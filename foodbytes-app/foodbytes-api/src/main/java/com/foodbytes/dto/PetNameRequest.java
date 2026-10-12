package com.foodbytes.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.foodbytes.service.PetPolicy;
import jakarta.validation.constraints.AssertTrue;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * MPP-14: rename the plan's pet. A null or blank name resets it to the default.
 * The length rule is checked on the TRIMMED name, so "  Pip  " is fine; @Size on
 * the raw string would reject padding the service is about to strip anyway.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetNameRequest {

    private String name;

    @JsonIgnore
    @AssertTrue(message = PetPolicy.NAME_LENGTH_ERROR)
    public boolean isWithinLengthLimit() {
        String normalised = PetPolicy.normalise(name);
        return normalised == null || normalised.length() <= PetPolicy.MAX_NAME_LENGTH;
    }
}
