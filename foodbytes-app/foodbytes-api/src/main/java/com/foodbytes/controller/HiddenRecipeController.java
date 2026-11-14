package com.foodbytes.controller;

import com.foodbytes.dto.HiddenRecipeDTO;
import com.foodbytes.dto.HiddenRecipesDTO;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.HiddenRecipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/** Per-person hidden recipes for the Recipes screen. The caller's own list, never the shared plan owner's. */
@RestController
@RequestMapping("/api/hidden-recipes")
@RequiredArgsConstructor
public class HiddenRecipeController {
    private final HiddenRecipeService hiddenRecipeService;

    @GetMapping
    public ResponseEntity<?> list(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) return forbidden();
        return ResponseEntity.ok(new HiddenRecipesDTO(hiddenRecipeService.listHidden(userPrincipal.getId())));
    }

    @PutMapping("/{recipeId}")
    public ResponseEntity<?> hide(@AuthenticationPrincipal UserPrincipal userPrincipal, @PathVariable Long recipeId) {
        if (userPrincipal == null) return forbidden();
        return hiddenRecipeService.hide(userPrincipal.getId(), recipeId)
            .<ResponseEntity<?>>map(key -> ResponseEntity.ok(new HiddenRecipeDTO(key)))
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{recipeId}")
    public ResponseEntity<?> unhide(@AuthenticationPrincipal UserPrincipal userPrincipal, @PathVariable Long recipeId) {
        if (userPrincipal == null) return forbidden();
        hiddenRecipeService.unhide(userPrincipal.getId(), recipeId);
        return ResponseEntity.noContent().build();
    }

    private static ResponseEntity<?> forbidden() {
        return ResponseEntity.status(403).body(Map.of("error", "Authentication required to manage hidden recipes"));
    }
}
