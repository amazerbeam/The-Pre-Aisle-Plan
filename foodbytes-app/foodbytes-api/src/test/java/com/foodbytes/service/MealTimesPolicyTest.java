package com.foodbytes.service;

import com.foodbytes.dto.MealTimesDTO;
import com.foodbytes.model.User;
import org.junit.jupiter.api.Test;

import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * MPP-13: defaults and the strict-order rule. The frontend mirrors the order rule
 * in client/src/utils/mealTimesUtils.js (AC 7: "same rules as the frontend").
 */
class MealTimesPolicyTest {

    @Test
    void effective_neverSet_returnsDefaults_notCustom() {
        MealTimesDTO dto = MealTimesPolicy.effective(new User());

        assertThat(dto.getBreakfastBy()).isEqualTo("11:00");
        assertThat(dto.getLunchBy()).isEqualTo("15:00");
        assertThat(dto.getDinnerBy()).isEqualTo("21:00");
        assertThat(dto.isCustom()).isFalse();
    }

    @Test
    void effective_saved_returnsSavedTimes_asHHmm_custom() {
        User user = new User();
        user.setBreakfastBy(LocalTime.of(8, 30));
        user.setLunchBy(LocalTime.of(13, 0));
        user.setDinnerBy(LocalTime.of(19, 5));

        MealTimesDTO dto = MealTimesPolicy.effective(user);

        assertThat(dto.getBreakfastBy()).isEqualTo("08:30");
        assertThat(dto.getLunchBy()).isEqualTo("13:00");
        assertThat(dto.getDinnerBy()).isEqualTo("19:05");
        assertThat(dto.isCustom()).isTrue();
    }

    @Test
    void isStrictlyOrdered_rejectsEqualAndReversed() {
        LocalTime nine = LocalTime.of(9, 0), noon = LocalTime.of(12, 0), six = LocalTime.of(18, 0);

        assertThat(MealTimesPolicy.isStrictlyOrdered(nine, noon, six)).isTrue();
        assertThat(MealTimesPolicy.isStrictlyOrdered(nine, nine, six)).isFalse();
        assertThat(MealTimesPolicy.isStrictlyOrdered(noon, nine, six)).isFalse();
        assertThat(MealTimesPolicy.isStrictlyOrdered(nine, six, noon)).isFalse();
    }

    @Test
    void byTime_usesSavedTimeOrDefault_andIsEmptyForNonMainMeals() {
        User user = new User();
        user.setLunchBy(LocalTime.of(13, 30));

        assertThat(MealTimesPolicy.byTime(user, "breakfast")).contains(MealTimesPolicy.DEFAULT_BREAKFAST_BY);
        assertThat(MealTimesPolicy.byTime(user, "lunch")).contains(LocalTime.of(13, 30));
        assertThat(MealTimesPolicy.byTime(user, "dinner")).contains(MealTimesPolicy.DEFAULT_DINNER_BY);
        assertThat(MealTimesPolicy.byTime(user, "snacks")).isEmpty();
        assertThat(MealTimesPolicy.byTime(user, "extras")).isEmpty();
    }
}
