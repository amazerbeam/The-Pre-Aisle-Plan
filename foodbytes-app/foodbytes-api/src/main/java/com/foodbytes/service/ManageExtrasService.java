package com.foodbytes.service;

import com.foodbytes.dto.ManageExtraDTO;
import com.foodbytes.dto.ManageExtrasMealDTO;
import com.foodbytes.dto.ManageExtrasViewDTO;
import com.foodbytes.dto.RecipeExtraNodeDTO;
import com.foodbytes.model.*;
import com.foodbytes.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * MPP-10: builds the Manage extras popup for a week or a template, and the per-template counts
 * shown in Manage templates. Read-only; every write goes through ExtraChoiceService.
 */
@Service
@RequiredArgsConstructor
public class ManageExtrasService {

    private final ExtraChoiceService extraChoiceService;
    private final MealPlanEntryRepository mealPlanEntryRepository;
    private final MealPlanTemplateRepository templateRepository;
    private final MealPlanTemplateEntryRepository templateEntryRepository;
    private final RecipeExtrasService recipeExtrasService;
    private final RecipeRepository recipeRepository;
    private final IngredientRepository ingredientRepository;
    private final RecipeFamilyMemberRepository familyMemberRepository;
    private final ExtraPortionResolver extraPortionResolver;

    @Transactional(readOnly = true)
    public ManageExtrasViewDTO getWeekView(Long userId, LocalDate startDate) {
        Long ownerId = extraChoiceService.resolveOwnerId(userId);
        List<MealPlanEntry> entries = new ArrayList<>(
            mealPlanEntryRepository.findByUserIdAndDateRange(ownerId, startDate, startDate.plusDays(7)));
        entries.sort(Comparator.comparing(MealPlanEntry::getPlanDate).thenComparing(e -> e.getMeal().getId()));
        Map<Long, Map<Long, Boolean>> choices = extraChoiceService.getEntryChoices(
            entries.stream().map(MealPlanEntry::getId).toList());
        ViewCache cache = new ViewCache();
        List<ManageExtrasMealDTO> meals = new ArrayList<>();
        for (MealPlanEntry e : entries) {
            ManageExtrasMealDTO meal = buildMeal(e.getId(), e.getPlanDate(),
                (int) ChronoUnit.DAYS.between(startDate, e.getPlanDate()), e.getMeal(), e.getRecipe(),
                e.getServings(), choices.getOrDefault(e.getId(), Map.of()), cache);
            if (!meal.getExtras().isEmpty()) meals.add(meal);
        }
        return ManageExtrasViewDTO.builder().scope("WEEK").startDate(startDate)
            .endDate(startDate.plusDays(6)).meals(meals).build();
    }

    /** @throws MealPlanTemplateService.TemplateNotFoundException when the owner has no such template */
    @Transactional(readOnly = true)
    public ManageExtrasViewDTO getTemplateView(Long userId, Long templateId) {
        Long ownerId = extraChoiceService.resolveOwnerId(userId);
        MealPlanTemplate template = templateRepository.findByIdAndUserId(templateId, ownerId)
            .orElseThrow(MealPlanTemplateService.TemplateNotFoundException::new);
        List<MealPlanTemplateEntry> entries = new ArrayList<>(templateEntryRepository.findByTemplateId(templateId));
        entries.sort(Comparator.comparing(MealPlanTemplateEntry::getDayOffset).thenComparing(e -> e.getMeal().getId()));
        Map<Long, Map<Long, Boolean>> choices = extraChoiceService.getTemplateEntryChoices(
            entries.stream().map(MealPlanTemplateEntry::getId).toList());
        ViewCache cache = new ViewCache();
        List<ManageExtrasMealDTO> meals = new ArrayList<>();
        for (MealPlanTemplateEntry e : entries) {
            ManageExtrasMealDTO meal = buildMeal(e.getId(), null, e.getDayOffset(), e.getMeal(), e.getRecipe(),
                e.getServings(), choices.getOrDefault(e.getId(), Map.of()), cache);
            if (!meal.getExtras().isEmpty()) meals.add(meal);
        }
        return ManageExtrasViewDTO.builder().scope("TEMPLATE").templateId(templateId)
            .templateName(template.getName()).meals(meals).build();
    }

    /** extrasMealCount / storeBoughtCount per template id (index 0 / 1). */
    @Transactional(readOnly = true)
    public Map<Long, int[]> templateExtrasCounts(List<MealPlanTemplate> templates) {
        Map<Long, Boolean> hasExtrasCache = new HashMap<>();
        Map<Long, int[]> out = new HashMap<>();
        for (MealPlanTemplate t : templates) {
            List<MealPlanTemplateEntry> entries = templateEntryRepository.findByTemplateId(t.getId());
            Map<Long, Map<Long, Boolean>> choices = extraChoiceService.getTemplateEntryChoices(
                entries.stream().map(MealPlanTemplateEntry::getId).toList());
            int meals = 0, storeBought = 0;
            for (MealPlanTemplateEntry e : entries) {
                if (!hasExtrasCache.computeIfAbsent(e.getRecipe().getId(), recipeExtrasService::hasExtras)) continue;
                meals++;
                storeBought += (int) choices.getOrDefault(e.getId(), Map.of()).values().stream()
                    .filter(Boolean.FALSE::equals).count();
            }
            out.put(t.getId(), new int[] {meals, storeBought});
        }
        return out;
    }

    private ManageExtrasMealDTO buildMeal(Long targetId, LocalDate planDate, int dayOffset, Meal meal,
                                          Recipe recipe, BigDecimal servings, Map<Long, Boolean> choices,
                                          ViewCache cache) {
        Integer defaultServings = recipe.getDefaultServings();
        BigDecimal ratio = (defaultServings == null || defaultServings <= 0 || servings == null)
            ? BigDecimal.ONE
            : servings.divide(BigDecimal.valueOf(defaultServings), 10, RoundingMode.HALF_UP);
        List<RecipeExtraNodeDTO> tree = cache.trees.computeIfAbsent(recipe.getId(),
            id -> recipeExtrasService.hasExtras(id)
                ? recipeExtrasService.buildExtrasTree(id, new HashSet<>())
                : List.of());
        List<ManageExtraDTO> extras = new ArrayList<>();
        flatten(tree, recipe, ratio, 0, null, choices, extras, cache);
        String variantLabel = cache.variantLabels.computeIfAbsent(recipe.getId(),
            id -> familyMemberRepository.findByRecipeId(id)
                .map(RecipeFamilyMember::getVariantLabel).orElse(""));
        return ManageExtrasMealDTO.builder()
            .targetId(targetId).planDate(planDate).dayOffset(dayOffset).mealType(meal.getKey())
            .recipeId(recipe.getId()).recipeName(recipe.getName())
            .variantLabel(variantLabel == null || variantLabel.isEmpty() ? null : variantLabel)
            .servings(servings).defaultServings(defaultServings).extras(extras).build();
    }

    /** Depth-first, display order; children of a store-bought extra are skipped (not cooked). */
    private void flatten(List<RecipeExtraNodeDTO> nodes, Recipe parent, BigDecimal parentRatio, int depth,
                         Long parentExtraId, Map<Long, Boolean> choices, List<ManageExtraDTO> out, ViewCache cache) {
        for (RecipeExtraNodeDTO node : nodes) {
            boolean homemade = !Boolean.FALSE.equals(choices.get(node.getRecipeId()));
            BigDecimal used = extraPortionResolver.usedGrams(parent, node.getRecipeId(), parentRatio);
            Long productId = node.getStoreBoughtIngredientId();
            String productName = productId == null ? null : cache.productNames.computeIfAbsent(productId,
                id -> ingredientRepository.findById(id).map(Ingredient::getName).orElse(null));
            out.add(ManageExtraDTO.builder()
                .extraRecipeId(node.getRecipeId()).extraName(node.getRecipeName())
                .depth(depth).parentExtraRecipeId(parentExtraId).homemade(homemade)
                .usedGrams(used == null ? null : used.setScale(0, RoundingMode.HALF_UP))
                .storeBoughtIngredientId(productId).storeBoughtIngredientName(productName)
                .build());
            if (!homemade || node.getChildren() == null || node.getChildren().isEmpty()) continue;
            Recipe child = cache.recipes.computeIfAbsent(node.getRecipeId(),
                id -> recipeRepository.findById(id).orElse(null)); // findById, not findWithDetailsById — see ShoppingListService#collectUsagesFromExtras
            if (child == null) continue;
            BigDecimal childRatio = extraPortionResolver.resolveExtraPortionRatio(parent, node.getRecipeId(), parentRatio, child);
            if (childRatio.compareTo(BigDecimal.ZERO) > 0) {
                flatten(node.getChildren(), child, childRatio, depth + 1, node.getRecipeId(), choices, out, cache);
            }
        }
    }

    /** Request-scoped caches: a recipe appears on several days. */
    private static final class ViewCache {
        final Map<Long, List<RecipeExtraNodeDTO>> trees = new HashMap<>();
        final Map<Long, String> variantLabels = new HashMap<>();
        final Map<Long, String> productNames = new HashMap<>();
        final Map<Long, Recipe> recipes = new HashMap<>();
    }
}
