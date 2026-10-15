package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** MPP-42: SprinklePolicy's payouts, so the Earn tab never hard-codes an amount. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SprinkleRatesDTO {
    private int mealEaten;
    private int onTimeBonus;
    private int homemadeBonus;
    private int fullWeek;
    private int shoppingListGenerated;
    private int shoppingListCompleted;
    private int mealsPerWeek;
}
