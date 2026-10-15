package com.foodbytes.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * MPP-25: pays sprinkles after the triggering request has committed, from the same events that
 * drive MPP-24's firsts (a tick publishes COOK_HOMEMADE_EXTRA for every meal; plan writes publish
 * PLAN_FULL_WEEK with the dates touched) - the event name is MPP-24's, the payload is all we need.
 * MPP-42: generating a list pays SHOPPING_LIST_GENERATED; ShoppingItemChecked may pay SHOPPING_LIST_COMPLETED.
 * A sprinkles failure must never fail or roll back a tick or a plan write, hence the catch.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SprinkleRecorder {

    private final SprinkleService sprinkleService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onCandidate(PetFirstCandidate candidate) {
        try {
            switch (candidate.key()) {
                case COOK_HOMEMADE_EXTRA -> sprinkleService.mealEaten(candidate.userId(), candidate.entryId());
                case PLAN_FULL_WEEK -> sprinkleService.planned(candidate.userId(), candidate.from(), candidate.to());
                case GENERATE_SHOPPING_LIST -> sprinkleService.shoppingListGenerated(candidate.userId()); // MPP-42
                case MAKE_TEMPLATE -> { }
            }
        } catch (RuntimeException e) {
            log.warn("MPP-25: could not pay sprinkles for {} by user {}; the request itself succeeded",
                     candidate.key(), candidate.userId(), e);
        }
    }

    /** MPP-42: an item was checked; the service re-reads the list and pays if it is now finished. */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onShoppingItemChecked(ShoppingItemChecked event) {
        try {
            sprinkleService.shoppingListCompleted(event.userId());
        } catch (RuntimeException e) {
            log.warn("MPP-42: could not pay the finished-shopping sprinkles for user {}; the toggle itself succeeded",
                     event.userId(), e);
        }
    }
}
