package com.foodbytes.service;

import com.foodbytes.dto.PipsPathClearDTO;
import com.foodbytes.dto.PipsPathMapDTO;
import com.foodbytes.dto.PipsPathStateDTO;
import com.foodbytes.model.GameMode;
import com.foodbytes.model.PetGameMap;
import com.foodbytes.model.PetGameProgress;
import com.foodbytes.model.SprinkleSource;
import com.foodbytes.repository.PetGameMapRepository;
import com.foodbytes.repository.PetGameProgressRepository;
import com.foodbytes.repository.PetSprinkleRepository;
import com.foodbytes.service.game.GardenPathFamily;
import com.foodbytes.service.game.GridMap;
import com.foodbytes.service.game.PuzzleFamilyRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** MPP-49: issue / clear / state of Pip's Path - slots, replay check, progress, and the 5-a-clear 50-a-day payout. */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PipsPathServiceTest {

    private static final Long USER = 2L;
    private static final Long MAP_ID = 77L;
    private static final List<Integer> SOLUTION = List.of(0, 1, 2, 5, 4, 3, 6, 7, 8);

    @Mock private PetGameMapRepository maps;
    @Mock private PetGameProgressRepository progress;
    @Mock private PetSprinkleRepository sprinkles;
    @Mock private SprinkleService sprinkleService;

    private PipsPathService service;

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(Instant.parse("2026-11-17T12:00:00Z"), ZoneOffset.UTC);
        service = new PipsPathService(new PuzzleFamilyRegistry(List.of(new GardenPathFamily())),
                maps, progress, sprinkles, sprinkleService, clock);
        when(maps.save(any(PetGameMap.class))).thenAnswer(inv -> inv.getArgument(0));
        when(progress.findByUserId(anyLong())).thenReturn(List.of());
        when(progress.findByUserIdAndFamily(anyLong(), anyString())).thenReturn(Optional.empty());
        when(sprinkles.sumAmountByUserIdAndSourceTypeBetween(anyLong(), any(), any(), any())).thenReturn(0L);
        when(sprinkleService.balance(anyLong())).thenReturn(105L);
    }

    // ---- issue ----

    @Test
    void issue_nextSlotForANewPlayer_isChapterOneLevelOne() {
        PipsPathMapDTO dto = service.issue(USER, null, null);

        assertThat(dto.getDifficulty()).isEqualTo(1);
        assertThat(dto.getMode()).isEqualTo("CHAPTER");
        assertThat(dto.getChapter()).isEqualTo(1);
        assertThat(dto.getWidth()).isEqualTo(3);
        assertThat(dto.getHeight()).isEqualTo(3);
        assertThat(dto.getRows()).hasSize(3);

        ArgumentCaptor<PetGameMap> saved = ArgumentCaptor.forClass(PetGameMap.class);
        verify(maps).save(saved.capture());
        assertThat(saved.getValue().getUserId()).isEqualTo(USER);
        assertThat(saved.getValue().getFamily()).isEqualTo("garden-path");
        GridMap parsed = GridMap.fromLayout(saved.getValue().getLayout(), 3, 3);
        assertThat(parsed.rows()).isEqualTo(dto.getRows());
    }

    @Test
    void issue_replayOfALockedLevel_isLockedAndStoresNothing() {
        when(progress.findByUserId(USER)).thenReturn(List.of(progressRow("garden-path", 3, 0)));

        assertThatThrownBy(() -> service.issue(USER, "garden-path", 5))
                .isInstanceOfSatisfying(PipGameException.class,
                        e -> assertThat(e.getReason()).isEqualTo(PipGameException.Reason.LOCKED));
        verify(maps, never()).save(any());
    }

    @Test
    void issue_replayOfAnUnlockedLevel_issuesThatDifficulty() {
        when(progress.findByUserId(USER)).thenReturn(List.of(progressRow("garden-path", 3, 0)));

        PipsPathMapDTO dto = service.issue(USER, "garden-path", 2);

        assertThat(dto.getDifficulty()).isEqualTo(2);
        assertThat(dto.getMode()).isEqualTo("CHAPTER");
    }

    @Test
    void issue_unknownFamilyAndHalfRequests_areRejected() {
        assertThatThrownBy(() -> service.issue(USER, "nope", 1))
                .isInstanceOfSatisfying(PipGameException.class,
                        e -> assertThat(e.getReason()).isEqualTo(PipGameException.Reason.UNKNOWN_FAMILY));
        assertThatThrownBy(() -> service.issue(USER, "garden-path", null))
                .isInstanceOfSatisfying(PipGameException.class,
                        e -> assertThat(e.getReason()).isEqualTo(PipGameException.Reason.BAD_DIFFICULTY));
        assertThatThrownBy(() -> service.issue(USER, null, 1))
                .isInstanceOfSatisfying(PipGameException.class,
                        e -> assertThat(e.getReason()).isEqualTo(PipGameException.Reason.BAD_DIFFICULTY));
        verify(maps, never()).save(any());
    }

    // ---- clear ----

    @Test
    void clear_validFirstOfTheDay_paysFiveAndRaisesProgress() {
        PetGameMap map = storedMap(GameMode.CHAPTER, 1, 1);
        when(maps.findByIdAndUserId(MAP_ID, USER)).thenReturn(Optional.of(map));

        PipsPathClearDTO dto = service.clear(USER, MAP_ID, SOLUTION);

        assertThat(dto.getPaid()).isEqualTo(5);
        assertThat(dto.isCapped()).isFalse();
        assertThat(dto.isAlreadyCleared()).isFalse();
        assertThat(dto.getEarnedToday()).isEqualTo(5);
        assertThat(dto.getDailyCap()).isEqualTo(50);
        assertThat(dto.getBalance()).isEqualTo(105L);
        assertThat(dto.getProgress().getHighestCleared()).isEqualTo(1);

        InOrder order = inOrder(sprinkleService, maps);
        order.verify(sprinkleService).lockWallet(USER);
        order.verify(maps).findByIdAndUserId(MAP_ID, USER);
        verify(sprinkles).insertIfAbsent(USER, "GAME_CLEAR", MAP_ID, 5);
        assertThat(map.getClearedAt()).isEqualTo(LocalDateTime.of(2026, 11, 17, 12, 0));
        ArgumentCaptor<PetGameProgress> saved = ArgumentCaptor.forClass(PetGameProgress.class);
        verify(progress).save(saved.capture());
        assertThat(saved.getValue().getUserId()).isEqualTo(USER);
        assertThat(saved.getValue().getHighestCleared()).isEqualTo(1);
    }

    @Test
    void clear_atTheDailyCap_countsButPaysNothing() {
        PetGameMap map = storedMap(GameMode.CHAPTER, 1, 1);
        when(maps.findByIdAndUserId(MAP_ID, USER)).thenReturn(Optional.of(map));
        when(sprinkles.sumAmountByUserIdAndSourceTypeBetween(anyLong(), any(), any(), any())).thenReturn(50L);

        PipsPathClearDTO dto = service.clear(USER, MAP_ID, SOLUTION);

        assertThat(dto.getPaid()).isZero();
        assertThat(dto.isCapped()).isTrue();
        assertThat(dto.getEarnedToday()).isEqualTo(50);
        verify(sprinkles, never()).insertIfAbsent(anyLong(), anyString(), anyLong(), anyInt());
        assertThat(map.getClearedAt()).isNotNull();
        ArgumentCaptor<PetGameProgress> saved = ArgumentCaptor.forClass(PetGameProgress.class);
        verify(progress).save(saved.capture());
        assertThat(saved.getValue().getHighestCleared()).isEqualTo(1);
    }

    @Test
    void clear_exactlyReachingTheCap_isCapped() {
        when(maps.findByIdAndUserId(MAP_ID, USER)).thenReturn(Optional.of(storedMap(GameMode.CHAPTER, 1, 1)));
        when(sprinkles.sumAmountByUserIdAndSourceTypeBetween(anyLong(), any(), any(), any())).thenReturn(45L);

        PipsPathClearDTO dto = service.clear(USER, MAP_ID, SOLUTION);

        assertThat(dto.getPaid()).isEqualTo(5);
        assertThat(dto.isCapped()).isTrue();
        assertThat(dto.getEarnedToday()).isEqualTo(50);
    }

    @Test
    void clear_nearTheCap_paysOnlyTheRemainder() {
        when(maps.findByIdAndUserId(MAP_ID, USER)).thenReturn(Optional.of(storedMap(GameMode.CHAPTER, 1, 1)));
        when(sprinkles.sumAmountByUserIdAndSourceTypeBetween(anyLong(), any(), any(), any())).thenReturn(48L);

        PipsPathClearDTO dto = service.clear(USER, MAP_ID, SOLUTION);

        assertThat(dto.getPaid()).isEqualTo(2);
        assertThat(dto.isCapped()).isTrue();
        assertThat(dto.getEarnedToday()).isEqualTo(50);
        verify(sprinkles).insertIfAbsent(USER, "GAME_CLEAR", MAP_ID, 2);
    }

    @Test
    void clear_sumsGameClearsOverTodaysDublinDayInUtc() {
        when(maps.findByIdAndUserId(MAP_ID, USER)).thenReturn(Optional.of(storedMap(GameMode.CHAPTER, 1, 1)));

        service.clear(USER, MAP_ID, SOLUTION);

        // 17 Nov is winter time: Dublin == UTC
        verify(sprinkles).sumAmountByUserIdAndSourceTypeBetween(USER, SprinkleSource.GAME_CLEAR,
                LocalDateTime.of(2026, 11, 17, 0, 0), LocalDateTime.of(2026, 11, 18, 0, 0));
    }

    @Test
    void clear_alreadyCleared_isHarmlessAndPaysNothing() {
        PetGameMap map = storedMap(GameMode.CHAPTER, 1, 1);
        LocalDateTime earlier = LocalDateTime.of(2026, 11, 17, 9, 0);
        map.setClearedAt(earlier);
        when(maps.findByIdAndUserId(MAP_ID, USER)).thenReturn(Optional.of(map));

        PipsPathClearDTO dto = service.clear(USER, MAP_ID, SOLUTION);

        assertThat(dto.isAlreadyCleared()).isTrue();
        assertThat(dto.getPaid()).isZero();
        assertThat(map.getClearedAt()).isEqualTo(earlier);
        verify(sprinkles, never()).insertIfAbsent(anyLong(), anyString(), anyLong(), anyInt());
        verify(progress, never()).save(any());
    }

    @Test
    void clear_invalidPath_isRejectedAndChangesNothing() {
        PetGameMap map = storedMap(GameMode.CHAPTER, 1, 1);
        when(maps.findByIdAndUserId(MAP_ID, USER)).thenReturn(Optional.of(map));

        assertThatThrownBy(() -> service.clear(USER, MAP_ID, List.of(0, 1, 2)))
                .isInstanceOfSatisfying(PipGameException.class,
                        e -> assertThat(e.getReason()).isEqualTo(PipGameException.Reason.INVALID_PATH));

        assertThat(map.getClearedAt()).isNull();
        verify(sprinkles, never()).insertIfAbsent(anyLong(), anyString(), anyLong(), anyInt());
        verify(progress, never()).save(any());
    }

    @Test
    void clear_someoneElsesMap_isNotFound() {
        when(maps.findByIdAndUserId(MAP_ID, 3L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.clear(3L, MAP_ID, SOLUTION))
                .isInstanceOfSatisfying(PipGameException.class,
                        e -> assertThat(e.getReason()).isEqualTo(PipGameException.Reason.NOT_FOUND));
        verify(sprinkles, never()).insertIfAbsent(anyLong(), anyString(), anyLong(), anyInt());
    }

    @Test
    void clear_aLowerReplay_keepsTheHigherProgress() {
        when(progress.findByUserIdAndFamily(USER, "garden-path"))
                .thenReturn(Optional.of(progressRow("garden-path", 6, 0)));
        when(maps.findByIdAndUserId(MAP_ID, USER)).thenReturn(Optional.of(storedMap(GameMode.CHAPTER, 2, 1)));

        service.clear(USER, MAP_ID, SOLUTION);

        ArgumentCaptor<PetGameProgress> saved = ArgumentCaptor.forClass(PetGameProgress.class);
        verify(progress).save(saved.capture());
        assertThat(saved.getValue().getHighestCleared()).isEqualTo(6);
    }

    @Test
    void clear_refresher_raisesRefresherThroughOnly() {
        when(progress.findByUserIdAndFamily(USER, "garden-path"))
                .thenReturn(Optional.of(progressRow("garden-path", 10, 0)));
        when(maps.findByIdAndUserId(MAP_ID, USER)).thenReturn(Optional.of(storedMap(GameMode.REFRESHER, 1, 2)));

        service.clear(USER, MAP_ID, SOLUTION);

        ArgumentCaptor<PetGameProgress> saved = ArgumentCaptor.forClass(PetGameProgress.class);
        verify(progress).save(saved.capture());
        assertThat(saved.getValue().getRefresherThrough()).isEqualTo(2);
        assertThat(saved.getValue().getHighestCleared()).isEqualTo(10);
    }

    @Test
    void clear_endless_paysButLeavesProgressAlone() {
        when(maps.findByIdAndUserId(MAP_ID, USER)).thenReturn(Optional.of(storedMap(GameMode.ENDLESS, 1, null)));

        PipsPathClearDTO dto = service.clear(USER, MAP_ID, SOLUTION);

        assertThat(dto.getPaid()).isEqualTo(5);
        ArgumentCaptor<PetGameProgress> saved = ArgumentCaptor.forClass(PetGameProgress.class);
        verify(progress).save(saved.capture());
        assertThat(saved.getValue().getHighestCleared()).isZero();
        assertThat(saved.getValue().getRefresherThrough()).isZero();
    }

    // ---- state ----

    @Test
    void state_newPlayer_pointsAtChapterOneLevelOne() {
        PipsPathStateDTO dto = service.state(USER);

        assertThat(dto.isEndless()).isFalse();
        assertThat(dto.getCurrentChapter()).isEqualTo(1);
        assertThat(dto.getNext().getMode()).isEqualTo("CHAPTER");
        assertThat(dto.getNext().getDifficulty()).isEqualTo(1);
        assertThat(dto.getFamilies()).hasSize(1);
        assertThat(dto.getFamilies().get(0).getId()).isEqualTo("garden-path");
        assertThat(dto.getFamilies().get(0).getChapter()).isEqualTo(1);
        assertThat(dto.getPerClear()).isEqualTo(5);
        assertThat(dto.getDailyCap()).isEqualTo(50);
    }

    @Test
    void state_chapterDone_isEndlessWithNoPreviewDifficulty() {
        when(progress.findByUserId(USER)).thenReturn(List.of(progressRow("garden-path", 10, 0)));
        when(sprinkles.sumAmountByUserIdAndSourceTypeBetween(anyLong(), eq(SprinkleSource.GAME_CLEAR), any(), any()))
                .thenReturn(15L);

        PipsPathStateDTO dto = service.state(USER);

        assertThat(dto.isEndless()).isTrue();
        assertThat(dto.getCurrentChapter()).isEqualTo(2);
        assertThat(dto.getNext().getMode()).isEqualTo("ENDLESS");
        assertThat(dto.getNext().getDifficulty()).isNull();
        assertThat(dto.getEarnedToday()).isEqualTo(15);
    }

    // ---- helpers ----

    private static PetGameProgress progressRow(String family, int highest, int refresher) {
        PetGameProgress row = new PetGameProgress(USER, family);
        row.setHighestCleared(highest);
        row.setRefresherThrough(refresher);
        return row;
    }

    private static PetGameMap storedMap(GameMode mode, int difficulty, Integer chapter) {
        PetGameMap map = new PetGameMap();
        map.setId(MAP_ID);
        map.setUserId(USER);
        map.setFamily("garden-path");
        map.setDifficulty(difficulty);
        map.setMode(mode);
        map.setChapter(chapter);
        map.setSeed(1L);
        map.setWidth(3);
        map.setHeight(3);
        map.setLayout("S../.../...");
        return map;
    }
}
