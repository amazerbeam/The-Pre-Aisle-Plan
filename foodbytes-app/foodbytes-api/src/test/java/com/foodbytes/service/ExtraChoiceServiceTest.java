package com.foodbytes.service;

import com.foodbytes.dto.ExtraChoiceItemDTO;
import com.foodbytes.dto.RecipeExtraNodeDTO;
import com.foodbytes.model.*;
import com.foodbytes.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/** MPP-10: choice storage rules - ownership, tree validation, default fan-out, template scope, legacy import. */
@ExtendWith(MockitoExtension.class)
class ExtraChoiceServiceTest {

    private static final Long OWNER = 1L;
    private static final Long LINKED = 2L;
    private static final Long STRANGER = 3L;

    @Mock private MealPlanEntryExtraChoiceRepository entryChoiceRepository;
    @Mock private MealPlanTemplateEntryExtraChoiceRepository templateChoiceRepository;
    @Mock private UserExtraDefaultRepository defaultRepository;
    @Mock private MealPlanEntryRepository mealPlanEntryRepository;
    @Mock private MealPlanTemplateRepository templateRepository;
    @Mock private MealPlanTemplateEntryRepository templateEntryRepository;
    @Mock private RecipeFamilyMemberRepository familyMemberRepository;
    @Mock private RecipeRepository recipeRepository;
    @Mock private RecipeExtrasService recipeExtrasService;
    @Mock private UserRepository userRepository;

    @InjectMocks private ExtraChoiceService service;

    private Recipe bolognese;

    @BeforeEach
    void setUp() {
        bolognese = recipe(82L);
        lenient().when(userRepository.findById(OWNER)).thenReturn(Optional.of(user(OWNER, null)));
        lenient().when(userRepository.findById(LINKED)).thenReturn(Optional.of(user(LINKED, OWNER)));
        // Recipe 82's extras tree is [Fresh Pasta 36]
        lenient().when(recipeExtrasService.buildExtrasTree(eq(82L), any()))
            .thenReturn(List.of(RecipeExtraNodeDTO.builder().recipeId(36L).recipeName("Fresh Pasta")
                .children(new ArrayList<>()).build()));
        lenient().when(recipeExtrasService.flattenExtrasToIds(anyList())).thenReturn(List.of(36L));
    }

    @Test
    void updateWeekChoices_linkedUser_writesAgainstOwnersEntry() {
        when(mealPlanEntryRepository.findAllById(any())).thenReturn(List.of(entry(500L, OWNER, bolognese)));
        givenFamily(81L, 82L, 83L);

        service.updateWeekChoices(LINKED, List.of(new ExtraChoiceItemDTO(500L, 36L, false)));

        ArgumentCaptor<List<MealPlanEntryExtraChoice>> saved = ArgumentCaptor.forClass(List.class);
        verify(entryChoiceRepository).saveAll(saved.capture());
        assertThat(saved.getValue()).singleElement().satisfies(c -> {
            assertThat(c.getMealPlanEntryId()).isEqualTo(500L);
            assertThat(c.getExtraRecipeId()).isEqualTo(36L);
            assertThat(c.getHomemade()).isFalse();
        });
        // defaults are keyed to the OWNER, not the requesting linked user
        ArgumentCaptor<List<UserExtraDefault>> defaults = ArgumentCaptor.forClass(List.class);
        verify(defaultRepository).saveAll(defaults.capture());
        assertThat(defaults.getValue()).allSatisfy(d -> assertThat(d.getUserId()).isEqualTo(OWNER));
    }

    @Test
    void updateWeekChoices_entryOfAnotherOwner_throwsNotFound() {
        when(mealPlanEntryRepository.findAllById(any())).thenReturn(List.of(entry(501L, STRANGER, bolognese)));

        assertThatThrownBy(() -> service.updateWeekChoices(OWNER, List.of(new ExtraChoiceItemDTO(501L, 36L, false))))
            .isInstanceOf(ExtraChoiceService.ChoiceTargetNotFoundException.class);

        verify(entryChoiceRepository, never()).saveAll(any());
        verifyNoInteractions(defaultRepository);
    }

    @Test
    void updateWeekChoices_extraNotInTree_throwsIllegalArgument() {
        when(mealPlanEntryRepository.findAllById(any())).thenReturn(List.of(entry(500L, OWNER, bolognese)));

        assertThatThrownBy(() -> service.updateWeekChoices(OWNER, List.of(new ExtraChoiceItemDTO(500L, 999L, false))))
            .isInstanceOf(IllegalArgumentException.class);

        verify(entryChoiceRepository, never()).saveAll(any());
    }

    @Test
    void updateWeekChoices_updatesDefaultsForWholeFamily() {
        when(mealPlanEntryRepository.findAllById(any())).thenReturn(List.of(entry(500L, OWNER, bolognese)));
        givenFamily(81L, 82L, 83L);

        service.updateWeekChoices(OWNER, List.of(new ExtraChoiceItemDTO(500L, 36L, false)));

        ArgumentCaptor<List<UserExtraDefault>> defaults = ArgumentCaptor.forClass(List.class);
        verify(defaultRepository).saveAll(defaults.capture());
        assertThat(defaults.getValue()).extracting(UserExtraDefault::getRecipeId)
            .containsExactlyInAnyOrder(81L, 82L, 83L);
        assertThat(defaults.getValue()).allSatisfy(d -> {
            assertThat(d.getUserId()).isEqualTo(OWNER);
            assertThat(d.getExtraRecipeId()).isEqualTo(36L);
            assertThat(d.getHomemade()).isFalse();
        });
    }

    @Test
    void updateWeekChoices_existingRow_isUpdatedNotDuplicated() {
        when(mealPlanEntryRepository.findAllById(any())).thenReturn(List.of(entry(500L, OWNER, bolognese)));
        givenFamily(82L);
        MealPlanEntryExtraChoice existing = new MealPlanEntryExtraChoice();
        existing.setId(7L);
        existing.setMealPlanEntryId(500L);
        existing.setExtraRecipeId(36L);
        existing.setHomemade(true);
        when(entryChoiceRepository.findByMealPlanEntryIdIn(anyCollection())).thenReturn(List.of(existing));

        service.updateWeekChoices(OWNER, List.of(new ExtraChoiceItemDTO(500L, 36L, false)));

        ArgumentCaptor<List<MealPlanEntryExtraChoice>> saved = ArgumentCaptor.forClass(List.class);
        verify(entryChoiceRepository).saveAll(saved.capture());
        assertThat(saved.getValue()).singleElement().satisfies(c -> {
            assertThat(c.getId()).isEqualTo(7L);
            assertThat(c.getHomemade()).isFalse();
        });
    }

    @Test
    void updateTemplateChoices_neverTouchesDefaults() {
        when(templateRepository.findByIdAndUserId(40L, OWNER)).thenReturn(Optional.of(new MealPlanTemplate()));
        when(templateEntryRepository.findByTemplateId(40L)).thenReturn(List.of(templateEntry(700L, bolognese)));

        service.updateTemplateChoices(OWNER, 40L, List.of(new ExtraChoiceItemDTO(700L, 36L, false)));

        ArgumentCaptor<List<MealPlanTemplateEntryExtraChoice>> saved = ArgumentCaptor.forClass(List.class);
        verify(templateChoiceRepository).saveAll(saved.capture());
        assertThat(saved.getValue()).singleElement().satisfies(c -> {
            assertThat(c.getTemplateEntryId()).isEqualTo(700L);
            assertThat(c.getHomemade()).isFalse();
        });
        verifyNoInteractions(defaultRepository);
        verifyNoInteractions(familyMemberRepository);
        verify(entryChoiceRepository, never()).saveAll(any());
    }

    @Test
    void updateTemplateChoices_entryNotInTemplate_throwsNotFound() {
        when(templateRepository.findByIdAndUserId(40L, OWNER)).thenReturn(Optional.of(new MealPlanTemplate()));
        when(templateEntryRepository.findByTemplateId(40L)).thenReturn(List.of(templateEntry(700L, bolognese)));

        assertThatThrownBy(() -> service.updateTemplateChoices(OWNER, 40L,
                List.of(new ExtraChoiceItemDTO(999L, 36L, false))))
            .isInstanceOf(ExtraChoiceService.ChoiceTargetNotFoundException.class);
        verify(templateChoiceRepository, never()).saveAll(any());
    }

    @Test
    void updateTemplateChoices_templateOfAnotherOwner_throwsNotFound() {
        when(templateRepository.findByIdAndUserId(40L, OWNER)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateTemplateChoices(OWNER, 40L,
                List.of(new ExtraChoiceItemDTO(700L, 36L, false))))
            .isInstanceOf(ExtraChoiceService.ChoiceTargetNotFoundException.class);
    }

    @Test
    void getEntryChoices_groupsByEntry() {
        when(entryChoiceRepository.findByMealPlanEntryIdIn(anyCollection())).thenReturn(List.of(
            choice(500L, 36L, false), choice(500L, 12L, true), choice(501L, 36L, true)));

        Map<Long, Map<Long, Boolean>> result = service.getEntryChoices(List.of(500L, 501L));

        assertThat(result).containsEntry(500L, Map.of(36L, false, 12L, true));
        assertThat(result).containsEntry(501L, Map.of(36L, true));
    }

    @Test
    void importLegacySelections_rejectsOversizedInnerMap() {
        Map<Long, Boolean> tooMany = new HashMap<>();
        for (long i = 1; i <= ExtraChoiceService.MAX_IMPORT_EXTRAS_PER_RECIPE + 1; i++) tooMany.put(i, true);

        assertThatThrownBy(() -> service.importLegacySelections(OWNER, Map.of(82L, tooMany)))
            .isInstanceOf(IllegalArgumentException.class);
        verify(defaultRepository, never()).saveAll(any());
    }

    @Test
    void getDefaults_linkedUser_readsOwnersDefaults() {
        UserExtraDefault d = new UserExtraDefault();
        d.setUserId(OWNER);
        d.setRecipeId(82L);
        d.setExtraRecipeId(36L);
        d.setHomemade(false);
        when(defaultRepository.findByUserId(OWNER)).thenReturn(List.of(d));

        Map<Long, Map<Long, Boolean>> result = service.getDefaults(LINKED);

        assertThat(result).containsEntry(82L, Map.of(36L, false));
        verify(defaultRepository).findByUserId(OWNER);
    }

    @Test
    void importLegacySelections_skipsWhenOwnerAlreadyHasChoices() {
        when(defaultRepository.existsByUserId(OWNER)).thenReturn(true);

        boolean imported = service.importLegacySelections(OWNER, Map.of(82L, Map.of(36L, false)));

        assertThat(imported).isFalse();
        verify(defaultRepository, never()).saveAll(any());
        verify(entryChoiceRepository, never()).saveAll(any());
    }

    @Test
    void importLegacySelections_writesDefaultsAndFillsCurrentAndFutureEntries() {
        LocalDate monday = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        when(recipeRepository.findAllById(any())).thenReturn(List.of(bolognese));
        MealPlanEntry matching = entry(500L, OWNER, bolognese);
        MealPlanEntry other = entry(501L, OWNER, recipe(50L));
        when(mealPlanEntryRepository.findByUserIdFromDate(OWNER, monday)).thenReturn(List.of(matching, other));
        givenFamily(82L);

        boolean imported = service.importLegacySelections(OWNER, Map.of(82L, Map.of(36L, false, 999L, true)));

        assertThat(imported).isTrue();
        ArgumentCaptor<List<MealPlanEntryExtraChoice>> saved = ArgumentCaptor.forClass(List.class);
        verify(entryChoiceRepository).saveAll(saved.capture());
        assertThat(saved.getValue()).singleElement().satisfies(c -> {
            assertThat(c.getMealPlanEntryId()).isEqualTo(500L);   // recipe 50 entry untouched
            assertThat(c.getExtraRecipeId()).isEqualTo(36L);      // 999 is not in the tree and was dropped
            assertThat(c.getHomemade()).isFalse();
        });
        ArgumentCaptor<List<UserExtraDefault>> defaults = ArgumentCaptor.forClass(List.class);
        verify(defaultRepository).saveAll(defaults.capture());
        assertThat(defaults.getValue()).singleElement().satisfies(d -> {
            assertThat(d.getRecipeId()).isEqualTo(82L);
            assertThat(d.getExtraRecipeId()).isEqualTo(36L);
        });
    }

    @Test
    void retainTreeExtras_dropsIdsOutsideTree() {
        Map<Long, Boolean> kept = service.retainTreeExtras(82L, Map.of(36L, false, 999L, true));

        assertThat(kept).isEqualTo(Map.of(36L, false));
    }

    @Test
    void copyEntryChoices_remapsRowsOntoTargetEntries() {
        when(entryChoiceRepository.findByMealPlanEntryIdIn(anyCollection()))
            .thenReturn(List.of(choice(10L, 36L, false)));

        service.copyEntryChoices(Map.of(10L, 900L));

        ArgumentCaptor<List<MealPlanEntryExtraChoice>> saved = ArgumentCaptor.forClass(List.class);
        verify(entryChoiceRepository).saveAll(saved.capture());
        assertThat(saved.getValue()).singleElement().satisfies(c -> {
            assertThat(c.getId()).isNull();
            assertThat(c.getMealPlanEntryId()).isEqualTo(900L);
            assertThat(c.getHomemade()).isFalse();
        });
    }

    @Test
    void templateRoundTrip_entryToTemplateAndBack_keepsChoices() {
        when(entryChoiceRepository.findByMealPlanEntryIdIn(anyCollection()))
            .thenReturn(List.of(choice(10L, 36L, false)));
        service.copyEntryChoicesToTemplate(Map.of(10L, 700L));
        ArgumentCaptor<List<MealPlanTemplateEntryExtraChoice>> toTemplate = ArgumentCaptor.forClass(List.class);
        verify(templateChoiceRepository).saveAll(toTemplate.capture());
        MealPlanTemplateEntryExtraChoice stored = toTemplate.getValue().get(0);
        assertThat(stored.getTemplateEntryId()).isEqualTo(700L);
        assertThat(stored.getHomemade()).isFalse();

        when(templateChoiceRepository.findByTemplateEntryIdIn(anyCollection())).thenReturn(List.of(stored));
        service.copyTemplateChoicesToEntries(Map.of(700L, 910L));
        ArgumentCaptor<List<MealPlanEntryExtraChoice>> toEntry = ArgumentCaptor.forClass(List.class);
        verify(entryChoiceRepository).saveAll(toEntry.capture());
        assertThat(toEntry.getValue()).singleElement().satisfies(c -> {
            assertThat(c.getMealPlanEntryId()).isEqualTo(910L);
            assertThat(c.getExtraRecipeId()).isEqualTo(36L);
            assertThat(c.getHomemade()).isFalse();
        });
    }

    // --- fixtures ---

    private void givenFamily(Long... recipeIds) {
        List<RecipeFamilyMember> members = Arrays.stream(recipeIds).map(id -> {
            RecipeFamilyMember m = new RecipeFamilyMember();
            m.setRecipe(recipe(id));
            return m;
        }).collect(Collectors.toList());
        when(familyMemberRepository.findVariantsForRecipe(anyLong())).thenReturn(members);
    }

    private static User user(Long id, Long ownerId) {
        User u = new User();
        u.setId(id);
        u.setMealPlanOwnerId(ownerId);
        return u;
    }

    private static Recipe recipe(Long id) {
        Recipe r = new Recipe();
        r.setId(id);
        return r;
    }

    private static MealPlanEntry entry(Long id, Long ownerId, Recipe recipe) {
        MealPlanEntry e = new MealPlanEntry();
        e.setId(id);
        e.setUser(user(ownerId, null));
        e.setRecipe(recipe);
        return e;
    }

    private static MealPlanTemplateEntry templateEntry(Long id, Recipe recipe) {
        MealPlanTemplateEntry e = new MealPlanTemplateEntry();
        e.setId(id);
        e.setRecipe(recipe);
        return e;
    }

    private static MealPlanEntryExtraChoice choice(Long entryId, Long extraId, boolean homemade) {
        MealPlanEntryExtraChoice c = new MealPlanEntryExtraChoice();
        c.setMealPlanEntryId(entryId);
        c.setExtraRecipeId(extraId);
        c.setHomemade(homemade);
        return c;
    }
}
