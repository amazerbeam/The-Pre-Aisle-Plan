package com.foodbytes.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * A request body that omits "servings" must deserialise to null so
 * MealPlanService can substitute the recipe's default_servings.
 *
 * <p>The validation tests below pin the other half of that contract: the bean
 * validation constraints must reject a non-positive explicit value (so the API
 * returns 400 rather than quietly storing something that zeroes every
 * shopping-list quantity), while staying silent on null.
 */
class MealPlanCreateRequestTest {

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    private static Validator validator() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        return factory.getValidator();
    }

    @Test
    void omittedServings_deserialisesToNull() throws Exception {
        String json = "{\"planDate\":\"2026-07-31\",\"mealId\":3,\"recipeId\":104}";

        MealPlanCreateRequest request = objectMapper.readValue(json, MealPlanCreateRequest.class);

        assertThat(request.getServings()).isNull();
    }

    @Test
    void explicitServings_isPreserved() throws Exception {
        String json = "{\"planDate\":\"2026-07-31\",\"mealId\":3,\"recipeId\":104,\"servings\":4}";

        MealPlanCreateRequest request = objectMapper.readValue(json, MealPlanCreateRequest.class);

        assertThat(request.getServings()).isEqualByComparingTo("4");
    }

    /**
     * An explicit servings of 0 must be rejected at the DTO boundary. Without this
     * barrier a 0 reaches ShoppingListService, which computes
     * quantity * 0 / default_servings = 0.00 for every ingredient — a silently
     * empty shopping list.
     *
     * <p>The lower bound is the DTO's {@code @DecimalMin("0.25")} (fractional
     * portions are legal; zero and negatives are not).
     */
    @Test
    void zeroServings_isRejectedByValidation() throws Exception {
        String json = "{\"planDate\":\"2026-07-31\",\"mealId\":3,\"recipeId\":104,\"servings\":0}";
        MealPlanCreateRequest request = objectMapper.readValue(json, MealPlanCreateRequest.class);

        Set<ConstraintViolation<MealPlanCreateRequest>> violations = validator().validate(request);

        assertThat(violations).hasSize(1);
        ConstraintViolation<MealPlanCreateRequest> violation = violations.iterator().next();
        assertThat(violation.getPropertyPath()).hasToString("servings");
        assertThat(violation.getMessage()).isEqualTo("Servings must be at least 0.25");
    }

    /**
     * The premise of the whole fix: the servings constraints must NOT fire on null,
     * so an omitted value falls through to MealPlanService.resolveServings and picks
     * up the recipe's default_servings instead of being rejected as a 400.
     */
    @Test
    void omittedServings_passesValidation() throws Exception {
        String json = "{\"planDate\":\"2026-07-31\",\"mealId\":3,\"recipeId\":104}";
        MealPlanCreateRequest request = objectMapper.readValue(json, MealPlanCreateRequest.class);

        Set<ConstraintViolation<MealPlanCreateRequest>> violations = validator().validate(request);

        assertThat(violations).isEmpty();
    }
}
