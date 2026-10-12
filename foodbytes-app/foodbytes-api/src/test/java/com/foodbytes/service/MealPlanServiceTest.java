package com.foodbytes.service;

import com.foodbytes.dto.MealPlanCreateRequest;
import com.foodbytes.dto.MealPlanEntryDTO;
import com.foodbytes.dto.MealPlanEntryEatenDTO;
import com.foodbytes.dto.MealPlanWeekDTO;
import com.foodbytes.model.Meal;
import com.foodbytes.model.MealPlanEntry;
import com.foodbytes.model.Recipe;
import com.foodbytes.model.RecipeFamily;
import com.foodbytes.model.RecipeFamilyMember;
import com.foodbytes.model.User;
import com.foodbytes.repository.MealPlanEntryRepository;
import com.foodbytes.repository.MealRepository;
import com.foodbytes.repository.RecipeFamilyMemberRepository;
import com.foodbytes.repository.RecipeRepository;
import com.foodbytes.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * Unit tests for MealPlanService.assignRecipe servings resolution.
 * A meal plan entry must inherit the recipe's default_servings when the request
 * omits servings — defaulting to the literal 1 halves every quantity the
 * shopping list derives from that entry.
 */
@ExtendWith(MockitoExtension.class)
class MealPlanServiceTest {

    @Mock private MealPlanEntryRepository mealPlanEntryRepository;
    @Mock private MealRepository mealRepository;
    @Mock private RecipeRepository recipeRepository;
    @Mock private UserRepository userRepository;
    @Mock private RecipeService recipeService;
    @Mock private MacroCalculationService macroCalculationService;
    @Mock private ExtraChoiceService extraChoiceService;
    @Mock private RecipeFamilyMemberRepository recipeFamilyMemberRepository;

    @InjectMocks private MealPlanService mealPlanService;

    @Captor private ArgumentCaptor<MealPlanEntry> entryCaptor;

    private static final Long USER_ID = 1L;
    private static final Long MEAL_ID = 3L;
    private static final Long RECIPE_ID = 104L;

    private User user;
    private Meal meal;
    private Recipe recipe;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(USER_ID);

        meal = new Meal();
        meal.setId(MEAL_ID);
        meal.setKey("dinner");

        recipe = new Recipe();
        recipe.setId(RECIPE_ID);
        recipe.setName("Beef & Mushroom Black Bean Stir Fry");
        recipe.setDefaultServings(2);
        recipe.setCalories(900);
    }

    /**
     * Stubs the empty-slot "create a new entry" path through assignRecipe,
     * including the convertToDTO tail that runs after the save.
     */
    private void stubHappyPath() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        when(mealPlanEntryRepository.findByUserIdAndPlanDateAndMealIdAndRecipeId(
                anyLong(), any(), anyLong(), anyLong())).thenReturn(Optional.empty());
        when(mealPlanEntryRepository.findByUserIdAndPlanDateAndMealId(
                anyLong(), any(), anyLong())).thenReturn(Optional.empty());
        when(mealRepository.findById(MEAL_ID)).thenReturn(Optional.of(meal));
        when(recipeRepository.findById(RECIPE_ID)).thenReturn(Optional.of(recipe));
        when(mealPlanEntryRepository.save(any(MealPlanEntry.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(macroCalculationService.calculatePerServingMacros(any()))
                .thenReturn(new int[]{0, 0, 0});
    }

    private MealPlanCreateRequest requestWithServings(BigDecimal servings) {
        MealPlanCreateRequest request = new MealPlanCreateRequest();
        request.setPlanDate(LocalDate.of(2026, 7, 31));
        request.setMealId(MEAL_ID);
        request.setRecipeId(RECIPE_ID);
        request.setServings(servings);
        return request;
    }

    @Test
    void assignRecipe_whenServingsOmitted_usesRecipeDefaultServings() {
        stubHappyPath();

        mealPlanService.assignRecipe(USER_ID, requestWithServings(null));

        verify(mealPlanEntryRepository).save(entryCaptor.capture());
        assertThat(entryCaptor.getValue().getServings()).isEqualByComparingTo("2");
    }

    /**
     * A value that is neither 1 nor the recipe's default_servings — the case a real
     * user hits when asking for 4 servings of a 2-serving recipe.
     */
    @Test
    void assignRecipe_whenServingsProvided_honoursRequestedValue() {
        stubHappyPath();

        mealPlanService.assignRecipe(USER_ID, requestWithServings(new BigDecimal("4")));

        verify(mealPlanEntryRepository).save(entryCaptor.capture());
        assertThat(entryCaptor.getValue().getServings()).isEqualByComparingTo("4");
    }

    /**
     * servings = 1 remains a legal EXPLICIT value (someone cooking for one).
     * Only the silent default changed — an explicit 1 must not be overwritten
     * by the recipe's default_servings.
     */
    @Test
    void assignRecipe_whenServingsExplicitlyOne_isNotOverriddenByRecipeDefault() {
        stubHappyPath();

        mealPlanService.assignRecipe(USER_ID, requestWithServings(BigDecimal.ONE));

        verify(mealPlanEntryRepository).save(entryCaptor.capture());
        assertThat(entryCaptor.getValue().getServings()).isEqualByComparingTo("1");
    }

    @Test
    void assignRecipe_whenRecipeHasNoDefaultServings_fallsBackToOne() {
        recipe.setDefaultServings(null);
        stubHappyPath();

        mealPlanService.assignRecipe(USER_ID, requestWithServings(null));

        verify(mealPlanEntryRepository).save(entryCaptor.capture());
        assertThat(entryCaptor.getValue().getServings()).isEqualByComparingTo("1");
    }

    /**
     * Covers the `recipeDefault > 0` half of the guard: a corrupt recipe row with
     * default_servings = 0 must still yield a usable 1, not a 0 that would zero
     * out every shopping-list quantity derived from the entry.
     */
    @Test
    void assignRecipe_whenRecipeDefaultServingsIsZero_fallsBackToOne() {
        recipe.setDefaultServings(0);
        stubHappyPath();

        mealPlanService.assignRecipe(USER_ID, requestWithServings(null));

        verify(mealPlanEntryRepository).save(entryCaptor.capture());
        assertThat(entryCaptor.getValue().getServings()).isEqualByComparingTo("1");
    }

    /**
     * MPP-3 AC 5: an omitted servings value resolves to the user's preference
     * rather than the recipe's default_servings.
     */
    @Test
    void assignRecipe_whenServingsOmittedAndUserHasPreference_usesThePreference() {
        user.setDefaultServings(new BigDecimal("1.00"));
        stubHappyPath();

        mealPlanService.assignRecipe(USER_ID, requestWithServings(null));

        verify(mealPlanEntryRepository).save(entryCaptor.capture());
        assertThat(entryCaptor.getValue().getServings()).isEqualByComparingTo("1.00");
    }

    /**
     * MPP-3 AC 10: the preference is a starting point, not a lock. An explicit
     * request value still wins over it.
     */
    @Test
    void assignRecipe_whenServingsProvided_beatsTheUserPreference() {
        user.setDefaultServings(new BigDecimal("1.00"));
        stubHappyPath();

        mealPlanService.assignRecipe(USER_ID, requestWithServings(new BigDecimal("4")));

        verify(mealPlanEntryRepository).save(entryCaptor.capture());
        assertThat(entryCaptor.getValue().getServings()).isEqualByComparingTo("4");
    }

    /**
     * MPP-3 AC 9: a user who never set the preference behaves exactly as before —
     * the recipe's default_servings (2) still wins.
     */
    @Test
    void assignRecipe_whenUserHasNoPreference_stillUsesRecipeDefault() {
        user.setDefaultServings(null);
        stubHappyPath();

        mealPlanService.assignRecipe(USER_ID, requestWithServings(null));

        verify(mealPlanEntryRepository).save(entryCaptor.capture());
        assertThat(entryCaptor.getValue().getServings()).isEqualByComparingTo("2");
    }

    // ------------------------------------------------------------------
    // MPP-10: homemade/store-bought extra choices
    // ------------------------------------------------------------------

    private static final Long OWNER_ID = 1L;
    private static final Long EXTRA_ID = 36L;
    private static final Long NEW_ENTRY_ID = 800L;

    private static Recipe recipeWithId(Long id) {
        Recipe r = new Recipe();
        r.setId(id);
        r.setDefaultServings(2);
        return r;
    }

    private static RecipeFamilyMember memberOfFamily(Long familyId) {
        RecipeFamily family = new RecipeFamily();
        family.setId(familyId);
        RecipeFamilyMember member = new RecipeFamilyMember();
        member.setFamily(family);
        return member;
    }

    private MealPlanEntry entryWithId(Long id, Recipe r, LocalDate date) {
        MealPlanEntry e = new MealPlanEntry();
        e.setId(id);
        e.setUser(user);
        e.setPlanDate(date);
        e.setMeal(meal);
        e.setRecipe(r);
        e.setServings(new BigDecimal("2"));
        return e;
    }

    /** Stubs assign into a slot that currently holds {@code replaced} (or is empty when null). */
    private void stubAssign(Long recipeId, MealPlanEntry replaced) {
        Recipe target = recipeWithId(recipeId);
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        when(mealPlanEntryRepository.findByUserIdAndPlanDateAndMealIdAndRecipeId(
                anyLong(), any(), anyLong(), anyLong())).thenReturn(Optional.empty());
        when(mealPlanEntryRepository.findByUserIdAndPlanDateAndMealId(anyLong(), any(), anyLong()))
                .thenReturn(Optional.ofNullable(replaced));
        when(mealRepository.findById(MEAL_ID)).thenReturn(Optional.of(meal));
        when(recipeRepository.findById(recipeId)).thenReturn(Optional.of(target));
        when(mealPlanEntryRepository.save(any(MealPlanEntry.class))).thenAnswer(inv -> {
            MealPlanEntry saved = inv.getArgument(0);
            saved.setId(NEW_ENTRY_ID);
            return saved;
        });
        when(macroCalculationService.calculatePerServingMacros(any())).thenReturn(new int[]{0, 0, 0});
    }

    private MealPlanCreateRequest assignRequest(Long recipeId, Map<Long, Boolean> choices) {
        MealPlanCreateRequest request = new MealPlanCreateRequest();
        request.setPlanDate(LocalDate.of(2026, 10, 12));
        request.setMealId(MEAL_ID);
        request.setRecipeId(recipeId);
        request.setExtraChoices(choices);
        return request;
    }

    private void stubWeekMacros() {
        when(macroCalculationService.calculatePerServingMacros(any())).thenReturn(new int[]{0, 0, 0});
        when(macroCalculationService.calculateTotalMacros(anyList())).thenReturn(new int[]{0, 0, 0});
        when(macroCalculationService.calculateWeeklyTotals(anyList())).thenReturn(new int[]{0, 0, 0});
        when(macroCalculationService.calculateDailyAverages(any(), anyInt())).thenReturn(new int[]{0, 0, 0});
    }

    @Test
    void assignRecipe_withExtraChoices_storesEntryChoicesAndUpdatesDefaults() {
        stubAssign(82L, null);
        Map<Long, Boolean> choices = Map.of(EXTRA_ID, false);
        when(extraChoiceService.retainTreeExtras(82L, choices)).thenReturn(choices);

        MealPlanEntryDTO dto = mealPlanService.assignRecipe(USER_ID, assignRequest(82L, choices));

        verify(extraChoiceService).setEntryChoices(NEW_ENTRY_ID, Map.of(EXTRA_ID, false));
        verify(extraChoiceService).updateDefaults(USER_ID, 82L, Map.of(EXTRA_ID, false));
        assertThat(dto.getExtraChoices()).containsEntry(EXTRA_ID, false);
    }

    @Test
    void assignRecipe_sameFamilySwap_withoutChoices_carriesReplacedEntryChoices() {
        MealPlanEntry replaced = entryWithId(10L, recipeWithId(81L), LocalDate.of(2026, 10, 12));
        stubAssign(82L, replaced);
        when(recipeFamilyMemberRepository.findByRecipeId(81L)).thenReturn(Optional.of(memberOfFamily(9L)));
        when(recipeFamilyMemberRepository.findByRecipeId(82L)).thenReturn(Optional.of(memberOfFamily(9L)));
        when(extraChoiceService.getEntryChoices(List.of(10L))).thenReturn(Map.of(10L, Map.of(EXTRA_ID, false)));

        MealPlanEntryDTO dto = mealPlanService.assignRecipe(USER_ID, assignRequest(82L, null));

        // The replaced entry's choices must be read before the entry is deleted (DB cascade).
        InOrder order = inOrder(extraChoiceService, mealPlanEntryRepository);
        order.verify(extraChoiceService).getEntryChoices(List.of(10L));
        order.verify(mealPlanEntryRepository).delete(replaced);
        verify(extraChoiceService).setEntryChoices(NEW_ENTRY_ID, Map.of(EXTRA_ID, false));
        verify(extraChoiceService, never()).updateDefaults(any(), any(), any());
        assertThat(dto.getExtraChoices()).containsEntry(EXTRA_ID, false);
    }

    @Test
    void assignRecipe_differentFamilySwap_doesNotCarry() {
        MealPlanEntry replaced = entryWithId(10L, recipeWithId(81L), LocalDate.of(2026, 10, 12));
        stubAssign(50L, replaced);
        when(recipeFamilyMemberRepository.findByRecipeId(81L)).thenReturn(Optional.of(memberOfFamily(9L)));
        when(recipeFamilyMemberRepository.findByRecipeId(50L)).thenReturn(Optional.of(memberOfFamily(4L)));

        MealPlanEntryDTO dto = mealPlanService.assignRecipe(USER_ID, assignRequest(50L, null));

        verify(extraChoiceService, never()).setEntryChoices(any(), anyMap());
        verify(extraChoiceService, never()).getEntryChoices(anyList());
        assertThat(dto.getExtraChoices()).isEmpty();
    }

    @Test
    void assignRecipe_requestChoicesBeatCarriedChoicesOnVariantSwap() {
        MealPlanEntry replaced = entryWithId(10L, recipeWithId(81L), LocalDate.of(2026, 10, 12));
        stubAssign(82L, replaced);
        when(recipeFamilyMemberRepository.findByRecipeId(81L)).thenReturn(Optional.of(memberOfFamily(9L)));
        when(recipeFamilyMemberRepository.findByRecipeId(82L)).thenReturn(Optional.of(memberOfFamily(9L)));
        when(extraChoiceService.getEntryChoices(List.of(10L))).thenReturn(Map.of(10L, Map.of(EXTRA_ID, false)));
        Map<Long, Boolean> choices = Map.of(EXTRA_ID, true);
        when(extraChoiceService.retainTreeExtras(82L, choices)).thenReturn(choices);

        mealPlanService.assignRecipe(USER_ID, assignRequest(82L, choices));

        verify(extraChoiceService).setEntryChoices(NEW_ENTRY_ID, Map.of(EXTRA_ID, true));
        verify(extraChoiceService, never()).setEntryChoices(NEW_ENTRY_ID, Map.of(EXTRA_ID, false));
    }

    @Test
    void assignRecipe_linkedUser_writesChoicesAgainstOwner() {
        User linked = new User();
        linked.setId(2L);
        linked.setMealPlanOwnerId(OWNER_ID);
        when(userRepository.findById(2L)).thenReturn(Optional.of(linked));
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.of(user));
        when(mealPlanEntryRepository.findByUserIdAndPlanDateAndMealIdAndRecipeId(
                anyLong(), any(), anyLong(), anyLong())).thenReturn(Optional.empty());
        when(mealPlanEntryRepository.findByUserIdAndPlanDateAndMealId(anyLong(), any(), anyLong()))
                .thenReturn(Optional.empty());
        when(mealRepository.findById(MEAL_ID)).thenReturn(Optional.of(meal));
        when(recipeRepository.findById(82L)).thenReturn(Optional.of(recipeWithId(82L)));
        when(mealPlanEntryRepository.save(any(MealPlanEntry.class))).thenAnswer(inv -> {
            MealPlanEntry saved = inv.getArgument(0);
            saved.setId(NEW_ENTRY_ID);
            return saved;
        });
        when(macroCalculationService.calculatePerServingMacros(any())).thenReturn(new int[]{0, 0, 0});
        Map<Long, Boolean> choices = Map.of(EXTRA_ID, false);
        when(extraChoiceService.retainTreeExtras(82L, choices)).thenReturn(choices);

        mealPlanService.assignRecipe(2L, assignRequest(82L, choices));

        verify(extraChoiceService).updateDefaults(OWNER_ID, 82L, choices);
        verify(mealPlanEntryRepository).save(entryCaptor.capture());
        assertThat(entryCaptor.getValue().getUser().getId()).isEqualTo(OWNER_ID);
    }

    @Test
    void copyWeek_copiesChoicesSourceToTarget() {
        LocalDate source = LocalDate.of(2026, 10, 5);
        LocalDate target = LocalDate.of(2026, 10, 12);
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        MealPlanEntry s1 = entryWithId(10L, recipeWithId(82L), source);
        MealPlanEntry s2 = entryWithId(11L, recipeWithId(38L), source.plusDays(3));
        when(mealPlanEntryRepository.findByUserIdAndDateRange(USER_ID, source, source.plusDays(7)))
                .thenReturn(List.of(s1, s2));
        when(mealPlanEntryRepository.findByUserIdAndDateRange(USER_ID, target, target.plusDays(7)))
                .thenReturn(List.of());
        when(mealPlanEntryRepository.saveAll(anyList())).thenAnswer(inv -> {
            List<MealPlanEntry> saved = new ArrayList<>(inv.<List<MealPlanEntry>>getArgument(0));
            saved.get(0).setId(900L);
            saved.get(1).setId(901L);
            return saved;
        });
        // The returned target week is empty in this fixture, so only the weekly roll-ups run.
        when(macroCalculationService.calculateWeeklyTotals(anyList())).thenReturn(new int[]{0, 0, 0});
        when(macroCalculationService.calculateDailyAverages(any(), anyInt())).thenReturn(new int[]{0, 0, 0});

        mealPlanService.copyWeek(USER_ID, source, target);

        verify(extraChoiceService).copyEntryChoices(Map.of(10L, 900L, 11L, 901L));
    }

    @Test
    void swapDays_movesEntriesInPlace_withoutRewritingChoices() {
        LocalDate a = LocalDate.of(2026, 10, 12);
        LocalDate b = LocalDate.of(2026, 10, 14);
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        MealPlanEntry ea = entryWithId(10L, recipeWithId(82L), a);
        MealPlanEntry eb = entryWithId(11L, recipeWithId(38L), b);
        when(mealPlanEntryRepository.findByUserIdAndPlanDate(USER_ID, a)).thenReturn(List.of(ea));
        when(mealPlanEntryRepository.findByUserIdAndPlanDate(USER_ID, b)).thenReturn(List.of(eb));

        mealPlanService.swapDays(USER_ID, a, b);

        assertThat(ea.getPlanDate()).isEqualTo(b);
        assertThat(eb.getPlanDate()).isEqualTo(a);
        assertThat(ea.getId()).isEqualTo(10L);
        assertThat(eb.getId()).isEqualTo(11L);
        verifyNoInteractions(extraChoiceService);
    }

    @Test
    void getWeekPlan_exposesStoredChoicesOnEntries() {
        LocalDate start = LocalDate.of(2026, 10, 12);
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        MealPlanEntry withChoice = entryWithId(10L, recipeWithId(82L), start);
        MealPlanEntry without = entryWithId(11L, recipeWithId(38L), start.plusDays(1));
        when(mealPlanEntryRepository.findByUserIdAndDateRange(USER_ID, start, start.plusDays(7)))
                .thenReturn(List.of(withChoice, without));
        when(extraChoiceService.getEntryChoices(List.of(10L, 11L)))
                .thenReturn(Map.of(10L, Map.of(EXTRA_ID, false)));
        stubWeekMacros();

        MealPlanWeekDTO week = mealPlanService.getWeekPlan(USER_ID, start);

        MealPlanEntryDTO first = week.getDays().get(0).getMealsByType().get("dinner").get(0);
        MealPlanEntryDTO second = week.getDays().get(1).getMealsByType().get("dinner").get(0);
        assertThat(first.getExtraChoices()).isEqualTo(Map.of(EXTRA_ID, false));
        assertThat(second.getExtraChoices()).isEmpty();
    }

    // ------------------------------------------------------------------
    // MPP-12: mark a planned meal as eaten
    // ------------------------------------------------------------------

    private static final Long ENTRY_ID = 812L;

    @Test
    void setEntryEaten_ownEntry_marksEatenWithUtcTimestamp() {
        MealPlanEntry entry = entryWithId(ENTRY_ID, recipeWithId(82L), LocalDate.of(2026, 10, 13));
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        when(mealPlanEntryRepository.findByIdAndUserId(ENTRY_ID, USER_ID)).thenReturn(Optional.of(entry));

        Optional<MealPlanEntryEatenDTO> result = mealPlanService.setEntryEaten(USER_ID, ENTRY_ID, true);

        assertThat(result).isPresent();
        assertThat(result.get().eaten()).isTrue();
        assertThat(result.get().eatenAt()).isCloseTo(Instant.now(), within(5, ChronoUnit.SECONDS));
        assertThat(entry.getEaten()).isTrue();
        assertThat(entry.getEatenAt().toInstant(ZoneOffset.UTC)).isEqualTo(result.get().eatenAt());
    }

    @Test
    void setEntryEaten_alreadyEaten_keepsFirstTimestamp() {
        MealPlanEntry entry = entryWithId(ENTRY_ID, recipeWithId(82L), LocalDate.of(2026, 10, 13));
        LocalDateTime first = LocalDateTime.of(2026, 10, 13, 12, 12, 4);
        entry.setEaten(true);
        entry.setEatenAt(first);
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        when(mealPlanEntryRepository.findByIdAndUserId(ENTRY_ID, USER_ID)).thenReturn(Optional.of(entry));

        MealPlanEntryEatenDTO result = mealPlanService.setEntryEaten(USER_ID, ENTRY_ID, true).orElseThrow();

        assertThat(entry.getEatenAt()).isEqualTo(first);
        assertThat(result.eatenAt()).isEqualTo(first.toInstant(ZoneOffset.UTC));
    }

    @Test
    void setEntryEaten_undo_clearsEatenAndTimestamp() {
        MealPlanEntry entry = entryWithId(ENTRY_ID, recipeWithId(82L), LocalDate.of(2026, 10, 13));
        entry.setEaten(true);
        entry.setEatenAt(LocalDateTime.of(2026, 10, 13, 12, 12, 4));
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        when(mealPlanEntryRepository.findByIdAndUserId(ENTRY_ID, USER_ID)).thenReturn(Optional.of(entry));

        MealPlanEntryEatenDTO result = mealPlanService.setEntryEaten(USER_ID, ENTRY_ID, false).orElseThrow();

        assertThat(result.eaten()).isFalse();
        assertThat(result.eatenAt()).isNull();
        assertThat(entry.getEaten()).isFalse();
        assertThat(entry.getEatenAt()).isNull();
    }

    @Test
    void setEntryEaten_linkedUser_writesTheOwnersRow() {
        User linked = new User();
        linked.setId(2L);
        linked.setMealPlanOwnerId(OWNER_ID);
        MealPlanEntry ownersEntry = entryWithId(ENTRY_ID, recipeWithId(82L), LocalDate.of(2026, 10, 13));
        when(userRepository.findById(2L)).thenReturn(Optional.of(linked));
        when(mealPlanEntryRepository.findByIdAndUserId(ENTRY_ID, OWNER_ID)).thenReturn(Optional.of(ownersEntry));

        Optional<MealPlanEntryEatenDTO> result = mealPlanService.setEntryEaten(2L, ENTRY_ID, true);

        assertThat(result).isPresent();
        assertThat(ownersEntry.getEaten()).isTrue();
        verify(mealPlanEntryRepository, never()).save(any(MealPlanEntry.class));
    }

    @Test
    void setEntryEaten_entryOutsideEffectivePlan_returnsEmpty() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        when(mealPlanEntryRepository.findByIdAndUserId(999L, USER_ID)).thenReturn(Optional.empty());

        assertThat(mealPlanService.setEntryEaten(USER_ID, 999L, true)).isEmpty();
    }

    @Test
    void assignRecipe_replacingAnEatenSlot_createsANotEatenEntry() {
        MealPlanEntry eatenEntry = entryWithId(10L, recipeWithId(38L), LocalDate.of(2026, 10, 12));
        eatenEntry.setEaten(true);
        eatenEntry.setEatenAt(LocalDateTime.of(2026, 10, 12, 12, 0));
        stubAssign(82L, eatenEntry);

        mealPlanService.assignRecipe(USER_ID, assignRequest(82L, Map.of()));

        verify(mealPlanEntryRepository).delete(eatenEntry);
        verify(mealPlanEntryRepository).save(entryCaptor.capture());
        assertThat(entryCaptor.getValue().getEaten()).isFalse();
        assertThat(entryCaptor.getValue().getEatenAt()).isNull();
    }

    @Test
    void getWeekPlan_exposesEatenStateOnEntries() {
        LocalDate start = LocalDate.of(2026, 10, 12);
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        MealPlanEntry eatenEntry = entryWithId(10L, recipeWithId(82L), start);
        eatenEntry.setEaten(true);
        eatenEntry.setEatenAt(LocalDateTime.of(2026, 10, 12, 12, 12, 4));
        when(mealPlanEntryRepository.findByUserIdAndDateRange(USER_ID, start, start.plusDays(7)))
                .thenReturn(List.of(eatenEntry));
        when(extraChoiceService.getEntryChoices(List.of(10L))).thenReturn(Map.of());
        stubWeekMacros();

        MealPlanWeekDTO week = mealPlanService.getWeekPlan(USER_ID, start);

        MealPlanEntryDTO dto = week.getDays().get(0).getMealsByType().get("dinner").get(0);
        assertThat(dto.getEaten()).isTrue();
        assertThat(dto.getEatenAt()).isEqualTo(Instant.parse("2026-10-12T12:12:04Z"));
    }
}
