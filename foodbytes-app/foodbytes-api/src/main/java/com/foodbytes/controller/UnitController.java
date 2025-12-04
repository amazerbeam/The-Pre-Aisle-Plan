package com.foodbytes.controller;

import com.foodbytes.dto.UnitDTO;
import com.foodbytes.model.Unit;
import com.foodbytes.repository.UnitRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Admin endpoints for unit management.
 * Implements FR-045 (Unit Autocomplete).
 */
@RestController
@RequestMapping("/api/admin/units")
@RequiredArgsConstructor
@Tag(name = "Units (Admin)", description = "Admin endpoints for unit management")
public class UnitController {

    private final UnitRepository unitRepository;

    // ========================================
    // READ OPERATIONS
    // ========================================

    @GetMapping
    @Operation(summary = "Get all units", description = "Returns all units sorted by display value")
    public ResponseEntity<List<UnitDTO>> getAllUnits() {
        List<UnitDTO> units = unitRepository.findAllByOrderByValueAsc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(units);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get unit by ID")
    public ResponseEntity<UnitDTO> getUnitById(@PathVariable Long id) {
        return unitRepository.findById(id)
                .map(this::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ========================================
    // AUTOCOMPLETE & SEARCH
    // ========================================

    @GetMapping("/autocomplete")
    @Operation(summary = "Autocomplete unit search",
            description = "Returns matching units for typeahead UI. Shows all units on empty query.")
    public ResponseEntity<List<UnitDTO>> autocomplete(
            @RequestParam(required = false, defaultValue = "") String query,
            @RequestParam(defaultValue = "20") int limit) {

        List<Unit> units;
        if (query == null || query.trim().isEmpty()) {
            // Return all units when no query (for dropdown on focus)
            units = unitRepository.findAllByOrderByValueAsc();
        } else {
            // Search by value (display text) containing query
            units = unitRepository.searchByValueContaining(query.trim());
        }

        List<UnitDTO> results = units.stream()
                .limit(limit)
                .map(this::toDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(results);
    }

    // ========================================
    // CRUD OPERATIONS
    // ========================================

    @PostMapping
    @Operation(summary = "Create new unit",
            description = "Creates a new unit. Key must be unique and uppercase.")
    public ResponseEntity<UnitDTO> createUnit(@RequestBody UnitDTO dto) {
        // Validate key doesn't exist
        if (unitRepository.findByKeyIgnoreCase(dto.getKey()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        Unit unit = new Unit();
        unit.setKey(dto.getKey().toUpperCase().replace(" ", "_"));
        unit.setValue(dto.getValue());

        Unit saved = unitRepository.save(unit);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(saved));
    }

    // ========================================
    // HELPER METHODS
    // ========================================

    private UnitDTO toDTO(Unit unit) {
        return UnitDTO.builder()
                .id(unit.getId())
                .key(unit.getKey())
                .value(unit.getValue())
                .build();
    }
}
