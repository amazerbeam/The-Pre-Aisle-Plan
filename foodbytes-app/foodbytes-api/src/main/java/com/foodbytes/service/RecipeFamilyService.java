package com.foodbytes.service;

import com.foodbytes.dto.*;
import com.foodbytes.model.Recipe;
import com.foodbytes.model.RecipeFamily;
import com.foodbytes.model.RecipeFamilyMember;
import com.foodbytes.repository.RecipeFamilyMemberRepository;
import com.foodbytes.repository.RecipeFamilyRepository;
import com.foodbytes.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * FR-043: Service for Recipe Family operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RecipeFamilyService {

    private final RecipeFamilyRepository recipeFamilyRepository;
    private final RecipeFamilyMemberRepository recipeFamilyMemberRepository;
    private final RecipeRepository recipeRepository;

    // ========================================
    // PUBLIC API - GET VARIANTS FOR RECIPES
    // ========================================

    /**
     * Get all variants for a recipe (for dropdown display).
     * Returns empty list if recipe is not part of a family.
     */
    @Transactional(readOnly = true)
    public List<RecipeVariantDTO> getVariantsForRecipe(Long recipeId) {
        List<RecipeFamilyMember> members = recipeFamilyMemberRepository.findVariantsForRecipe(recipeId);

        // Only show dropdown if 2+ members
        if (members.size() < 2) {
            return List.of();
        }

        return members.stream()
            .map(this::toVariantDTO)
            .collect(Collectors.toList());
    }

    /**
     * Check if a recipe has variants (for conditional dropdown display).
     */
    @Transactional(readOnly = true)
    public boolean hasVariants(Long recipeId) {
        List<RecipeFamilyMember> members = recipeFamilyMemberRepository.findVariantsForRecipe(recipeId);
        return members.size() >= 2;
    }

    // ========================================
    // ADMIN - CRUD OPERATIONS
    // ========================================

    /**
     * Get all recipe families.
     */
    @Transactional(readOnly = true)
    public List<RecipeFamilyDTO> getAllFamilies() {
        return recipeFamilyRepository.findAllByOrderByFamilyNameAsc().stream()
            .map(this::toFamilyDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get a recipe family by ID.
     */
    @Transactional(readOnly = true)
    public RecipeFamilyDTO getFamilyById(Long id) {
        RecipeFamily family = recipeFamilyRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Recipe family not found: " + id));
        return toFamilyDTO(family);
    }

    /**
     * Create a new recipe family.
     */
    @Transactional
    public RecipeFamilyDTO createFamily(RecipeFamilyDTO dto) {
        // Validate name uniqueness
        if (recipeFamilyRepository.existsByFamilyNameIgnoreCase(dto.getFamilyName())) {
            throw new IllegalArgumentException("A family with this name already exists");
        }

        RecipeFamily family = new RecipeFamily();
        family.setFamilyName(dto.getFamilyName());
        family.setDescription(dto.getDescription());

        RecipeFamily saved = recipeFamilyRepository.save(family);
        log.info("Created recipe family: {}", saved.getFamilyName());

        // Add members if provided
        if (dto.getMembers() != null && !dto.getMembers().isEmpty()) {
            addMembersToFamily(saved.getId(), dto.getMembers());
        }

        return toFamilyDTO(recipeFamilyRepository.findById(saved.getId()).orElse(saved));
    }

    /**
     * Update a recipe family.
     */
    @Transactional
    public RecipeFamilyDTO updateFamily(Long id, RecipeFamilyDTO dto) {
        RecipeFamily family = recipeFamilyRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Recipe family not found: " + id));

        // Check name uniqueness if changed
        if (!family.getFamilyName().equalsIgnoreCase(dto.getFamilyName()) &&
            recipeFamilyRepository.existsByFamilyNameIgnoreCase(dto.getFamilyName())) {
            throw new IllegalArgumentException("A family with this name already exists");
        }

        family.setFamilyName(dto.getFamilyName());
        family.setDescription(dto.getDescription());

        RecipeFamily saved = recipeFamilyRepository.save(family);
        log.info("Updated recipe family: {}", saved.getFamilyName());

        return toFamilyDTO(saved);
    }

    /**
     * Delete a recipe family (unlinks all recipes, doesn't delete recipes).
     */
    @Transactional
    public void deleteFamily(Long id) {
        RecipeFamily family = recipeFamilyRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Recipe family not found: " + id));

        log.info("Deleting recipe family: {} (unlinking {} recipes)",
            family.getFamilyName(), family.getMembers().size());

        recipeFamilyRepository.delete(family);
    }

    // ========================================
    // ADMIN - FAMILY MEMBER OPERATIONS
    // ========================================

    /**
     * Add recipes to a family.
     */
    @Transactional
    public RecipeFamilyDTO addMembersToFamily(Long familyId, List<RecipeFamilyMemberDTO> memberDTOs) {
        RecipeFamily family = recipeFamilyRepository.findById(familyId)
            .orElseThrow(() -> new IllegalArgumentException("Recipe family not found: " + familyId));

        for (RecipeFamilyMemberDTO memberDTO : memberDTOs) {
            // Check if recipe exists
            Recipe recipe = recipeRepository.findById(memberDTO.getRecipeId())
                .orElseThrow(() -> new IllegalArgumentException("Recipe not found: " + memberDTO.getRecipeId()));

            // Check if recipe is already in a family
            if (recipeFamilyMemberRepository.existsByRecipeId(memberDTO.getRecipeId())) {
                throw new IllegalArgumentException("Recipe '" + recipe.getName() + "' is already in a family");
            }

            RecipeFamilyMember member = new RecipeFamilyMember();
            member.setFamily(family);
            member.setRecipe(recipe);
            member.setVariantLabel(memberDTO.getVariantLabel());
            member.setIsDefault(memberDTO.getIsDefault() != null ? memberDTO.getIsDefault() : false);
            member.setDisplayOrder(memberDTO.getDisplayOrder() != null ? memberDTO.getDisplayOrder() : 0);

            family.getMembers().add(member);
        }

        // Validate exactly one default
        validateOneDefault(family);

        RecipeFamily saved = recipeFamilyRepository.save(family);
        log.info("Added {} members to family: {}", memberDTOs.size(), family.getFamilyName());

        return toFamilyDTO(saved);
    }

    /**
     * Update a family member (variant label, display order, is_default).
     */
    @Transactional
    public RecipeFamilyDTO updateMember(Long familyId, Long recipeId, RecipeFamilyMemberDTO dto) {
        RecipeFamily family = recipeFamilyRepository.findById(familyId)
            .orElseThrow(() -> new IllegalArgumentException("Recipe family not found: " + familyId));

        RecipeFamilyMember member = family.getMembers().stream()
            .filter(m -> m.getRecipe().getId().equals(recipeId))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Recipe not found in this family"));

        member.setVariantLabel(dto.getVariantLabel());
        member.setDisplayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : member.getDisplayOrder());

        // Handle default change
        if (dto.getIsDefault() != null && dto.getIsDefault() && !member.getIsDefault()) {
            // Clear previous default
            family.getMembers().forEach(m -> m.setIsDefault(false));
            member.setIsDefault(true);
        }

        RecipeFamily saved = recipeFamilyRepository.save(family);
        log.info("Updated member {} in family: {}", recipeId, family.getFamilyName());

        return toFamilyDTO(saved);
    }

    /**
     * Remove a recipe from a family.
     */
    @Transactional
    public RecipeFamilyDTO removeMemberFromFamily(Long familyId, Long recipeId) {
        RecipeFamily family = recipeFamilyRepository.findById(familyId)
            .orElseThrow(() -> new IllegalArgumentException("Recipe family not found: " + familyId));

        RecipeFamilyMember memberToRemove = family.getMembers().stream()
            .filter(m -> m.getRecipe().getId().equals(recipeId))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Recipe not found in this family"));

        // If removing default and family has other members, require setting new default first
        if (memberToRemove.getIsDefault() && family.getMembers().size() > 1) {
            throw new IllegalArgumentException(
                "Cannot remove default recipe. Set a new default first.");
        }

        family.getMembers().remove(memberToRemove);
        recipeFamilyMemberRepository.delete(memberToRemove);

        RecipeFamily saved = recipeFamilyRepository.save(family);
        log.info("Removed recipe {} from family: {}", recipeId, family.getFamilyName());

        return toFamilyDTO(saved);
    }

    /**
     * Set default recipe for a family.
     */
    @Transactional
    public RecipeFamilyDTO setDefaultRecipe(Long familyId, Long recipeId) {
        RecipeFamily family = recipeFamilyRepository.findById(familyId)
            .orElseThrow(() -> new IllegalArgumentException("Recipe family not found: " + familyId));

        boolean found = false;
        for (RecipeFamilyMember member : family.getMembers()) {
            if (member.getRecipe().getId().equals(recipeId)) {
                member.setIsDefault(true);
                found = true;
            } else {
                member.setIsDefault(false);
            }
        }

        if (!found) {
            throw new IllegalArgumentException("Recipe not found in this family");
        }

        RecipeFamily saved = recipeFamilyRepository.save(family);
        log.info("Set recipe {} as default in family: {}", recipeId, family.getFamilyName());

        return toFamilyDTO(saved);
    }

    // ========================================
    // PRIVATE HELPERS
    // ========================================

    private void validateOneDefault(RecipeFamily family) {
        if (family.getMembers().isEmpty()) {
            return;
        }

        long defaultCount = family.getMembers().stream()
            .filter(m -> Boolean.TRUE.equals(m.getIsDefault()))
            .count();

        if (defaultCount == 0) {
            // Set first member as default
            family.getMembers().get(0).setIsDefault(true);
        } else if (defaultCount > 1) {
            throw new IllegalArgumentException("Only one recipe can be the default in a family");
        }
    }

    private RecipeVariantDTO toVariantDTO(RecipeFamilyMember member) {
        Recipe recipe = member.getRecipe();
        // FR-043: Calculate per-serving calories for dropdown display
        Integer caloriesPerServing = recipe.getDefaultServings() > 0
            ? recipe.getCalories() / recipe.getDefaultServings()
            : recipe.getCalories();
        return new RecipeVariantDTO(
            recipe.getId(),
            recipe.getName(),
            member.getVariantLabel(),
            member.getIsDefault(),
            member.getDisplayOrder(),
            caloriesPerServing
        );
    }

    private RecipeFamilyDTO toFamilyDTO(RecipeFamily family) {
        List<RecipeVariantDTO> variants = family.getMembers().stream()
            .map(this::toVariantDTO)
            .collect(Collectors.toList());

        return RecipeFamilyDTO.builder()
            .id(family.getId())
            .familyName(family.getFamilyName())
            .description(family.getDescription())
            .variants(variants)
            .build();
    }
}
