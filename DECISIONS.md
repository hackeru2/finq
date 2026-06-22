# DECISIONS.md

## 0. Icons over text labels wherever meaning is universal

Cognitive science research consistently shows the human brain processes a recognised icon in ~150 ms — roughly twice as fast as reading the equivalent word. This is because icon recognition is handled by the visual cortex (pre-attentive processing) while reading activates the language centres and requires sequential decoding. In scanning a list of ten rows, a user spends cognitive budget on names and details; every piece of metadata that can be communicated visually instead of verbally frees up that budget.

This app applies the principle in three places:

| Data | What was replaced | What is shown now | Why it is universally understood |
|---|---|---|---|
| Gender | "male" / "female" text tag | ♂ `ManOutlined` (blue) / ♀ `WomanOutlined` (pink) | Mars/Venus symbols with culturally consistent colour coding are recognised globally without reading |
| Country | Country name text | Flag emoji + hover tooltip | National flags are among the most widely recognised symbols on Earth; the tooltip preserves full accessibility |
| Contact type | Bare phone/email strings | `PhoneOutlined` / `MailOutlined` before each value | Icons preemptively answer "what type of thing is this?" before the user reads the value |

**Hover-tooltip rule:** Every icon that replaces a text value **must** carry a `<Tooltip title={value}>` so keyboard/screen-reader users and anyone unfamiliar with the symbol can still access the full label. Icon-only without a fallback is an accessibility failure, not a design win.

**When not to use an icon:** Labels for editable fields (שם, מגדר, כתובת…) remain as text because the icon for "street address" or "date of birth" is not universally agreed on. Forcing an icon there would slow comprehension, not speed it up.

---

## 0a. Ant Design over plain CSS or another component library

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

## 2. MySQL 8 + phpMyAdmin

### Why MySQL over SQLite or a JSON file

**JSON file** — concurrent writes (even two browser tabs) can corrupt the file. No query capability, no transactions, no referential integrity. Fine for a config store; wrong for user data that is read, written, and updated concurrently.

**SQLite** — a legitimate choice: single file, zero operational overhead, synchronous API via `better-sqlite3`. I ruled it out for two reasons. First, MySQL is the database teams reach for in production Node.js stacks — using `mysql2` here demonstrates the exact connection-pool, prepared-statement, and error-handling patterns an interviewer would expect to see in a real service. Second, running MySQL in Docker means the entire data layer is self-contained and identical across every machine, with no dependency on the host's SQLite version or file-system permissions.

**Why MySQL 8 specifically:** Row-level locking (vs. SQLite's table-level lock) handles concurrent saves without contention. The `mysql2` driver is the industry-standard Node.js client — promise-based, uses prepared statements by default (protecting against SQL injection), and supports connection pooling out of the box. MySQL 8 also introduced `DEFAULT_AUTHENTICATION_PLUGIN=caching_sha2_password`, which is more secure than the legacy `mysql_native_password` used in older versions.

**Tradeoff:** MySQL takes ~20–30 seconds to initialise on first boot. The `docker-compose.yml` handles this with a `healthcheck` + `depends_on: condition: service_healthy` so the backend only starts once MySQL is actually ready to accept connections.

**Production note:** I'd add an index on `email` and migrate the inline `initDb()` schema to a proper migration tool (Flyway or Knex migrations) so schema changes are versioned and reversible.

---

### Why phpMyAdmin

phpMyAdmin is a web-based GUI for MySQL that runs as a fourth container in the Docker Compose stack and is accessible at `http://localhost:8080`. It requires no installation beyond a single line in `docker-compose.yml`.

**Why it earns its place:**

- **Zero-friction data inspection during development.** Instead of dropping into a terminal and writing `SELECT * FROM users WHERE ...`, you can browse the `users` table, inspect every column (including `original_first_name` / `original_last_name`), and see the effect of each save/update in real time. This cuts debug cycles significantly.
- **Schema visibility.** phpMyAdmin renders the full table structure — column types, defaults, nullable flags, indexes — in a single view. This makes it immediately obvious when a migration ran correctly (or didn't).
- **No credentials to manage.** The `docker-compose.yml` passes `PMA_HOST`, `PMA_USER`, and `PMA_PASSWORD` as environment variables so phpMyAdmin auto-connects. The reviewer or interviewer can open `localhost:8080` with zero configuration and inspect live data instantly.
- **Demonstrates operational awareness.** Choosing to include a DB admin panel signals that the developer thinks beyond the code — they consider observability and debuggability as first-class concerns, not afterthoughts.

**Why not a heavier alternative (DBeaver, TablePlus, MySQL Workbench):** Those tools require a separate desktop installation and manual connection setup. phpMyAdmin runs in Docker alongside everything else — no setup, no version conflicts, works on any OS.

---

## 3. Filter modal behind a button, not an always-visible filter bar

Gender, age range, and country filters live inside a modal that opens from a "Filters" button. The text search stays visible inline at all times.

**Why a modal rather than always-visible controls:**
An always-visible filter bar takes up permanent vertical space above the list, pushing content down even when the user has no intention of filtering. The majority of list views are browsed without filtering — the controls are noise for most interactions. Hiding them behind a button gives the list more room and reduces visual clutter by default.

**Active-state button:** When any modal filter is set, the button switches to `type="primary"` (filled blue) and a red badge shows the count of active filters. The user always knows at a glance whether the list is filtered without having to inspect the controls. This is the same pattern used by Airbnb, Booking.com, and most mobile-first filter UIs.

**Why text search stays outside the modal:** Text search is the fastest, most common filter action — typing a name to jump to a result. Putting it inside a modal would add two extra clicks (open → type → close) to the most frequent interaction. The modal is for precision filters that require deliberate configuration.

**Draft-then-apply:** Changes inside the modal are not applied to the list until the user clicks Apply. This prevents the list from re-filtering on every slider drag or radio click while the modal is open. Cancel discards the draft; Reset All clears all modal filters immediately.

**Country filter (new):** A searchable Select populated dynamically from the countries present in the current user list. It is exact-match (not substring), so it complements rather than duplicates the text search which already handles name filtering.

---

## 3a. Single debounced filter input at 200ms

Instead of two separate inputs (name / country), I used one `<Input>` that searches across both fields, debounced at 200ms.

**Why one input:** Users think "I'm looking for John from Canada", not "search name field, then country field". A single box is faster and requires no coordination. The tradeoff is you can't search for "Smith" and exclude a country simultaneously — acceptable for 10 results.

**Why 200ms:** Sub-100ms feels instant but causes re-filters on every keystroke which flickers on slower devices. 300ms is perceptibly laggy. 200ms is the UX sweet spot validated by Nielsen's response time research.

---

## BiDi / RTL Approach (Screen 3)

Screen 3 sets `dir="rtl"` directly on the Ant Design `<Flex>` card wrapper. This reverses flex child order so Hebrew labels (first child) land on the right without any CSS trickery. Each value cell carries a `<div dir="ltr">` wrapper so email addresses, phone numbers, and street numbers always read left-to-right inside the RTL card. A plain `<div>` is used here — not an antd component — because `dir` is a DOM attribute that antd layout components don't forward, and wrapping with an antd component just to hold one attribute adds noise with no benefit.

The name `<Input>` elements get a dynamic `dir` prop (via `getInputDir()`) rather than a fixed `ltr`: when the user types Hebrew the cursor tracks right-to-left; when typing Latin it tracks left-to-right. This eliminates the insertion-point jump that occurs when RTL context fights LTR input.

Buttons and the action bar live in a separate `<Flex>` outside the RTL card and stay in LTR order so their layout is unaffected.

---

## Name-change history in Saved Profiles

When a saved profile's name is edited, the original name is preserved and shown in the list as a small muted line directly under the current name:

```
♂  Jane Smith
   🕐 was John Smith
```

**Why this is the right UX decision:**

Editing a name is a lightweight action — one click, two fields, one button. There is no confirmation dialog, no audit log visible anywhere else, and no undo. Without the history label, a user who comes back to the list a week later has no way to know whether "Jane Smith" was always named that, or was previously someone else. This matters in a contact-management context: names are identity. Silently overwriting them without a trace destroys context.

Showing the original name also catches accidental edits. If a user fat-fingers a name and saves it, the "was …" label makes the mistake immediately visible the next time they see the list — without requiring a separate history screen, an undo stack, or any extra navigation.

The label is intentionally subtle (11 px, `type="secondary"`). Users who don't need it don't see it as noise; users who do need it can't miss it.

**Why store it in the DB rather than in the client:**
Client-side state is lost on refresh. The original name must survive across sessions, browser restarts, and multiple devices — so it belongs in the database, not in Zustand or localStorage.

**Implementation:** Two DB columns `original_first_name` / `original_last_name` are set at INSERT time equal to the initial name and never updated by PATCH. A startup backfill seeds them for rows predating this feature.

**Rule:** `PATCH /users/:id` must never touch `original_first_name` or `original_last_name`. The `nameChanged()` utility in `frontend/src/utils/nameHistory.ts` is the single source of truth for the comparison — never inline it.

---

## Corners cut

- **No auth / RBAC** — spec says not required.
- **tsx runtime in Docker** — no separate TypeScript compile step. In production I'd add `tsc --noEmit` in CI and ship compiled JS.
- **No optimistic delete** — delete waits for the server response. In production I'd remove the row immediately and restore it on error.
- **No pagination** — 10 random users and small saved lists. Would add cursor-based pagination at >100 rows.

---

## Long text in profile fields: ellipsis + hover tooltip

Profile fields like email can be longer than the card width. Instead of letting them overflow or hard-wrapping (which breaks layout), long values are clipped with `…` and the full value is shown on hover via Ant Design's `Typography.Text ellipsis={{ tooltip: value }}`. This requires the value to be inside a `display: block` span so the browser has a width boundary to truncate against.

**Rule:** Any single-line data value that can be arbitrarily long (email, URL, ID) must be wrapped in `<Typography.Text ellipsis={{ tooltip: value }}>`. Multi-line values (address, description) use CSS `wordBreak: 'break-word'` instead.

---

## Country flag instead of country name text

Country is displayed as a flag emoji, not as text. Hovering shows the full country name via Ant Design `<Tooltip>`. Flag emojis are generated from ISO 3166-1 alpha-2 codes using Unicode regional indicator characters (no image assets, no external library). The `countryFlag()` utility maps the country name strings returned by randomuser.me to ISO codes, covering every nationality in our `&nat=` filter list.

**Rule:** Never render a raw country name string in the UI. Always use `countryFlag(user.country)` wrapped in `<Tooltip title={user.country}>`.

---

## Nationality filter on randomuser.me

The app validates that names are Hebrew or English only. The `randomuser.me` API without a `nat=` parameter can return users from Iran (IR), whose names use Farsi/Arabic script, Serbia (RS) and Ukraine (UA) with Cyrillic, and India (IN) with Devanagari. These names would fail validation and confuse the user.

**Fix:** The API call includes `&nat=au,br,ca,ch,de,dk,es,fi,fr,gb,ie,mx,nl,no,nz,us` — only Latin-script nationalities. This is a deliberate constraint, not an accidental omission: we want the fetched data to be consistent with what the validation rules allow to be saved.

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
