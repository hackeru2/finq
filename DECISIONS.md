# DECISIONS.md

## 0. Ant Design over plain CSS or another component library

I chose Ant Design because I know it, it is a proven production-grade library (7+ years, tens of thousands of GitHub stars), it is MIT-licensed (free), and it gives the app a professional finish without any CSS authoring. The alternative — letting the AI write plain CSS — produces an obviously "AI-generated" look: neutral greys, generic card shadows, nothing that reads as a considered choice. That would have hurt the submission more than helped it.

**Tradeoffs:** Ant Design adds ~300 kB to the bundle (tree-shaken at build time, smaller than the raw number suggests). Its CSS-in-JS engine (`@ant-design/cssinjs`) adds a small runtime cost. For a production app I'd evaluate whether the bundle weight is acceptable; for this spec it is the right call.

---

## 1. Zustand over Context (built-in) or Redux

React's Context API ships with React — zero install, zero extra dependency. So why not use it?

Context is a *notification mechanism*, not a state-management solution. When any value in a Context changes, React re-renders **every component that consumes that context**, regardless of which slice of the value it actually uses. For a context object holding `{ randomUsers, savedUsers, loadingRandom, loadingSaved, … }`, every list row would re-render whenever the loading flag flips — even though the row only cares about its own user object.

To use Context correctly at this scale you would need to:
- Split into multiple contexts (one per concern: users, loading, errors)
- Wrap every setter in `useCallback` so consumers don't re-render on parent re-render
- Memoize derived values with `useMemo`
- Write a custom `useContextSelector` hook (not in React core) or accept the over-rendering

That is approximately 80% of what Zustand gives you, written from scratch, with more boilerplate and more ways to get it wrong. Context is the right tool for low-frequency values like theme or locale that rarely change. It is the wrong tool for list data that changes on every fetch.

**Why not Redux:** For 4 endpoints and 2 lists, Redux's setup (slices, reducers, selectors, middleware, Provider) costs more in ceremony than it returns in structure.

**Why Zustand:** Selector-based subscriptions out of the box — `useStore(s => s.savedUsers)` only re-renders when `savedUsers` changes. Async actions are plain `async` functions in the store. 1 kB gzipped, no Provider wrapping required.

**Tradeoff:** Zustand's devtools are less mature than Redux DevTools. In a production app with complex async flows I would use TanStack Query for server state and keep Zustand only for UI-only state (filters, modals, etc.).

---

## 2. MySQL over SQLite or JSON file

I chose MySQL 8 running in Docker because the spec said "be ready to defend your persistence choice" and a real relational DB shows the design more clearly.

**Why not JSON file:** Concurrent writes (even two tabs) can corrupt it. No query capability. Fine for a prototype but wrong for a multi-user service.

**Why not SQLite:** SQLite would have been fine here — single file, zero ops, synchronous API with `better-sqlite3`. I chose MySQL because it is already in the Docker network, phpMyAdmin adds free visibility into the data during development, and it demonstrates the same `mysql2` patterns you'd use in production. The tradeoff is ~30 seconds of MySQL init time on first boot.

**Production note:** I'd add an index on `email` and separate the schema migration into a proper migration tool (e.g., Flyway or Knex migrations).

---

## 3. Single debounced filter input at 200ms

Instead of two separate inputs (name / country), I used one `<Input>` that searches across both fields, debounced at 200ms.

**Why one input:** Users think "I'm looking for John from Canada", not "search name field, then country field". A single box is faster and requires no coordination. The tradeoff is you can't search for "Smith" and exclude a country simultaneously — acceptable for 10 results.

**Why 200ms:** Sub-100ms feels instant but causes re-filters on every keystroke which flickers on slower devices. 300ms is perceptibly laggy. 200ms is the UX sweet spot validated by Nielsen's response time research.

---

## BiDi / RTL Approach (Screen 3)

Screen 3 sets `dir="rtl"` directly on the Ant Design `<Flex>` card wrapper. This reverses flex child order so Hebrew labels (first child) land on the right without any CSS trickery. Each value cell carries a `<div dir="ltr">` wrapper so email addresses, phone numbers, and street numbers always read left-to-right inside the RTL card. A plain `<div>` is used here — not an antd component — because `dir` is a DOM attribute that antd layout components don't forward, and wrapping with an antd component just to hold one attribute adds noise with no benefit.

The name `<Input>` elements get a dynamic `dir` prop (via `getInputDir()`) rather than a fixed `ltr`: when the user types Hebrew the cursor tracks right-to-left; when typing Latin it tracks left-to-right. This eliminates the insertion-point jump that occurs when RTL context fights LTR input.

Buttons and the action bar live in a separate `<Flex>` outside the RTL card and stay in LTR order so their layout is unaffected.

---

## Corners cut

- **No auth / RBAC** — spec says not required.
- **tsx runtime in Docker** — no separate TypeScript compile step. In production I'd add `tsc --noEmit` in CI and ship compiled JS.
- **No optimistic delete** — delete waits for the server response. In production I'd remove the row immediately and restore it on error.
- **No pagination** — 10 random users and small saved lists. Would add cursor-based pagination at >100 rows.

---

## Filter design: gender toggle + age range slider, not just text

Beyond the required name/country text search, I added two additional filters: a gender toggle (All / Male / Female) and an age range slider. All three live in a single `FilterBar` component.

**Why a toggle instead of a checkbox:** A radio group makes the three states (all/male/female) mutually exclusive and immediately visible. A dropdown would hide the options. Checkboxes would suggest multi-select which isn't needed.

**Why a range slider for age:** The API returns users aged 18–90. A slider communicates the distribution space better than two number inputs; it is faster to interact with and visually matches what users expect for a range.

**Title prefix removed:** Mr/Ms/Dr is noisy data — it adds clutter without adding signal when scanning a list. The gender icon (♂/♀ in blue/pink) communicates the same information in one glyph with less space. This was an explicit product decision, not a default.

---

## Extension: Ant Design Skeleton loading

I added `<SkeletonList>` (using Ant Design's built-in `<Skeleton avatar>`) for both list screens instead of a spinner.

**Why this over other options:** A spinner tells the user "wait". A skeleton tells them "here's roughly what you'll see", which reduces perceived latency by anchoring expectations. It's also trivially free with Ant Design — one component, no extra CSS.

**Why not error boundaries or tests:** Error boundaries require a class component or a library; tests require a test runner setup. Both are valuable but cost more setup time than a skeleton. A skeleton produces immediately visible UX improvement for ~10 lines of code.

**What I'd do next:** Add per-row retry on failed save (show an inline error in the row with a retry button), and wrap the profile detail in an error boundary so a bad route state doesn't crash the whole app.
