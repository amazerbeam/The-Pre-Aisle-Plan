package com.foodbytes.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * MPP-40: the pet free-mode switch for local testing (app.pet-free-mode / PET_FREE_MODE, default off).
 * When on, every room-shop item is owned, upgrades cost nothing and any station can be set to any
 * level - see PetRoomService, DecorService and StationService. Read once at startup; never set it on Railway.
 */
@Component
@Slf4j
public class PetFreeMode {

    private final boolean on;

    public PetFreeMode(@Value("${app.pet-free-mode:false}") boolean on) {
        this.on = on;
        if (on) {
            log.warn("PET FREE MODE IS ON: Pip's room shop is unlocked and free for every user. Testing only.");
        }
    }

    public boolean isOn() {
        return on;
    }
}
