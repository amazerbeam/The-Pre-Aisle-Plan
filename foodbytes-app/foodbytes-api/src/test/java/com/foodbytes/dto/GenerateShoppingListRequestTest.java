package com.foodbytes.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * MPP-8: the client sends homemade/store-bought selections as a JSON object, so its keys
 * arrive as strings ({"82":{"36":false}}). They must deserialise to Long keys, or
 * ShoppingListService's selectionsMap.get(recipeId) misses every entry and silently
 * falls back to homemade.
 */
class GenerateShoppingListRequestTest {

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Test
    void stringKeyedSelections_deserialiseToLongKeys() throws Exception {
        String json = "{\"startDate\":\"2026-10-12\",\"endDate\":\"2026-10-14\","
            + "\"selections\":{\"82\":{\"36\":false,\"37\":true}}}";

        GenerateShoppingListRequest request = objectMapper.readValue(json, GenerateShoppingListRequest.class);

        assertThat(request.getStartDate()).isEqualTo(LocalDate.of(2026, 10, 12));
        assertThat(request.getEndDate()).isEqualTo(LocalDate.of(2026, 10, 14));
        Map<Long, Boolean> forBolognese = request.getSelections().get(82L);
        assertThat(forBolognese).isNotNull();
        assertThat(forBolognese.get(36L)).isFalse();
        assertThat(forBolognese.get(37L)).isTrue();
    }

    @Test
    void omittedSelections_deserialiseToNull() throws Exception {
        String json = "{\"startDate\":\"2026-10-12\",\"endDate\":\"2026-10-14\"}";

        GenerateShoppingListRequest request = objectMapper.readValue(json, GenerateShoppingListRequest.class);

        assertThat(request.getSelections()).isNull();
    }
}
