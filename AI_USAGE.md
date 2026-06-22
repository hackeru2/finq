# AI_USAGE.md

I used Claude (claude-sonnet-4-6 via Claude Code CLI) throughout this assignment. It generated the initial project scaffold, all boilerplate TypeScript types, the Zustand store structure, the mysql2 CRUD routes, the Ant Design component wiring, and the test suites. It also drafted this document and DECISIONS.md.

My role was directing the architecture: choosing MySQL over SQLite, specifying Zustand over Context or Redux, deciding on a single debounced filter input, and designing the RTL/LTR split in the profile detail (using `ConfigProvider direction="rtl"` with per-cell `dir="ltr"` overrides). I reviewed every generated file, caught a missing `dir="ltr"` on the name inputs that would have caused cursor-flip bugs in mixed Hebrew/Latin editing, and made the call to use `tsx` at runtime rather than a compiled build step for this dev-focused submission.

**On Ant Design:** I chose Ant Design explicitly — not Claude. Claude's default UI output is visually obvious (generic CSS resets, neutral greys, nothing that reads as a deliberate design choice). Ant Design is a component library I know well, it has been production-stable for years, and it is free under the MIT licence. Using it lets the code focus on logic rather than styling, which is where the interesting decisions live for this spec.

Every line in the repo is code I can explain and defend.
