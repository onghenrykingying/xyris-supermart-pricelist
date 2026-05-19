# CLAUDE.md — Project Instructions for Claude Code

> **Read this file first. It is the single source of truth for how this project is built.**
> Always check `docs/` for detailed specifications before implementing any feature.

---

## What this project is

**Xyris Supermart Pricelist** is a mobile-first public price list website for sari-sari (small neighborhood) store owners in the Philippines. It displays ~10,500 SKUs (products) sourced from a Google Sheet that the Xyris team updates manually. Store owners use the site to check current prices, then contact the business via Call / Messenger / Viber to place orders.

**It is NOT an e-commerce site.** There is no checkout, no cart, no payments, no accounts. The site's only job is: (1) help store owners find products and prices fast, and (2) funnel them to a chat-based ordering conversation.

## Tech stack (locked)

- **Frontend**: Next.js 14+ (App Router) + TypeScript + Tailwind CSS
- **Hosting**: Vercel (free tier)
- **Data source**: Google Sheets → Google Apps Script → JSON files in this repo → Vercel rebuilds on push
- **Repo**: GitHub (single repo for site + data files + Apps Script source)
- **No database, no backend server, no auth on the public site.**

## Non-negotiables

Read these carefully. They constrain every decision.

1. **Mobile-first.** Most users are on Android phones on cellular data. Every screen designed for 360px wide first, then enhanced for larger screens. Page weight under 500KB on first load.
2. **No product images, ever.** The catalog has 10,500+ SKUs. Typography and information hierarchy do all the visual work.
3. **Never expose sensitive columns.** See `docs/05-column-mapping.md`. The public JSON contains **only 6 fields** per SKU. Cost, supplier, and wholesale price must NEVER appear in any public file or API response.
4. **No accounts, no login, no popup on entry.** Store owners came to check prices — let them.
5. **All copy in English** with occasional Filipino warmth in CTAs (e.g., "Order na!" on the FAB is fine). Product names stay as-is in the data.
6. **Performance**: list of 10k SKUs must use virtualized rendering. Never naively `.map()` all 10k into the DOM.
7. **The Google Sheet is the source of truth.** The site is a read-only consumer. Never write back to the sheet from the site.

## File structure

```
xyris-supermart-pricelist/
├── CLAUDE.md                # ← you are here
├── README.md                # public project overview
├── package.json             # Next.js + dependencies (you create this)
├── .gitignore
├── docs/                    # ← READ THESE before implementing
│   ├── 01-architecture.md
│   ├── 02-brand-guide.md
│   ├── 03-data-pipeline.md
│   ├── 04-categories.md
│   ├── 05-column-mapping.md
│   ├── 06-validation-rules.md
│   ├── 07-publish-flow.md
│   ├── 08-ui-spec.md
│   ├── 09-cta-spec.md
│   ├── 10-order-list.md
│   └── 11-deployment.md
├── data/
│   ├── master-categories.csv   # canonical category list (12 cats, ~58 subcats)
│   └── sample-output/          # example JSON structure the Apps Script produces
│       ├── manifest.json
│       └── baby.json
├── apps-script/             # Google Apps Script source (deployed separately to Google)
│   ├── README.md
│   ├── Code.gs
│   ├── Config.gs
│   └── appsscript.json
├── app/                     # Next.js App Router pages (you create)
├── components/              # React components (you create)
├── lib/                     # utilities (you create)
└── public/
    └── data/                # JSON files committed by the Apps Script publish step
        ├── manifest.json
        ├── baby.json
        ├── beverages.json
        └── ... (one per category)
```

## Phased build plan

Do NOT try to build everything at once. Follow this order. Stop and ask the user before moving to the next phase.

### Phase 1 — Foundation (start here)
1. Initialize Next.js 14 with TypeScript and Tailwind: `npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --eslint`
2. Set up Tailwind config with the brand colors from `docs/02-brand-guide.md`
3. Create `lib/types.ts` with the `SKU` and `Manifest` TypeScript types (see `docs/05-column-mapping.md`)
4. Copy sample JSON files from `data/sample-output/` to `public/data/` so the site has something to render during dev
5. Build the homepage layout: header with logo + tagline, dummy CTA buttons (top-right), filter bar placeholder, empty SKU list placeholder
6. **STOP. Show the user. Get approval before Phase 2.**

### Phase 2 — Data loading and filtering
1. Build the data fetching logic in `lib/data.ts` — loads `manifest.json` first, then fetches category JSON on demand
2. Build the filter UI: Category → Sub-category → Brand (cascading dropdowns on mobile, sidebar on desktop)
3. Build the SKU list component with virtualized rendering (use `react-window` or `@tanstack/react-virtual`)
4. Implement search (client-side, fuzzy match on product name, brand, barcode)
5. Implement sort (price asc/desc, name asc)
6. Show "Last updated" timestamp from manifest
7. **STOP. Show the user. Get approval before Phase 3.**

### Phase 3 — CTAs and order list
1. Build the top-right "Order" button that expands into Call / Messenger / Viber options
2. Build the floating action button (FAB) — same expanding behavior, fixed bottom-right on mobile
3. Build the Viber channel CTA banner (dismissible, sits above the filter bar)
4. Build the repeating Viber channel card every ~20 SKU results
5. Build the order list feature (per-SKU "+" button → in-browser list → "Send via chat" pre-fills a message)
6. Wire all CTA links to the Settings tab data (loaded from `manifest.json`)
7. **STOP. Show the user. Get approval before Phase 4.**

### Phase 4 — Apps Script and deployment
1. Walk the user through deploying the Apps Script to their Google Sheet (see `apps-script/README.md`)
2. Set up GitHub repo connection
3. Deploy to Vercel
4. Test the end-to-end pipeline: edit sheet → click Publish → site updates within ~1 minute

## How to work in this codebase

- **Always read `docs/` before implementing.** The MD files contain decisions already made — don't second-guess them, don't propose alternatives unless you spot a real problem.
- **Ask the user when in doubt.** Especially for visual/UX decisions not specified in docs.
- **Keep components small and focused.** One responsibility per file.
- **Performance first.** Every component renders on a low-end Android phone over slow data. If you add a dependency, justify it.
- **Type everything.** No `any` in TypeScript.
- **Comment WHY, not WHAT.** Code shows what; comments explain why a non-obvious decision was made.

## Things you should NOT do

- ❌ Add a database, backend API, or server-side data fetching beyond what Next.js static generation provides
- ❌ Add authentication, accounts, or user tracking
- ❌ Add product images, even placeholder ones
- ❌ Add an e-commerce checkout flow
- ❌ Render all 10k SKUs at once without virtualization
- ❌ Include `unit_cost`, `wholeprice`, `sup_desc`, or any sensitive column in the public site
- ❌ Hardcode contact info (phone, Messenger URL, Viber link) — they live in the Settings tab and load via manifest
- ❌ Use heavy UI libraries (Material-UI, Ant Design). Tailwind only.
- ❌ Add animations or transitions that aren't functional (loading states, modal open/close are fine; decorative parallax is not)

## When you finish a phase

1. Run `npm run build` and make sure it succeeds with no errors
2. Test on mobile viewport (Chrome DevTools, 360px width)
3. Verify Lighthouse mobile score is 90+ for Performance and Accessibility
4. Commit with a clear message: `feat(phase-N): description`
5. Show the user what you built and what to test
6. Wait for approval before continuing

---

**Start here:** Read `docs/01-architecture.md`, then `docs/02-brand-guide.md`, then begin Phase 1.
