package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Move a folder under a new parent; parentId null = top level. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeFolderParentRequest {
    private Long parentId;
}
