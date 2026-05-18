# UX Preview: Updated Design Ideas

## 1. Header Improvement

Clean, streamlined header with better visual hierarchy:

```
+----------------------------------------------------------+
| [Logo] The Pre-Aisle Plan                    [User Menu] |
+----------------------------------------------------------+
| [Breakfast] [Lunch] [Dinner] [Snacks]        [Search]    |
+----------------------------------------------------------+
```

- Logo left-aligned with app name
- User menu collapsed to icon (avatar or hamburger)
- Meal tabs as secondary navigation row
- Search integrated but not dominant

---

## 2. Outline Buttons

Replace filled buttons with outline style for a lighter, more modern feel:

### Primary Button (Outline)
```css
.btn-primary {
  background: transparent;
  border: 2px solid #4a3f80;
  color: #4a3f80;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #4a3f80;
  color: #ffffff;
}

.btn-primary:active {
  background: #3a3266;
  border-color: #3a3266;
  color: #ffffff;
}
```

### Secondary Button (Outline)
```css
.btn-secondary {
  background: transparent;
  border: 2px solid #5a6c7d;
  color: #5a6c7d;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #5a6c7d;
  color: #ffffff;
}
```

### Button Visual Examples
```
+------------------+     +------------------+
|    [Details]     |     |   [ Add Plan ]   |
|                  |     |                  |
| ┌──────────────┐ |     | ┌──────────────┐ |
| │   Details    │ |     | │  Add Plan    │ |
| │  (outlined)  │ |     | │  (outlined)  │ |
| └──────────────┘ |     | └──────────────┘ |
+------------------+     +------------------+
     Default                  Default

+------------------+     +------------------+
| ┌──────────────┐ |     | ┌──────────────┐ |
| │▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ |     | │▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ |
| │   Details    │ |     | │  Add Plan    │ |
| │▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ |     | │▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ |
| └──────────────┘ |     | └──────────────┘ |
+------------------+     +------------------+
     Hover (filled)           Hover (filled)
```

---

## 3. Recipe Card Color Accents

Adding subtle color accents to recipe cards for visual interest. Instead of just "cheat meals," use accent colors based on categories or themes:

### Option A: Meal Type Accents
```
+------------------------+    +------------------------+
| ═══ (coral accent) ═══ |    | ═══ (mint accent) ═══  |
| Morning Porridge       |    | Garden Salad           |
| 880 cal  •  2 servings |    | 320 cal  •  2 servings |
| [Details]  [Add Plan]  |    | [Details]  [Add Plan]  |
+------------------------+    +------------------------+
     Breakfast card               Lunch card

+------------------------+    +------------------------+
| ═══ (amber accent) ═══ |    | ═══ (lavender) ═══════ |
| Spaghetti Bolognese    |    | Smoothie Bowl          |
| 650 cal  •  2 servings |    | 280 cal  •  1 serving  |
| [Details]  [Add Plan]  |    | [Details]  [Add Plan]  |
+------------------------+    +------------------------+
     Dinner card                  Snack card
```

### Option B: Accent Color Palette (Random/Alternating)
```css
/* Soft accent colors for recipe card top borders */
:root {
  --accent-coral: #FF6B6B;      /* Warm, energetic */
  --accent-mint: #4ECDC4;       /* Fresh, healthy */
  --accent-amber: #FFE66D;      /* Golden, comforting */
  --accent-lavender: #A8A4CE;   /* Soft, calming */
  --accent-peach: #FFB085;      /* Warm, inviting */
  --accent-sky: #87CEEB;        /* Light, refreshing */
}
```

### Option C: Calorie-Based Accents (Subtle Hint)
```
Light meals (< 400 cal):     Mint border (#4ECDC4)
Medium meals (400-600 cal):  Amber border (#FFE66D)
Hearty meals (> 600 cal):    Coral border (#FF6B6B)
```

### Recipe Card Structure
```css
.recipe-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  border-top: 4px solid var(--accent-color);  /* Color accent */
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.recipe-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}
```

### Card Wireframe with Accent
```
┌────────────────────────────┐
│▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀│  <- 4px color accent bar
│                            │
│  Recipe Name               │
│  880 cal  •  2 servings    │
│                            │
│  ┌──────────┐ ┌──────────┐ │
│  │ Details  │ │ Add Plan │ │  <- Outline buttons
│  └──────────┘ └──────────┘ │
│                            │
└────────────────────────────┘
```

---

## 4. Combined Preview: Recipe Grid

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] The Pre-Aisle Plan                        [👤] [≡]  │
├─────────────────────────────────────────────────────────────┤
│ [ Breakfast ]  [ Lunch ]  [ Dinner ]  [ Snacks ]   [🔍]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐   ┌─────────────────┐                 │
│  │▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀│   │▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀│                 │
│  │ Coral           │   │ Mint            │                 │
│  │                 │   │                 │                 │
│  │ Morning         │   │ Veggie          │                 │
│  │ Porridge        │   │ Omelette        │                 │
│  │                 │   │                 │                 │
│  │ 880 cal • 2 srv │   │ 420 cal • 2 srv │                 │
│  │                 │   │                 │                 │
│  │ ┌─────┐ ┌─────┐ │   │ ┌─────┐ ┌─────┐ │                 │
│  │ │ Det │ │ Add │ │   │ │ Det │ │ Add │ │                 │
│  │ └─────┘ └─────┘ │   │ └─────┘ └─────┘ │                 │
│  └─────────────────┘   └─────────────────┘                 │
│                                                             │
│  ┌─────────────────┐   ┌─────────────────┐                 │
│  │▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀│   │▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀│                 │
│  │ Amber           │   │ Lavender        │                 │
│  │                 │   │                 │                 │
│  │ Pancakes        │   │ Granola         │                 │
│  │ Stack           │   │ Bowl            │                 │
│  │                 │   │                 │                 │
│  │ 550 cal • 2 srv │   │ 380 cal • 1 srv │                 │
│  │                 │   │                 │                 │
│  │ ┌─────┐ ┌─────┐ │   │ ┌─────┐ ┌─────┐ │                 │
│  │ │ Det │ │ Add │ │   │ │ Det │ │ Add │ │                 │
│  │ └─────┘ └─────┘ │   │ └─────┘ └─────┘ │                 │
│  └─────────────────┘   └─────────────────┘                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Color Accent Options to Consider

| Option | Accent Colors | Reasoning |
|--------|---------------|-----------|
| **A. By Meal** | Coral/Mint/Amber/Lavender | Visual meal categorization |
| **B. Random** | Rotating palette | Fun, varied appearance |
| **C. Calories** | Green/Yellow/Orange | Subtle nutritional hint |
| **D. User picks** | User-selected accent | Personalization feature |

### Recommended: Option A or B
Option A gives meaning to colors while B adds visual variety without implying anything about the recipe content.

---

## Summary of Changes

| Element | Before | After |
|---------|--------|-------|
| Buttons | Filled solid colors | Outline with fill on hover |
| Recipe cards | Plain white | 4px colored accent bar at top |
| Cheat badge | Orange "Cheat" label | Removed (using accent colors instead) |
| Overall feel | Dense, heavy | Light, modern, airy |
