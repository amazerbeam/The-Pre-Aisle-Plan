package com.foodbytes.service;

import com.foodbytes.model.FirstKey;
import com.foodbytes.model.StreakType;

/**
 * MPP-32 AC 1: when a clothing item unlocks, as data. Each kind uses only its own parameters; the
 * rest are null. Evaluated by WardrobePolicy#isMet.
 */
public record UnlockRule(Kind kind, StreakType streak, Integer milestone, FirstKey first, Integer form) {

    public enum Kind {
        STARTER,     // owned from the start
        AWARD,       // that streak type's ladder milestone earned at least once (MPP-22)
        ANY_AWARD,   // the milestone earned on any streak type
        ALL_AWARDS,  // the milestone earned on every streak type
        FIRST,       // an MPP-24 first earned
        FORM         // Pip has reached this form at least once (MPP-31 peakForm)
    }

    public static UnlockRule starter() {
        return new UnlockRule(Kind.STARTER, null, null, null, null);
    }

    public static UnlockRule award(StreakType streak, int milestone) {
        return new UnlockRule(Kind.AWARD, streak, milestone, null, null);
    }

    public static UnlockRule anyAward(int milestone) {
        return new UnlockRule(Kind.ANY_AWARD, null, milestone, null, null);
    }

    public static UnlockRule allAwards(int milestone) {
        return new UnlockRule(Kind.ALL_AWARDS, null, milestone, null, null);
    }

    public static UnlockRule first(FirstKey key) {
        return new UnlockRule(Kind.FIRST, null, null, key, null);
    }

    public static UnlockRule form(int form) {
        return new UnlockRule(Kind.FORM, null, null, null, form);
    }
}
