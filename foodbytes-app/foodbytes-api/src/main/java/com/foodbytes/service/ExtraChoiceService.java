package com.foodbytes.service;

import com.foodbytes.dto.ExtraChoiceItemDTO;
import com.foodbytes.model.*;
import com.foodbytes.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

/**
 * MPP-10: owns every rule about homemade/store-bought choices for recipe extras.
 *
 * <ul>
 *   <li>Choices live per planned meal, per template entry, and as a per-dish default.</li>
 *   <li>Everything resolves through the effective meal-plan owner, so linked accounts share rows.</li>
 *   <li>No stored choice = homemade.</li>
 *   <li>Week edits and the add-to-day popup update the default; template edits never do.</li>
 *   <li>Defaults are written for the whole recipe family (a "dish" = its Light/Moderate/Balanced set).</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ExtraChoiceService {

    static final int MAX_IMPORT_EXTRAS_PER_RECIPE = 50;

    public static class ChoiceTargetNotFoundException extends RuntimeException {
        public ChoiceTargetNotFoundException(String message) { super(message); }
    }

    private final MealPlanEntryExtraChoiceRepository entryChoiceRepository;
    private final MealPlanTemplateEntryExtraChoiceRepository templateChoiceRepository;
    private final UserExtraDefaultRepository defaultRepository;
    private final MealPlanEntryRepository mealPlanEntryRepository;
    private final MealPlanTemplateRepository templateRepository;
    private final MealPlanTemplateEntryRepository templateEntryRepository;
    private final RecipeFamilyMemberRepository familyMemberRepository;
    private final RecipeRepository recipeRepository;
    private final RecipeExtrasService recipeExtrasService;
    private final UserRepository userRepository;

    /** Same rule as MealPlanService#effectiveOwnerId. */
    public Long resolveOwnerId(Long userId) {
        return userRepository.findById(userId)
            .map(user -> user.getMealPlanOwnerId() != null ? user.getMealPlanOwnerId() : userId)
            .orElse(userId);
    }

    @Transactional(readOnly = true)
    public Map<Long, Map<Long, Boolean>> getEntryChoices(Collection<Long> entryIds) {
        Map<Long, Map<Long, Boolean>> out = new HashMap<>();
        if (entryIds == null || entryIds.isEmpty()) return out;
        for (MealPlanEntryExtraChoice c : entryChoiceRepository.findByMealPlanEntryIdIn(entryIds)) {
            out.computeIfAbsent(c.getMealPlanEntryId(), k -> new HashMap<>()).put(c.getExtraRecipeId(), c.getHomemade());
        }
        return out;
    }

    @Transactional(readOnly = true)
    public Map<Long, Map<Long, Boolean>> getTemplateEntryChoices(Collection<Long> templateEntryIds) {
        Map<Long, Map<Long, Boolean>> out = new HashMap<>();
        if (templateEntryIds == null || templateEntryIds.isEmpty()) return out;
        for (MealPlanTemplateEntryExtraChoice c : templateChoiceRepository.findByTemplateEntryIdIn(templateEntryIds)) {
            out.computeIfAbsent(c.getTemplateEntryId(), k -> new HashMap<>()).put(c.getExtraRecipeId(), c.getHomemade());
        }
        return out;
    }

    /** Upsert on (entry, extra). Null keys/values are ignored. */
    @Transactional
    public void setEntryChoices(Long entryId, Map<Long, Boolean> choices) {
        if (choices == null || choices.isEmpty()) return;
        Map<Long, MealPlanEntryExtraChoice> existing = entryChoiceRepository
            .findByMealPlanEntryIdIn(List.of(entryId)).stream()
            .collect(Collectors.toMap(MealPlanEntryExtraChoice::getExtraRecipeId, c -> c));
        List<MealPlanEntryExtraChoice> toSave = new ArrayList<>();
        choices.forEach((extraId, homemade) -> {
            if (extraId == null || homemade == null) return;
            MealPlanEntryExtraChoice row = existing.get(extraId);
            if (row == null) {
                row = new MealPlanEntryExtraChoice();
                row.setMealPlanEntryId(entryId);
                row.setExtraRecipeId(extraId);
            }
            row.setHomemade(homemade);
            toSave.add(row);
        });
        entryChoiceRepository.saveAll(toSave);
    }

    private void setTemplateEntryChoices(Long templateEntryId, Map<Long, Boolean> choices) {
        if (choices == null || choices.isEmpty()) return;
        Map<Long, MealPlanTemplateEntryExtraChoice> existing = templateChoiceRepository
            .findByTemplateEntryIdIn(List.of(templateEntryId)).stream()
            .collect(Collectors.toMap(MealPlanTemplateEntryExtraChoice::getExtraRecipeId, c -> c));
        List<MealPlanTemplateEntryExtraChoice> toSave = new ArrayList<>();
        choices.forEach((extraId, homemade) -> {
            if (extraId == null || homemade == null) return;
            MealPlanTemplateEntryExtraChoice row = existing.get(extraId);
            if (row == null) {
                row = new MealPlanTemplateEntryExtraChoice();
                row.setTemplateEntryId(templateEntryId);
                row.setExtraRecipeId(extraId);
            }
            row.setHomemade(homemade);
            toSave.add(row);
        });
        templateChoiceRepository.saveAll(toSave);
    }

    /** Writes the default for recipeId AND every member of its recipe family. */
    @Transactional
    public void updateDefaults(Long ownerId, Long recipeId, Map<Long, Boolean> choices) {
        if (choices == null || choices.isEmpty()) return;
        Set<Long> recipeIds = new LinkedHashSet<>();
        recipeIds.add(recipeId);
        familyMemberRepository.findVariantsForRecipe(recipeId)
            .forEach(m -> recipeIds.add(m.getRecipe().getId()));
        Map<String, UserExtraDefault> existing = defaultRepository
            .findByUserIdAndRecipeIdIn(ownerId, recipeIds).stream()
            .collect(Collectors.toMap(d -> d.getRecipeId() + ":" + d.getExtraRecipeId(), d -> d));
        List<UserExtraDefault> toSave = new ArrayList<>();
        for (Long rid : recipeIds) {
            choices.forEach((extraId, homemade) -> {
                if (extraId == null || homemade == null) return;
                UserExtraDefault row = existing.get(rid + ":" + extraId);
                if (row == null) {
                    row = new UserExtraDefault();
                    row.setUserId(ownerId);
                    row.setRecipeId(rid);
                    row.setExtraRecipeId(extraId);
                }
                row.setHomemade(homemade);
                toSave.add(row);
            });
        }
        defaultRepository.saveAll(toSave);
    }

    @Transactional(readOnly = true)
    public Map<Long, Map<Long, Boolean>> getDefaults(Long userId) {
        Long ownerId = resolveOwnerId(userId);
        Map<Long, Map<Long, Boolean>> out = new HashMap<>();
        for (UserExtraDefault d : defaultRepository.findByUserId(ownerId)) {
            out.computeIfAbsent(d.getRecipeId(), k -> new HashMap<>()).put(d.getExtraRecipeId(), d.getHomemade());
        }
        return out;
    }

    /** Targets are freshly created entries, so rows are inserted without an upsert lookup. */
    @Transactional
    public void copyEntryChoices(Map<Long, Long> sourceEntryIdToTargetEntryId) {
        if (sourceEntryIdToTargetEntryId.isEmpty()) return;
        List<MealPlanEntryExtraChoice> copies = new ArrayList<>();
        for (MealPlanEntryExtraChoice src : entryChoiceRepository.findByMealPlanEntryIdIn(sourceEntryIdToTargetEntryId.keySet())) {
            MealPlanEntryExtraChoice c = new MealPlanEntryExtraChoice();
            c.setMealPlanEntryId(sourceEntryIdToTargetEntryId.get(src.getMealPlanEntryId()));
            c.setExtraRecipeId(src.getExtraRecipeId());
            c.setHomemade(src.getHomemade());
            copies.add(c);
        }
        entryChoiceRepository.saveAll(copies);
    }

    /** Template save / update: copies each entry's choices onto the freshly created template entry. */
    @Transactional
    public void copyEntryChoicesToTemplate(Map<Long, Long> entryIdToTemplateEntryId) {
        if (entryIdToTemplateEntryId.isEmpty()) return;
        List<MealPlanTemplateEntryExtraChoice> copies = new ArrayList<>();
        for (MealPlanEntryExtraChoice src : entryChoiceRepository.findByMealPlanEntryIdIn(entryIdToTemplateEntryId.keySet())) {
            MealPlanTemplateEntryExtraChoice c = new MealPlanTemplateEntryExtraChoice();
            c.setTemplateEntryId(entryIdToTemplateEntryId.get(src.getMealPlanEntryId()));
            c.setExtraRecipeId(src.getExtraRecipeId());
            c.setHomemade(src.getHomemade());
            copies.add(c);
        }
        templateChoiceRepository.saveAll(copies);
    }

    /** Template apply: copies each template entry's choices onto the freshly created planned meal. */
    @Transactional
    public void copyTemplateChoicesToEntries(Map<Long, Long> templateEntryIdToEntryId) {
        if (templateEntryIdToEntryId.isEmpty()) return;
        List<MealPlanEntryExtraChoice> copies = new ArrayList<>();
        for (MealPlanTemplateEntryExtraChoice src : templateChoiceRepository.findByTemplateEntryIdIn(templateEntryIdToEntryId.keySet())) {
            MealPlanEntryExtraChoice c = new MealPlanEntryExtraChoice();
            c.setMealPlanEntryId(templateEntryIdToEntryId.get(src.getTemplateEntryId()));
            c.setExtraRecipeId(src.getExtraRecipeId());
            c.setHomemade(src.getHomemade());
            copies.add(c);
        }
        entryChoiceRepository.saveAll(copies);
    }

    /** Week scope: validates ownership + tree, upserts, then updates each dish's default. */
    @Transactional
    public void updateWeekChoices(Long userId, List<ExtraChoiceItemDTO> choices) {
        if (choices == null || choices.isEmpty()) throw new IllegalArgumentException("No choices supplied");
        Long ownerId = resolveOwnerId(userId);
        Set<Long> entryIds = choices.stream().map(ExtraChoiceItemDTO::getTargetId).collect(Collectors.toSet());
        Map<Long, MealPlanEntry> entries = mealPlanEntryRepository.findAllById(entryIds).stream()
            .collect(Collectors.toMap(MealPlanEntry::getId, e -> e));
        Map<Long, Set<Long>> treeCache = new HashMap<>();
        Map<Long, Map<Long, Boolean>> byEntry = new LinkedHashMap<>();
        for (ExtraChoiceItemDTO item : choices) {
            MealPlanEntry entry = entries.get(item.getTargetId());
            if (entry == null || !entry.getUser().getId().equals(ownerId)) {
                log.warn("Extra choice rejected: meal plan entry {} not found for owner", item.getTargetId());
                throw new ChoiceTargetNotFoundException("Meal plan entry not found: " + item.getTargetId());
            }
            requireInTree(entry.getRecipe().getId(), item.getExtraRecipeId(), treeCache);
            byEntry.computeIfAbsent(entry.getId(), k -> new LinkedHashMap<>()).put(item.getExtraRecipeId(), item.getHomemade());
        }
        byEntry.forEach((entryId, map) -> {
            setEntryChoices(entryId, map);
            updateDefaults(ownerId, entries.get(entryId).getRecipe().getId(), map);
        });
    }

    /** Template scope: validates template ownership + membership + tree. Never touches defaults. */
    @Transactional
    public void updateTemplateChoices(Long userId, Long templateId, List<ExtraChoiceItemDTO> choices) {
        if (choices == null || choices.isEmpty()) throw new IllegalArgumentException("No choices supplied");
        Long ownerId = resolveOwnerId(userId);
        templateRepository.findByIdAndUserId(templateId, ownerId)
            .orElseThrow(() -> {
                log.warn("Extra choice rejected: template {} not found for owner", templateId);
                return new ChoiceTargetNotFoundException("Template not found: " + templateId);
            });
        Map<Long, MealPlanTemplateEntry> entries = templateEntryRepository.findByTemplateId(templateId).stream()
            .collect(Collectors.toMap(MealPlanTemplateEntry::getId, e -> e));
        Map<Long, Set<Long>> treeCache = new HashMap<>();
        Map<Long, Map<Long, Boolean>> byEntry = new LinkedHashMap<>();
        for (ExtraChoiceItemDTO item : choices) {
            MealPlanTemplateEntry entry = entries.get(item.getTargetId());
            if (entry == null) {
                log.warn("Extra choice rejected: template entry {} not in template {}", item.getTargetId(), templateId);
                throw new ChoiceTargetNotFoundException("Template entry not found: " + item.getTargetId());
            }
            requireInTree(entry.getRecipe().getId(), item.getExtraRecipeId(), treeCache);
            byEntry.computeIfAbsent(entry.getId(), k -> new LinkedHashMap<>()).put(item.getExtraRecipeId(), item.getHomemade());
        }
        byEntry.forEach(this::setTemplateEntryChoices);
    }

    /** One-time upload of a browser's localStorage selections. Returns false when skipped. */
    @Transactional
    public boolean importLegacySelections(Long userId, Map<Long, Map<Long, Boolean>> selections) {
        if (selections != null && selections.values().stream()
                .anyMatch(m -> m != null && m.size() > MAX_IMPORT_EXTRAS_PER_RECIPE)) {
            throw new IllegalArgumentException(
                "Each recipe may hold at most " + MAX_IMPORT_EXTRAS_PER_RECIPE + " extra choices");
        }
        Long ownerId = resolveOwnerId(userId);
        if (selections == null || selections.isEmpty()
                || defaultRepository.existsByUserId(ownerId)
                || entryChoiceRepository.existsForOwner(ownerId)) {
            return false;
        }
        Set<Long> liveRecipeIds = recipeRepository.findAllById(selections.keySet()).stream()
            .map(Recipe::getId).collect(Collectors.toSet());
        Map<Long, Map<Long, Boolean>> clean = new HashMap<>();
        selections.forEach((recipeId, map) -> {
            if (recipeId == null || !liveRecipeIds.contains(recipeId)) return;
            Map<Long, Boolean> kept = retainTreeExtras(recipeId, map);
            if (!kept.isEmpty()) clean.put(recipeId, kept);
        });
        if (clean.isEmpty()) return false;
        clean.forEach((recipeId, map) -> updateDefaults(ownerId, recipeId, map));
        LocalDate monday = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        int entriesFilled = 0;
        for (MealPlanEntry entry : mealPlanEntryRepository.findByUserIdFromDate(ownerId, monday)) {
            Map<Long, Boolean> map = clean.get(entry.getRecipe().getId());
            if (map != null) {
                setEntryChoices(entry.getId(), map);
                entriesFilled++;
            }
        }
        log.info("Legacy extras import: {} dish defaults written, {} planned meals filled",
                 clean.size(), entriesFilled);
        return true;
    }

    /** Drops extra ids that are not in recipeId's extras tree (unknown ids would also break the FK). */
    @Transactional(readOnly = true)
    public Map<Long, Boolean> retainTreeExtras(Long recipeId, Map<Long, Boolean> choices) {
        if (choices == null || choices.isEmpty()) return Map.of();
        Set<Long> tree = treeIds(recipeId, new HashMap<>());
        Map<Long, Boolean> kept = new LinkedHashMap<>();
        choices.forEach((extraId, homemade) -> {
            if (extraId != null && homemade != null && tree.contains(extraId)) kept.put(extraId, homemade);
        });
        return kept;
    }

    private void requireInTree(Long recipeId, Long extraRecipeId, Map<Long, Set<Long>> cache) {
        if (!treeIds(recipeId, cache).contains(extraRecipeId)) {
            log.warn("Extra choice rejected: recipe {} is not in the extras tree of recipe {}", extraRecipeId, recipeId);
            throw new IllegalArgumentException("Recipe " + extraRecipeId + " is not an extra of recipe " + recipeId);
        }
    }

    private Set<Long> treeIds(Long recipeId, Map<Long, Set<Long>> cache) {
        return cache.computeIfAbsent(recipeId, id -> new HashSet<>(
            recipeExtrasService.flattenExtrasToIds(recipeExtrasService.buildExtrasTree(id, new HashSet<>()))));
    }
}
