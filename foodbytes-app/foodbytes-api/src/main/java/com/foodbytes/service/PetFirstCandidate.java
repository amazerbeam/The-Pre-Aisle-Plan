package com.foodbytes.service;

import com.foodbytes.model.FirstKey;
import java.time.LocalDate;

/**
 * MPP-24: "this action may have earned a first", published by the service write paths and handled
 * after commit by PetFirstRecorder. userId is always the person who acted, never the plan owner.
 * from/to are the dates a planning action touched (PLAN_FULL_WEEK); entryId is the ticked meal
 * (COOK_HOMEMADE_EXTRA).
 */
public record PetFirstCandidate(Long userId, FirstKey key, LocalDate from, LocalDate to, Long entryId) {

    /** MAKE_TEMPLATE or GENERATE_SHOPPING_LIST: the action itself is the proof. */
    public static PetFirstCandidate of(Long userId, FirstKey key) {
        return new PetFirstCandidate(userId, key, null, null, null);
    }

    public static PetFirstCandidate planned(Long userId, LocalDate from, LocalDate to) {
        return new PetFirstCandidate(userId, FirstKey.PLAN_FULL_WEEK, from, to, null);
    }

    public static PetFirstCandidate cooked(Long userId, Long entryId) {
        return new PetFirstCandidate(userId, FirstKey.COOK_HOMEMADE_EXTRA, null, null, entryId);
    }
}
