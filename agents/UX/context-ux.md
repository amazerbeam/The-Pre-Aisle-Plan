# UX Design Context
> Reference material for ux-design-agent

## Platform

**IMPORTANT:** This is a **responsive web application**, NOT a mobile app.
- Runs in web browsers (Chrome, Safari, Firefox, Edge)
- Works on desktop, tablet, and mobile devices via responsive design
- NOT React Native, NOT a native app
- Mobile support via mobile-first CSS and responsive layouts

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
    [View as Guest] --- or --- [Login with Google/GitHub]
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
| FoodBytes           [=]   |  <- Header (hamburger menu)
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
| FoodBytes  [Breakfast][Lunch][Dinner] |  <- Header with tabs
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
| FoodBytes     [Breakfast] [Lunch] [Dinner] [Snacks]  [=] |
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
