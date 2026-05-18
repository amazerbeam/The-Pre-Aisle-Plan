package com.foodbytes.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

/**
 * FR-043: DTO for recipe family (admin management).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecipeFamilyDTO {
    private Long id;

    @NotBlank(message = "Family name is required")
    private String familyName;

    private String description;

    private List<RecipeVariantDTO> variants;

    // For creating/updating family members
    private List<RecipeFamilyMemberDTO> members;
}
