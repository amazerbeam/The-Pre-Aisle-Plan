package com.foodbytes.service.game;

/** MPP-49: how many solutions a map has (capped at the caller's limit), and the first one found. */
public record SolveResult(long count, boolean budgetExceeded, int[] first) {}
