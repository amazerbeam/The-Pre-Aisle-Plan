package com.foodbytes.service;

import com.foodbytes.dto.RecentSprinklesDTO;
import com.foodbytes.dto.SprinkleEntryDTO;
import com.foodbytes.model.Meal;
import com.foodbytes.model.MealPlanEntry;
import com.foodbytes.model.PetDecorOwned;
import com.foodbytes.model.PetSprinkle;
import com.foodbytes.model.SprinkleSource;
import com.foodbytes.repository.MealPlanEntryRepository;
import com.foodbytes.repository.PetDecorOwnedRepository;
import com.foodbytes.repository.PetSprinkleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyIterable;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** MPP-42: own rows only, a 14-day window, each source's context, and the rates. */
@ExtendWith(MockitoExtension.class)
class SprinkleHistoryServiceTest {

    private static final LocalDateTime NOW_UTC = LocalDateTime.of(2026, 10, 14, 12, 0);
    private static final LocalDate MON = LocalDate.of(2026, 10, 12);

    @Mock private PetSprinkleRepository sprinkles;
    @Mock private MealPlanEntryRepository entries;
    @Mock private PetDecorOwnedRepository decor;

    private SprinkleHistoryService service;

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(Instant.parse("2026-10-14T12:00:00Z"), HabitStreakPolicy.ZONE);
        service = new SprinkleHistoryService(sprinkles, entries, decor, clock);
    }

    private static PetSprinkle row(long id, SprinkleSource source, long sourceId, int amount) {
        return new PetSprinkle(id, 7L, source, sourceId, amount, NOW_UTC.minusHours(id));
    }

    @Test
    void recent_readsOnlyTheCallersRows_fromFourteenDaysAgo() {
        when(sprinkles.findByUserIdAndCreatedAtGreaterThanEqualOrderByCreatedAtDescIdDesc(7L, NOW_UTC.minusDays(14)))
                .thenReturn(List.of());
        when(decor.findAllById(anyIterable())).thenReturn(List.of());

        RecentSprinklesDTO result = service.recent(7L);

        verify(sprinkles).findByUserIdAndCreatedAtGreaterThanEqualOrderByCreatedAtDescIdDesc(7L, NOW_UTC.minusDays(14));
        assertThat(result.getEntries()).isEmpty();
    }

    @Test
    void recent_describesEverySource() {
        MealPlanEntryRepository.MealSlotContext entry = mock(MealPlanEntryRepository.MealSlotContext.class);
        when(entry.getId()).thenReturn(812L);
        when(entry.getMealKey()).thenReturn("lunch");
        when(entry.getPlanDate()).thenReturn(LocalDate.of(2026, 10, 14));
        PetDecorOwned shelf = new PetDecorOwned(31L, 7L, "herb-shelf", null);
        when(sprinkles.findByUserIdAndCreatedAtGreaterThanEqualOrderByCreatedAtDescIdDesc(7L, NOW_UTC.minusDays(14)))
                .thenReturn(List.of(
                        row(1, SprinkleSource.MEAL_ON_TIME, 812, 5),
                        row(2, SprinkleSource.MEAL_EATEN, 812, 10),
                        row(3, SprinkleSource.SHOPPING_LIST_COMPLETED, MON.toEpochDay(), 15),
                        row(4, SprinkleSource.STATION_UPGRADE, 22, -300),
                        row(5, SprinkleSource.DECOR_PURCHASE, 31, -120),
                        row(6, SprinkleSource.MEAL_EATEN, 999, 10)));   // entry since deleted
        when(entries.findMealSlotContextByIdIn(anyCollection())).thenReturn(List.of(entry));
        when(decor.findAllById(anyIterable())).thenReturn(List.of(shelf));

        List<SprinkleEntryDTO> out = service.recent(7L).getEntries();

        assertThat(out).hasSize(6);
        assertThat(out.get(0).getSourceType()).isEqualTo("MEAL_ON_TIME");
        assertThat(out.get(0).getMealKey()).isEqualTo("lunch");
        assertThat(out.get(0).getPlanDate()).isEqualTo(LocalDate.of(2026, 10, 14));
        assertThat(out.get(0).getEntryId()).isEqualTo(812L);
        assertThat(out.get(0).getCreatedAt()).isEqualTo(Instant.parse("2026-10-14T11:00:00Z"));
        assertThat(out.get(2).getWeekStart()).isEqualTo(MON);
        assertThat(out.get(3).getStation()).isEqualTo("fridge");
        assertThat(out.get(3).getLevel()).isEqualTo(2);
        assertThat(out.get(3).getAmount()).isEqualTo(-300);
        assertThat(out.get(4).getDecorItem()).isEqualTo("herb-shelf");
        assertThat(out.get(5).getEntryId()).isEqualTo(999L);
        assertThat(out.get(5).getMealKey()).isNull();
    }

    @Test
    void rates_mirrorSprinklePolicy() {
        var rates = SprinkleHistoryService.rates();
        assertThat(rates.getMealEaten()).isEqualTo(SprinklePolicy.MEAL_EATEN);
        assertThat(rates.getShoppingListGenerated()).isEqualTo(10);
        assertThat(rates.getShoppingListCompleted()).isEqualTo(15);
        assertThat(rates.getMealsPerWeek()).isEqualTo(21);
    }
}
