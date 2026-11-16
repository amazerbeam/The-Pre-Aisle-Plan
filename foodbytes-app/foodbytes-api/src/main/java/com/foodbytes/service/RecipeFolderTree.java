package com.foodbytes.service;

import com.foodbytes.model.RecipeFolder;
import java.util.*;

/** Pure rules for a user's folder tree (adjacency list). Depth: top level = 1. Height: leaf = 1. */
final class RecipeFolderTree {
    static final int MAX_DEPTH = 3;
    static final int MAX_FOLDERS = 100;
    static final int NAME_MAX = 40;

    private RecipeFolderTree() {}

    static int depthOf(Long id, List<RecipeFolder> all) {
        Map<Long, RecipeFolder> byId = index(all);
        int depth = 0;
        for (RecipeFolder f = byId.get(id); f != null && depth <= all.size(); f = byId.get(f.getParentId())) depth++;
        return depth;
    }

    static int heightOf(Long id, List<RecipeFolder> all) {
        return 1 + all.stream().filter(f -> id.equals(f.getParentId()))
            .mapToInt(c -> heightOf(c.getId(), all)).max().orElse(0);
    }

    static Set<Long> descendantIds(Long id, List<RecipeFolder> all) {
        Set<Long> out = new HashSet<>();
        Deque<Long> todo = new ArrayDeque<>(List.of(id));
        while (!todo.isEmpty()) {
            Long cur = todo.pop();
            for (RecipeFolder f : all) if (cur.equals(f.getParentId()) && out.add(f.getId())) todo.push(f.getId());
        }
        return out;
    }

    static boolean siblingNameTaken(Long parentId, String name, Long exceptId, List<RecipeFolder> all) {
        String wanted = name.trim();
        return all.stream().anyMatch(f -> Objects.equals(f.getParentId(), parentId)
            && !f.getId().equals(exceptId) && f.getName().equalsIgnoreCase(wanted));
    }

    static String cleanName(String raw) {
        String name = raw == null ? "" : raw.trim();
        if (name.isEmpty()) throw new IllegalArgumentException("Give the folder a name.");
        if (name.length() > NAME_MAX) throw new IllegalArgumentException("Folder names can be up to 40 characters.");
        return name;
    }

    private static Map<Long, RecipeFolder> index(List<RecipeFolder> all) {
        Map<Long, RecipeFolder> m = new HashMap<>();
        all.forEach(f -> m.put(f.getId(), f));
        return m;
    }
}
