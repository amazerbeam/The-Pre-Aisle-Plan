package com.foodbytes.service;

import com.foodbytes.dto.RoomWriteDTO;
import com.foodbytes.model.PetDecorOwned;
import com.foodbytes.model.RoomSpot;
import com.foodbytes.model.SprinkleSource;
import com.foodbytes.repository.PetDecorOwnedRepository;
import com.foodbytes.repository.PetRoomPlacementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * MPP-27: buying and placing decor in the caller's own room (per-person Pip, MPP-33 - never the
 * meal-plan owner's). buy() is MPP-26's spend path plus an ownership row: lock, checks, owned row,
 * debit, auto-place, in one transaction, so a refused debit rolls the owned row back and nothing
 * is kept unpaid (AC 2). place() moves no sprinkles, so it takes no lock (AC 3).
 */
@Service
@RequiredArgsConstructor
public class DecorService {

    private final PetDecorOwnedRepository ownedRepository;
    private final PetRoomPlacementRepository placementRepository;
    private final SprinkleService sprinkleService;
    private final PetRoomService petRoomService;

    /** A bought item goes on its spot if that spot is empty; a bought style is applied at once. */
    @Transactional
    public RoomWriteDTO buy(Long userId, String itemId) {
        DecorCatalogue.Item item = known(itemId);
        sprinkleService.lockWallet(userId);
        if (item.isFree() || ownedRepository.existsByUserIdAndItemKey(userId, item.id())) {
            throw new PetShopException(PetShopException.Reason.ALREADY_OWNED, "You already own that.");
        }
        PetDecorOwned owned = ownedRepository.save(new PetDecorOwned(null, userId, item.id(), null));
        sprinkleService.spend(userId, SprinkleSource.DECOR_PURCHASE, owned.getId(), item.price());
        RoomSpot spot = item.spot();
        if (spot.isStyle() || !placementRepository.existsByUserIdAndSpot(userId, spot)) {
            placementRepository.upsert(userId, spot.name(), item.id());
        }
        return petRoomService.write(userId);
    }

    /** Puts an owned (or free) item on its spot, or clears the spot when itemId is null/blank (a finish resets to its default, which is never stored). */
    @Transactional
    public RoomWriteDTO place(Long userId, RoomSpot spot, String itemId) {
        if (itemId == null || itemId.isBlank()) {
            placementRepository.deleteByUserIdAndSpot(userId, spot);
            return petRoomService.write(userId);
        }
        DecorCatalogue.Item item = known(itemId);
        if (item.spot() != spot) {
            throw new IllegalArgumentException(item.id() + " doesn't go on the " + spot.label());
        }
        if (item.isDefault()) {
            placementRepository.deleteByUserIdAndSpot(userId, spot); // the default is never stored
            return petRoomService.write(userId);
        }
        if (!item.isFree() && !ownedRepository.existsByUserIdAndItemKey(userId, item.id())) {
            throw new PetShopException(PetShopException.Reason.NOT_OWNED, "You don't own that yet.");
        }
        placementRepository.upsert(userId, spot.name(), item.id());
        return petRoomService.write(userId);
    }

    private static DecorCatalogue.Item known(String itemId) {
        return DecorCatalogue.find(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Unknown item: " + itemId));
    }
}
