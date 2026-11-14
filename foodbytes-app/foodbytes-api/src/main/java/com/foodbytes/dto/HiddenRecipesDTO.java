package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/** The caller's hidden recipe keys (family default ids). */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HiddenRecipesDTO {
    private List<Long> recipeIds;
}
