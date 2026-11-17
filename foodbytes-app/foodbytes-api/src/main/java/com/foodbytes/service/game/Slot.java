package com.foodbytes.service.game;

import com.foodbytes.model.GameMode;

/** MPP-49: the map to issue next. chapter is null for ENDLESS. */
public record Slot(String family, int difficulty, GameMode mode, Integer chapter) {}
