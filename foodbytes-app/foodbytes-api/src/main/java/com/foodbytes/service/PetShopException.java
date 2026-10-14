package com.foodbytes.service;

/**
 * MPP-26: a purchase the caller's current state does not allow. Controllers answer 409 {error} with
 * the message, which is shown to the user as-is. MPP-27 (decor) uses ALREADY_OWNED / NOT_OWNED.
 */
public class PetShopException extends RuntimeException {

    public enum Reason { MAXED, NOT_ENOUGH_SPRINKLES, ALREADY_OWNED, NOT_OWNED }

    private final Reason reason;

    public PetShopException(Reason reason, String message) {
        super(message);
        this.reason = reason;
    }

    public Reason getReason() {
        return reason;
    }
}
