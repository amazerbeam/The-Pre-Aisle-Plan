package com.foodbytes.service;

import com.foodbytes.dto.DecorItemDTO;
import com.foodbytes.dto.PetRoomDTO;
import com.foodbytes.dto.RoomWriteDTO;
import com.foodbytes.model.PetDecorOwned;
import com.foodbytes.model.PetRoomPlacement;
import com.foodbytes.model.PetStationLevel;
import com.foodbytes.model.RoomSpot;
import com.foodbytes.model.RoomStation;
import com.foodbytes.repository.PetDecorOwnedRepository;
import com.foodbytes.repository.PetRoomPlacementRepository;
import com.foodbytes.repository.PetStationLevelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * MPP-26: the caller's own room as the client sees it (per-person Pip, MPP-33 - never the meal-plan
 * owner's), and their owned decor and placements (MPP-27; DecorService writes them). Built from repositories only, so the services that change the room (StationService,
 * MPP-27's DecorService) depend on this and never on each other.
 */
@Service
@RequiredArgsConstructor
public class PetRoomService {

    private final PetStationLevelRepository levelRepository;
    private final PetDecorOwnedRepository ownedRepository;
    private final PetRoomPlacementRepository placementRepository;
    private final SprinkleService sprinkleService;

    @Transactional(readOnly = true)
    public PetRoomDTO room(Long userId) {
        Map<RoomStation, Integer> levels = levels(userId);
        Map<String, Integer> stations = new LinkedHashMap<>();
        for (RoomStation station : RoomStation.values()) {
            stations.put(station.key(), levels.get(station));
        }
        Set<String> owned = ownedRepository.findByUserId(userId).stream()
                .map(PetDecorOwned::getItemKey)
                .collect(Collectors.toSet());
        return new PetRoomDTO(stations, new TreeMap<>(StationPolicy.UPGRADE_COSTS),
                decorOf(owned), placementsOf(placementRepository.findByUserId(userId)));
    }

    /** The response to every room write: the balance after it, and the whole room. */
    @Transactional(readOnly = true)
    public RoomWriteDTO write(Long userId) {
        return new RoomWriteDTO(sprinkleService.balance(userId), room(userId));
    }

    /** Every station's level; a station with no row is at level 1. */
    public Map<RoomStation, Integer> levels(Long userId) {
        return levelsOf(levelRepository.findByUserId(userId));
    }

    static Map<RoomStation, Integer> levelsOf(List<PetStationLevel> rows) {
        Map<RoomStation, Integer> levels = new EnumMap<>(RoomStation.class);
        for (RoomStation station : RoomStation.values()) {
            levels.put(station, StationPolicy.MIN_LEVEL);
        }
        rows.forEach(row -> levels.put(row.getStation(), row.getLevel()));
        return levels;
    }

    /** MPP-27: every catalogue entry with whether the caller owns it; the free defaults always are. */
    static List<DecorItemDTO> decorOf(Set<String> owned) {
        return DecorCatalogue.ITEMS.stream()
                .map(item -> new DecorItemDTO(item.id(), item.spot().key(), item.price(),
                        item.isDefault() || owned.contains(item.id())))
                .toList();
    }

    /**
     * MPP-27: each spot's effective item - null for an empty decor spot, the default for an unset
     * finish. A row naming an id the catalogue no longer has, or one on the wrong spot, is ignored.
     */
    static Map<String, String> placementsOf(List<PetRoomPlacement> rows) {
        Map<String, String> placements = new LinkedHashMap<>();
        for (RoomSpot spot : RoomSpot.values()) {
            placements.put(spot.key(), spot.isStyle() ? DecorCatalogue.defaultFor(spot) : null);
        }
        rows.forEach(row -> DecorCatalogue.find(row.getItemKey())
                .filter(item -> item.spot() == row.getSpot())
                .ifPresent(item -> placements.put(row.getSpot().key(), item.id())));
        return placements;
    }
}
