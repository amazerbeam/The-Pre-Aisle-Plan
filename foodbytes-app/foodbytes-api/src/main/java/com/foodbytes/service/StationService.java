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
 * both writes, so nobody pays without the level or levels up without paying.
 */
@Service
@RequiredArgsConstructor
public class StationService {

    private final PetStationLevelRepository levelRepository;
    private final SprinkleService sprinkleService;
    private final PetRoomService petRoomService;

    @Transactional
    public RoomWriteDTO upgrade(Long userId, RoomStation station) {
        sprinkleService.lockWallet(userId);
        int level = PetRoomService.levelsOf(levelRepository.findByUserId(userId)).get(station);
        if (StationPolicy.isMaxed(level)) {
            throw new PetShopException(PetShopException.Reason.MAXED,
                    "Your " + station.label() + " is already at the top level.");
        }
        int next = level + 1;
        sprinkleService.spend(userId, SprinkleSource.STATION_UPGRADE, StationPolicy.sourceId(station, next), StationPolicy.costFor(next));
        levelRepository.upsert(userId, station.name(), next);
        return petRoomService.write(userId);
    }
}
