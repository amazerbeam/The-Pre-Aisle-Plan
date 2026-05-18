# Chef — Output format

Present every recipe in this layout for user approval before generating SQL.

```markdown
## [Recipe Name]
**Cuisine:** [Italian | Spanish | Thai | …] | **Time:** [prep + cook] | **Default servings:** 2

### Why this works
[1–2 sentences on the technique or flavour idea — why this dish is worth making this way.]

### Extras (if any)
- **Pizza Dough** — 370 g of a 761 g batch (linked recipe 11; store-bought option = ingredient 75)
- **Pizza Sauce** — 120 g of a 440 g batch (linked recipe 12; store-bought option = ingredient 76)

### Ingredients (Moderate variant)
- [ ] Chicken thigh — 300 g
- [ ] Pita Bread — 100 g of a 300 g batch (linked recipe 117)
- [ ] Olive oil — 1 tbsp (14 g)
- [ ] Garlic — 2 cloves (6 g)

### Instructions
1. **Make the pita** [linked: Pita Bread] · *store-bought: warm 1 pita in a dry pan 30 sec/side*
2. Pat the chicken dry, season with salt and sumac.
3. Sear in olive oil 4 min per side until golden and 75 °C internal.
4. Slice, stuff into pita with yoghurt and herbs.

### Variant family

| Variant | kcal/srv | Protein | Fat (g · %kcal) | Carbs (g · %kcal) | What changes vs Moderate |
|---|---|---|---|---|---|
| Light    | 510 | 38 g | 16 g · 28% | 56 g · 44% | 250 g chicken, 70 g pita, ½ tbsp oil |
| **Moderate (default)** | 605 | 42 g | 19 g · 28% | 68 g · 45% | — |
| Balanced | 760 | 50 g | 26 g · 31% | 85 g · 45% | 380 g chicken, 130 g pita, +½ avocado |

### Macro check
- All three variants hit the per-variant targets (kcal band, protein ≥35 g, fat 25–35%, carbs 40–50%). ✓
- Light < Moderate < Balanced, gaps ≥ 100 kcal. ✓
- Stored `recipes.calories` will be 1020 / 1210 / 1520 (kcal/srv × default_servings = 2). ✓
```

After the user approves, proceed to step 7 of the workflow (combined ID-fetch + INSERT generation).
