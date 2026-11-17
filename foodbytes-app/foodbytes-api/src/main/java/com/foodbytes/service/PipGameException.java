package com.foodbytes.service;

/**
 * MPP-49: a Pip's Path request the caller's state does not allow, or a map that could not be made.
 * PipsPathController maps each Reason to a status and returns {error: message}.
 */
public class PipGameException extends RuntimeException {

    public enum Reason { UNKNOWN_FAMILY, BAD_DIFFICULTY, LOCKED, NOT_FOUND, INVALID_PATH, GENERATION_FAILED }

    private final Reason reason;

    public PipGameException(Reason reason, String message) {
        super(message);
        this.reason = reason;
    }

    public Reason getReason() {
        return reason;
    }
}
