# Requirements Traceability Matrix

> **Source:** agents/Requirements/foodbytes-requirements.md
> **Generated:** 2025-11-30
> **Last Updated:** 2025-11-30

## Summary

| Category | Total | Verified | Implemented | In Progress | Not Started | Blocked |
|----------|-------|----------|-------------|-------------|-------------|---------|
| Functional (FR) | 29 | 0 | 0 | 0 | 29 | 0 |
| Non-Functional (NFR) | 15 | 0 | 0 | 0 | 15 | 0 |
| **TOTAL** | **44** | **0** | **0** | **0** | **44** | **0** |

**Coverage: 0%**

**Status:** IN PROGRESS - Build Starting

---

## Status Legend

| Status | Symbol | Meaning |
|--------|--------|---------|
| NOT_STARTED | - | Requirement not yet addressed by any phase |
| IN_PROGRESS | ~ | Design approved, implementation underway |
| IMPLEMENTED | + | Code complete, awaiting verification |
| VERIFIED | V | All acceptance criteria confirmed working |
| BLOCKED | X | Cannot implement - requires user decision |

---

## Functional Requirements

### FR-000: Shared Date Range Across All Views
**Status:** NOT_STARTED
**Priority:** High
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Acceptance Criteria:**
- [ ] "From" date picker - start of planning period
- [ ] "To" date picker - end of planning period
- [ ] Default range: Current date to current date + 6 days (7 days total)
- [ ] Date range displayed prominently on all views
- [ ] Changing date range updates all three views
- [ ] End date must be >= start date (validation)
- [ ] Date range persists in session
- [ ] Authenticated users: saved to account
- [ ] Guest users: stored in localStorage

---

### FR-001: Browse Recipes by Meal Category
**Status:** NOT_STARTED
**Priority:** High
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Acceptance Criteria:**
- [ ] Four tab buttons: Breakfast, Lunch, Dinner, Snacks
- [ ] NO "All Recipes" tab
- [ ] Default tab on load is Breakfast
- [ ] Clicking tab filters recipes by meal type
- [ ] Each recipe MUST be assigned to at least one meal category
- [ ] Active tab visually distinguished
- [ ] Recipes sorted alphabetically within category
- [ ] Cheat meal recipes appear after regular recipes
- [ ] Recipe card displays: name, calories, servings control, View Details, day buttons

---

### FR-002: Search Recipes by Name
**Status:** NOT_STARTED
**Priority:** Medium
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Acceptance Criteria:**
- [ ] Search bar accessible from bottom navigation
- [ ] Search filters case-insensitively by recipe name
- [ ] Results update as user types (real-time filtering)
- [ ] "No recipes found" message when no results
- [ ] Clearing search returns to previous meal category view

---

### FR-003: View Recipe Details
**Status:** NOT_STARTED
**Priority:** High
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Acceptance Criteria:**
- [ ] Each recipe card has collapsible details section
- [ ] Details shows complete ingredients list with quantities/units
- [ ] Details shows numbered cooking steps
- [ ] Toggle button switches between "Show Details" and "Hide Details"
- [ ] Ingredient quantities scaled based on current serving size

---

### FR-004: Adjust Serving Sizes with Ingredient Scaling
**Status:** NOT_STARTED
**Priority:** High
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Acceptance Criteria:**
- [ ] Each recipe displays servings input control
- [ ] Default value is user's Default Servings preference
- [ ] If no preference, default to 1 serving
- [ ] Guest users default to 1 serving
- [ ] Changing servings recalculates all ingredient quantities
- [ ] Minimum serving size is 1
- [ ] Maximum serving size is 10
- [ ] Scaled quantities show appropriate precision
- [ ] Calorie display updates based on serving adjustment

---

### FR-005: Copy Recipe to Clipboard
**Status:** NOT_STARTED
**Priority:** Medium
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Acceptance Criteria:**
- [ ] Copy button visible in recipe header
- [ ] Clicking copy formats recipe with title, scaled ingredients, steps
- [ ] Format includes emoji header
- [ ] Button shows "Copied!" confirmation for 2 seconds
- [ ] Clipboard API failure shows error alert

---

### FR-006: Fullscreen Recipe View
**Status:** NOT_STARTED
**Priority:** Medium
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Acceptance Criteria:**
- [ ] Maximize button opens fullscreen recipe overlay
- [ ] Fullscreen displays recipe title, servings info, calories
- [ ] Ingredients list shows scaled quantities
- [ ] Cooking steps numbered and clearly displayed
- [ ] Close button (X) exits fullscreen mode
- [ ] Screen wake lock activates in fullscreen (if supported)

---

### FR-007: Assign Recipes to Days of the Week
**Status:** NOT_STARTED
**Priority:** High
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Acceptance Criteria:**
- [ ] Each recipe card displays 7 day buttons: Mon-Sun
- [ ] Day buttons correspond to days within current date range
- [ ] Clicking day button assigns recipe to that date
- [ ] Clicking already-assigned day removes recipe (toggle)
- [ ] Visual indicator shows which days recipe is assigned to
- [ ] Recipe's current serving size saved with assignment
- [ ] Recipe assigned to meal type matching current tab
- [ ] Assigning recipe updates Shopping List and Meal Plan
- [ ] Authenticated users' assignments sync to server
- [ ] Guest users can browse but cannot save assignments

---

### FR-008: Remove Recipes from Calendar
**Status:** NOT_STARTED
**Priority:** High
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Acceptance Criteria:**
- [ ] Clicking already-assigned date removes recipe
- [ ] Visual indicator updates to show not assigned
- [ ] Date entry cleaned up if no recipes remain
- [ ] Change syncs to server for authenticated users

---

### FR-009: View Meal Plan Calendar
**Status:** NOT_STARTED
**Priority:** High
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Acceptance Criteria:**
- [ ] Meal Plan button in footer opens calendar view
- [ ] Uses shared global date range (FR-000)
- [ ] Displays all days within date range
- [ ] Current date visually highlighted
- [ ] Each date shows recipes organized by meal type
- [ ] Each entry shows: recipe name and serving size
- [ ] Daily calorie total displayed
- [ ] Can remove recipes directly from meal plan view
- [ ] Visual distinction for past/current/future dates
- [ ] Changing global date range updates meal plan view
- [ ] Wake lock activates when calendar visible

---

### FR-010: Calculate Daily Calorie Totals
**Status:** NOT_STARTED
**Priority:** Medium
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Acceptance Criteria:**
- [ ] Each day shows sum of all recipe calories
- [ ] Calories calculated based on recipe calories and serving size
- [ ] Per-serving calorie info shows for individual recipes
- [ ] Total updates when recipes added/removed

---

### FR-011: Enforce Cheat Meal Limits
**Status:** NOT_STARTED
**Priority:** Low
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Acceptance Criteria:**
- [ ] Recipes with isCheat=true identified as cheat meals
- [ ] Maximum 1 cheat per meal type per week
- [ ] Attempting excess cheat shows warning alert
- [ ] Alert specifies which meal type limit exceeded
- [ ] Non-cheat recipes not restricted

---

### FR-012: Generate Aggregated Shopping List
**Status:** NOT_STARTED
**Priority:** High
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Acceptance Criteria:**
- [ ] Shopping List accessible from bottom navigation
- [ ] Uses shared global date range (FR-000)
- [ ] NO preset buttons (no "3 days", "1 week" buttons)
- [ ] NO separate date pickers
- [ ] Only ingredients within global date range aggregated
- [ ] Same ingredients from multiple recipes combined
- [ ] Quantities reflect recipe serving sizes
- [ ] List updates when date range, recipes, or servings change

---

### FR-013: Group Ingredients by Grocery Aisle
**Status:** NOT_STARTED
**Priority:** High
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Acceptance Criteria:**
- [ ] Ingredients grouped by assigned aisle
- [ ] 17 aisles available
- [ ] Aisle sections display in store-walking order (1-17)
- [ ] Each item shows colored left border matching aisle
- [ ] Unknown ingredients default to "Misc" aisle

---

### FR-014: Check Off Purchased Items
**Status:** NOT_STARTED
**Priority:** Medium
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Acceptance Criteria:**
- [ ] Each ingredient has checkbox
- [ ] Clicking item row toggles checkbox
- [ ] Checked state persists to localStorage
- [ ] Checked items move to bottom within aisle
- [ ] Visual styling distinguishes checked vs unchecked

---

### FR-015: Uncheck All Shopping Items
**Status:** NOT_STARTED
**Priority:** Low
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Acceptance Criteria:**
- [ ] "Uncheck All" button visible
- [ ] Confirmation dialog before unchecking
- [ ] All items reset to unchecked
- [ ] localStorage updated
- [ ] List re-renders with all items unchecked

---

### FR-016: Copy Shopping List to Clipboard
**Status:** NOT_STARTED
**Priority:** Medium
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Acceptance Criteria:**
- [ ] Copy button visible in shopping list header
- [ ] Copied format includes all ingredients with quantities
- [ ] Format uses markdown-style with emoji header
- [ ] Button shows "Copied!" confirmation
- [ ] Only unchecked items included

---

### FR-017: Sort Shopping List by Aisle, Name, Status
**Status:** NOT_STARTED
**Priority:** Medium
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Acceptance Criteria:**
- [ ] Unchecked items appear before checked
- [ ] Within check status, sort by aisle order (1-17)
- [ ] Within aisle, sort alphabetically by name
- [ ] Same ingredient with different units appears together
- [ ] Sort updates when checkbox state changes

---

### FR-018: Persist Meal Plan to Server Database
**Status:** NOT_STARTED
**Priority:** High
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Acceptance Criteria:**
- [ ] Authenticated users' meal plans sync to MySQL via REST API
- [ ] Plan loads from server on login
- [ ] Guest users cannot save meal plans
- [ ] Changes sync after each modification
- [ ] Corrupted data handled gracefully
- [ ] localStorage used only for session tokens and temp data
- [ ] Meal plan data retained for rolling 6 months

---

### FR-019: Persist Shopping List State to Local Storage
**Status:** NOT_STARTED
**Priority:** Medium
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Acceptance Criteria:**
- [ ] Checkbox states save immediately on change
- [ ] States load from localStorage on page load
- [ ] localStorage key is `shoppingListState`
- [ ] Data stored as JSON array of [key, boolean] pairs

---

### FR-020: Generate Shareable Meal Plan URL
**Status:** NOT_STARTED
**Priority:** Low
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Acceptance Criteria:**
- [ ] Share button visible in meal plan view
- [ ] User can select date range to share
- [ ] Generates URL with base64-encoded planner data
- [ ] URL automatically copied to clipboard
- [ ] Success message confirms URL copied
- [ ] URL uses ?planner= query parameter

---

### FR-021: Import Meal Plan from Shared URL
**Status:** NOT_STARTED
**Priority:** Low
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Acceptance Criteria:**
- [ ] System checks for ?planner= URL parameter on load
- [ ] Base64 data decoded to meal plan array
- [ ] Confirmation dialog before importing
- [ ] User can choose original dates or shift to current week
- [ ] Import merges or replaces (user choice)
- [ ] Requires authentication to save
- [ ] Invalid URLs fallback gracefully

---

### FR-022: Screen Wake Lock During Cooking
**Status:** NOT_STARTED
**Priority:** Low
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Acceptance Criteria:**
- [ ] Wake lock requests when fullscreen recipe opens
- [ ] Wake lock requests when meal plan modal visible
- [ ] Wake lock releases when views close
- [ ] Feature detection handles unsupported browsers
- [ ] Errors logged but don't interrupt UX

---

### FR-023: User Registration and Login (Google OAuth Only)
**Status:** NOT_STARTED
**Priority:** High
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Acceptance Criteria:**
- [ ] Google Sign-In button ONLY - no GitHub
- [ ] Official Google branding with "G" logo
- [ ] Button text: "Sign in with Google"
- [ ] Follow Google Brand Guidelines
- [ ] New users auto-registered on first login
- [ ] JWT stored in httpOnly cookies
- [ ] User profile displays name and email
- [ ] Logout clears session
- [ ] Guest users can browse but not save
- [ ] Session persists across browser sessions

---

### FR-024: View and Edit User Profile
**Status:** NOT_STARTED
**Priority:** Medium
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Acceptance Criteria:**
- [ ] Profile displays user name and email
- [ ] Shows OAuth provider (Google only)
- [ ] Shows account creation date
- [ ] Shows admin status if applicable
- [ ] Default Servings setting available
- [ ] Default Servings applies to all recipes
- [ ] Default Servings range: 1-10
- [ ] Default Servings persists to database
- [ ] New users default to 1 serving
- [ ] Logout option available

---

### FR-025: GOD Mode Admin Access
**Status:** NOT_STARTED
**Priority:** High
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Acceptance Criteria:**
- [ ] Admin role stored in database (is_admin flag)
- [ ] Admin status assigned in database (not self-service)
- [ ] Admin users see "Edit Recipe" button
- [ ] Admin users can access recipe management
- [ ] Non-admin users see recipes as read-only
- [ ] Admin actions logged for accountability

---

### FR-026: Recipe Editing (Admin Only)
**Status:** NOT_STARTED
**Priority:** High
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Acceptance Criteria:**
- [ ] Edit form allows modifying recipe name
- [ ] Edit form allows modifying servings and calories
- [ ] Can add/remove/modify ingredients
- [ ] Can add/remove/reorder cooking steps
- [ ] Can toggle cheat meal flag
- [ ] Can toggle recipe visibility (Live/Hidden)
- [ ] Can assign to meal categories
- [ ] Delete performs soft delete
- [ ] Changes immediately visible after save
- [ ] Only admin users can access

---

### FR-027: Recipe Edit Audit Trail
**Status:** NOT_STARTED
**Priority:** High
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Acceptance Criteria:**
- [ ] Every create/update/delete logged
- [ ] Audit captures: admin ID, recipe ID, action, timestamp
- [ ] Full diff stored: old_values and new_values JSON
- [ ] Audit log viewable by admin
- [ ] Can filter by recipe, user, or date range
- [ ] Can view side-by-side comparison
- [ ] Audit records immutable (append-only)

---

### FR-028: Recipe Visibility Toggle (Admin Only)
**Status:** NOT_STARTED
**Priority:** High
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Acceptance Criteria:**
- [ ] Each recipe has visibility: Live (1) or Hidden (0)
- [ ] New recipes default to Hidden (0)
- [ ] Only admin can toggle visibility
- [ ] Hidden recipes NOT visible to regular users
- [ ] Hidden recipes visible to admin with indicator
- [ ] Admin sees toggle button on cards and edit form
- [ ] Visibility changes logged in audit trail
- [ ] Admin view can filter by Live/Hidden

---

## Non-Functional Requirements

### NFR-001: Hybrid Client-Server Architecture
**Status:** NOT_STARTED
**Category:** Architecture
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Measurable Criteria:**
- [ ] Frontend: React with responsive CSS (NOT React Native)
- [ ] Backend: Java Spring Boot REST API
- [ ] Database: MySQL for users, meal plans, recipes, audit
- [ ] API endpoints secured with JWT
- [ ] Guest browsing requires no auth
- [ ] Authenticated features require valid JWT

---

### NFR-002: Instant Ingredient Scaling
**Status:** NOT_STARTED
**Category:** Performance
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Measurable Criteria:**
- [ ] Calculations complete in < 16ms
- [ ] No visible lag on servings change
- [ ] DOM updates minimal and targeted

---

### NFR-003: Mobile-First Responsive Design
**Status:** NOT_STARTED
**Category:** Usability
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Measurable Criteria:**
- [ ] Touch targets minimum 44x44 pixels
- [ ] Font sizes 16px+ body text
- [ ] Layouts adapt 320px to 1920px
- [ ] Safe area insets for notched devices

---

### NFR-004: Thumb-Accessible Navigation
**Status:** NOT_STARTED
**Category:** Usability
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Measurable Criteria:**
- [ ] Bottom navigation fixed at screen bottom
- [ ] Three main actions thumb-accessible
- [ ] Navigation visible on all views

---

### NFR-005: Visual Aisle Color Coding
**Status:** NOT_STARTED
**Category:** Usability
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Measurable Criteria:**
- [ ] 17 distinct colors for 17 aisles
- [ ] Colors distinguishable and accessible
- [ ] Color applied as left border on items

---

### NFR-006: Graceful API Fallbacks
**Status:** NOT_STARTED
**Category:** Reliability
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Measurable Criteria:**
- [ ] Wake lock failure doesn't break cooking view
- [ ] Clipboard failure shows user-friendly error
- [ ] Missing localStorage degrades to session-only

---

### NFR-007: Data Recovery on Load
**Status:** NOT_STARTED
**Category:** Reliability
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Measurable Criteria:**
- [ ] Authenticated: meal plan loaded from server
- [ ] Guest: browse-only mode
- [ ] Shopping list checkbox state from localStorage
- [ ] Server failures handled with retry/notification
- [ ] Corrupted data fallback to defaults

---

### NFR-008: Server-Side Data Storage
**Status:** NOT_STARTED
**Category:** Compatibility
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Measurable Criteria:**
- [ ] Meal plans in MySQL (authenticated)
- [ ] Recipes in MySQL (admin-managed)
- [ ] Audit logs in MySQL
- [ ] localStorage: tokens, checkbox state, preferences only
- [ ] Degrades gracefully if localStorage unavailable
- [ ] Server is single source of truth

---

### NFR-009: Progressive Enhancement for Modern APIs
**Status:** NOT_STARTED
**Category:** Compatibility
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Measurable Criteria:**
- [ ] Core features work without Wake Lock
- [ ] Core features work without Clipboard (fails gracefully)
- [ ] ES6+ JavaScript required

---

### NFR-010: Centralized Ingredient Definitions
**Status:** NOT_STARTED
**Category:** Maintainability
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Measurable Criteria:**
- [ ] Single source of truth for ingredient names
- [ ] No duplicate ingredient names
- [ ] All names singular form
- [ ] Recipes reference by key, not free-text
- [ ] Single source for aisle assignments
- [ ] N() helper enforces validation

---

### NFR-011: Data Validation Helpers
**Status:** NOT_STARTED
**Category:** Maintainability
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Measurable Criteria:**
- [ ] N() validates ingredient key existence
- [ ] getAisleInfoByName() provides safe lookup
- [ ] Invalid data logs errors

---

### NFR-012: API Authentication and Authorization
**Status:** NOT_STARTED
**Category:** Security
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Measurable Criteria:**
- [ ] All write endpoints require valid JWT
- [ ] Admin endpoints verify is_admin flag
- [ ] JWT expires after 7 days
- [ ] Refresh token mechanism
- [ ] No passwords stored (OAuth-only)
- [ ] HTTPS required in production
- [ ] Rate limiting on auth endpoints

---

### NFR-013: Audit Data Integrity
**Status:** NOT_STARTED
**Category:** Security
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Measurable Criteria:**
- [ ] Audit table uses auto-increment ID
- [ ] Timestamps in UTC
- [ ] FKs ensure referential integrity
- [ ] No DELETE/UPDATE on audit table (append-only)
- [ ] old_values/new_values store complete JSON
- [ ] Records preserved even if recipe deleted
- [ ] Regular backup strategy

---

### NFR-014: Data Retention Policy
**Status:** NOT_STARTED
**Category:** Reliability
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Measurable Criteria:**
- [ ] Scheduled job archives meal plans > 6 months
- [ ] Archived data moved to archive table or deleted
- [ ] Users can export data before archival
- [ ] Audit logs exempt (kept indefinitely)
- [ ] Recipes never auto-archived

---

### NFR-015: Centralized Unit Definitions
**Status:** NOT_STARTED
**Category:** Maintainability
**Phase:** TBD
**Implementation:** None
**Evidence:** None
**Measurable Criteria:**
- [ ] Single source of truth via UNIT constant
- [ ] No duplicate unit representations
- [ ] All units singular/invariant form
- [ ] Recipes reference by key
- [ ] Shopping list uses exact unit matching
- [ ] Different units appear as separate lines grouped together

---

## Verification History

| Date | Phase | Action | Coverage Before | Coverage After |
|------|-------|--------|-----------------|----------------|
| 2025-11-30 | Startup | RTM Created | 0% | 0% |

---

## Gaps Summary

(Will be populated during Phase 10 verification)

---

## Exceptions (User Approved)

(None yet)

---
