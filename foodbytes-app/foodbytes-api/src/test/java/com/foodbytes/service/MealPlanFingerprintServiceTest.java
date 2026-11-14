package com.foodbytes.service;

import com.foodbytes.model.Meal;
import com.foodbytes.model.MealPlanEntry;
import com.foodbytes.model.Recipe;
import com.foodbytes.repository.MealPlanEntryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MealPlanFingerprintServiceTest {

    private static final Long OWNER = 7L;
    private static final LocalDate START = LocalDate.of(2026, 11, 9);

    @Mock private MealPlanEntryRepository mealPlanEntryRepository;
    @Mock private ExtraChoiceService extraChoiceService;

    @InjectMocks private MealPlanFingerprintService service;

    private MealPlanEntry entry(long id, long recipeId, String servings) {
        Meal meal = new Meal();
        meal.setId(1L);
        Recipe recipe = new Recipe();
        recipe.setId(recipeId);
        MealPlanEntry e = new MealPlanEntry();
        e.setId(id);
        e.setPlanDate(START.plusDays(id));
        e.setMeal(meal);
        e.setRecipe(recipe);
        e.setServings(new BigDecimal(servings));
        return e;
    }

    private void plan(List<MealPlanEntry> entries) {
        when(mealPlanEntryRepository.findByUserIdAndDateRange(OWNER, START, START.plusDays(ShoppingListService.WINDOW_DAYS))).thenReturn(entries);
    }

    private void noChoices() {
        lenient().when(extraChoiceService.getEntryChoices(anyCollection())).thenReturn(Map.of());
    }

    @Test
    void sameplan_sameFingerprint_andIgnoresEaten() {
        noChoices();
        plan(List.of(entry(1, 100, "2"), entry(2, 101, "1")));
        String a = service.fingerprint(OWNER, START);
        // MealPlanEntry carries no eaten state (per-person MealPlanEntryEaten), so identical entries match.
        plan(List.of(entry(1, 100, "2"), entry(2, 101, "1")));
        String b = service.fingerprint(OWNER, START);
        assertThat(a).isEqualTo(b).hasSize(64).matches("[0-9a-f]{64}");
    }

    @Test
    void removedEntry_changesFingerprint() {
        noChoices();
        plan(List.of(entry(1, 100, "2"), entry(2, 101, "1")));
        String a = service.fingerprint(OWNER, START);
        plan(List.of(entry(1, 100, "2")));
        String b = service.fingerprint(OWNER, START);
        assertThat(a).isNotEqualTo(b);
    }

    @Test
    void servingsChange_changesFingerprint() {
        noChoices();
        plan(List.of(entry(1, 100, "2")));
        String a = service.fingerprint(OWNER, START);
        plan(List.of(entry(1, 100, "1.5")));
        String b = service.fingerprint(OWNER, START);
        assertThat(a).isNotEqualTo(b);
    }

    @Test
    void servingsScale_doesNotChangeFingerprint() {
        noChoices();
        plan(List.of(entry(1, 100, "2.00")));
        String a = service.fingerprint(OWNER, START);
        plan(List.of(entry(1, 100, "2")));
        String b = service.fingerprint(OWNER, START);
        assertThat(a).isEqualTo(b);
    }

    @Test
    void extraChoiceChange_changesFingerprint() {
        plan(List.of(entry(10, 100, "2")));
        when(extraChoiceService.getEntryChoices(anyCollection()))
            .thenReturn(Map.of(10L, Map.of(5L, true)))
            .thenReturn(Map.of(10L, Map.of(5L, false)));
        String a = service.fingerprint(OWNER, START);
        String b = service.fingerprint(OWNER, START);
        assertThat(a).isNotEqualTo(b);
    }

    @Test
    void orderOfEntries_doesNotMatter() {
        noChoices();
        MealPlanEntry a = entry(1, 100, "2");
        MealPlanEntry b = entry(2, 101, "1");
        plan(List.of(a, b));
        String first = service.fingerprint(OWNER, START);
        plan(List.of(b, a));
        String second = service.fingerprint(OWNER, START);
        assertThat(first).isEqualTo(second);
    }

    @Test
    void usesExclusiveEndPlusOne() {
        plan(List.of());
        service.fingerprint(OWNER, START);
        verify(mealPlanEntryRepository).findByUserIdAndDateRange(OWNER, START, START.plusDays(ShoppingListService.WINDOW_DAYS));
        verifyNoInteractions(extraChoiceService);
    }
}
