# Future Development Ideas
> Features to be built on the FoodBytes foundation - NOT for current implementation

## Status
These are ideas for future development phases. Do NOT implement these features in the current build.

---

## FD-001: Recipe Ratings
**Category:** User Engagement

**Description:** Allow users to rate recipes they have tried

**Initial Thoughts:**
- Star rating system (1-5 stars)
- User can only rate recipes they've added to their meal plan
- Average rating displayed on recipe cards
- Filter/sort recipes by rating
- Prevent rating manipulation (one rating per user per recipe)

---

## FD-002: Paid Subscription Model
**Category:** Monetization

**Description:** Freemium model with restricted features for unpaid users

**Initial Thoughts:**
- **Free tier restrictions:**
  - Cannot save meal plans (or limited to 3 days only)
  - Cannot generate shopping lists
  - Limited recipe access (see FD-003)
- **Paid tier benefits:**
  - Unlimited meal plan saving
  - Full shopping list generation
  - Access to all recipes
  - Priority support
- Payment integration (Stripe?)
- Subscription management UI

---

## FD-003: Restricted Recipe Access for Free Users
**Category:** Monetization

**Description:** Free users see limited recipes per category

**Initial Thoughts:**
- Free users see only 5 recipes per meal category (Breakfast, Lunch, Dinner, Snacks)
- Recipes shown could be:
  - Random selection
  - Most popular (by rating)
  - Curated "sample" recipes
- "Unlock more recipes" prompt to upgrade
- Paid users see all recipes

---

## FD-004: Free Trial Period
**Category:** Monetization

**Description:** New users get a trial period with full features

**Initial Thoughts:**
- 1 month (30 days) free trial of all paid features
- Requires Google OAuth authentication to prevent abuse
- Trial starts on first login
- Clear countdown/notification of trial expiration
- Prompt to subscribe before trial ends
- One trial per Google account (track by OAuth ID)
- Grace period or data export option when trial expires

---

## FD-005: Gamification - Avatar & Rewards
**Category:** User Engagement

**Description:** Users have an avatar and earn rewards for completing meals

**Initial Thoughts:**
- User creates/selects an avatar
- "I ate this meal" button on planned meals
- Completing meals earns coins/points
- Coins can be used for:
  - Avatar customization (outfits, accessories)
  - Unlock special themes
  - Badges/achievements
- Streak bonuses (consecutive days of logging meals)
- Weekly/monthly challenges
- Leaderboard (optional, privacy considerations)

---

## FD-006: Additional GOD Mode Features
**Category:** Admin Tools

**Description:** Enhanced admin capabilities beyond current scope

**Initial Thoughts:**
- User management (view all users, grant/revoke access)
- Analytics dashboard (popular recipes, usage stats)
- Bulk recipe operations (import/export)
- Featured recipe management
- Push notification management
- Subscription/payment management
- Content moderation tools
- A/B testing for recipes

---

## FD-007: Custom Aisle Ordering
**Category:** Personalization

**Description:** Users can reorder aisles to match their local supermarket layout

**Initial Thoughts:**
- Default aisle order provided (current 1-17)
- User can drag-and-drop to reorder aisles
- Custom order saved to user profile (server-side)
- Shopping list renders in user's custom order
- "Reset to default" option
- Could potentially support multiple saved store layouts

---

## FD-008: "Never Show" Ingredient List
**Category:** Personalization

**Description:** Users can mark ingredients to exclude from their shopping list

**Initial Thoughts:**
- "Never show in shopping list" option per ingredient
- Use cases:
  - Items user always has at home (salt, pepper, oil)
  - Allergies/dietary restrictions
  - Items purchased elsewhere
- Manage "never show" list in user settings
- Easy toggle on/off from shopping list view
- Saved to user profile (server-side)
- Clear visual indicator when recipe contains "never show" items
- Bulk management interface

---

## Priority Notes

| ID | Feature | Complexity | Revenue Impact |
|----|---------|------------|----------------|
| FD-002 | Paid Model | High | Direct |
| FD-003 | Restricted Access | Medium | Direct |
| FD-004 | Free Trial | Medium | Direct |
| FD-001 | Ratings | Low | Indirect |
| FD-007 | Aisle Ordering | Low | Retention |
| FD-008 | Never Show List | Low | Retention |
| FD-005 | Gamification | High | Retention |
| FD-006 | GOD Features | Medium | Operations |

---

## Dependencies

```
FD-002 (Paid Model)
  └── FD-003 (Restricted Access) depends on this
  └── FD-004 (Free Trial) depends on this

FD-001 (Ratings)
  └── Could influence FD-003 (show highest-rated free recipes)

FD-005 (Gamification)
  └── Standalone but could integrate with FD-002 (premium avatars)
```

---

## Notes

- All monetization features (FD-002, FD-003, FD-004) should be designed together
- Gamification (FD-005) is a significant undertaking - consider MVP version first
- Personalization features (FD-007, FD-008) are lower effort, high user satisfaction
- Consider GDPR/privacy implications for user data in ratings and gamification
