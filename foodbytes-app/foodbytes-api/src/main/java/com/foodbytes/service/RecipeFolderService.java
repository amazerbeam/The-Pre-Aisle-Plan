package com.foodbytes.service;

import com.foodbytes.dto.RecipeFolderDTO;
import com.foodbytes.model.RecipeFolder;
import com.foodbytes.model.RecipeFolderItem;
import com.foodbytes.repository.RecipeFolderItemRepository;
import com.foodbytes.repository.RecipeFolderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

import static com.foodbytes.service.RecipeFolderTree.*;

/**
 * Personal recipe folders. Always the caller's own folders (never the shared meal-plan owner's).
 * Rule breaks throw IllegalArgumentException with a user-facing message (controller -> 400);
 * unknown / foreign ids come back empty (controller -> 404).
 */
@Service
@RequiredArgsConstructor
public class RecipeFolderService {
    private final RecipeFolderRepository folderRepository;
    private final RecipeFolderItemRepository itemRepository;
    private final RecipeKeyResolver recipeKeyResolver;

    @Transactional(readOnly = true)
    public List<RecipeFolderDTO> listFolders(Long userId) {
        List<RecipeFolder> folders = folderRepository.findByUserId(userId);
        Map<Long, List<Long>> keys = folders.isEmpty() ? Map.of()
            : itemRepository.findByFolderIdIn(folders.stream().map(RecipeFolder::getId).toList()).stream()
                .collect(Collectors.groupingBy(RecipeFolderItem::getFolderId,
                    Collectors.mapping(RecipeFolderItem::getRecipeId, Collectors.toList())));
        return folders.stream()
            .sorted(Comparator.comparing(RecipeFolder::getName, String.CASE_INSENSITIVE_ORDER))
            .map(f -> toDto(f, keys.getOrDefault(f.getId(), List.of())))
            .toList();
    }

    @Transactional
    public RecipeFolderDTO create(Long userId, String rawName, Long parentId) {
        String name = cleanName(rawName);
        List<RecipeFolder> all = folderRepository.findByUserId(userId);
        if (folderRepository.countByUserId(userId) >= MAX_FOLDERS)
            throw new IllegalArgumentException("You can have up to 100 folders.");
        if (parentId != null) {
            if (all.stream().noneMatch(f -> f.getId().equals(parentId))) throw new NoSuchElementException("Folder not found");
            if (depthOf(parentId, all) + 1 > MAX_DEPTH) throw new IllegalArgumentException("Folders go up to 3 levels deep.");
        }
        if (siblingNameTaken(parentId, name, null, all)) throw duplicate(name);
        RecipeFolder saved = folderRepository.save(new RecipeFolder(null, userId, parentId, name, null));
        return toDto(saved, List.of());
    }

    @Transactional
    public Optional<RecipeFolderDTO> rename(Long userId, Long folderId, String rawName) {
        String name = cleanName(rawName);
        return folderRepository.findByIdAndUserId(folderId, userId).map(f -> {
            if (siblingNameTaken(f.getParentId(), name, f.getId(), folderRepository.findByUserId(userId))) throw duplicate(name);
            f.setName(name);
            return toDto(folderRepository.save(f), keysOf(f.getId()));
        });
    }

    @Transactional
    public Optional<RecipeFolderDTO> move(Long userId, Long folderId, Long newParentId) {
        return folderRepository.findByIdAndUserId(folderId, userId).map(f -> {
            List<RecipeFolder> all = folderRepository.findByUserId(userId);
            if (newParentId != null) {
                if (all.stream().noneMatch(x -> x.getId().equals(newParentId))) throw new NoSuchElementException("Folder not found");
                if (newParentId.equals(f.getId()) || descendantIds(f.getId(), all).contains(newParentId))
                    throw new IllegalArgumentException("A folder can't go inside itself.");
                if (depthOf(newParentId, all) + heightOf(f.getId(), all) > MAX_DEPTH)
                    throw new IllegalArgumentException("Folders go up to 3 levels deep.");
            }
            if (siblingNameTaken(newParentId, f.getName(), f.getId(), all)) throw duplicate(f.getName());
            f.setParentId(newParentId);
            return toDto(folderRepository.save(f), keysOf(f.getId()));
        });
    }

    @Transactional
    public boolean delete(Long userId, Long folderId) {
        Optional<RecipeFolder> found = folderRepository.findByIdAndUserId(folderId, userId);
        if (found.isEmpty()) return false;
        RecipeFolder folder = found.get();
        List<RecipeFolder> all = folderRepository.findByUserId(userId);
        List<RecipeFolder> children = all.stream().filter(c -> folder.getId().equals(c.getParentId())).toList();
        for (RecipeFolder child : children) {
            if (siblingNameTaken(folder.getParentId(), child.getName(), folder.getId(), all)) {
                String where = all.stream().filter(p -> p.getId().equals(folder.getParentId())).findFirst()
                    .map(p -> "“" + p.getName() + "”").orElse("the top level");
                throw new IllegalArgumentException("Can't delete: “" + child.getName()
                    + "” would clash with a folder of the same name in " + where + ".");
            }
        }
        children.forEach(c -> { c.setParentId(folder.getParentId()); folderRepository.save(c); });
        folderRepository.delete(folder);
        return true;
    }

    @Transactional
    public Optional<Long> addRecipe(Long userId, Long folderId, Long recipeId) {
        if (folderRepository.findByIdAndUserId(folderId, userId).isEmpty()) return Optional.empty();
        return recipeKeyResolver.resolve(recipeId).map(key -> { itemRepository.insertIfAbsent(folderId, key); return key; });
    }

    @Transactional
    public boolean removeRecipe(Long userId, Long folderId, Long recipeId) {
        if (folderRepository.findByIdAndUserId(folderId, userId).isEmpty()) return false;
        recipeKeyResolver.resolve(recipeId).ifPresent(key -> itemRepository.deleteByFolderIdAndRecipeId(folderId, key));
        return true;
    }

    private List<Long> keysOf(Long folderId) {
        return itemRepository.findByFolderIdIn(List.of(folderId)).stream().map(RecipeFolderItem::getRecipeId).toList();
    }

    private static RecipeFolderDTO toDto(RecipeFolder f, List<Long> recipeIds) {
        return new RecipeFolderDTO(f.getId(), f.getName(), f.getParentId(), recipeIds);
    }

    private static IllegalArgumentException duplicate(String name) {
        return new IllegalArgumentException("There's already a folder called “" + name.trim() + "” here.");
    }
}
