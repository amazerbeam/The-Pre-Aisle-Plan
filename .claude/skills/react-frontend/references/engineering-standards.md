# Engineering Standards — Reference (FoodBytes client)

General React/frontend engineering standards that apply regardless of feature. Read once, internalize, return when scaffolding something new or reviewing a large change.

**Not here:** FoodBytes-specific conventions (Context list, PWA config, recipe kcal quirks, touch-target rules) — those live in `SKILL.md`. The MUST/NEVER contract also lives in `SKILL.md`; this file is the rationale and the detail.

## Engineering principles

Optimise every implementation for, in order:

1. Readability over cleverness
2. Simplicity over abstraction
3. Consistency over personal preference
4. Maintainability over speed of implementation
5. Reusability over duplication
6. Predictability over complexity

Before calling a change done, answer:

- Will another developer understand this in six months?
- Is this the simplest solution that solves the problem?
- Does it align with existing patterns in this codebase?
- Can it be easily tested and maintained?

Code is read far more often than it is written. The goal is an app that stays simple, consistent and reliable as it grows — not a sophisticated one.

## Component size budget

| Lines | Verdict |
|---|---|
| < 200 | fine |
| 200–400 | needs a second look — is there a hook or a sibling component hiding in here? |
| > 400 | **blocking** — split it in the same change |

Measure, don't estimate. Before declaring the work done:

```powershell
(Get-Content <file> | Measure-Object -Line).Lines
```

A file over 400 lines is not a review note for a human to catch later — split it now. Extract logic into a `use*` hook; extract per-concern render blocks into sibling components in the same folder.

Current offenders in this repo (fix opportunistically when you touch them, don't grow them):

| File | Lines |
|---|---|
| `components/admin/RecipeIngredientsForm.jsx` | 682 |
| `contexts/MealPlanContext.jsx` | 476 |
| `components/recipes/RecipeViewModal.jsx` | 393 |

Large components almost always mean mixed concerns, or business logic that belongs in a hook.

## Component file order

One order, every file:

```
imports → constants → component → helper functions → default export
```

Helpers that don't touch component state belong below the component (or in `utils/` once reused). Constants belong above it, not inline in JSX.

## One component, one responsibility

- Components render UI. Hooks hold logic. When a component body starts computing, aggregating, or sequencing async work, that logic wants to be a `use*` hook.
- Custom hooks take **declarative props** (`useTooltip({ label })`) and return values. A hook that returns an imperative setter meant to be called during render forces `useRef` + force-render workarounds and is an infinite-loop trap with `useState`.
- Hooks are called at the top level of a component or another `use*` hook — never in a loop, condition, nested function, or a plain non-React function.

## Prefer duplication over premature abstraction

Shared abstractions should emerge from proven reuse, not anticipation. Keep code next to the feature it serves; promote to `components/common/`, `hooks/`, or `utils/` only once a second real consumer exists.

Never create dumping-ground folders: `misc`, `helpers`, `temp`, `old`, `new`. If a name doesn't say what's inside, it will collect everything.

## Constants and enumeration

Magic strings and numbers are a primary source of silent defects — a typo in a string literal fails at runtime, in one branch, quietly. Anything carrying meaning that appears more than once gets a constant:

```js
export const MEAL_TYPE = {
  BREAKFAST: 'breakfast',
  LUNCH:     'lunch',
  DINNER:    'dinner',
}
```

`UPPER_SNAKE_CASE` keys, one exported map, imported everywhere.

Categories that always get this treatment: meal types, variant labels (Light / Moderate / Balanced), storage keys, route paths, API endpoints, event names, sort directions, filter modes, status values.

Known debt: meal-type string literals (`'breakfast'` / `'lunch'` / `'dinner'`) appear ~31 times across 8 files with no shared constant. There is no `constants/` folder yet — create `src/constants/` when you next need one of these.

## Four async states

Every asynchronous surface has **four** states, not two:

| State | Requirement |
|---|---|
| loading | a visible indicator — never a frozen or blank UI |
| success | the data |
| error | a human-readable message, never a raw stack trace or a blank screen |
| empty | distinct from loading and from error — "no recipes match" is not "still loading" |

Skipping any of the four ships a broken UX. Empty state is the one most often forgotten.

## API resilience

- **Every request needs a timeout.** A hung request with no timeout is an indefinite spinner. Set a default on the shared Axios instance (`services/api.js`) via one exported constant; opt specific heavy calls out explicitly rather than hard-coding literals per call site.
- **Reads that a user can navigate away from get an `AbortController`** — created in the fetching effect, aborted in cleanup (unmount / dependency change). Swallow cancellations (`axios.isCancel`) — a cancelled request is not a user-facing error.
- **Never auto-abort writes.** Cancelling a half-sent POST/PATCH/DELETE leaves ambiguous server state. Let mutations accept an optional config so a caller can opt in deliberately.
- **Never swallow an error into a success shape.** `catch { return [] }` inside a fetch turns a timeout or a 500 into "loaded successfully, zero results" — no error, no retry, a silently blank panel. Let it reject and handle it in the state machine above.
- **Read the error body before throwing a generic error.** `if (!res.ok) throw new Error(res.status)` discards whatever message the backend sent. Parse the body first, surface the server's message, and fall back to a status-based message only when there is no body.
- **Distinguish offline from failed.** Network-down and request-timeout deserve different copy from "the server rejected this". Detect offline reactively via an `online`/`offline` listener hook — a render-time `navigator.onLine` snapshot never updates on reconnect.

## Performance — priority order

Work in this order; stop when the problem is solved:

1. **Eliminate async waterfalls** — parallelise independent fetches (`Promise.all`) instead of awaiting in sequence.
2. **Reduce bundle size** — `React.lazy()` + `Suspense` for large, rarely-opened features (admin forms, modals).
3. **Minimise re-renders** — first by placing state at the right level, only then by memoising.

Anti-patterns: deep prop drilling, one giant context that re-renders the whole tree on any change, heavy calculation inside render, fresh anonymous functions passed to memoised children, and **excessive memoisation** — `memo` / `useMemo` / `useCallback` added without profiling evidence is itself an anti-pattern, adding cost and noise for no measured gain.

## State placement

| State | Where |
|---|---|
| Local UI (form fields, open/closed, hover) | `useState` in the component |
| Shared across a feature's components | the existing Context that owns that domain |
| Server data | the Context that owns it, fetched through `services/` |
| Shareable / bookmarkable | URL via React Router params |

Own state at the lowest level that works. Lift only when genuinely shared. Prop drilling 2–3 levels is preferable to a new Context; deeper than that, use the Context.

**One sanctioned store: React Context.** Don't introduce Zustand, Redux, or a `useReducer`-based shared store — mixing state managers fragments the model and makes data flow impossible to follow. Feature-specific state never goes into a global Context.

## Security

- Validate and sanitise user input at the boundary.
- `dangerouslySetInnerHTML` needs an explicit, reviewed justification. Default answer is no.
- Never commit API keys, credentials, or secrets. Client-side env vars are public by definition — anything in `VITE_*` is shipped to the browser.

## Logging

- No `console.log` / `console.debug` in shipped code. Current debt: 6 occurrences across `services/api.js`, `hooks/useWakeLock.js`, `components/mealplan/MealPlanEntry.jsx`.
- Errors that *are* logged must be actionable — include enough context (what operation, which id) to diagnose without a repro.

## Testing

There is no test runner wired into `client/package.json`. Consequences:

- Never claim a test passed. State plainly what you verified manually, and what you could not verify.
- If a test runner is introduced, it's Vitest + React Testing Library (matches the Vite toolchain), with coverage **risk-based** — deepest on critical journeys (meal-plan write path, shopping-list persistence, auth gating), lightest on presentational components.
- Test behaviour, not implementation. Query through accessible roles and labels (`getByRole`, `getByLabelText`) — those queries double as an accessibility audit, so a component that's hard to query is usually a component that's hard to use with a screen reader.

## Dependencies

The client has four runtime dependencies (`react`, `react-dom`, `react-router-dom`, `axios`). That is a feature, not an accident.

Before adding one, justify it: what existing code or platform API could do this, bundle-size cost, maintenance activity, security surface, and whether it's still supportable in two years. A 20-line utility beats a transitive dependency tree. Say the justification out loud in the change summary — don't add a dependency silently.

## Definition of Done

A change is done when:

- Functionality works, verified by actually exercising it (or explicitly stated as unverified and why).
- All four async states are handled on any new async surface.
- Accessibility is satisfied: keyboard reachable, semantic elements, ARIA on icon-only controls, ≥44px touch targets, AA contrast.
- Errors are handled — no blank screens, no raw stack traces, no swallowed failures.
- No file left over 400 lines; no new `console.log`; no new magic string that should be a constant.
- The PWA baseline is intact (see `SKILL.md` § PWA).
- The summary states: what changed, why this approach, what was verified and how, what wasn't verified, and any known risk or debt.

## Change size and debt

- Smaller incremental changes beat one giant change. Past ~500 lines of diff, flag it explicitly and say why it couldn't be split.
- Leave the code better than you found it — readability, duplication, naming, dead code.
- **Never knowingly introduce technical debt silently.** If a shortcut is the right call, say so in the summary so it's a decision, not a surprise.
