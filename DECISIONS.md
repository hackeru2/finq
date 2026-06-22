# DECISIONS.md

## Decision 1: Zustand for shared state instead of React Context

I put `randomUsers` and `savedUsers` in a Zustand store rather than React Context because Context re-renders **every consumer** whenever any value in the object changes. A single fetch would re-render every list row even if its own data hadn't changed. Zustand's selector subscriptions (`useStore(s => s.savedUsers)`) limit re-renders to the slice that actually changed.

**Tradeoff:** Zustand is an extra dependency. Context would have worked fine for this scale — 10 users, 4 screens — and a good developer could avoid the over-rendering problem with `useMemo` + split contexts. Zustand was still the right call because it keeps async actions (fetch, save, delete) co-located with state instead of scattered across `useEffect` hooks in multiple components. In production I'd layer TanStack Query on top for caching, background refetch, and stale-while-revalidate — Zustand would then hold only UI-only state like filter values.

---

## Decision 2: Debounced filter input at 200 ms instead of filtering on every keystroke

The text filter runs on every render of the list. Firing it on every keypress means re-filtering 10 rows on every character typed. I debounced the `FilterState` update to 200 ms so the filter only runs after the user pauses.

**Tradeoff:** 200 ms introduces a tiny lag that is imperceptible to humans (Nielsen's research puts the "instant" threshold at 100 ms for response and 1000 ms for flow interruption — 200 ms sits safely in the middle). Going lower, say 50 ms, would feel identical but fire the filter 4× more often. Going higher, say 500 ms, would feel sluggish on fast typists. In production with a server-side search hitting a real database, I'd raise the debounce to 300–400 ms to reduce API calls and add a loading indicator so the user knows the search is in flight.

---

## Decision 3: MySQL 8 + Prisma ORM for the persistence layer

I chose MySQL 8 in Docker over SQLite, accessed through Prisma ORM rather than raw `mysql2` queries. MySQL gives row-level locking (two simultaneous saves from different tabs don't queue), prepared statements that block SQL injection by default, and phpMyAdmin (port 8080) as a zero-setup admin panel. Prisma adds schema-first TypeScript types generated from `schema.prisma`, a clean OOP `UserRepository` class (`findAll`, `create`, `update`, `delete`) instead of SQL strings scattered across route handlers, and built-in `prisma studio` for dev debugging.

**Tradeoff:** MySQL adds ~25 s on first boot; handled with `healthcheck` + `depends_on: service_healthy` so the backend waits. Prisma adds ~50 ms to cold queries vs raw `mysql2`, but at this scale (10–100 rows) the delta is unmeasurable. SQLite would have been zero-config; raw SQL would have been faster to write. In production I'd add versioned migrations (Prisma Migrate) and benchmark hot-path queries against raw SQL if latency became a concern.

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

Added gender, age range (slider), and country (multi-select) filters behind a modal button. Filters stay hidden until needed — a persistent bar wastes vertical space. When active, the button turns blue with a badge count. Text search stays inline since it's the most frequent action. Draft-then-apply prevents re-filtering on every slider drag.

**With more time:** Connect a vision AI agent (Claude API, server-side) to analyse each profile photo and return an age/gender match score — shown as a ✓ or ⚠ badge on the avatar. Real identity products can't trust user-supplied data blindly; this turns a static photo into a data-quality signal.
