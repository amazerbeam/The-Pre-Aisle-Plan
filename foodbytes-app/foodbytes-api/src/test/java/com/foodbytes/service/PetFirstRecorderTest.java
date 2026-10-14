package com.foodbytes.service;

import com.foodbytes.model.FirstKey;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

/**
 * MPP-24 AC 2: recording never fails the original request. No test boots JPA, so the after-commit
 * wiring is pinned by annotation here and proven at runtime by the local boot + manual check.
 */
@ExtendWith(MockitoExtension.class)
class PetFirstRecorderTest {

    private static final PetFirstCandidate CANDIDATE = PetFirstCandidate.of(2L, FirstKey.MAKE_TEMPLATE);

    @Mock private PetFirstService petFirstService;
    @InjectMocks private PetFirstRecorder recorder;

    @Test
    void onCandidate_delegatesToEvaluate() {
        recorder.onCandidate(CANDIDATE);

        verify(petFirstService).evaluate(CANDIDATE);
    }

    @Test
    void onCandidate_whenEvaluateFails_swallowsIt() {
        doThrow(new DataAccessResourceFailureException("pet_firsts unavailable"))
                .when(petFirstService).evaluate(CANDIDATE);

        assertThatCode(() -> recorder.onCandidate(CANDIDATE)).doesNotThrowAnyException();
    }

    @Test
    void runsAfterCommit_andEvaluatesInItsOwnTransaction() throws NoSuchMethodException {
        TransactionalEventListener listener = PetFirstRecorder.class
                .getMethod("onCandidate", PetFirstCandidate.class)
                .getAnnotation(TransactionalEventListener.class);
        assertThat(listener).isNotNull();
        assertThat(listener.phase()).isEqualTo(TransactionPhase.AFTER_COMMIT);
        assertThat(listener.fallbackExecution()).isTrue();

        Transactional tx = PetFirstService.class
                .getMethod("evaluate", PetFirstCandidate.class)
                .getAnnotation(Transactional.class);
        assertThat(tx.propagation()).isEqualTo(Propagation.REQUIRES_NEW);
    }
}
