package com.foodbytes.dto;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

/** Validation contract of PATCH /api/meal-plan/{id}: date+meal travel together, body not empty, servings 0.25-20 at 2 dp. */
class MealPlanEntryUpdateRequestTest {

    private static Validator validator() {
        return Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    void moveOnly_isValid() {
        assertThat(validator().validate(new MealPlanEntryUpdateRequest(LocalDate.of(2026, 11, 15), 2L, null))).isEmpty();
    }

    @Test
    void servingsOnly_isValid() {
        assertThat(validator().validate(new MealPlanEntryUpdateRequest(null, null, new BigDecimal("1.5")))).isEmpty();
    }

    @Test
    void dateWithoutMeal_isInvalid() {
        assertThat(validator().validate(new MealPlanEntryUpdateRequest(LocalDate.of(2026, 11, 15), null, null)))
            .extracting(v -> v.getMessage()).contains("planDate and mealId must be sent together");
    }

    @Test
    void emptyBody_isInvalid() {
        assertThat(validator().validate(new MealPlanEntryUpdateRequest(null, null, null)))
            .extracting(v -> v.getMessage()).contains("Nothing to update");
    }

    @Test
    void servingsOutOfRange_isInvalid() {
        assertThat(validator().validate(new MealPlanEntryUpdateRequest(null, null, new BigDecimal("0.10")))).isNotEmpty();
        assertThat(validator().validate(new MealPlanEntryUpdateRequest(null, null, new BigDecimal("20.01")))).isNotEmpty();
        assertThat(validator().validate(new MealPlanEntryUpdateRequest(null, null, new BigDecimal("1.255")))).isNotEmpty();
    }
}
