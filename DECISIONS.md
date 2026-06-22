# DECISIONS.md

## 1. Zustand over Redux or Context

I chose Zustand for shared client state (random users list, saved users list, loading/error flags).

**Why not Redux:** For 4 endpoints and 2 lists, the Redux setup (slices, reducers, selectors, Provider) would add boilerplate that far exceeds its benefit at this scale. Redux shines when many independent components need to subscribe to fine-grained slices; here every subscriber wants the whole list.

**Why not Context:** Context triggers a re-render in every consumer on every update unless you carefully split contexts and memoize. Zustand uses a selector-based subscription model, so a component that only reads `savedUsers` won't re-render when `loadingRandom` changes. That's the right default for a list-heavy app.

**Tradeoff:** Zustand has no devtools story as rich as Redux. In a production app with complex async flows I'd reach for TanStack Query for server state and keep Zustand only for UI state.

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

Screen 3 uses `<ConfigProvider direction="rtl">` from Ant Design to flip the Descriptions layout so Hebrew labels render on the right. Inside each row, the content cell carries `direction: ltr` (CSS) so data (email, phone, address numbers) renders left-to-right.

The name `<Input>` elements explicitly carry `dir="ltr"`. This matters for cursor behaviour: without it, typing a Latin name after a Hebrew character can cause the insertion point to jump. With it, the browser always treats the field as a left-to-right input regardless of the surrounding RTL context.

Buttons live outside the `ConfigProvider` wrapper and stay in a LTR `<Space>` so their order and alignment are unaffected.

---

## Corners cut

- **No auth / RBAC** — spec says not required.
- **tsx runtime in Docker** — no separate TypeScript compile step. In production I'd add `tsc --noEmit` in CI and ship compiled JS.
- **No optimistic delete** — delete waits for the server response. In production I'd remove the row immediately and restore it on error.
- **No pagination** — 10 random users and small saved lists. Would add cursor-based pagination at >100 rows.

---

## Extension: Ant Design Skeleton loading

I added `<SkeletonList>` (using Ant Design's built-in `<Skeleton avatar>`) for both list screens instead of a spinner.

**Why this over other options:** A spinner tells the user "wait". A skeleton tells them "here's roughly what you'll see", which reduces perceived latency by anchoring expectations. It's also trivially free with Ant Design — one component, no extra CSS.

**Why not error boundaries or tests:** Error boundaries require a class component or a library; tests require a test runner setup. Both are valuable but cost more setup time than a skeleton. A skeleton produces immediately visible UX improvement for ~10 lines of code.

**What I'd do next:** Add per-row retry on failed save (show an inline error in the row with a retry button), and wrap the profile detail in an error boundary so a bad route state doesn't crash the whole app.
