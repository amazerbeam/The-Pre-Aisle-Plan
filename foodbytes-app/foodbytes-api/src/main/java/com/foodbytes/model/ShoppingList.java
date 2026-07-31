package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Shopping List entity - represents a persisted shopping list for a user.
 * Only one shopping list per user at a time (snapshot generated on demand).
 */
@Entity
@Table(name = "shopping_lists")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShoppingList {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    private User user;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "generated_at")
    private LocalDateTime generatedAt;

    @OneToMany(mappedBy = "shoppingList", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<ShoppingListItem> items = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        generatedAt = LocalDateTime.now();
    }

    /**
     * Add an item to this shopping list.
     */
    public void addItem(ShoppingListItem item) {
        items.add(item);
        item.setShoppingList(this);
    }

    /**
     * Clear all items from this shopping list.
     */
    public void clearItems() {
        items.clear();
    }

    // Identity is the primary key — see Recipe#equals. `items` hold a
    // `shoppingList` back-reference, closing the cycle.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ShoppingList other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return ShoppingList.class.hashCode();
    }
}
