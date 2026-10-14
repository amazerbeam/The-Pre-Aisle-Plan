package com.foodbytes.model;

/**
 * MPP-24: the four planning/cooking features Pip's cabinet nudges people to try once. Stored as the
 * name in pet_firsts.first_key and serialised the same way. Order is the cabinet's display order.
 * Never a variety reward (MPP-11): none of these depends on which food was chosen.
 */
public enum FirstKey {
    MAKE_TEMPLATE,
    GENERATE_SHOPPING_LIST,
    PLAN_FULL_WEEK,
    COOK_HOMEMADE_EXTRA
}
