package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "recipes", indexes = {
    @Index(name = "idx_is_live", columnList = "isLive"),
    @Index(name = "idx_is_deleted", columnList = "isDeleted")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "JSON")
    private String mealTypes;  // JSON array of meal types

    @Column(nullable = false)
    private Integer defaultServings;

    @Column(nullable = false)
    private Integer calories;

    @Column(columnDefinition = "JSON", nullable = false)
    private String ingredients;  // JSON array of ingredients

    @Column(columnDefinition = "JSON", nullable = false)
    private String steps;  // JSON array of steps

    @Column(nullable = false)
    @Builder.Default
    private Boolean isCheat = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isLive = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isDeleted = false;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
