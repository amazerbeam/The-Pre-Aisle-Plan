package com.foodbytes.controller;

import com.foodbytes.dto.AisleDTO;
import com.foodbytes.model.Aisle;
import com.foodbytes.repository.AisleRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Endpoints for aisle data.
 * Used for ingredient aisle selection (FR-044).
 */
@RestController
@RequestMapping("/api/aisles")
@RequiredArgsConstructor
@Tag(name = "Aisles", description = "Grocery aisle endpoints")
public class AisleController {

    private final AisleRepository aisleRepository;

    @GetMapping
    @Operation(summary = "Get all aisles", description = "Returns all aisles sorted by display order")
    public ResponseEntity<List<AisleDTO>> getAllAisles() {
        List<AisleDTO> aisles = aisleRepository.findAllByOrderByDisplayOrderAsc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(aisles);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get aisle by ID")
    public ResponseEntity<AisleDTO> getAisleById(@PathVariable Long id) {
        return aisleRepository.findById(id)
                .map(this::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private AisleDTO toDTO(Aisle aisle) {
        return AisleDTO.builder()
                .id(aisle.getId())
                .key(aisle.getKey())
                .name(aisle.getName())
                .displayOrder(aisle.getDisplayOrder())
                .build();
    }
}
