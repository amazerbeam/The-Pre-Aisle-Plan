package com.foodbytes.dto;

import java.time.Instant;

/**
 * MPP-12: response of PUT /api/meal-plan/{id}/eaten. Slim on purpose: the tick needs no recipe
 * summary or macro recomputation. eatenAt is UTC and serialises as ISO-8601 with a trailing Z.
 */
public record MealPlanEntryEatenDTO(Long id, boolean eaten, Instant eatenAt) {}
