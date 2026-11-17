package com.foodbytes.service;

import com.foodbytes.dto.*;
import com.foodbytes.model.GameMode;
import com.foodbytes.model.PetGameMap;
import com.foodbytes.model.PetGameProgress;
import com.foodbytes.model.SprinkleSource;
import com.foodbytes.repository.PetGameMapRepository;
import com.foodbytes.repository.PetGameProgressRepository;
import com.foodbytes.repository.PetSprinkleRepository;
import com.foodbytes.service.game.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

/**
 * MPP-49: Pip's Path for one person. Issues freshly generated, solver-proven maps in chapter order
 * (PipsPathSequencer), replays a submitted path against the stored map, and on a valid first clear
 * raises the person's own progress and pays GAME_CLEAR (5, capped at 50 a Dublin day). The clear holds
 * the wallet lock, so two devices can't both slip under the cap; uk_pet_sprinkles pays a map once.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PipsPathService {

    private final PuzzleFamilyRegistry registry;
    private final PetGameMapRepository mapRepository;
    private final PetGameProgressRepository progressRepository;
    private final PetSprinkleRepository sprinkleRepository;
    private final SprinkleService sprinkleService;
    private final Clock clock;

    @Transactional(readOnly = true)
    public PipsPathStateDTO state(Long userId) {
        List<PuzzleFamily> ordered = registry.ordered();
        Map<String, FamilyProgress> progress = progressOf(userId);
        Slot next = PipsPathSequencer.next(ordered, progress, ThreadLocalRandom.current());
        // REFRESHER / ENDLESS difficulty is rolled when the map is issued, so a preview number would be wrong
        Integer previewDifficulty = next.mode() == GameMode.CHAPTER ? next.difficulty() : null;
        return new PipsPathStateDTO(
                ordered.stream().map(f -> familyDto(f, progress.getOrDefault(f.id(), FamilyProgress.NONE))).toList(),
                PipsPathSequencer.currentChapter(ordered, progress),
                PipsPathSequencer.isEndless(ordered, progress),
                new PipsPathSlotDTO(next.family(), previewDifficulty, next.mode().name(), next.chapter()),
                earnedToday(userId), SprinklePolicy.GAME_DAILY_CAP, SprinklePolicy.GAME_CLEAR);
    }

    /**
     * Deliberately not @Transactional: the reads and the single save each run in their repository's own short
     * transaction, so the CPU-bound generation never holds a DB connection.
     */
    public PipsPathMapDTO issue(Long userId, String familyId, Integer difficulty) {
        List<PuzzleFamily> ordered = registry.ordered();
        Map<String, FamilyProgress> progress = progressOf(userId);
        Slot slot = familyId == null && difficulty == null
                ? PipsPathSequencer.next(ordered, progress, ThreadLocalRandom.current())
                : replaySlot(familyId, difficulty, ordered, progress);
        PuzzleFamily family = family(slot.family());
        long seed = ThreadLocalRandom.current().nextLong();
        GridMap map;
        try {
            map = family.generate(slot.difficulty(), seed);
        } catch (PipGameException e) {
            if (e.getReason() == PipGameException.Reason.GENERATION_FAILED) {
                log.warn("Pip's Path generation failed: family={} difficulty={} seed={}",
                        family.id(), slot.difficulty(), seed);
            }
            throw e;
        }

        PetGameMap row = new PetGameMap();
        row.setUserId(userId);
        row.setFamily(family.id());
        row.setDifficulty(slot.difficulty());
        row.setMode(slot.mode());
        row.setChapter(slot.chapter());
        row.setSeed(seed);
        row.setWidth(map.width());
        row.setHeight(map.height());
        row.setLayout(map.layout());
        PetGameMap saved = mapRepository.save(row);
        return new PipsPathMapDTO(saved.getId(), saved.getFamily(), saved.getDifficulty(), saved.getMode().name(),
                saved.getChapter(), map.width(), map.height(), map.rows());
    }

    @Transactional
    public PipsPathClearDTO clear(Long userId, Long mapId, List<Integer> path) {
        sprinkleService.lockWallet(userId);
        PetGameMap row = mapRepository.findByIdAndUserId(mapId, userId)
                .orElseThrow(() -> new PipGameException(PipGameException.Reason.NOT_FOUND, "That puzzle was not found."));
        PuzzleFamily family = family(row.getFamily());
        PetGameProgress progress = progressRepository.findByUserIdAndFamily(userId, row.getFamily())
                .orElseGet(() -> new PetGameProgress(userId, row.getFamily()));

        if (row.getClearedAt() != null) {
            long earned = earnedToday(userId);
            return clearDto(true, 0, earned >= SprinklePolicy.GAME_DAILY_CAP, earned, userId, family, progress);
        }
        GridMap map = GridMap.fromLayout(row.getLayout(), row.getWidth(), row.getHeight());
        if (!family.isValidClear(map, path)) {
            log.debug("Pip's Path invalid path: userId={} mapId={}", userId, mapId);
            throw new PipGameException(PipGameException.Reason.INVALID_PATH,
                    "That path doesn't visit every tile exactly once.");
        }
        row.setClearedAt(LocalDateTime.now(clock.withZone(ZoneOffset.UTC)));
        mapRepository.save(row);
        advance(progress, row);
        progressRepository.save(progress);

        long earned = earnedToday(userId);
        int amount = SprinklePolicy.gameClearAmount(earned);
        if (amount > 0) sprinkleRepository.insertIfAbsent(userId, SprinkleSource.GAME_CLEAR.name(), mapId, amount);
        return clearDto(false, amount, earned + amount >= SprinklePolicy.GAME_DAILY_CAP, earned + amount, userId, family, progress);
    }

    private Slot replaySlot(String familyId, Integer difficulty, List<PuzzleFamily> ordered,
                            Map<String, FamilyProgress> progress) {
        if (familyId == null || difficulty == null) {
            throw new PipGameException(PipGameException.Reason.BAD_DIFFICULTY,
                    "Pick both a game and a difficulty, or neither.");
        }
        PuzzleFamily family = family(familyId);
        if (difficulty < 1 || difficulty > PipsPathSequencer.CHAPTER_LEVELS) {
            throw new PipGameException(PipGameException.Reason.BAD_DIFFICULTY, "Difficulty must be 1-" + PipsPathSequencer.CHAPTER_LEVELS + ".");
        }
        if (!PipsPathSequencer.isUnlocked(family, difficulty, ordered, progress)) {
            throw new PipGameException(PipGameException.Reason.LOCKED, "That level is still locked.");
        }
        return new Slot(family.id(), difficulty, GameMode.CHAPTER, family.chapter());
    }

    private static void advance(PetGameProgress progress, PetGameMap map) {
        switch (map.getMode()) {
            case CHAPTER -> progress.setHighestCleared(Math.max(progress.getHighestCleared(), map.getDifficulty()));
            case REFRESHER -> progress.setRefresherThrough(Math.max(progress.getRefresherThrough(), map.getChapter()));
            case ENDLESS -> { }
        }
    }

    private PuzzleFamily family(String id) {
        return registry.byId(id).orElseThrow(() ->
                new PipGameException(PipGameException.Reason.UNKNOWN_FAMILY, "Unknown game family."));
    }

    private Map<String, FamilyProgress> progressOf(Long userId) {
        return progressRepository.findByUserId(userId).stream().collect(Collectors.toMap(
                PetGameProgress::getFamily, p -> new FamilyProgress(p.getHighestCleared(), p.getRefresherThrough())));
    }

    private long earnedToday(Long userId) {
        LocalDateTime[] day = SprinklePolicy.dublinDayUtc(HabitStreakPolicy.today(clock));
        return sprinkleRepository.sumAmountByUserIdAndSourceTypeBetween(userId, SprinkleSource.GAME_CLEAR, day[0], day[1]);
    }

    private PipsPathClearDTO clearDto(boolean alreadyCleared, int paid, boolean capped, long earnedToday,
                                      Long userId, PuzzleFamily family, PetGameProgress progress) {
        return new PipsPathClearDTO(alreadyCleared, paid, capped, earnedToday, SprinklePolicy.GAME_DAILY_CAP,
                sprinkleService.balance(userId),
                familyDto(family, new FamilyProgress(progress.getHighestCleared(), progress.getRefresherThrough())));
    }

    private static PipsPathFamilyDTO familyDto(PuzzleFamily family, FamilyProgress progress) {
        return new PipsPathFamilyDTO(family.id(), family.chapter(), progress.highestCleared(), progress.refresherThrough());
    }
}
