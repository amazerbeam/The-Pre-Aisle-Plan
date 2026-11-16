package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** The normalised key (family default id) returned after filing a recipe. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeFolderItemDTO {
    private Long recipeId;
}
