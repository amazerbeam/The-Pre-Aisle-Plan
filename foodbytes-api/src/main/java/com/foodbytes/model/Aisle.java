package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "aisles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Aisle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "`key`", unique = true, nullable = false)
    private String key;

    @Column(nullable = false)
    private String name;

    @Column(name = "display_order")
    private Integer displayOrder;

    private String color;
}
