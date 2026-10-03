# 7 Grounded Directions: Bloomberg Terminal Density

*Derived from the Bloomberg terminal world — high-data financial terminal with dense tables, mono type, amber/green/red state, keyboard-first. Each direction translates this world's type, palette, density, and one signature move into the correlation budget portfolio dashboard.*

---

## 1. **Price Ladder Portfolio** — The Order Book as Portfolio

**Thesis**: The portfolio *is* an order book. Each project is a level; survival probability = fill probability; concentration = position risk.

**World translation**:
- **Palette/Material**: Near-black ground (`#0B0F14`), mono amber (`#E6B800`) for headers, mono green (`#00D084`) for positive delivery, mono red (`#FF4444`) for concentration breaches, slate (`#6A7A8A`) for metadata. No gradients.
- **Type/Composition**: `JetBrains Mono` throughout. Single size scale (13px base). Rank via weight (Bold/Regular) and reversal (light-on-dark vs dark-on-light). Tables use hairline rules (`#1E2A3A`).
- **Topology/Navigation**: Three vertical panes — Filter Rail (left, 280px), Order Book / Portfolio Table (center, flex), Risk Console (right, 320px). Keyboard shortcuts: `F` filter, `O` optimize, `R` risk, `C` compare.
- **Controls/State**: Toggle switches as `[ ]` / `[x]` brackets. Sliders as `[=====   ] 0.15` inline. Dropdown as `▼ USA ▸` with type-ahead. Loading = blinking cursor `_`. Error = `!` prefix in amber.
- **Responsive/Motion**: Desktop-first. Tablet collapses Risk Console into bottom drawer. Mobile stacks all three panes vertically with tabs. No animation on data; only the cursor blink and instant cell flash on update.

**Signature Move**: *Live cell flash* — when optimization re-runs, changed cells flash amber→green→settle in 300ms. The portfolio table feels alive like a trading screen.

**First Viewport**: Filter Rail shows active filters as pinned chips. Center table shows top 20 projects by tonnes with columns: `ID | Project | Ctry | Dev | Type | Reg | Tonnes | Px | Surv | $`. Right console shows Summary Cards (Cost, Delivery, C, 1/HHI) as mono blocks with amber labels, green values.

---

## 2. **Risk Model Manuscript** — LaTeX Precision as Dashboard

**Thesis**: The dashboard reads like a quant white paper — every number has provenance, every constraint is a theorem, every result is a proof.

**World translation**:
- **Palette/Material**: Warm paper ground (`#FDFBF7`), charcoal text (`#1A1A1A`), deep blue (`#1B3A5C`) for structure, rust (`#B84A2A`) for alerts, forest (`#2D5A3D`) for passes. No pure black.
- **Type/Composition**: `Newsreader` for prose (16px/1.6), `JetBrains Mono` for numbers (13px). Headlines in `Newsreader Display` Bold. Marginalia in mono at 11px. Generous leading. Tables as formal LaTeX `booktabs` — top/mid/bottom rules only, no vertical lines.
- **Topology/Navigation**: Single column scroll. Sticky TOC on left (desktop) showing: Filters → Parameters → Portfolio → Concentration → Stress Tests → Comparison. Each section numbered (1, 2, 3…).
- **Controls/State**: Parameters as inline `key = value` pairs with `[edit]` link. Editing opens a marginal dialog. Optimization status as marginal badge: `compiling…` `optimal` `infeasible`.
- **Responsive/Motion**: Tablet keeps single column, TOC becomes bottom sheet. Mobile same. Scroll-driven reveal: sections fade in at 20% viewport. No parallax.

**Signature Move**: *Marginal provenance* — hover any result cell, a marginal note appears showing the exact constraint, shadow price, and binding status. "C = 0.1423 ← binding: country cap Mexico 17.99% ≤ 18%"

**First Viewport**: Title block with model name, timestamp, seed. Filters as marginal `key = value` list. Parameters as aligned `key = value` with units. "Run Optimization" as a ruled button `[ RUN ]`.

---

## 3. **Trading Ticket Book** — Carbon-Copy Forms as Portfolio Lines

**Thesis**: Each project is a trading ticket — carbon copy, ruled fields, stamped states, immutable once written.

**World translation**:
- **Palette/Material**: Cream coupon stock (`#F5F0E8`), carbon purple (`#4A3A5A`) for filled fields, carrier navy (`#0B1D3A`) for headers, VOID red (`#C0392B`) for rejected, verified green (`#27AE60`) for accepted. Subtle paper texture.
- **Type/Composition**: `Space Grotesk` for headers (caps, tracked), `JetBrains Mono` for fields. Each ticket = one row = one project. Ruled grid with carbon-copy lines between tickets.
- **Topology/Navigation**: Left: Ticket Filter Stack (whitelist/blacklist as stamped toggles). Center: Ticket Ledger (vertical stack of tickets). Right: Settlement Summary (totals, stamps).
- **Controls/State**: Whitelist = `☑` green stamp. Blacklist = `☒` red VOID. Rating filter = perforated tear-off dropdown. Project cap = filled field with carbon smudge.
- **Responsive/Motion**: Tickets stack on mobile. Tablet shows 2-up. The "tear" animation on filter change — ticket slides out, new slides in. Settlement stamps ink in.

**Signature Move**: *Stamp confirmation* — when optimization completes, a `SETTLED` stamp in green ink lands on the portfolio total row with a subtle press animation. The audit trail is visible.

**First Viewport**: Filter Stack shows active stamps. Ticket Ledger shows first 8 tickets with ruled fields: `CCY | ID | PROJECT | COUNTRY | DEVELOPER | TYPE | REG | TONNES | PRICE | SURV | COST`. Settlement Summary shows 4 mono blocks: `GROSS TONNES | NET DELIVERY | TOTAL COST | CORR SCORE`.

---

## 4. **Correlation Heatmap Terminal** — Split-Flap Concentration Board

**Thesis**: Concentration is the signal. The dashboard is a split-flap board where HHI values cascade like departures — live, ranked, urgent.

**World translation**:
- **Palette/Material**: Matte black ground (`#000000`), split-flap white (`#F0F0F0`), amber row lamps (`#FFB800`), delay red (`#FF3333`), verified green (`#00CC66`). Steel frame border (`#333333`).
- **Type/Composition**: `Space Mono` for flaps (condensed, fixed-width cells). `IBM Plex Sans` for labels. Single size. Columns: `FACTOR | GROUP | SHARE | HHI | CAP | STATUS`. Status flaps: `OK` `WARN` `BREACH`.
- **Topology/Navigation**: Top bar: Model selector tabs `[Baseline] [Corr Budget] [Time-Aware] [Compare]`. Center: Split-flap board (scrollable). Bottom: Control strip with sliders as flap-style `[===---] 0.15`.
- **Controls/State**: Sliders as flap tracks. Toggles as flap `ON`/`OFF`. Parameter edits trigger cascade re-flap. Loading = full board cascade.
- **Responsive/Motion**: **Signature move = character-by-character flap animation** on data change. Each cell flaps through values. Reduced motion = instant flip. Mobile collapses to single next-breach view.

**Signature Move**: *Cascade re-flap* — when C_max changes, only breaching rows cascade. The board feels alive with risk.

**First Viewport**: Model tabs. Board shows top 15 concentration groups across all factors, ranked by HHI contribution. Bottom strip: `C_MAX [===---] 0.15 | TARGET [=====--] 100k | BUDGET [=======] 1M | RUN [EXECUTE]`.

---

## 5. **Transit Map Portfolio** — Concentration as Network Topology

**Thesis**: Correlation budget = transit system. Factors = lines. Groups = stations. Concentration = crowding. C_max = capacity.

**World translation**:
- **Palette/Material**: Deep navy ground (`#081426`), line colors: Developer `#FF6B35` (orange), Country `#00D4AA` (teal), Type `#FFD600` (yellow), Registry `#BB86FC` (purple). Station dots white. Transfer rings amber.
- **Type/Composition**: `IBM Plex Sans` for labels, `JetBrains Mono` for metrics. Route lines at 3px, station dots 8px. Concentration = dot size (area ∝ share²).
- **Topology/Navigation**: Full-screen SVG map. Left panel: Legend + Filters. Right panel: Station Detail (click station). Top bar: Model selector + C_max slider.
- **Controls/State**: Hover station = highlight line, show tooltip. Filter = dim non-matching lines. Optimize = recalculate routes (animated pathfinding).
- **Responsive/Motion**: **Signature move = route recalculation animation** — lines redraw with elastic easing when constraints change. Mobile = pan/zoom map. Tablet = side panel collapsible.

**Signature Move**: *Live route recalc* — change C_max, watch lines reroute and stations resize. The correlation budget is a capacity constraint visualized.

**First Viewport**: Map centered on portfolio. 4 lines (factors) with stations (groups) sized by concentration. Legend shows line colors. Right panel shows selected station detail: `Mexico (Country) | Share 17.99% | HHI 0.032 | Cap 18% | OK`.

---

## 6. **Regulatory Filing Dashboard** — SEC Form as Optimization Output

**Thesis**: The output is a regulatory filing — structured, auditable, sectioned, with every number traceable to a rule.

**World translation**:
- **Palette/Material**: White ground (`#FFFFFF`), SEC blue (`#002B5C`) for headers, charcoal (`#2D2D2D`) for body, gray (`#666666`) for metadata, red (`#CC0000`) for flags. Clean, print-ready.
- **Type/Composition**: `Source Serif 4` for prose (15px/1.55), `JetBrains Mono` for tables (12px). Section numbers: `ITEM 1`, `ITEM 1.A`, `ITEM 1.B`. Tables with `booktabs` rules.
- **Topology/Navigation**: Sticky section navigator on left: `ITEM 1: Filters` → `ITEM 2: Parameters` → `ITEM 3: Portfolio` → `ITEM 4: Concentration` → `ITEM 5: Stress Tests` → `ITEM 6: Comparison` → `ITEM 7: Certification`.
- **Controls/State**: Parameters as `Field: Value` with `†` footnote markers. Optimization status as `ITEM 3.1: Status — OPTIMAL (SCIP, 0.43s)`. Flags as `⚠` in margin.
- **Responsive/Motion**: Print stylesheet included. Screen: single column, sticky navigator. Mobile: navigator as bottom drawer. No animation.

**Signature Move**: *Footnote traceability* — every result cell has a `†n` linking to the exact constraint, parameter, or data source in the margin. "Total Cost $279,877.61†3.2†4.1" → click → shows binding constraints.

**First Viewport**: Header: `FORM CB-PM | Correlation Budget Portfolio Model | As of 2026-10-03 14:32 UTC`. ITEM 1: Active filters as `Field: Value` list. ITEM 2: Parameters table. `[ RECOMPUTE ]` button at ITEM 2 end.

---

## 7. **Quant Dashboard Terminal** — Minimalist Density with One Accent

**Thesis**: Pure density. One accent color. Everything else is structure, hierarchy, and mono type. The category standard, executed at craft ceiling.

**World translation**:
- **Palette/Material**: `#0D1117` ground, `#FFFFFF` text, `#7EE787` (terminal green) as sole accent. Borders `#30363D`. No other colors.
- **Type/Composition**: `JetBrains Mono` exclusively. 12px base. Scale: 10px/11px/12px/14px/16px/20px/28px. Weight only (400/600/700). Tables: tight, sortable, virtualized.
- **Topology/Navigation**: Top bar: `Filters | Params | Portfolio | Concentration | Stress | Compare` as command-palette tabs (`⌘K` opens). Main: active tab panel. Right drawer: live metrics (pinned).
- **Controls/State**: Native `<select>`, `<input type=range>`, `<input type=checkbox>` styled to terminal. `:focus` = green outline. Loading = spinner in tab label.
- **Responsive/Motion**: Standard responsive tables (horizontal scroll). Mobile: tabs as dropdown. No motion except focus ring.

**Signature Move**: *Command palette* — `⌘K` opens fuzzy search over all projects, filters, parameters. Type "mex" → filters to Mexico. Type "cmax" → jumps to C_max slider. Power-user first.

**First Viewport**: Top tabs. Portfolio table (virtualized, 100 rows). Right drawer: `COST $279,877.61 | DELIVERY 100,000.0t | C 0.1423 | 1/HHI 7.0`. Footer: `SCIP optimal 0.43s | 4355 projects | 19 selected`.

---

## Ordering by Resonance

1. **Quant Dashboard Terminal** — Most honest to "Bloomberg terminal density", directly usable by portfolio managers
2. **Price Ladder Portfolio** — Strongest mechanism fit (portfolio as order book)
3. **Trading Ticket Book** — Strong domain metaphor, good for audit trail ← **ASSIGNED (index 3)**
4. **Correlation Heatmap Terminal** — Best signature move for concentration monitoring
5. **Risk Model Manuscript** — Best for audit/regulatory use case
6. **Transit Map Portfolio** — Novel but risks "costume" territory per mode rules
7. **Regulatory Filing Dashboard** — Accurate but least "dashboard-like"

**Assigned Index (roll)**: 3 → **Trading Ticket Book**

**Impeccable's Pick**: **Quant Dashboard Terminal** (index 1) — *Honest risk: familiar category standard, but executed at craft ceiling with command-palette power user affordance the category lacks.*