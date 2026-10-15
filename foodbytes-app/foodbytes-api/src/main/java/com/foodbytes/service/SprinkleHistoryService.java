package com.foodbytes.service;

import com.foodbytes.dto.RecentSprinklesDTO;
import com.foodbytes.dto.SprinkleEntryDTO;
import com.foodbytes.dto.SprinkleRatesDTO;
import com.foodbytes.model.PetDecorOwned;
import com.foodbytes.model.PetSprinkle;
import com.foodbytes.model.RoomStation;
import com.foodbytes.model.SprinkleSource;
import com.foodbytes.repository.MealPlanEntryRepository;
import com.foodbytes.repository.PetDecorOwnedRepository;
import com.foodbytes.repository.PetSprinkleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

/**
 * MPP-42 AC 13: the caller's own sprinkles from the last 14 days, newest first, each with enough
 * context for the client to describe it, plus SprinklePolicy's payouts. Two batched lookups (a meal-slot
 * projection of key + date only, and decor rows) - never one per row. Only ever reads the caller's user_id.
 */
@Service
@RequiredArgsConstructor
public class SprinkleHistoryService {

    private static final Set<SprinkleSource> MEAL_SOURCES =
            EnumSet.of(SprinkleSource.MEAL_EATEN, SprinkleSource.MEAL_ON_TIME, SprinkleSource.HOMEMADE_EXTRA);
    private static final Set<SprinkleSource> WEEK_SOURCES =
            EnumSet.of(SprinkleSource.FULL_WEEK, SprinkleSource.SHOPPING_LIST_GENERATED, SprinkleSource.SHOPPING_LIST_COMPLETED);

    private final PetSprinkleRepository petSprinkleRepository;
    private final MealPlanEntryRepository mealPlanEntryRepository;
    private final PetDecorOwnedRepository petDecorOwnedRepository;
    private final Clock clock;

    @Transactional(readOnly = true)
    public RecentSprinklesDTO recent(Long userId) {
        // created_at is UTC wall time (serverTimezone=UTC), so the window is too.
        LocalDateTime since = LocalDateTime.now(clock.withZone(ZoneOffset.UTC)).minusDays(SprinklePolicy.RECENT_DAYS);
        List<PetSprinkle> rows = petSprinkleRepository
                .findByUserIdAndCreatedAtGreaterThanEqualOrderByCreatedAtDescIdDesc(userId, since);
        Set<Long> mealIds = sourceIds(rows, MEAL_SOURCES);
        Map<Long, MealPlanEntryRepository.MealSlotContext> meals = mealIds.isEmpty() ? Map.of()
                : byId(mealPlanEntryRepository.findMealSlotContextByIdIn(mealIds), MealPlanEntryRepository.MealSlotContext::getId);
        Map<Long, PetDecorOwned> decor = byId(
                petDecorOwnedRepository.findAllById(sourceIds(rows, EnumSet.of(SprinkleSource.DECOR_PURCHASE))), PetDecorOwned::getId);
        List<SprinkleEntryDTO> entries = rows.stream().map(row -> toDto(row, meals, decor)).toList();
        return new RecentSprinklesDTO(entries, rates());
    }

    static SprinkleRatesDTO rates() {
        return new SprinkleRatesDTO(
                SprinklePolicy.MEAL_EATEN, SprinklePolicy.ON_TIME_BONUS, SprinklePolicy.HOMEMADE_BONUS,
                SprinklePolicy.FULL_WEEK, SprinklePolicy.SHOPPING_LIST_GENERATED, SprinklePolicy.SHOPPING_LIST_COMPLETED,
                SprinklePolicy.mealsPerWeek());
    }

    private static SprinkleEntryDTO toDto(PetSprinkle row, Map<Long, MealPlanEntryRepository.MealSlotContext> meals, Map<Long, PetDecorOwned> decor) {
        SprinkleEntryDTO dto = new SprinkleEntryDTO();
        SprinkleSource source = row.getSourceType();
        dto.setSourceType(source.name());
        dto.setAmount(row.getAmount());
        dto.setCreatedAt(row.getCreatedAt().toInstant(ZoneOffset.UTC));
        if (MEAL_SOURCES.contains(source)) {
            dto.setEntryId(row.getSourceId());
            MealPlanEntryRepository.MealSlotContext entry = meals.get(row.getSourceId());
            if (entry != null) {
                dto.setMealKey(entry.getMealKey());
                dto.setPlanDate(entry.getPlanDate());
            }
        } else if (WEEK_SOURCES.contains(source)) {
            dto.setWeekStart(LocalDate.ofEpochDay(row.getSourceId()));
        } else if (source == SprinkleSource.STATION_UPGRADE) {
            RoomStation station = StationPolicy.stationOf(row.getSourceId());
            if (station != null) {
                dto.setStation(station.key());
                dto.setLevel(StationPolicy.levelOf(row.getSourceId()));
            }
        } else if (source == SprinkleSource.DECOR_PURCHASE) {
            PetDecorOwned owned = decor.get(row.getSourceId());
            if (owned != null) dto.setDecorItem(owned.getItemKey());
        }
        return dto;
    }

    private static Set<Long> sourceIds(List<PetSprinkle> rows, Set<SprinkleSource> sources) {
        return rows.stream().filter(row -> sources.contains(row.getSourceType()))
                .map(PetSprinkle::getSourceId).collect(Collectors.toSet());
    }

    private static <T> Map<Long, T> byId(Iterable<T> found, Function<T, Long> id) {
        return StreamSupport.stream(found.spliterator(), false).collect(Collectors.toMap(id, Function.identity()));
    }
}
