package com.foodbytes.service;

import com.foodbytes.dto.*;
import com.foodbytes.model.Aisle;
import com.foodbytes.model.Ingredient;
import com.foodbytes.repository.AisleRepository;
import com.foodbytes.repository.IngredientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for ingredient management and validation.
 * Implements NFR-010 (Centralized Ingredient Definitions) and NFR-011 (Data Validation Helpers).
 *
 * Mirrors the N() function pattern from Legacy recipes.js:
 * - validateAndGetByKey() = validates ingredient key exists (like N() does)
 * - Recipes must use keys from master list, no free-text allowed
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class IngredientService {

    private final IngredientRepository ingredientRepository;
    private final AisleRepository aisleRepository;

    // Fuzzy matching thresholds (stricter per requirements)
    private static final double SIMILARITY_THRESHOLD = 0.50;  // Show similar at 50%
    private static final double BLOCK_THRESHOLD = 0.70;       // Block at 70%

    // Common plural endings to normalize to singular
    private static final LinkedHashMap<String, String> PLURAL_RULES = new LinkedHashMap<>();
    static {
        PLURAL_RULES.put("ies", "y");    // berries -> berry
        PLURAL_RULES.put("oes", "o");    // tomatoes -> tomato
        PLURAL_RULES.put("ves", "f");    // leaves -> leaf
        PLURAL_RULES.put("es", "");      // slices -> slice
        PLURAL_RULES.put("s", "");       // carrots -> carrot
    }

    // ========================================
    // VALIDATION METHODS (like N() function)
    // ========================================

    /**
     * Validates an ingredient key exists - mirrors the N() function pattern.
     * Called when adding ingredients to recipes.
     *
     * @param key The ingredient key (e.g., "chicken_breast")
     * @return The Ingredient if valid
     * @throws IllegalArgumentException if key doesn't exist
     */
    @Transactional(readOnly = true)
    public Ingredient validateAndGetByKey(String key) {
        return ingredientRepository.findByKeyIgnoreCase(key)
                .orElseThrow(() -> {
                    log.error("Missing ingredient key: \"{}\"", key);
                    return new IllegalArgumentException(
                            "Invalid ingredient key: \"" + key + "\". " +
                            "Ingredient must exist in the master list."
                    );
                });
    }

    /**
     * Batch validate multiple ingredient keys (for recipe creation).
     */
    @Transactional(readOnly = true)
    public Map<String, Ingredient> validateAndGetByKeys(List<String> keys) {
        Map<String, Ingredient> result = new HashMap<>();
        List<String> invalidKeys = new ArrayList<>();

        for (String key : keys) {
            Optional<Ingredient> ing = ingredientRepository.findByKeyIgnoreCase(key);
            if (ing.isPresent()) {
                result.put(key.toLowerCase(), ing.get());
            } else {
                invalidKeys.add(key);
            }
        }

        if (!invalidKeys.isEmpty()) {
            log.error("Missing ingredient keys: {}", invalidKeys);
            throw new IllegalArgumentException(
                    "Invalid ingredient keys: " + invalidKeys +
                    ". All ingredients must exist in the master list."
            );
        }

        return result;
    }

    // ========================================
    // NAME NORMALIZATION (singular form)
    // ========================================

    /**
     * Normalizes an ingredient name:
     * - Trim whitespace
     * - Convert to singular form
     * - Title case
     */
    public String normalizeName(String name) {
        if (name == null || name.isBlank()) {
            return "";
        }

        String trimmed = name.trim();
        String singular = toSingular(trimmed);
        return toTitleCase(singular);
    }

    /**
     * Converts a word to singular form using common English rules.
     */
    private String toSingular(String word) {
        String lower = word.toLowerCase();

        // Check each plural rule in order
        for (Map.Entry<String, String> rule : PLURAL_RULES.entrySet()) {
            if (lower.endsWith(rule.getKey()) && lower.length() > rule.getKey().length() + 1) {
                String stem = word.substring(0, word.length() - rule.getKey().length());
                return stem + rule.getValue();
            }
        }

        return word;
    }

    private String toTitleCase(String text) {
        if (text == null || text.isEmpty()) return text;

        // Split on spaces and capitalize first letter of each word
        return Arrays.stream(text.split("\\s+"))
                .map(word -> word.isEmpty() ? word :
                    Character.toUpperCase(word.charAt(0)) + word.substring(1).toLowerCase())
                .collect(Collectors.joining(" "));
    }

    /**
     * Generates a key from a name (e.g., "Chicken breast" -> "chicken_breast")
     */
    public String generateKeyFromName(String name) {
        if (name == null || name.isBlank()) return "";
        return name.trim()
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "_")
                .replaceAll("^_+|_+$", "");
    }

    // ========================================
    // FUZZY MATCHING / SIMILARITY
    // ========================================

    /**
     * Finds ingredients similar to the given name using multiple strategies:
     * 1. Exact match (case-insensitive)
     * 2. Prefix match
     * 3. Contains match
     * 4. Levenshtein distance for typos
     */
    @Transactional(readOnly = true)
    public List<IngredientSearchResultDTO> findSimilar(String searchName, int maxResults) {
        String normalized = normalizeName(searchName);
        String lowerNorm = normalized.toLowerCase();

        List<IngredientSearchResultDTO> results = new ArrayList<>();
        Set<Long> seenIds = new HashSet<>();

        // 1. Exact match
        ingredientRepository.findByNameIgnoreCase(normalized)
                .ifPresent(ing -> {
                    results.add(toSearchResult(ing, 1.0));
                    seenIds.add(ing.getId());
                });

        // 2. Prefix match
        ingredientRepository.findByNameStartingWithIgnoreCase(normalized).stream()
                .filter(ing -> !seenIds.contains(ing.getId()))
                .forEach(ing -> {
                    results.add(toSearchResult(ing, 0.9));
                    seenIds.add(ing.getId());
                });

        // 3. Contains match
        if (results.size() < maxResults) {
            ingredientRepository.searchByNameContaining(normalized).stream()
                    .filter(ing -> !seenIds.contains(ing.getId()))
                    .forEach(ing -> {
                        double score = calculateContainsScore(ing.getName(), lowerNorm);
                        results.add(toSearchResult(ing, score));
                        seenIds.add(ing.getId());
                    });
        }

        // 4. Levenshtein fuzzy match for typos
        if (results.size() < maxResults) {
            List<Ingredient> allIngredients = ingredientRepository.findAllByOrderByNameAsc();
            allIngredients.stream()
                    .filter(ing -> !seenIds.contains(ing.getId()))
                    .map(ing -> {
                        double score = calculateLevenshteinScore(
                                ing.getName().toLowerCase(), lowerNorm
                        );
                        return new AbstractMap.SimpleEntry<>(ing, score);
                    })
                    .filter(entry -> entry.getValue() >= SIMILARITY_THRESHOLD)
                    .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                    .limit(maxResults - results.size())
                    .forEach(entry -> results.add(toSearchResult(entry.getKey(), entry.getValue())));
        }

        // Sort by score descending and limit
        return results.stream()
                .sorted((a, b) -> Double.compare(b.getSimilarityScore(), a.getSimilarityScore()))
                .limit(maxResults)
                .collect(Collectors.toList());
    }

    private double calculateContainsScore(String name, String search) {
        String lowerName = name.toLowerCase();
        if (lowerName.startsWith(search)) return 0.85;
        if (lowerName.contains(search)) return 0.7;
        return 0.5;
    }

    /**
     * Levenshtein distance normalized to a 0-1 similarity score.
     */
    private double calculateLevenshteinScore(String s1, String s2) {
        int distance = levenshteinDistance(s1, s2);
        int maxLen = Math.max(s1.length(), s2.length());
        if (maxLen == 0) return 1.0;
        return 1.0 - ((double) distance / maxLen);
    }

    private int levenshteinDistance(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];

        for (int i = 0; i <= s1.length(); i++) dp[i][0] = i;
        for (int j = 0; j <= s2.length(); j++) dp[0][j] = j;

        for (int i = 1; i <= s1.length(); i++) {
            for (int j = 1; j <= s2.length(); j++) {
                int cost = (s1.charAt(i - 1) == s2.charAt(j - 1)) ? 0 : 1;
                dp[i][j] = Math.min(
                        Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                        dp[i - 1][j - 1] + cost
                );
            }
        }

        return dp[s1.length()][s2.length()];
    }

    private IngredientSearchResultDTO toSearchResult(Ingredient ing, double score) {
        return new IngredientSearchResultDTO(
                ing.getId(),
                ing.getKey(),
                ing.getName(),
                ing.getAisle().getName(),
                score
        );
    }

    // ========================================
    // VALIDATION FOR NEW INGREDIENT CREATION
    // ========================================

    /**
     * Validates a proposed new ingredient name before creation.
     * Returns validation result with:
     * - Normalized name
     * - Suggested key
     * - Similar existing ingredients (potential duplicates)
     * - Validation errors
     */
    @Transactional(readOnly = true)
    public IngredientValidationResultDTO validateNewIngredient(String proposedName) {
        List<String> errors = new ArrayList<>();
        String normalized = normalizeName(proposedName);
        String suggestedKey = generateKeyFromName(normalized);

        // Check empty
        if (normalized.isBlank()) {
            errors.add("Ingredient name cannot be empty");
            return new IngredientValidationResultDTO(false, normalized, suggestedKey, List.of(), errors);
        }

        // Check length
        if (normalized.length() < 2) {
            errors.add("Ingredient name must be at least 2 characters");
        }
        if (normalized.length() > 255) {
            errors.add("Ingredient name cannot exceed 255 characters");
        }

        // Check exact duplicate (case-insensitive)
        if (ingredientRepository.existsByNameIgnoreCase(normalized)) {
            errors.add("An ingredient with this name already exists");
        }

        // Check key collision
        if (ingredientRepository.existsByKeyIgnoreCase(suggestedKey)) {
            errors.add("Generated key '" + suggestedKey + "' conflicts with existing ingredient");
        }

        // Find similar ingredients (potential duplicates)
        List<IngredientSearchResultDTO> similar = findSimilar(normalized, 5)
                .stream()
                .filter(s -> s.getSimilarityScore() >= SIMILARITY_THRESHOLD)
                .collect(Collectors.toList());

        // If high similarity found, warn (but don't block unless very similar)
        if (!similar.isEmpty() && similar.get(0).getSimilarityScore() >= BLOCK_THRESHOLD) {
            errors.add("Very similar ingredient exists: '" + similar.get(0).getName() +
                    "' (similarity: " + Math.round(similar.get(0).getSimilarityScore() * 100) + "%). " +
                    "Consider using the existing ingredient instead.");
        }

        boolean valid = errors.isEmpty();

        return new IngredientValidationResultDTO(valid, normalized, suggestedKey, similar, errors);
    }

    // ========================================
    // CRUD OPERATIONS
    // ========================================

    @Transactional(readOnly = true)
    public List<IngredientAdminDTO> getAllIngredients() {
        return ingredientRepository.findAllByOrderByNameAsc().stream()
                .map(this::toAdminDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public IngredientAdminDTO getIngredientById(Long id) {
        return ingredientRepository.findById(id)
                .map(this::toAdminDTO)
                .orElseThrow(() -> new IllegalArgumentException("Ingredient not found: " + id));
    }

    @Transactional
    public IngredientAdminDTO createIngredient(IngredientAdminDTO dto) {
        // Validate first
        IngredientValidationResultDTO validation = validateNewIngredient(dto.getName());
        if (!validation.isValid()) {
            throw new IllegalArgumentException(
                    "Invalid ingredient: " + String.join("; ", validation.getValidationErrors())
            );
        }

        // Get aisle
        Aisle aisle = aisleRepository.findById(dto.getAisleId())
                .orElseThrow(() -> new IllegalArgumentException("Aisle not found: " + dto.getAisleId()));

        // Create ingredient
        Ingredient ingredient = new Ingredient();
        ingredient.setKey(validation.getSuggestedKey());
        ingredient.setName(validation.getNormalizedName());
        ingredient.setAisle(aisle);

        // FR-080: Set macro fields if provided
        if (dto.getProteinPer100g() != null) {
            ingredient.setProteinPer100g(dto.getProteinPer100g());
        }
        if (dto.getCarbsPer100g() != null) {
            ingredient.setCarbsPer100g(dto.getCarbsPer100g());
        }
        if (dto.getFatPer100g() != null) {
            ingredient.setFatPer100g(dto.getFatPer100g());
        }

        // FR-083: Set verification flag (defaults to false)
        // Can only be verified if all macro fields are set
        if (dto.getMacrosVerified() != null && dto.getMacrosVerified()) {
            validateMacrosForVerification(dto);
            ingredient.setMacrosVerified(true);
        }

        Ingredient saved = ingredientRepository.save(ingredient);
        log.info("Created new ingredient: {} (key: {}, verified: {})",
                saved.getName(), saved.getKey(), saved.getMacrosVerified());

        return toAdminDTO(saved);
    }

    @Transactional
    public IngredientAdminDTO updateIngredient(Long id, IngredientAdminDTO dto) {
        Ingredient existing = ingredientRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ingredient not found: " + id));

        String normalizedName = normalizeName(dto.getName());

        // Check if name changed and validate
        if (!existing.getName().equalsIgnoreCase(normalizedName)) {
            if (ingredientRepository.existsByNameIgnoreCase(normalizedName)) {
                throw new IllegalArgumentException("An ingredient with name '" + normalizedName + "' already exists");
            }
            existing.setName(normalizedName);
        }

        // Update aisle if changed
        if (!existing.getAisle().getId().equals(dto.getAisleId())) {
            Aisle aisle = aisleRepository.findById(dto.getAisleId())
                    .orElseThrow(() -> new IllegalArgumentException("Aisle not found: " + dto.getAisleId()));
            existing.setAisle(aisle);
        }

        // FR-080: Update macro fields if provided
        if (dto.getProteinPer100g() != null) {
            existing.setProteinPer100g(dto.getProteinPer100g());
        }
        if (dto.getCarbsPer100g() != null) {
            existing.setCarbsPer100g(dto.getCarbsPer100g());
        }
        if (dto.getFatPer100g() != null) {
            existing.setFatPer100g(dto.getFatPer100g());
        }

        // FR-083: Update verification flag
        if (dto.getMacrosVerified() != null && dto.getMacrosVerified()) {
            validateMacrosForVerification(dto);
            existing.setMacrosVerified(true);
        } else if (dto.getMacrosVerified() != null && !dto.getMacrosVerified()) {
            existing.setMacrosVerified(false);
        }

        Ingredient saved = ingredientRepository.save(existing);
        log.info("Updated ingredient: {} (key: {}, verified: {})",
                saved.getName(), saved.getKey(), saved.getMacrosVerified());

        return toAdminDTO(saved);
    }

    /**
     * FR-083: Validates that all macro fields are set before marking as verified.
     * Admin must enter protein, carbs, and fat values to verify an ingredient.
     */
    private void validateMacrosForVerification(IngredientAdminDTO dto) {
        if (dto.getProteinPer100g() == null ||
            dto.getCarbsPer100g() == null ||
            dto.getFatPer100g() == null) {
            throw new IllegalArgumentException(
                    "Cannot mark ingredient as verified: protein_per_100g, carbs_per_100g, and fat_per_100g must all be set");
        }
    }

    @Transactional
    public void deleteIngredient(Long id) {
        if (!ingredientRepository.existsById(id)) {
            throw new IllegalArgumentException("Ingredient not found: " + id);
        }
        // Note: FK constraint will prevent deletion if ingredient is used in recipes
        ingredientRepository.deleteById(id);
        log.info("Deleted ingredient with id: {}", id);
    }

    // ========================================
    // AUTOCOMPLETE FOR ADMIN UI
    // ========================================

    @Transactional(readOnly = true)
    public List<IngredientSearchResultDTO> autocomplete(String query, int limit) {
        if (query == null || query.length() < 2) {
            return List.of();
        }
        return findSimilar(query, limit);
    }

    private IngredientAdminDTO toAdminDTO(Ingredient ing) {
        IngredientAdminDTO dto = new IngredientAdminDTO();
        dto.setId(ing.getId());
        dto.setKey(ing.getKey());
        dto.setName(ing.getName());
        dto.setAisleId(ing.getAisle().getId());
        dto.setAisleName(ing.getAisle().getName());
        // FR-080: Include macro fields
        dto.setProteinPer100g(ing.getProteinPer100g());
        dto.setCarbsPer100g(ing.getCarbsPer100g());
        dto.setFatPer100g(ing.getFatPer100g());
        // FR-083: Include verification flag
        dto.setMacrosVerified(ing.getMacrosVerified());
        return dto;
    }
}
