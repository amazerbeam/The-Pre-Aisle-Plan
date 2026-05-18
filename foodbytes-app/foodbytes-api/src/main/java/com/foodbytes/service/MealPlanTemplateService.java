package com.foodbytes.service;

import com.foodbytes.dto.*;
import com.foodbytes.model.*;
import com.foodbytes.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for saved meal-plan templates.
 *
 * See requirement-meal-plan-templates-2026-05-09.md.
 *
 * All operations resolve through the effective meal-plan owner so that
 * synced users (users.meal_plan_owner_id) share one template library.
 */
@Service
@RequiredArgsConstructor
public class MealPlanTemplateService {

    public static class DuplicateTemplateNameException extends RuntimeException {
        public DuplicateTemplateNameException() { super("Template name already exists"); }
    }

    public static class TemplateNotFoundException extends RuntimeException {
        public TemplateNotFoundException() { super("Template not found"); }
    }

    private final MealPlanTemplateRepository templateRepository;
    private final MealPlanTemplateEntryRepository templateEntryRepository;
    private final MealPlanEntryRepository mealPlanEntryRepository;
    private final MealRepository mealRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final MealPlanService mealPlanService;

    private Long getEffectiveMealPlanOwnerId(Long userId) {
        return userRepository.findById(userId)
            .map(user -> user.getMealPlanOwnerId() != null ? user.getMealPlanOwnerId() : userId)
            .orElse(userId);
    }

    @Transactional(readOnly = true)
    public List<MealPlanTemplateDTO> listTemplates(Long userId) {
        Long ownerId = getEffectiveMealPlanOwnerId(userId);
        return templateRepository.findByUserId(ownerId).stream()
            .map(this::toSummaryDTO)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MealPlanTemplateDTO getTemplate(Long userId, Long templateId) {
        Long ownerId = getEffectiveMealPlanOwnerId(userId);
        MealPlanTemplate template = templateRepository.findByIdAndUserId(templateId, ownerId)
            .orElseThrow(TemplateNotFoundException::new);
        return toDetailDTO(template);
    }

    /**
     * Snapshot the user's current week as a new template.
     */
    @Transactional
    public MealPlanTemplateDTO saveTemplate(Long userId, MealPlanTemplateCreateRequest request) {
        Long ownerId = getEffectiveMealPlanOwnerId(userId);
        String trimmedName = request.getName() == null ? "" : request.getName().trim();
        if (trimmedName.isEmpty()) {
            throw new IllegalArgumentException("Name is required");
        }

        if (templateRepository.existsByUserIdAndNameIgnoreCase(ownerId, trimmedName)) {
            throw new DuplicateTemplateNameException();
        }

        User owner = userRepository.findById(ownerId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        MealPlanTemplate template = new MealPlanTemplate();
        template.setUser(owner);
        template.setName(trimmedName);
        template = templateRepository.save(template);

        snapshotIntoTemplate(template, ownerId, request.getSourceStartDate());
        return toDetailDTO(template);
    }

    /**
     * Replace the snapshot of an existing template with the user's current week.
     */
    @Transactional
    public MealPlanTemplateDTO updateSnapshot(Long userId, Long templateId, LocalDate sourceStartDate) {
        Long ownerId = getEffectiveMealPlanOwnerId(userId);
        MealPlanTemplate template = templateRepository.findByIdAndUserId(templateId, ownerId)
            .orElseThrow(TemplateNotFoundException::new);

        templateEntryRepository.deleteByTemplateId(templateId);
        templateEntryRepository.flush();
        template.getEntries().clear();

        snapshotIntoTemplate(template, ownerId, sourceStartDate);
        template.setUpdatedAt(java.time.LocalDateTime.now());
        templateRepository.save(template);
        return toDetailDTO(template);
    }

    @Transactional
    public MealPlanTemplateDTO renameTemplate(Long userId, Long templateId, String newName) {
        Long ownerId = getEffectiveMealPlanOwnerId(userId);
        MealPlanTemplate template = templateRepository.findByIdAndUserId(templateId, ownerId)
            .orElseThrow(TemplateNotFoundException::new);

        String trimmed = newName == null ? "" : newName.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("Name is required");
        }
        if (!trimmed.equalsIgnoreCase(template.getName())) {
            if (templateRepository.existsByUserIdAndNameIgnoreCase(ownerId, trimmed)) {
                throw new DuplicateTemplateNameException();
            }
        }
        template.setName(trimmed);
        template = templateRepository.save(template);
        return toSummaryDTO(template);
    }

    @Transactional
    public boolean deleteTemplate(Long userId, Long templateId) {
        Long ownerId = getEffectiveMealPlanOwnerId(userId);
        Optional<MealPlanTemplate> existing = templateRepository.findByIdAndUserId(templateId, ownerId);
        if (existing.isEmpty()) {
            return false;
        }
        templateRepository.delete(existing.get());
        return true;
    }

    /**
     * Apply a saved template to the target week:
     *  - Delete every entry in [targetStartDate, targetStartDate+7) for the owner.
     *  - Insert template entries with planDate = targetStartDate + dayOffset.
     *  - Skip silently if a referenced recipe no longer exists.
     */
    @Transactional
    public MealPlanWeekDTO applyTemplate(Long userId, Long templateId, LocalDate targetStartDate) {
        Long ownerId = getEffectiveMealPlanOwnerId(userId);
        MealPlanTemplate template = templateRepository.findByIdAndUserId(templateId, ownerId)
            .orElseThrow(TemplateNotFoundException::new);

        LocalDate targetEndExclusive = targetStartDate.plusDays(7);

        mealPlanEntryRepository.deleteByUserIdAndDateRange(ownerId, targetStartDate, targetEndExclusive);
        mealPlanEntryRepository.flush();

        User owner = userRepository.findById(ownerId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        List<MealPlanTemplateEntry> sourceEntries = templateEntryRepository.findByTemplateId(templateId);
        List<MealPlanEntry> newEntries = new ArrayList<>();

        for (MealPlanTemplateEntry src : sourceEntries) {
            // Skip silently if the recipe was deleted after the template was saved.
            Optional<Recipe> recipe = recipeRepository.findById(src.getRecipe().getId());
            if (recipe.isEmpty()) continue;

            MealPlanEntry entry = new MealPlanEntry();
            entry.setUser(owner);
            entry.setPlanDate(targetStartDate.plusDays(src.getDayOffset()));
            entry.setMeal(src.getMeal());
            entry.setRecipe(recipe.get());
            entry.setServings(src.getServings() != null ? src.getServings() : 1);
            newEntries.add(entry);
        }

        if (!newEntries.isEmpty()) {
            mealPlanEntryRepository.saveAll(newEntries);
        }

        return mealPlanService.getWeekPlan(userId, targetStartDate);
    }

    /**
     * Capture the owner's [sourceStartDate, +7) week into the template's entries.
     * Caller is responsible for clearing any existing entries first.
     */
    private void snapshotIntoTemplate(MealPlanTemplate template, Long ownerId, LocalDate sourceStartDate) {
        LocalDate sourceEndExclusive = sourceStartDate.plusDays(7);
        List<MealPlanEntry> sourceEntries = mealPlanEntryRepository
            .findByUserIdAndDateRange(ownerId, sourceStartDate, sourceEndExclusive);

        List<MealPlanTemplateEntry> snapshots = new ArrayList<>();
        for (MealPlanEntry src : sourceEntries) {
            long offset = ChronoUnit.DAYS.between(sourceStartDate, src.getPlanDate());
            if (offset < 0 || offset > 6) continue;

            MealPlanTemplateEntry e = new MealPlanTemplateEntry();
            e.setTemplate(template);
            e.setDayOffset((int) offset);
            e.setMeal(src.getMeal());
            e.setRecipe(src.getRecipe());
            e.setServings(src.getServings() != null ? src.getServings() : 1);
            snapshots.add(e);
        }

        if (!snapshots.isEmpty()) {
            templateEntryRepository.saveAll(snapshots);
        }
        template.getEntries().clear();
        template.getEntries().addAll(snapshots);
    }

    private MealPlanTemplateDTO toSummaryDTO(MealPlanTemplate template) {
        MealPlanTemplateDTO dto = new MealPlanTemplateDTO();
        dto.setId(template.getId());
        dto.setName(template.getName());
        dto.setEntryCount(template.getEntries() != null ? template.getEntries().size() : 0);
        dto.setCreatedAt(template.getCreatedAt());
        dto.setUpdatedAt(template.getUpdatedAt());
        dto.setEntries(null);
        return dto;
    }

    private MealPlanTemplateDTO toDetailDTO(MealPlanTemplate template) {
        MealPlanTemplateDTO dto = toSummaryDTO(template);
        List<MealPlanTemplateEntry> entries = templateEntryRepository.findByTemplateId(template.getId());
        dto.setEntries(entries.stream().map(this::toEntryDTO).collect(Collectors.toList()));
        dto.setEntryCount(entries.size());
        return dto;
    }

    private MealPlanTemplateEntryDTO toEntryDTO(MealPlanTemplateEntry e) {
        MealPlanTemplateEntryDTO dto = new MealPlanTemplateEntryDTO();
        dto.setId(e.getId());
        dto.setDayOffset(e.getDayOffset());
        dto.setMealId(e.getMeal().getId());
        dto.setMealType(e.getMeal().getKey());
        dto.setRecipeId(e.getRecipe().getId());
        dto.setRecipeName(e.getRecipe().getName());
        dto.setServings(e.getServings());
        return dto;
    }
}
