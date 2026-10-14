package com.foodbytes.service;

import com.foodbytes.dto.MealPlanTemplateCreateRequest;
import com.foodbytes.dto.MealPlanTemplateDTO;
import com.foodbytes.model.*;
import com.foodbytes.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * MPP-10: template save / apply / update carry each meal's homemade/store-bought choices,
 * and never touch the per-dish defaults (AC 4, AC 7).
 */
@ExtendWith(MockitoExtension.class)
class MealPlanTemplateServiceTest {

    @Mock private MealPlanTemplateRepository templateRepository;
    @Mock private MealPlanTemplateEntryRepository templateEntryRepository;
    @Mock private MealPlanEntryRepository mealPlanEntryRepository;
    @Mock private MealRepository mealRepository;
    @Mock private RecipeRepository recipeRepository;
    @Mock private UserRepository userRepository;
    @Mock private MealPlanService mealPlanService;
    @Mock private ExtraChoiceService extraChoiceService;
    @Mock private ManageExtrasService manageExtrasService;
    @Mock private ApplicationEventPublisher eventPublisher;   // MPP-24: firsts candidates

    @InjectMocks private MealPlanTemplateService service;

    private static final Long USER_ID = 1L;
    private static final LocalDate MONDAY = LocalDate.of(2026, 10, 12);

    private User owner;
    private Meal dinner;
    private Recipe bolognese;
    private Recipe pinkSauce;
    private MealPlanTemplate template;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(USER_ID);
        dinner = new Meal();
        dinner.setId(3L);
        dinner.setKey("dinner");
        bolognese = recipe(82L);
        pinkSauce = recipe(38L);
        template = new MealPlanTemplate();
        template.setId(5L);
        template.setUser(owner);
        template.setName("Cut week");
        template.setEntries(new ArrayList<>());
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(owner));
    }

    private static Recipe recipe(Long id) {
        Recipe r = new Recipe();
        r.setId(id);
        return r;
    }

    private MealPlanEntry planEntry(Long id, Recipe recipe, int dayOffset) {
        MealPlanEntry e = new MealPlanEntry();
        e.setId(id);
        e.setUser(owner);
        e.setPlanDate(MONDAY.plusDays(dayOffset));
        e.setMeal(dinner);
        e.setRecipe(recipe);
        e.setServings(new BigDecimal("2"));
        return e;
    }

    private MealPlanTemplateEntry templateEntry(Long id, Recipe recipe, int dayOffset) {
        MealPlanTemplateEntry e = new MealPlanTemplateEntry();
        e.setId(id);
        e.setTemplate(template);
        e.setDayOffset(dayOffset);
        e.setMeal(dinner);
        e.setRecipe(recipe);
        e.setServings(new BigDecimal("2"));
        return e;
    }

    /** saveAll answers that assign sequential ids, like the real repository would. */
    private void stubTemplateEntrySaveAll(long firstId) {
        when(templateEntryRepository.saveAll(anyList())).thenAnswer(inv -> {
            List<MealPlanTemplateEntry> list = inv.getArgument(0);
            long next = firstId;
            for (MealPlanTemplateEntry e : list) e.setId(next++);
            return list;
        });
    }

    private void stubEntrySaveAll(long firstId) {
        when(mealPlanEntryRepository.saveAll(anyList())).thenAnswer(inv -> {
            List<MealPlanEntry> list = inv.getArgument(0);
            long next = firstId;
            for (MealPlanEntry e : list) e.setId(next++);
            return list;
        });
    }

    private void stubSaveSource() {
        when(templateRepository.existsByUserIdAndNameIgnoreCase(USER_ID, "Cut week")).thenReturn(false);
        when(templateRepository.save(any(MealPlanTemplate.class))).thenAnswer(inv -> {
            MealPlanTemplate t = inv.getArgument(0);
            t.setId(5L);
            return t;
        });
        when(mealPlanEntryRepository.findByUserIdAndDateRange(USER_ID, MONDAY, MONDAY.plusDays(7)))
            .thenReturn(List.of(planEntry(10L, bolognese, 0), planEntry(11L, pinkSauce, 2)));
        stubTemplateEntrySaveAll(700L);
    }

    private MealPlanTemplateCreateRequest createRequest() {
        MealPlanTemplateCreateRequest request = new MealPlanTemplateCreateRequest();
        request.setName("Cut week");
        request.setSourceStartDate(MONDAY);
        return request;
    }

    @Test
    void saveTemplate_snapshotsEachMealsChoices() {
        stubSaveSource();

        service.saveTemplate(USER_ID, createRequest());

        verify(extraChoiceService).copyEntryChoicesToTemplate(Map.of(10L, 700L, 11L, 701L));
        verify(eventPublisher).publishEvent(PetFirstCandidate.of(USER_ID, FirstKey.MAKE_TEMPLATE));
    }

    @Test
    void applyTemplate_restoresChoicesOntoNewEntries() {
        when(templateRepository.findByIdAndUserId(5L, USER_ID)).thenReturn(Optional.of(template));
        when(templateEntryRepository.findByTemplateId(5L))
            .thenReturn(List.of(templateEntry(700L, bolognese, 0), templateEntry(701L, pinkSauce, 2)));
        when(recipeRepository.findById(82L)).thenReturn(Optional.of(bolognese));
        when(recipeRepository.findById(38L)).thenReturn(Optional.of(pinkSauce));
        stubEntrySaveAll(900L);

        service.applyTemplate(USER_ID, 5L, MONDAY);

        verify(extraChoiceService).copyTemplateChoicesToEntries(Map.of(700L, 900L, 701L, 901L));
        verify(eventPublisher).publishEvent(PetFirstCandidate.planned(USER_ID, MONDAY, MONDAY.plusDays(6)));
    }

    @Test
    void applyTemplate_skipsDeletedRecipe_andItsChoices() {
        when(templateRepository.findByIdAndUserId(5L, USER_ID)).thenReturn(Optional.of(template));
        when(templateEntryRepository.findByTemplateId(5L))
            .thenReturn(List.of(templateEntry(700L, bolognese, 0), templateEntry(701L, pinkSauce, 2)));
        when(recipeRepository.findById(82L)).thenReturn(Optional.of(bolognese));
        when(recipeRepository.findById(38L)).thenReturn(Optional.empty());
        stubEntrySaveAll(900L);

        service.applyTemplate(USER_ID, 5L, MONDAY);

        verify(extraChoiceService).copyTemplateChoicesToEntries(Map.of(700L, 900L));
    }

    @Test
    void updateSnapshot_resnapshotsChoices() {
        when(templateRepository.findByIdAndUserId(5L, USER_ID)).thenReturn(Optional.of(template));
        when(mealPlanEntryRepository.findByUserIdAndDateRange(USER_ID, MONDAY, MONDAY.plusDays(7)))
            .thenReturn(List.of(planEntry(10L, bolognese, 0), planEntry(11L, pinkSauce, 2)));
        stubTemplateEntrySaveAll(710L);

        service.updateSnapshot(USER_ID, 5L, MONDAY);

        InOrder order = inOrder(templateEntryRepository, extraChoiceService);
        order.verify(templateEntryRepository).deleteByTemplateId(5L);
        order.verify(extraChoiceService).copyEntryChoicesToTemplate(Map.of(10L, 710L, 11L, 711L));
        verifyNoInteractions(eventPublisher);   // MPP-24: re-snapshotting is not "making" a template
    }

    @Test
    void listTemplates_carriesExtrasCounts() {
        MealPlanTemplate other = new MealPlanTemplate();
        other.setId(6L);
        other.setName("Bulk week");
        other.setEntries(new ArrayList<>());
        when(templateRepository.findByUserId(USER_ID)).thenReturn(List.of(template, other));
        when(manageExtrasService.templateExtrasCounts(List.of(template, other)))
            .thenReturn(Map.of(5L, new int[] {2, 1}));

        List<MealPlanTemplateDTO> result = service.listTemplates(USER_ID);

        assertThat(result.get(0).getExtrasMealCount()).isEqualTo(2);
        assertThat(result.get(0).getStoreBoughtCount()).isEqualTo(1);
        // A template with no counts entry reports zero rather than null.
        assertThat(result.get(1).getExtrasMealCount()).isZero();
        assertThat(result.get(1).getStoreBoughtCount()).isZero();
    }

    @Test
    void templateEdits_neverTouchDefaults() {
        // save
        stubSaveSource();
        service.saveTemplate(USER_ID, createRequest());

        // apply
        when(templateRepository.findByIdAndUserId(5L, USER_ID)).thenReturn(Optional.of(template));
        when(templateEntryRepository.findByTemplateId(5L)).thenReturn(List.of(templateEntry(700L, bolognese, 0)));
        when(recipeRepository.findById(82L)).thenReturn(Optional.of(bolognese));
        stubEntrySaveAll(900L);
        service.applyTemplate(USER_ID, 5L, MONDAY);

        // update
        service.updateSnapshot(USER_ID, 5L, MONDAY);

        verify(extraChoiceService, never()).updateDefaults(any(), any(), any());
        verify(extraChoiceService, never()).updateWeekChoices(any(), any());
    }
}
