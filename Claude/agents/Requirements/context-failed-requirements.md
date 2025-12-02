# Context: Failed Requirements Analysis

This document provides context and examples for the `agent-failed-requirements.md` agent. It contains real examples of requirements that failed and how they were clarified.

---

## Purpose of DO/DO NOT Sections

When requirements are implemented incorrectly, it's often because:
1. The requirement was ambiguous
2. Multiple valid interpretations existed
3. Assumptions were made that weren't stated
4. Common patterns weren't specified

Adding **DO** and **DO NOT** sections eliminates ambiguity by:
- **DO**: Explicitly stating what MUST be done, including specific files, components, and styling
- **DO NOT**: Explicitly prohibiting common mistakes or wrong approaches

---

## Real Example: Session 2025-12-02

### Requirements That Failed Testing

Three requirements failed during manual testing after implementation:
1. **FR-038** - Recipes button placed in wrong location (header instead of footer)
2. **FR-041** - Emojis added to wrong component (day buttons instead of Meal Plan only)
3. **NFR-016** - Animation still present (global CSS overriding component CSS)

### Root Cause Analysis

| Requirement | Original Language | Why It Failed | Root Cause |
|-------------|-------------------|---------------|------------|
| FR-038 | "Recipes button visible in Meal Plan view header/top bar" | Button was placed in MealPlanCalendar header, but user wanted it in the footer alongside other nav buttons | Ambiguous "navigation" language; didn't specify footer location |
| FR-041 | "Emojis appear on day buttons AND in meal plan calendar" | Emojis were added to DayAssignmentButtons.jsx in Recipes view | User said "both places" during requirements gathering, but later clarified only Meal Plan |
| NFR-016 | "No click animation" | global.css had `transition: all 0.2s ease` on all buttons that overrode component CSS | Didn't specify to override global styles with `!important` |

---

## Example: FR-038 Before and After

### BEFORE (Ambiguous)
```markdown
### FR-038: Recipes Navigation Button in Meal Plan
**Description:** Add a "Recipes" button to the Meal Plan view allowing users to navigate back to the recipe browser.

**Acceptance Criteria:**
- [ ] "Recipes" button visible in Meal Plan view header/top bar
- [ ] Clicking Recipes button closes Meal Plan and returns to Recipes view
- [ ] Button styled consistently with other navigation elements
```

**Why it failed:** "header/top bar" was interpreted as the MealPlanCalendar component's header. User actually wanted it in the Footer component alongside "Meal Plan", "Search", and "Shopping" buttons.

### AFTER (Clarified)
```markdown
### FR-038: Recipes Navigation Button in Footer
**Priority:** High

**Category:** Navigation

**Description:** Add a "Recipes" button to the bottom footer navigation bar, positioned alongside the existing "Meal Plan", "Search", and "Shopping" buttons.

**User Story:** As a user, I want a Recipes button in the footer navigation so that I can easily return to browse recipes from any screen.

**Acceptance Criteria:**
- [ ] "Recipes" button appears in the footer navigation bar at the bottom of the screen
- [ ] Button is positioned as the first item (leftmost) in the footer, before "Meal Plan"
- [ ] Button uses identical styling as other footer buttons (`.footer-btn` CSS class)
- [ ] Button includes an SVG icon (utensils/fork-knife icon)
- [ ] Button includes "Recipes" text label below the icon
- [ ] Button has active/highlighted state when user is on Recipes view (home route `/`)
- [ ] Clicking navigates to Recipes view

**DO:**
- Place the button in `Footer.jsx` component
- Use the existing `.footer-btn` CSS class for consistent styling
- Follow the same icon + label pattern as Meal Plan, Search, Shopping buttons
- Add `.active` class when on home route `/`

**DO NOT:**
- Do NOT place this button in a header or top bar
- Do NOT place this button inside MealPlanCalendar or any other view-specific component
- Do NOT create custom styling - must match existing footer buttons exactly
- Do NOT add this button to multiple locations

**Source Evidence:** User clarification - "it should be at the bottom footer beside 'Meal Plan' 'Search' & 'Shopping' and be the same style"
```

---

## Example: FR-041 Before and After

### BEFORE (Ambiguous)
```markdown
### FR-041: Random Food Emojis Per Meal Type
**Description:** Display random food/happy emojis on day buttons and in meal plan view, with emoji pools themed by meal type for variety.

**Acceptance Criteria:**
- [ ] Emojis appear on day buttons (e.g., "Mon 🍳", "Tue 🥗")
- [ ] Emojis appear in meal plan calendar view next to each meal entry
```

**Why it failed:** During initial requirements gathering, user said "Both places" when asked where emojis should appear. However, after seeing the implementation, user clarified emojis should ONLY be in Meal Plan view, not on the recipe assignment buttons.

### AFTER (Clarified)
```markdown
### FR-041: Random Food Emojis Per Meal Type (Meal Plan View Only)
**Priority:** Low

**Category:** UX Enhancement

**Description:** Display themed food emojis in the Meal Plan calendar view next to meal type headers, providing visual variety.

**User Story:** As a user, I want to see fun food emojis in my Meal Plan calendar so that the interface feels more lively.

**Acceptance Criteria:**
- [ ] Emojis appear in the Meal Plan calendar view next to each meal type header (Breakfast, Lunch, Dinner, Snacks)
- [ ] Each meal type has a themed emoji pool (8+ options per type)
- [ ] Emoji selection is consistent per date+meal combination (same date/meal always shows same emoji)
- [ ] Emojis are randomized across different dates for variety

**DO:**
- Add emojis to `MealPlanDay.jsx` component in the meal type header section
- Create an emoji utility function that returns consistent emoji based on date + meal type hash
- Use emojis only as visual decoration alongside meal type labels

**DO NOT:**
- Do NOT add emojis to day assignment buttons in the Recipes view (DayAssignmentButtons.jsx)
- Do NOT add emojis to recipe cards
- Do NOT add emojis to the footer navigation
- Do NOT make emojis change on every re-render (must be consistent for same date/meal)

**Source Evidence:** User clarification - "this should only be in 'Meal Plan'" (not on recipe day buttons)
```

---

## Example: NFR-016 Before and After

### BEFORE (Incomplete)
```markdown
### NFR-016: Simplified Day Button Styling
**Description:** Day selection buttons should use simplified, flat design without click animations or ripple effects, matching the Legacy implementation.

**Measurable Criteria:**
- No click animation (no scale, no ripple, no circle effect)
- Flat button design with three clear visual states
- Simple hover state (slight background color change only)
```

**Why it failed:** The implementation added no animations to the component CSS, but `global.css` had `transition: all 0.2s ease` applied to ALL buttons. The component CSS was overridden by global styles.

### AFTER (Clarified)
```markdown
### NFR-016: Simplified Day Button Styling (No Animations)
**Category:** Usability

**Description:** Day selection buttons in the Recipes view should use simplified, flat design matching the Legacy implementation - no click animations, no ripple effects, no transitions.

**Measurable Criteria:**
- No click animation (no scale, no ripple, no circle effect)
- No hover transitions or transform effects
- No focus ring animation
- Flat button design with three clear visual states
- Simple hover state: slight background color change only, no transition timing

**DO:**
- Add explicit `transition: none` to day button CSS in `DayAssignmentButtons.css`
- Use `!important` if needed to override global button styles from `global.css`
- Keep button styling flat and simple
- Match the Legacy `/Legacy/styles.css` button appearance

**DO NOT:**
- Do NOT rely on global button styles (they may include transitions that need overriding)
- Do NOT add CSS transitions, transforms, or animations to day buttons
- Do NOT add ripple effects or material design interactions
- Do NOT add scale effects on click or hover

**Source Evidence:** User request - "I don't like the clicks animation or the circle in the Day buttons"; Root cause: global.css line 83 had `transition: all 0.2s ease` on all buttons
```

---

## Best Practices for DO/DO NOT Sections

### DO Section Should Include:
1. **Specific file/component names** - "Place in `Footer.jsx`"
2. **CSS class names** - "Use `.footer-btn` class"
3. **Existing patterns to follow** - "Follow same icon + label pattern as..."
4. **Override instructions** - "Use `!important` to override global styles"

### DO NOT Section Should Include:
1. **Common wrong locations** - "Do NOT place in header"
2. **Wrong components** - "Do NOT add to DayAssignmentButtons.jsx"
3. **Wrong styling approaches** - "Do NOT create custom styling"
4. **Architecture mistakes** - "Do NOT add to multiple locations"

---

## Files Modified in This Session

| File | Change Made |
|------|-------------|
| `foodbytes-requirements.md` | Updated FR-038, FR-041, NFR-016 with DO/DO NOT sections |
| `DayAssignmentButtons.css` | Added `transition: none !important` |
| `DayAssignmentButtons.jsx` | Removed emoji import and rendering |
| `MealPlanCalendar.jsx` | Removed Recipes button from header |
| `Footer.jsx` | Added Recipes button with `.footer-btn` styling |

---

## Key Takeaways

1. **Location matters** - Always specify the exact component/file where code should be placed
2. **Styling specificity matters** - Reference existing CSS classes, mention override requirements
3. **User clarification is gold** - Always quote exact user feedback in Source Evidence
4. **Negative requirements prevent mistakes** - DO NOT sections catch common wrong approaches
5. **Think like an AI** - What could be misinterpreted? What assumptions might be made?
