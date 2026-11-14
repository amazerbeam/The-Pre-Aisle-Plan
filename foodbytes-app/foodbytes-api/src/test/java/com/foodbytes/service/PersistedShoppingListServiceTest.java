package com.foodbytes.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodbytes.dto.AggregatedShoppingListDTO;
import com.foodbytes.dto.PersistedShoppingListDTO;
import com.foodbytes.model.FirstKey;
import com.foodbytes.model.ShoppingList;
import com.foodbytes.model.ShoppingListItem;
import com.foodbytes.model.User;
import com.foodbytes.repository.ShoppingListItemRepository;
import com.foodbytes.repository.ShoppingListRepository;
import com.foodbytes.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/** MPP-24: generating a list on a shared plan earns the first for whoever generated it. */
@ExtendWith(MockitoExtension.class)
class PersistedShoppingListServiceTest {

    @Mock private ShoppingListRepository shoppingListRepository;
    @Mock private ShoppingListItemRepository shoppingListItemRepository;
    @Mock private ShoppingListService shoppingListService;
    @Mock private UserRepository userRepository;
    @Mock private ObjectMapper objectMapper;
    @Mock private ApplicationEventPublisher eventPublisher;
    @Mock private MealPlanFingerprintService fingerprintService;

    @InjectMocks private PersistedShoppingListService service;

    @Test
    void generateShoppingList_linkedPartner_publishesTheFirstForThePartner() {
        User owner = new User();
        owner.setId(1L);
        User partner = new User();
        partner.setId(2L);
        partner.setMealPlanOwnerId(1L);
        LocalDate start = LocalDate.of(2026, 10, 12);
        when(userRepository.findById(2L)).thenReturn(Optional.of(partner));
        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));
        when(shoppingListService.getShoppingList(1L, start))
                .thenReturn(new AggregatedShoppingListDTO(start, start.plusDays(6), List.of(), 0));
        when(shoppingListRepository.save(any(ShoppingList.class))).thenAnswer(inv -> {
            ShoppingList list = inv.getArgument(0);
            list.setId(50L);
            return list;
        });
        when(shoppingListItemRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        service.generateShoppingList(2L, start, start.plusDays(6));

        verify(eventPublisher).publishEvent(PetFirstCandidate.of(2L, FirstKey.GENERATE_SHOPPING_LIST));
    }

    private ShoppingListItem itemOnPartnersPlan(boolean checked) {
        User partner = new User();
        partner.setId(2L);
        partner.setMealPlanOwnerId(1L);
        when(userRepository.findById(2L)).thenReturn(Optional.of(partner));
        ShoppingListItem item = new ShoppingListItem();
        item.setId(7L);
        item.setIsChecked(checked);
        when(shoppingListItemRepository.findByIdAndUserId(7L, 1L)).thenReturn(Optional.of(item));
        return item;
    }

    @Test
    void toggleItemChecked_toChecked_publishesShoppingItemCheckedForTheClicker() {
        itemOnPartnersPlan(false);
        service.toggleItemChecked(2L, 7L);
        verify(eventPublisher).publishEvent(new ShoppingItemChecked(2L));
    }

    @Test
    void toggleItemChecked_toUnchecked_publishesNothing() {
        itemOnPartnersPlan(true);
        service.toggleItemChecked(2L, 7L);
        verifyNoInteractions(eventPublisher);
    }

    private ShoppingList storedList(String fingerprint) {
        ShoppingList list = new ShoppingList();
        list.setId(50L);
        list.setStartDate(LocalDate.of(2026, 11, 9));
        list.setEndDate(LocalDate.of(2026, 11, 15));
        list.setPlanFingerprint(fingerprint);
        when(userRepository.findById(2L)).thenReturn(Optional.of(partnerOf(1L)));
        when(shoppingListRepository.findByUserId(1L)).thenReturn(Optional.of(list));
        when(shoppingListItemRepository.findByShoppingListIdOrderByAisle(50L)).thenReturn(List.of());
        return list;
    }

    private User partnerOf(Long ownerId) {
        User partner = new User();
        partner.setId(2L);
        partner.setMealPlanOwnerId(ownerId);
        return partner;
    }

    @Test
    void generate_storesTheFingerprint() {
        User owner = new User();
        owner.setId(1L);
        LocalDate start = LocalDate.of(2026, 11, 9);
        LocalDate end = start.plusDays(6);
        when(userRepository.findById(2L)).thenReturn(Optional.of(partnerOf(1L)));
        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));
        when(shoppingListService.getShoppingList(1L, start))
                .thenReturn(new AggregatedShoppingListDTO(start, end, List.of(), 0));
        // computed over the effective owner (1), not the partner who clicked (2)
        when(fingerprintService.fingerprint(1L, start)).thenReturn("a".repeat(64));
        when(shoppingListRepository.save(any(ShoppingList.class))).thenAnswer(inv -> inv.getArgument(0));
        when(shoppingListItemRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        PersistedShoppingListDTO dto = service.generateShoppingList(2L, start, end);

        ArgumentCaptor<ShoppingList> saved = ArgumentCaptor.forClass(ShoppingList.class);
        verify(shoppingListRepository).save(saved.capture());
        assertThat(saved.getValue().getPlanFingerprint()).isEqualTo("a".repeat(64));
        assertThat(dto.getPlanChangedSinceGenerated()).isFalse();
    }

    @Test
    void get_reportsChanged_whenFingerprintDiffers() {
        ShoppingList list = storedList("aaa");
        when(fingerprintService.fingerprint(1L, list.getStartDate())).thenReturn("bbb");

        assertThat(service.getShoppingList(2L).getPlanChangedSinceGenerated()).isTrue();
    }

    @Test
    void get_reportsUnchanged_whenEqual() {
        ShoppingList list = storedList("aaa");
        when(fingerprintService.fingerprint(1L, list.getStartDate())).thenReturn("aaa");

        assertThat(service.getShoppingList(2L).getPlanChangedSinceGenerated()).isFalse();
    }

    @Test
    void get_legacyListWithoutFingerprint_reportsFalse_andDoesNotCompute() {
        storedList(null);

        assertThat(service.getShoppingList(2L).getPlanChangedSinceGenerated()).isFalse();
        verifyNoInteractions(fingerprintService);
    }
}
