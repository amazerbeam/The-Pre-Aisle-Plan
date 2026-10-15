package com.foodbytes.service;

/**
 * MPP-42: a shopping-list item was just checked (never published for an un-check). SprinkleRecorder
 * re-reads the whole list after the toggle commits and pays SHOPPING_LIST_COMPLETED when it is done.
 */
public record ShoppingItemChecked(Long userId) {
}
