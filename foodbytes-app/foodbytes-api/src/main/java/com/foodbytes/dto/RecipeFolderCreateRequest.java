package com.foodbytes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Create a folder; parentId null = top level. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeFolderCreateRequest {
    @NotBlank(message = "Give the folder a name.")
    @Size(max = 40, message = "Folder names can be up to 40 characters.")
    private String name;
    private Long parentId;
}
