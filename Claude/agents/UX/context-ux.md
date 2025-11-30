# UX Design Context
> Reference material for ux-design-agent

## Branding

**Website Name:** The Pre-Aisle Plan

**Brand Color:** `#4a3f80` (deep purple)

## DO / DO NOT

### DO NOT
- Do NOT use white text on a white background
- Do NOT use light text on light backgrounds
- Do NOT create text that is hard to read or invisible
- Do NOT ignore contrast requirements
- Do NOT offer GitHub login - **Google OAuth only**
- Do NOT create custom Google login buttons - use official branding

### DO
- DO ensure all text is visible and readable
- DO maintain WCAG 2.1 AA contrast ratios (4.5:1 minimum for text)
- DO test text visibility on all background colors
- DO use the brand color `#4a3f80` consistently
- DO use dark text on light backgrounds OR light text on dark backgrounds
- DO use the **official Google Sign-In button** with Google's branding guidelines

## Design Principles

### 1. Mobile-First
- Design for smallest screens first
- Progressively enhance for larger screens
- Touch-friendly by default

### 2. Accessible
- WCAG 2.1 AA compliance
- Keyboard navigable
- Screen reader compatible
- Sufficient color contrast

### 3. Intuitive
- Familiar patterns users already know
- Clear visual hierarchy
- Consistent interactions
- Immediate feedback

### 4. Efficient
- Minimize taps/clicks to complete tasks
- Smart defaults
- Remember user preferences

## Core User Flows

### Flow 1: Browse Recipes (Guest or Logged In)
```
Landing Page
    |
    [View as Guest] --- or --- [Sign in with Google]
    |
    v
Recipe Browser
    |
    +-- Breakfast Tab
    +-- Lunch Tab
    +-- Dinner Tab
    +-- Snacks Tab
    +-- Search Bar
    |
    v
Recipe Card
    |
    +-- View Details
    +-- Adjust Servings
    +-- Add to Plan (Login Required)
```

### Flow 2: Plan Meals (Authenticated)
```
Calendar View
    |
    Navigate: < Previous Week | Next Week >
    |
    Select Date
    |
    v
Day Detail
    Breakfast: [Empty] -> Add Recipe
    Lunch: [Recipe Name] -> Change/Remove
    Dinner: [Empty] -> Add Recipe
    Snacks: [Empty] -> Add Recipe
    |
    v
Recipe Selector Modal
    Filter by meal type
    Search
    Select recipe -> Confirm servings -> Added
```

### Flow 3: Shopping List (Authenticated)
```
Shopping List View
    |
    Date Range Picker
       [Next 3 days]
       [Next 7 days] <- Default
       [Next 14 days]
       [Custom range]
    |
    v
Aggregated Ingredients
    Grouped by Aisle (color-coded)
       Meat (red)
       Vegetables (green)
       Dairy (blue)
       ...
    |
    Each Item:
       [ ] Checkbox (tap to mark purchased)
       Quantity + Unit
       Ingredient Name
       |
       Checked items move to bottom
       [Copy List] -> Clipboard
```

### Flow 4: Admin Recipe Editing (GOD Mode)
```
Recipe Card (Admin View)
    |
    [Edit Recipe] button (visible only to admins)
    |
    v
Recipe Editor Modal
    Name field
    Calories field
    Default servings
    Meal type checkboxes
    Cheat meal toggle
    |
    Ingredients Section
       [+ Add Ingredient]
       Each: Name | Qty | Unit | [Remove]
    |
    Steps Section
       [+ Add Step]
       Each: Step text | [Move Up] [Move Down] [Remove]
    |
    [Cancel] [Save Changes]
    |
    v
Audit log entry created automatically
```

## Wireframes

### Mobile Layout (< 480px)
```
+---------------------------+
| The Pre-Aisle Plan  [=]   |  <- Header (hamburger menu)
+---------------------------+
|                           |
| +----------------------+  |
| | Recipe Card          |  |  <- Full width cards
| +----------------------+  |
| | Porridge             |  |
| | 880 cal | 2 serv     |  |
| +----------------------+  |
| | [Details] [Add]      |  |  <- Stacked buttons
| +----------------------+  |
|                           |
| +----------------------+  |
| | Recipe Card 2        |  |
| +----------------------+  |
|                           |
+---------------------------+
| Recipe  Plan  Shop  User  |  <- Bottom nav (thumb zone)
+---------------------------+
```

### Tablet Layout (480px - 768px)
```
+---------------------------------------+
| Pre-Aisle [Breakfast][Lunch][Dinner]  |  <- Header with tabs
+---------------------------------------+
|                                       |
| +----------------+ +----------------+ |
| | Recipe 1       | | Recipe 2       | |  <- 2-column grid
| +----------------+ +----------------+ |
| | [Det] [Add]    | | [Det] [Add]    | |
| +----------------+ +----------------+ |
|                                       |
| +----------------+ +----------------+ |
| | Recipe 3       | | Recipe 4       | |
| +----------------+ +----------------+ |
|                                       |
+---------------------------------------+
|     Plan      Search      Shop        |
+---------------------------------------+
```

### Desktop Layout (> 1024px)
```
+----------------------------------------------------------+
| The Pre-Aisle Plan  [Breakfast] [Lunch] [Dinner] [Snacks]|
+----------------------------------------------------------+
|                                         |                 |
| +------------+ +------------+ +-------+ | Calendar        |
| | Recipe 1   | | Recipe 2   | | Rec 3 | |                 |
| +------------+ +------------+ +-------+ | Mon Tue Wed ... |
| | [D] [Add]  | | [D] [Add]  | |[D][A] | |                 |
| +------------+ +------------+ +-------+ |                 |
|                                         |                 |
| +------------+ +------------+ +-------+ | [View Plan]     |
| | Recipe 4   | | Recipe 5   | | Rec 6 | | [Shopping]      |
| +------------+ +------------+ +-------+ |                 |
+----------------------------------------------------------+
```

## Calendar UI

### Week View (Default)
```
+-------------------------------------------------------------+
| <  November 2024  >                    [Week] [Month]       |
+-------------------------------------------------------------+
| Mon 25  | Tue 26  | Wed 27  | Thu 28  | Fri 29  | Sat 30   |
+---------+---------+---------+---------+---------+-----------+
| Porridge| Eggs    | +Add    | Pancake | +Add    | Toast    |  <- Breakfast
+---------+---------+---------+---------+---------+-----------+
| Salad   | +Add    | Wrap    | +Add    | Soup    | +Add     |  <- Lunch
+---------+---------+---------+---------+---------+-----------+
| Pasta   | Stir-fry| +Add    | Curry   | Pizza   | Burger   |  <- Dinner
+---------+---------+---------+---------+---------+-----------+

Legend:
  Gray background = Past dates (read-only)
  White background = Future dates (editable)
  Blue border = Today
```

### Mobile Calendar (Day View)
```
+---------------------------+
|    <  Mon, Nov 25  >      |  <- Swipe or tap arrows
+---------------------------+
|                           |
| Breakfast                 |
| +----------------------+  |
| | Porridge      2 serv |  |
| | 880 cal    [x] [edit]|  |
| +----------------------+  |
|                           |
| Lunch                     |
| +----------------------+  |
| | + Add Recipe         |  |
| +----------------------+  |
|                           |
| Dinner                    |
| +----------------------+  |
| | Spaghetti     2 serv |  |
| | 650 cal    [x] [edit]|  |
| +----------------------+  |
|                           |
| Snacks                    |
| +----------------------+  |
| | + Add Recipe         |  |
| +----------------------+  |
|                           |
|     Total: 1,530 cal      |
+---------------------------+
```

## Component Specifications

### Recipe Card
| State | Visual |
|-------|--------|
| Default | White background, subtle shadow |
| Hover (desktop) | Slight lift, stronger shadow |
| Assigned to today | Green left border |
| Cheat meal | Orange "Cheat" badge |

### Date Picker
| Element | Behavior |
|---------|----------|
| Past dates (> 6 months) | Disabled, grayed out |
| Past dates (< 6 months) | Selectable, shows history |
| Today | Blue highlight |
| Future dates | Normal, selectable |

### Shopping List Item
| State | Visual |
|-------|--------|
| Unchecked | Full opacity, checkbox empty |
| Checked | Strikethrough, reduced opacity, checkbox filled |
| Aisle color | 6px left border in aisle color |

## Interaction Patterns

### Touch Targets
- Minimum 44x44px for all interactive elements
- Adequate spacing between targets (8px minimum)

### Gestures (Mobile)
- Swipe left/right on calendar to change days
- Pull-to-refresh on lists
- Tap-and-hold for quick actions (optional)

### Feedback
- Button press: Scale down slightly (transform: scale(0.98))
- Loading: Skeleton screens, not spinners
- Success: Green checkmark animation
- Error: Red highlight + message

### Navigation
- Mobile: Bottom tab bar (thumb-friendly)
- Desktop: Top navigation + sidebar
- Back button always visible in modals

## Google Sign-In Button

**IMPORTANT:** Use the official Google Sign-In button. Do NOT create custom Google login buttons.

### Requirements
- Use the **official Google logo** (multi-color "G")
- Follow Google's Brand Guidelines: https://developers.google.com/identity/branding-guidelines
- Button text: "Sign in with Google" (not "Login with Google")
- White background with Google logo on the left
- No GitHub login option - **Google only**

### Official Button Styling
```css
.google-signin-btn {
  display: inline-flex;
  align-items: center;
  padding: 0 12px;
  height: 40px;
  background-color: #ffffff;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-family: 'Roboto', arial, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #3c4043;
  cursor: pointer;
  transition: background-color 0.2s, box-shadow 0.2s;
}

.google-signin-btn:hover {
  background-color: #f7f8f8;
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
}

.google-signin-btn:active {
  background-color: #f1f3f4;
}

.google-signin-btn img {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}
```

### Google Logo
Use the official Google "G" logo SVG or the hosted image from Google's CDN.

```html
<button class="google-signin-btn">
  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo">
  Sign in with Google
</button>
```

## Color System

### Brand Colors
```css
:root {
  /* Primary Brand Color */
  --brand-primary: #4a3f80;        /* Deep purple */
  --brand-primary-dark: #3a3266;   /* Darker shade for hover states */
  --brand-primary-light: #6b5fa0;  /* Lighter shade for backgrounds */

  /* Text Colors - MUST be readable */
  --text-primary: #2c3e50;         /* Dark gray - use on light backgrounds */
  --text-secondary: #5a6c7d;       /* Medium gray - secondary text */
  --text-on-brand: #ffffff;        /* White - ONLY on brand color backgrounds */
  --text-on-dark: #f5f5f5;         /* Light - use on dark backgrounds */

  /* Background Colors */
  --bg-primary: #ffffff;           /* White */
  --bg-secondary: #f8f9fa;         /* Light gray */
  --bg-dark: #2c3e50;              /* Dark */

  /* Status Colors */
  --success: #27ae60;
  --warning: #f39c12;
  --error: #e74c3c;
  --info: #3498db;
}
```

### Text Visibility Rules

**CRITICAL: All text must be visible and readable.**

| Background | Text Color | Example Use |
|------------|------------|-------------|
| White (`#ffffff`) | Dark (`#2c3e50`) | Main content |
| Light gray (`#f8f9fa`) | Dark (`#2c3e50`) | Cards, sections |
| Brand (`#4a3f80`) | White (`#ffffff`) | Buttons, headers |
| Dark (`#2c3e50`) | Light (`#f5f5f5`) | Footer, dark mode |

**NEVER DO:**
- White text on white background
- Light gray text on white background
- Dark text on dark background
- Brand color text on brand color background

**Contrast Requirements:**
- Normal text: minimum 4.5:1 contrast ratio
- Large text (18px+ bold or 24px+): minimum 3:1 contrast ratio
- Use tools like WebAIM Contrast Checker to verify

## Aisle Color Coding
```css
:root {
  --aisle-meat: #e74c3c;
  --aisle-vegetables: #27ae60;
  --aisle-dairy: #3498db;
  --aisle-bakery: #f39c12;
  --aisle-frozen: #9b59b6;
  --aisle-pantry: #95a5a6;
  --aisle-beverages: #1abc9c;
  --aisle-snacks: #e67e22;
  --aisle-condiments: #f1c40f;
  --aisle-grains: #d35400;
  --aisle-canned: #7f8c8d;
  --aisle-spices: #c0392b;
  --aisle-oils: #16a085;
  --aisle-pasta: #2980b9;
  --aisle-breakfast: #8e44ad;
  --aisle-international: #2c3e50;
  --aisle-other: #bdc3c7;
}
```

**Aisle Label Text:** Always use dark text (`#2c3e50`) on aisle color backgrounds for readability, except for dark aisles (international, spices) which should use light text.

## Accessibility Checklist
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Focus states are visible
- [ ] Color is not the only indicator
- [ ] Contrast ratio >= 4.5:1 for text
- [ ] Skip links for keyboard users
- [ ] ARIA labels on icons
- [ ] Modal traps focus appropriately
- [ ] Error messages are announced
