package com.foodbytes.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

/**
 * MPP-20: an answer to Pip's check-in. clean = true credits every day since the last answer;
 * clean = false needs the lapse day. The coversFrom..today window is checked in the service,
 * which knows today and the last answer.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HabitAnswerRequest {

    @NotNull(message = "clean is required")
    private Boolean clean;

    private LocalDate lapseDate;

    @JsonIgnore
    @AssertTrue(message = "lapseDate is required when clean is false")
    public boolean isLapseDateGivenWhenLapsed() {
        return !Boolean.FALSE.equals(clean) || lapseDate != null;
    }
}
