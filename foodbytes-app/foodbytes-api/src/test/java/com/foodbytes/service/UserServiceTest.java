package com.foodbytes.service;

import com.foodbytes.dto.MealTimesRequest;
import com.foodbytes.dto.UserDTO;
import com.foodbytes.dto.UserPreferencesUpdateRequest;
import com.foodbytes.model.User;
import com.foodbytes.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * MPP-3 / MPP-13: UserService.updatePreferences and getUserDTO.
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @InjectMocks private UserService userService;

    private static final Long USER_ID = 7L;
    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(USER_ID);
        user.setEmail("cook@example.com");
        user.setName("Cook");
        user.setIsAdmin(false);
    }

    private void stubSave() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    private static UserPreferencesUpdateRequest servings(BigDecimal value) {
        UserPreferencesUpdateRequest r = new UserPreferencesUpdateRequest();
        r.setDefaultServings(value);
        return r;
    }

    private static UserPreferencesUpdateRequest times(MealTimesRequest value) {
        UserPreferencesUpdateRequest r = new UserPreferencesUpdateRequest();
        r.setMealTimes(value);
        return r;
    }

    @Test
    void updatePreferences_storesTheValue_andReturnsItOnTheDTO() {
        stubSave();

        UserDTO dto = userService.updatePreferences(USER_ID, servings(new BigDecimal("1.00")));

        assertThat(user.getDefaultServings()).isEqualByComparingTo("1.00");
        assertThat(dto.getDefaultServings()).isEqualByComparingTo("1.00");
    }

    /**
     * AC 9: an explicit null clears the preference back to "never set" so the
     * starting value falls back to the recipe's own default_servings. A null
     * coerced to 1 here would look identical in the UI but would permanently
     * pin every recipe to one serving.
     */
    @Test
    void updatePreferences_withNull_clearsThePreference() {
        user.setDefaultServings(new BigDecimal("3.00"));
        stubSave();

        UserDTO dto = userService.updatePreferences(USER_ID, servings(null));

        assertThat(user.getDefaultServings()).isNull();
        assertThat(dto.getDefaultServings()).isNull();
    }

    @Test
    void updatePreferences_whenUserMissing_throws() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updatePreferences(USER_ID, servings(BigDecimal.ONE)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void updatePreferences_mealTimes_storesAllThree_andLeavesServingsUntouched() {
        user.setDefaultServings(new BigDecimal("3.00"));
        stubSave();

        UserDTO dto = userService.updatePreferences(USER_ID,
                times(new MealTimesRequest("08:30", "13:00", "19:30")));

        assertThat(user.getBreakfastBy()).isEqualTo(LocalTime.of(8, 30));
        assertThat(user.getLunchBy()).isEqualTo(LocalTime.of(13, 0));
        assertThat(user.getDinnerBy()).isEqualTo(LocalTime.of(19, 30));
        assertThat(user.getDefaultServings()).isEqualByComparingTo("3.00");
        assertThat(dto.getMealTimes().getLunchBy()).isEqualTo("13:00");
        assertThat(dto.getMealTimes().isCustom()).isTrue();
    }

    /** AC 5: reset clears to NULL — it must not write the default values into the row. */
    @Test
    void updatePreferences_nullMealTimes_clearsAllThree_andReturnsDefaults() {
        user.setBreakfastBy(LocalTime.of(8, 30));
        user.setLunchBy(LocalTime.of(13, 0));
        user.setDinnerBy(LocalTime.of(19, 30));
        stubSave();

        UserDTO dto = userService.updatePreferences(USER_ID, times(null));

        assertThat(user.getBreakfastBy()).isNull();
        assertThat(user.getLunchBy()).isNull();
        assertThat(user.getDinnerBy()).isNull();
        assertThat(dto.getMealTimes().getBreakfastBy()).isEqualTo("11:00");
        assertThat(dto.getMealTimes().isCustom()).isFalse();
    }

    @Test
    void updatePreferences_servingsOnly_leavesMealTimesUntouched() {
        user.setLunchBy(LocalTime.of(13, 0));
        stubSave();

        userService.updatePreferences(USER_ID, servings(new BigDecimal("2.00")));

        assertThat(user.getLunchBy()).isEqualTo(LocalTime.of(13, 0));
    }

    @Test
    void getUserDTO_returnsEffectiveMealTimes() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));

        UserDTO dto = userService.getUserDTO(USER_ID);

        assertThat(dto.getId()).isEqualTo(USER_ID);
        assertThat(dto.getMealTimes().getDinnerBy()).isEqualTo("21:00");
    }
}
