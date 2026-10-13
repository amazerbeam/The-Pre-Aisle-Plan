package com.foodbytes.model;

/**
 * MPP-20: the daily habits Pip checks in on. Stored by name in VARCHAR(16) columns guarded by a
 * CHECK constraint (see the 2026-10-13-mpp20 migration); adding a value needs a migration too.
 */
public enum Habit {
    SNACK,
    ALCOHOL
}
