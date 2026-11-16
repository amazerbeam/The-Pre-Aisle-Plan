package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/** One folder with the recipe keys (family default ids) filed in it. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeFolderDTO {
    private Long id;
    private String name;
    private Long parentId;
    private List<Long> recipeIds;
}
