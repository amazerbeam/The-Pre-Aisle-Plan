package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/** The caller's whole folder tree, flat (parentId links). */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeFoldersDTO {
    private List<RecipeFolderDTO> folders;
}
