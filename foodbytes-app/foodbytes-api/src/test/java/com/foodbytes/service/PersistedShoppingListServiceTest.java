package com.foodbytes.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodbytes.dto.AggregatedShoppingListDTO;
import com.foodbytes.model.FirstKey;
import com.foodbytes.model.ShoppingList;
import com.foodbytes.model.User;
import com.foodbytes.repository.ShoppingListItemRepository;
import com.foodbytes.repository.ShoppingListRepository;
import com.foodbytes.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.verify;
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
}
