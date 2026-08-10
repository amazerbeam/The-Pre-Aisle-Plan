package com.foodbytes.service;

import com.foodbytes.dto.UserDTO;
import com.foodbytes.model.User;
import com.foodbytes.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * MPP-3: UserService.updateDefaultServings.
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

    @Test
    void updateDefaultServings_storesTheValue_andReturnsItOnTheDTO() {
        stubSave();

        UserDTO dto = userService.updateDefaultServings(USER_ID, new BigDecimal("1.00"));

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
    void updateDefaultServings_withNull_clearsThePreference() {
        user.setDefaultServings(new BigDecimal("3.00"));
        stubSave();

        UserDTO dto = userService.updateDefaultServings(USER_ID, null);

        assertThat(user.getDefaultServings()).isNull();
        assertThat(dto.getDefaultServings()).isNull();
    }

    @Test
    void updateDefaultServings_whenUserMissing_throws() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateDefaultServings(USER_ID, BigDecimal.ONE))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User not found");
    }
}
