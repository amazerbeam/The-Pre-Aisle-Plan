package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * A recipe filed in a folder. recipeId is the family's DEFAULT recipe id (same key as hidden recipes).
 * Plain id columns; MySQL cascades rows away with their folder / recipe.
 */
@Entity
@Table(name = "recipe_folder_items", uniqueConstraints = {
    @UniqueConstraint(name = "uk_recipe_folder_item", columnNames = {"folder_id", "recipe_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeFolderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "folder_id", nullable = false)
    private Long folderId;

    @Column(name = "recipe_id", nullable = false)
    private Long recipeId;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    // Identity is the primary key - see Recipe#equals.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RecipeFolderItem other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return RecipeFolderItem.class.hashCode();
    }
}
