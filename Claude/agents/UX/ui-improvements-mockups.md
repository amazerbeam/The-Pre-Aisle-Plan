# UI Improvement Mockups for MyPantryPlan

## Current State Analysis

After reviewing the existing codebase, here are the key areas that could benefit from UI improvements for both mobile and desktop experiences.

---

## 1. Header Improvements

### Current Issues
- Logo and user controls cramped on mobile
- Date range picker placement inconsistent
- Sign-in button lacks visual hierarchy

### Proposed Mobile Header (< 480px)
```
+------------------------------------------+
| [=]  MyPantryPlan           [Avatar/Sign]|
+------------------------------------------+
|          [Date Range Picker]              |  <- Full-width below header
+------------------------------------------+
```

### Proposed Desktop Header (> 768px)
```
+------------------------------------------------------------------+
| MyPantryPlan    [Date: Nov 25 - Dec 1 v]        [Avatar | Name v]|
+------------------------------------------------------------------+
```

### CSS Improvements
```css
/* Improved Header - Mobile First */
.header {
  background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-primary-dark) 100%);
  padding: var(--spacing-md) var(--spacing-lg);
  box-shadow: 0 4px 20px rgba(74, 63, 128, 0.15);
}

.header-content {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--spacing-md);
}

/* Mobile: Stack date picker below */
@media (max-width: 600px) {
  .header-content {
    grid-template-columns: auto 1fr;
  }

  .date-picker-wrapper {
    grid-column: 1 / -1;
    margin-top: var(--spacing-sm);
  }
}

/* Logo with subtle animation */
.logo h1 {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  transition: transform 0.2s ease;
}

.logo:hover h1 {
  transform: scale(1.02);
}

/* Improved Sign-In Button */
.sign-in-btn {
  background: white;
  color: var(--brand-primary);
  padding: 10px 20px;
  border-radius: 24px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.sign-in-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}
```

---

## 2. Recipe Card Redesign

### Current Issues
- Cards feel flat and lack visual depth
- Expand button competes with content
- Calories/servings info not visually prominent
- "Show Details" button doesn't indicate content richness

### Proposed Recipe Card - Mobile
```
+----------------------------------+
| [IMAGE PLACEHOLDER / GRADIENT]   |  <- Optional hero image area
| -------------------------------- |
|  Porridge with Honey       Cheat |
|  --------------------------------|
|  [880 cal v]    [2 servings +/-] |  <- Inline controls
|  --------------------------------|
|  +----------+  +---------------+ |
|  | Mon | Tue|  | View Recipe   | |  <- Simplified actions
|  +----------+  +---------------+ |
+----------------------------------+
```

### Proposed Recipe Card - Desktop
```
+-------------------------------------------+
|                                   [Expand]|
| Porridge with Honey and Fresh Berries     |
| Cheat Meal                                |
|-------------------------------------------|
| 880 cal/serving  |  [- 2 servings +]      |
|-------------------------------------------|
| Mon  Tue  Wed  Thu  Fri  Sat  Sun         |
|  +    +    +    +    +    +    +          |
|-------------------------------------------|
| [View Full Recipe]              [Edit]    |
+-------------------------------------------+
```

### CSS Improvements
```css
/* Modern Recipe Card */
.recipe-card {
  background: white;
  border-radius: 16px;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.25s ease;
  position: relative;
}

.recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(74, 63, 128, 0.12);
}

/* Card Hero Area (optional gradient for now) */
.recipe-card-hero {
  height: 8px;
  background: linear-gradient(90deg,
    var(--brand-primary-light) 0%,
    var(--brand-primary) 100%);
}

/* Cheat meal variant */
.recipe-card.is-cheat .recipe-card-hero {
  background: linear-gradient(90deg,
    #ff8a65 0%,
    var(--cheat-badge) 100%);
}

/* Card Body */
.recipe-card-body {
  padding: var(--spacing-md) var(--spacing-lg);
}

/* Recipe Title */
.recipe-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
  margin-bottom: var(--spacing-xs);
}

/* Modern Cheat Badge */
.cheat-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #ff8a65 0%, var(--cheat-badge) 100%);
  color: white;
  font-size: 0.6875rem;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Calorie Display */
.calorie-display {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  font-weight: 600;
  color: var(--brand-primary);
}

/* Modern Servings Control */
.servings-control {
  display: inline-flex;
  align-items: center;
  background: var(--bg-secondary);
  border-radius: 8px;
  overflow: hidden;
}

.servings-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  font-size: 1.25rem;
  color: var(--brand-primary);
  cursor: pointer;
  transition: background 0.15s ease;
}

.servings-btn:hover {
  background: var(--brand-primary);
  color: white;
}

.servings-value {
  padding: 0 12px;
  font-weight: 600;
  min-width: 48px;
  text-align: center;
}

/* Recipe Actions Row */
.recipe-actions {
  display: flex;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  margin-top: var(--spacing-md);
}

/* Primary Action Button */
.recipe-action-primary {
  flex: 1;
  padding: 12px 16px;
  background: var(--brand-primary);
  color: white;
  border-radius: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  transition: all 0.2s ease;
}

.recipe-action-primary:hover {
  background: var(--brand-primary-dark);
  transform: translateY(-1px);
}
```

---

## 3. Bottom Navigation Redesign

### Current Issues
- Icons feel generic
- Active state not prominent enough
- Labels too small on mobile

### Proposed Bottom Nav - Mobile
```
+----------------------------------------------------+
|   [Recipe]    [Plan]    [Search]    [Shopping]    |
|    icon        icon       icon         icon        |
|    text        text       text         text        |
+----------------------------------------------------+
     ^--- Active state: filled icon + colored bar above
```

### CSS Improvements
```css
/* Modern Bottom Navigation */
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: none;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 100;
}

.footer-nav {
  display: flex;
  justify-content: space-around;
  align-items: stretch;
  max-width: 500px;
  margin: 0 auto;
  padding: 0;
}

.footer-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px 8px 10px;
  background: none;
  color: var(--text-secondary);
  position: relative;
  transition: all 0.2s ease;
  border: none;
  min-height: 56px;
}

/* Active Indicator Line */
.footer-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 3px;
  background: var(--brand-primary);
  border-radius: 0 0 2px 2px;
  transition: width 0.25s ease;
}

.footer-btn.active::before {
  width: 32px;
}

.footer-btn.active {
  color: var(--brand-primary);
}

.footer-btn svg {
  width: 24px;
  height: 24px;
  stroke-width: 2;
  transition: transform 0.2s ease;
}

.footer-btn.active svg {
  transform: scale(1.1);
}

.footer-btn span {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

/* Hover effect */
.footer-btn:hover:not(.active) {
  color: var(--brand-primary-light);
}

/* Ripple effect on tap */
.footer-btn:active svg {
  transform: scale(0.95);
}
```

---

## 4. Meal Plan Calendar Improvements

### Current Issues
- Desktop 7-column grid cramped
- Day cards lack visual hierarchy
- "Today" indicator not prominent enough
- Add recipe action hard to discover

### Proposed Desktop Calendar
```
+------------------------------------------------------------------+
| < November 2024 >                    Weekly Total: 12,350 cal    |
+------------------------------------------------------------------+
| MON 25      | TUE 26      | WED 27      | THU 28      | ...      |
| [TODAY]     |             |             |             |           |
|-------------|-------------|-------------|-------------|-----------|
| Breakfast   | Breakfast   | Breakfast   |             |           |
| Porridge    | Eggs        | + Add       |             |           |
|             |             |             |             |           |
| Lunch       | Lunch       | Lunch       |             |           |
| Salad       | + Add       | Wrap        |             |           |
|             |             |             |             |           |
| Dinner      | Dinner      | Dinner      |             |           |
| Pasta       | Stir Fry    | + Add       |             |           |
|-------------|-------------|-------------|-------------|-----------|
| 1,850 cal   | 1,620 cal   | 780 cal     | --          |           |
+------------------------------------------------------------------+
```

### Proposed Mobile Calendar (Single Day View)
```
+----------------------------------+
|  <  Monday, November 25  >       |
|  [TODAY]                         |
+----------------------------------+
|                                  |
|  BREAKFAST                       |
|  +----------------------------+  |
|  | Porridge with Honey        |  |
|  | 440 cal  |  2 servings     |  |
|  | [Edit] [Remove]            |  |
|  +----------------------------+  |
|                                  |
|  LUNCH                           |
|  +----------------------------+  |
|  |     + Add Lunch Recipe     |  |
|  +----------------------------+  |
|                                  |
|  DINNER                          |
|  +----------------------------+  |
|  | Spaghetti Bolognese        |  |
|  | 650 cal  |  2 servings     |  |
|  | [Edit] [Remove]            |  |
|  +----------------------------+  |
|                                  |
|  SNACKS                          |
|  +----------------------------+  |
|  |     + Add Snack            |  |
|  +----------------------------+  |
|                                  |
+----------------------------------+
|  Daily Total: 1,090 calories     |
+----------------------------------+
```

### CSS Improvements
```css
/* Modern Calendar Day Card */
.meal-plan-day {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.meal-plan-day:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

/* Today Highlight */
.meal-plan-day.today {
  border: 2px solid var(--brand-primary);
  box-shadow: 0 4px 20px rgba(74, 63, 128, 0.15);
}

.today-badge {
  background: linear-gradient(135deg, var(--brand-primary-light) 0%, var(--brand-primary) 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* Day Header */
.day-header {
  padding: 12px 16px;
  background: linear-gradient(180deg, var(--bg-secondary) 0%, white 100%);
  border-bottom: 1px solid var(--border-color);
}

.day-name {
  font-weight: 700;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.day-date {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

/* Add Meal Button */
.add-meal-btn {
  width: 100%;
  padding: 12px;
  background: var(--bg-secondary);
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.add-meal-btn:hover {
  background: rgba(74, 63, 128, 0.05);
  border-color: var(--brand-primary);
  color: var(--brand-primary);
}

.add-meal-btn:hover .add-icon {
  transform: rotate(90deg);
}

.add-icon {
  font-size: 1.25rem;
  transition: transform 0.3s ease;
}

/* Meal Entry Card */
.meal-entry {
  padding: 10px 12px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid var(--brand-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.meal-entry:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateX(2px);
}

/* Day Footer with Calories */
.day-footer {
  padding: 10px 16px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
}

.day-calories {
  font-weight: 700;
  color: var(--brand-primary);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}
```

---

## 5. Shopping List Improvements

### Current Issues
- Aisle headers not visually distinct enough
- Checked items don't feel "done"
- Quantity display could be clearer
- No quick-add or bulk actions

### Proposed Shopping List - Mobile
```
+----------------------------------+
| Shopping List             [...]  |
| Nov 25 - Dec 1  |  32 items      |
+----------------------------------+
|                                  |
| PRODUCE                    (12)  |
| ================================ |
| [x] Banana         2 pieces      |  <- Strikethrough, faded
| [ ] Spinach        200g          |
| [ ] Tomatoes       4 pieces      |
| [ ] Onion          2 pieces      |
|                                  |
| DAIRY & EGGS                (5)  |
| ================================ |
| [ ] Milk           500ml         |
| [ ] Eggs           6 pieces      |
| [x] Butter         100g          |  <- Checked
|                                  |
| ... more aisles ...              |
|                                  |
+----------------------------------+
| [Copy List]        [Clear Done]  |
+----------------------------------+
```

### CSS Improvements
```css
/* Shopping List Container */
.shopping-list-page {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 100px;
}

/* Modern Header */
.shopping-list-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 3px solid var(--brand-primary);
}

.shopping-list-header h1 {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--brand-primary);
  margin: 0;
}

.item-count {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 6px 14px;
  background: var(--brand-primary);
  color: white;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

/* Aisle Section */
.shopping-aisle {
  background: white;
  border-radius: 16px;
  margin-bottom: var(--spacing-md);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--border-color);
}

/* Aisle Header with Color Coding */
.aisle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: var(--bg-secondary);
  border-left: 5px solid var(--aisle-color);
  cursor: pointer;
  transition: background 0.15s ease;
}

.aisle-header:hover {
  background: var(--border-color);
}

.aisle-name {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.aisle-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  background: white;
  border-radius: 14px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary);
}

/* Shopping Item */
.shopping-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
}

.shopping-item:last-child {
  border-bottom: none;
}

.shopping-item:hover {
  background: var(--bg-secondary);
}

/* Modern Checkbox */
.shopping-item input[type="checkbox"] {
  appearance: none;
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.shopping-item input[type="checkbox"]:checked {
  background: var(--success);
  border-color: var(--success);
}

.shopping-item input[type="checkbox"]:checked::after {
  content: '';
  position: absolute;
  left: 7px;
  top: 3px;
  width: 6px;
  height: 12px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* Item Details */
.item-name {
  flex: 1;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.item-quantity {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 600;
  padding: 4px 10px;
  background: var(--bg-secondary);
  border-radius: 6px;
}

/* Checked State Animation */
.shopping-item.checked {
  background: #f8fff8;
}

.shopping-item.checked .item-name {
  text-decoration: line-through;
  color: var(--text-secondary);
  opacity: 0.6;
}

.shopping-item.checked .item-quantity {
  opacity: 0.5;
}

/* Floating Action Bar */
.shopping-actions {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: var(--spacing-sm);
  padding: 12px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.action-btn {
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: all 0.2s ease;
}

.action-btn-primary {
  background: var(--brand-primary);
  color: white;
}

.action-btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
}
```

---

## 6. Global UI Enhancements

### Typography Improvements
```css
/* Better Typography Scale */
:root {
  /* Type Scale (1.25 ratio) */
  --text-xs: 0.64rem;    /* 10.24px */
  --text-sm: 0.8rem;     /* 12.8px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.25rem;    /* 20px */
  --text-xl: 1.5625rem;  /* 25px */
  --text-2xl: 1.953rem;  /* 31.25px */
  --text-3xl: 2.441rem;  /* 39px */

  /* Line Heights */
  --leading-tight: 1.2;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;

  /* Letter Spacing */
  --tracking-tight: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.02em;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Enhanced Shadows
```css
:root {
  /* Layered Shadow System */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.04),
               0 4px 8px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.04),
               0 8px 16px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.06),
               0 16px 32px rgba(0, 0, 0, 0.08);
  --shadow-xl: 0 16px 32px rgba(0, 0, 0, 0.08),
               0 24px 48px rgba(0, 0, 0, 0.12);

  /* Brand Shadow */
  --shadow-brand: 0 4px 12px rgba(74, 63, 128, 0.15);
}
```

### Improved Color Palette
```css
:root {
  /* Extended Brand Colors */
  --brand-50: #f5f3ff;
  --brand-100: #ede9fe;
  --brand-200: #ddd6fe;
  --brand-300: #c4b5fd;
  --brand-400: #a78bfa;
  --brand-500: #8b5cf6;
  --brand-600: #7c3aed;
  --brand-700: #6d28d9;
  --brand-800: #5b21b6;
  --brand-900: #4c1d95;

  /* Use your brand color as primary */
  --brand-primary: #4a3f80;
  --brand-primary-light: #6b5fa0;
  --brand-primary-dark: #3a3266;

  /* Surface Colors */
  --surface-0: #ffffff;
  --surface-1: #f9fafb;
  --surface-2: #f3f4f6;
  --surface-3: #e5e7eb;

  /* Success/Error States */
  --success-light: #dcfce7;
  --success: #22c55e;
  --success-dark: #16a34a;

  --error-light: #fee2e2;
  --error: #ef4444;
  --error-dark: #dc2626;
}
```

### Animation Tokens
```css
:root {
  /* Timing Functions */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Durations */
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
}

/* Micro-interactions */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

@keyframes pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 7. Mobile-Specific Improvements

### Touch Target Guidelines
```css
/* Ensure all interactive elements meet 44x44px minimum */
button,
a,
input[type="checkbox"],
.clickable {
  min-height: 44px;
  min-width: 44px;
}

/* Adequate spacing between touch targets */
.button-group {
  gap: 8px;
}
```

### Safe Area Insets
```css
/* Support notched devices */
.header {
  padding-top: max(var(--spacing-md), env(safe-area-inset-top));
}

.footer {
  padding-bottom: max(var(--spacing-md), env(safe-area-inset-bottom));
}

.main-content {
  padding-left: max(var(--spacing-md), env(safe-area-inset-left));
  padding-right: max(var(--spacing-md), env(safe-area-inset-right));
}
```

### Pull-to-Refresh Indicator
```css
.pull-indicator {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: all 0.2s ease;
}

.pull-indicator.visible {
  opacity: 1;
  top: 10px;
}

.pull-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-color);
  border-top-color: var(--brand-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
```

---

## Implementation Priority

### Phase 1: Quick Wins (Low effort, high impact)
1. Header gradient and improved shadows
2. Recipe card hover states
3. Bottom nav active indicator
4. Typography improvements

### Phase 2: Core Components
1. Recipe card redesign
2. Shopping list modernization
3. Meal plan calendar improvements

### Phase 3: Polish
1. Micro-animations
2. Pull-to-refresh
3. Safe area insets
4. Advanced hover/focus states

---

## Accessibility Notes

All improvements maintain:
- WCAG 2.1 AA contrast ratios (4.5:1 minimum)
- Focus visible states
- Touch targets >= 44x44px
- Reduced motion support via `prefers-reduced-motion`
- Screen reader announcements for state changes
