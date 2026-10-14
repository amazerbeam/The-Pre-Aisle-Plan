package com.foodbytes.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * MPP-24: records firsts after the triggering request has committed, so a firsts failure can never
 * roll back or fail it (AC 2), and the full-week check sees the entry that completed the week.
 * Spring does not swallow after-commit listener exceptions, hence the catch here.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PetFirstRecorder {

    private final PetFirstService petFirstService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onCandidate(PetFirstCandidate candidate) {
        try {
            petFirstService.evaluate(candidate);
        } catch (RuntimeException e) {
            log.warn("MPP-24: could not record first {} for user {}; the request itself succeeded",
                     candidate.key(), candidate.userId(), e);
        }
    }
}
