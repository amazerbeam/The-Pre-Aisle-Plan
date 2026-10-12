package com.foodbytes.service;

import com.foodbytes.dto.PetDTO;
import com.foodbytes.model.User;

/**
 * MPP-14: the single backend owner of the pet's default name and name rule. The
 * default lives ONLY here — the server always sends the effective name plus a
 * customName flag, so the frontend has no copy to drift from (the MPP-13
 * MealTimesPolicy pattern). MAX_NAME_LENGTH is mirrored as PET_NAME_MAX_LENGTH in
 * client/src/constants/pet.js; keep them in sync.
 *
 * NAME_LENGTH_ERROR is a compile-time constant so PetNameRequest can use it in an
 * annotation.
 */
public final class PetPolicy {

    public static final String DEFAULT_NAME = "Pip";
    public static final int MAX_NAME_LENGTH = 12;
    public static final String NAME_LENGTH_ERROR = "Pet name must be 12 characters or fewer";

    private PetPolicy() {
    }

    /** Trimmed name, or null for null/blank — null means "back to the default". */
    public static String normalise(String name) {
        if (name == null) {
            return null;
        }
        String trimmed = name.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    public static PetDTO toDTO(User owner) {
        String saved = owner.getPetName();
        return new PetDTO(
                saved != null ? saved : DEFAULT_NAME,
                saved != null,
                MealTimesPolicy.effective(owner));
    }
}
