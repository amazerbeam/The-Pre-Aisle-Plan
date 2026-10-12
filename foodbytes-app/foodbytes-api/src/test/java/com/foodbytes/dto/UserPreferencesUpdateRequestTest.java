package com.foodbytes.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * MPP-13: PATCH semantics and validation for /api/users/me/preferences.
 * A field absent from the body must stay untouched — otherwise saving meal
 * times would silently clear a saved Default portions value, and vice versa.
 */
class UserPreferencesUpdateRequestTest {

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    private UserPreferencesUpdateRequest read(String json) throws Exception {
        return objectMapper.readValue(json, UserPreferencesUpdateRequest.class);
    }

    private Set<String> messages(UserPreferencesUpdateRequest request) {
        return validator.validate(request).stream()
                .map(ConstraintViolation::getMessage)
                .collect(java.util.stream.Collectors.toSet());
    }

    @Test
    void mealTimesOnly_leavesDefaultServingsAbsent() throws Exception {
        UserPreferencesUpdateRequest r = read(
                "{\"mealTimes\":{\"breakfastBy\":\"09:30\",\"lunchBy\":\"13:00\",\"dinnerBy\":\"19:30\"}}");

        assertThat(r.isMealTimesPresent()).isTrue();
        assertThat(r.isDefaultServingsPresent()).isFalse();
        assertThat(messages(r)).isEmpty();
    }

    @Test
    void defaultServingsOnly_leavesMealTimesAbsent() throws Exception {
        UserPreferencesUpdateRequest r = read("{\"defaultServings\":1.5}");

        assertThat(r.isDefaultServingsPresent()).isTrue();
        assertThat(r.isMealTimesPresent()).isFalse();
    }

    @Test
    void explicitNullMealTimes_isPresentAndValid_meaningReset() throws Exception {
        UserPreferencesUpdateRequest r = read("{\"mealTimes\":null}");

        assertThat(r.isMealTimesPresent()).isTrue();
        assertThat(r.getMealTimes()).isNull();
        assertThat(messages(r)).isEmpty();
    }

    @Test
    void badFormat_isRejected_withFormatMessage() throws Exception {
        UserPreferencesUpdateRequest r = read(
                "{\"mealTimes\":{\"breakfastBy\":\"9:30\",\"lunchBy\":\"13:00\",\"dinnerBy\":\"19:30\"}}");

        assertThat(messages(r)).containsExactly("Meal times must be HH:mm");
    }

    @Test
    void missingTime_isRejected_withFormatMessage() throws Exception {
        UserPreferencesUpdateRequest r = read(
                "{\"mealTimes\":{\"breakfastBy\":\"09:30\",\"dinnerBy\":\"19:30\"}}");

        assertThat(messages(r)).containsExactly("Meal times must be HH:mm");
    }

    @Test
    void outOfOrder_isRejected_withOrderMessage() throws Exception {
        UserPreferencesUpdateRequest r = read(
                "{\"mealTimes\":{\"breakfastBy\":\"13:00\",\"lunchBy\":\"12:00\",\"dinnerBy\":\"19:30\"}}");

        assertThat(messages(r)).containsExactly("Times must run breakfast → lunch → dinner.");
    }

    @Test
    void equalTimes_areRejected_strictOrder() throws Exception {
        UserPreferencesUpdateRequest r = read(
                "{\"mealTimes\":{\"breakfastBy\":\"12:00\",\"lunchBy\":\"12:00\",\"dinnerBy\":\"19:30\"}}");

        assertThat(messages(r)).containsExactly("Times must run breakfast → lunch → dinner.");
    }
}
