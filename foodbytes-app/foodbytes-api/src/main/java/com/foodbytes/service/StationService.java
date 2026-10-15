package com.foodbytes.service;

import com.foodbytes.dto.RoomWriteDTO;
import com.foodbytes.model.RoomStation;
import com.foodbytes.model.SprinkleSource;
import com.foodbytes.repository.PetStationLevelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * MPP-26 AC 2: raise one of the caller's own stations by one level, paying from their own
 * sprinkles. Lock, level check, debit, level up, in one transaction: any failure rolls back
 * both writes, so nobody pays without the level or levels up without paying. MPP-40: in free mode
 * (PetFreeMode) an upgrade is free, and setLevel() sets any level for testing.
 */
@Service
@RequiredArgsConstructor
public class StationService {

    private final PetStationLevelRepository levelRepository;
    private final SprinkleService sprinkleService;
    private final PetRoomService petRoomService;
    private final PetFreeMode freeMode;

    @Transactional
    public RoomWriteDTO upgrade(Long userId, RoomStation station) {
        sprinkleService.lockWallet(userId);
        int level = PetRoomService.levelsOf(levelRepository.findByUserId(userId)).get(station);
        if (StationPolicy.isMaxed(level)) {
            throw new PetShopException(PetShopException.Reason.MAXED,
                    "Your " + station.label() + " is already at the top level.");
        }
        int next = level + 1;
        if (!freeMode.isOn()) {
            sprinkleService.spend(userId, SprinkleSource.STATION_UPGRADE, StationPolicy.sourceId(station, next), StationPolicy.costFor(next));
        }
        levelRepository.upsert(userId, station.name(), next);
        return petRoomService.write(userId);
    }

    /** MPP-40 free mode only: set a station to any level 1..4, up or down, for nothing. Level 1 = no row. */
    @Transactional
    public RoomWriteDTO setLevel(Long userId, RoomStation station, int level) {
        if (!freeMode.isOn()) {
            throw new PetShopException(PetShopException.Reason.FREE_MODE_ONLY, "Free mode is off.");
        }
        if (level < StationPolicy.MIN_LEVEL || level > StationPolicy.MAX_LEVEL) {
            throw new IllegalArgumentException("Level must be 1 to 4");
        }
        sprinkleService.lockWallet(userId); // the same per-person lock as upgrade, so the two cannot race
        if (level == StationPolicy.MIN_LEVEL) {
            levelRepository.deleteByUserIdAndStation(userId, station);
        } else {
            levelRepository.upsert(userId, station.name(), level);
        }
        return petRoomService.write(userId);
    }
}
