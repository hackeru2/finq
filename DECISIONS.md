# DECISIONS.md

## Decision 1: Zustand for shared state instead of React Context

I put `randomUsers` and `savedUsers` in a Zustand store rather than React Context because Context re-renders **every consumer** whenever any value in the object changes. A single fetch would re-render every list row even if its own data hadn't changed. Zustand's selector subscriptions (`useStore(s => s.savedUsers)`) limit re-renders to the slice that actually changed.

**Tradeoff:** Zustand is an extra dependency. Context would have worked fine for this scale — 10 users, 4 screens — and a good developer could avoid the over-rendering problem with `useMemo` + split contexts. Zustand was still the right call because it keeps async actions (fetch, save, delete) co-located with state instead of scattered across `useEffect` hooks in multiple components. In production I'd layer TanStack Query on top for caching, background refetch, and stale-while-revalidate — Zustand would then hold only UI-only state like filter values.

---

## Decision 2: Debounced filter input at 200 ms instead of filtering on every keystroke

The text filter runs on every render of the list. Firing it on every keypress means re-filtering 10 rows on every character typed. I debounced the `FilterState` update to 200 ms so the filter only runs after the user pauses.

**Tradeoff:** 200 ms introduces a tiny lag that is imperceptible to humans (Nielsen's research puts the "instant" threshold at 100 ms for response and 1000 ms for flow interruption — 200 ms sits safely in the middle). Going lower, say 50 ms, would feel identical but fire the filter 4× more often. Going higher, say 500 ms, would feel sluggish on fast typists. In production with a server-side search hitting a real database, I'd raise the debounce to 300–400 ms to reduce API calls and add a loading indicator so the user knows the search is in flight.

---

## Decision 3: MySQL 8 over SQLite for the persistence layer

I chose MySQL running in Docker over SQLite because MySQL demonstrates the patterns that actually matter in a production Node.js service: a connection pool (`mysql2/promise` `createPool`), prepared statements that prevent SQL injection by default, and row-level locking that handles concurrent writes without contention. SQLite would have worked, but it uses a table-level write lock — two simultaneous saves from different browser tabs would queue. I also included phpMyAdmin (port 8080) as a zero-setup DB admin panel. In development it lets you inspect rows instantly without a terminal. In production it doubles as an emergency tool — a webmaster can fix a malformed record directly in minutes rather than waiting for a developer hotfix deploy (access should be IP-restricted in prod).

**Tradeoff:** MySQL adds ~25 seconds on first boot while the container initialises. I handled this with a `healthcheck` + `depends_on: condition: service_healthy` in docker-compose so the backend waits for MySQL to be ready. SQLite would have started instantly with zero config. In production I'd also move the inline `initDb()` schema to versioned migrations (Knex or Flyway) so schema changes are reversible and auditable.

---

## UI: zero raw HTML — Ant Design components only

Every element in the component tree is an Ant Design component. Layout uses `<Flex>` instead of `<div>`, inline text uses `<Typography.Text>` instead of `<span>`. Hover and click feedback on list rows is driven by `theme.useToken()` — reading `token.colorFillAlter` (hover) and `token.colorFillSecondary` (active/click) directly from the antd design-token system so the colours stay consistent if the theme ever changes. No CSS files, no inline hex values for interactive states.

---

## RTL / LTR mixed-direction approach (Screen 3)

Screen 3 sets `dir="rtl"` on the outer `<Flex>` card wrapper. This makes the browser treat the whole card as RTL: flex children reverse order automatically so Hebrew labels sit on the right without any CSS `float` or `margin` hacks. The single `dir` attribute does the layout work.

Value cells (email, phone, street number) use `<Flex style={{ direction: 'ltr' }}>` so those values always read left-to-right inside the RTL card. CSS `direction` is forwarded via the `style` prop on any antd component, so no raw `<div>` is needed.

The name `<Input>` fields get a dynamic `dir` from `getInputDir()`: if the user types Hebrew the cursor moves right-to-left; Latin text moves left-to-right. Without this, an RTL-context input with LTR content shows the cursor at the wrong end, which is disorienting. The action buttons live in a separate `<Flex>` outside the RTL card so their order is unaffected.

---

## Corners cut deliberately

- **No auth / RBAC** — spec says not required. In production: JWT + refresh tokens, role-based route guards.
- **`tsx` runtime in Docker** — TypeScript runs directly via `tsx watch`, no compile step. Fast for dev. In production: `tsc --noEmit` in CI to catch type errors, ship compiled JS.
- **No optimistic UI on delete** — the row waits for the server response before disappearing. In production: remove the row immediately, restore it on error with an inline retry.
- **No pagination** — 10 random users, small saved lists. In production: cursor-based pagination at the API level, virtual list rendering in the UI at >100 rows.

---

## Extension: filter modal with active-state button

Beyond the required name filter I added gender (All / Male / Female radio), age range (slider, 0–100), and country (multi-select) filters. All three live inside a modal behind a "Filters" button rather than an always-visible bar — a filter bar eats permanent vertical space even when the user isn't filtering, which is most of the time.

When any modal filter is active the button switches to `type="primary"` (filled blue) and shows a red badge with the count of active filters. The user always knows at a glance whether the list is filtered without inspecting the controls. The text search stays inline outside the modal because it's the most frequent action — putting it inside would cost two extra clicks every time.

**What I'd do next:** Add a saved-search feature — let users name and store a filter combination. Add a URL-based filter state (`?gender=female&country=France`) so filtered views are shareable and survive a page refresh.
