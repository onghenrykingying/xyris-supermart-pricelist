# 08 — UI Specification

## Pages

The site has exactly **one page** (single-page app within Next.js). All filtering, searching, and SKU browsing happens in-place via client-side state. No navigation between routes.

## Layout — mobile (360-768px, primary target)

```
┌────────────────────────────────────────┐
│ [Xyris Supermart logo]    [☎ Order ▾] │ ← Sticky header, yellow bg
│       Save More Live Bright           │
├────────────────────────────────────────┤
│ [Join Viber for weekly promos →]    × │ ← Dismissible banner
├────────────────────────────────────────┤
│ 🔍 Search products, brand, barcode...│ ← Search bar
├────────────────────────────────────────┤
│ [Category ▾] [Sub-cat ▾] [Brand ▾]   │ ← Filter chips
│ Sort: Price ↑ ↓ | Name                │
├────────────────────────────────────────┤
│ Showing 540 of 10,107  •  Updated 2h │
├────────────────────────────────────────┤
│ LAMPEIN MEDIUM 12'SX16          [+]   │
│ Lampein · Diapers                     │
│                              ₱81.55   │
├────────────────────────────────────────┤
│ LAMPEIN MEDIUM 4'SX40           [+]   │
│ Lampein · Diapers                     │
│                              ₱27.25   │
├────────────────────────────────────────┤
│ ... virtualized list ...              │
├────────────────────────────────────────┤
│ ┌────────────────────────────────┐    │
│ │ 📢 Get weekly promos on Viber │    │ ← Repeated every ~20 rows
│ │             [Join channel →]   │    │
│ └────────────────────────────────┘    │
├────────────────────────────────────────┤
│ ... more SKUs ...                     │
│                                       │
│ ─── Footer ───                        │
│ Manila, Philippines                   │
│ Prices subject to change.             │
└────────────────────────────────────────┘
                          ┌─────────────┐
                          │ 🛒 Order na!│ ← Floating FAB
                          └─────────────┘
```

## Layout — desktop (768px+)

Sidebar layout. Filters move into a left sidebar; SKU list takes the main area.

```
┌──────────────────────────────────────────────────────────────────┐
│ [Xyris Supermart logo]                       [☎ Order ▾]         │
│      Save More Live Bright                                       │
├────────────────────┬─────────────────────────────────────────────┤
│ FILTERS            │ [Join Viber for weekly promos →]        ×   │
│                    ├─────────────────────────────────────────────┤
│ 🔍 Search...       │ Showing 540 of 10,107  •  Updated 2h ago    │
│                    ├─────────────────────────────────────────────┤
│ Category           │ LAMPEIN MEDIUM 12'SX16              [+]     │
│ ◯ Beverages (540)  │ Lampein · Diapers                  ₱81.55   │
│ ◉ Baby (676)       ├─────────────────────────────────────────────┤
│ ◯ Beverages (540)  │ LAMPEIN MEDIUM 4'SX40               [+]     │
│ ◯ Canned (458)     │ Lampein · Diapers                  ₱27.25   │
│ ...                ├─────────────────────────────────────────────┤
│                    │ ... (virtualized) ...                       │
│ Sub-Category       │                                             │
│ ◯ Diapers (277)    │                                             │
│ ◯ Toiletries (227) │                                             │
│ ...                │                                             │
│                    │                                             │
│ Brand              │                                             │
│ [search brand...]  │                                             │
│ ☐ Lampein          │                                             │
│ ☐ Super Twins      │                                             │
│ ...                │                                             │
│                    │                                             │
│ [Clear all]        │                                             │
└────────────────────┴─────────────────────────────────────────────┘
```

## Component breakdown

### Header (`components/Header.tsx`)
- Sticky to top, yellow background (`#F8E27C`)
- Logo image left (use `public/logo.png`)
- Brand tagline below logo on mobile, beside logo on desktop
- "Order" button top-right (see `09-cta-spec.md`)
- Height: 64px on mobile, 80px on desktop

### Viber banner (`components/ViberBanner.tsx`)
- Below header, full-width
- Background: brand blue (`#264DAC`), white text
- "Join Viber for weekly promos" + arrow icon
- Right side: `×` close button. Dismissal stored in `sessionStorage` key `viberBannerDismissed` — stays dismissed within the same tab across refreshes, re-shows on a new tab or after the browser is closed.

### Search bar (`components/SearchBar.tsx`)
- Full-width input on mobile, 400px on desktop
- Placeholder: "Search products, brand, or barcode…"
- Icon: magnifying glass on the left
- Searches across `name`, `brand`, `code` (barcode)
- Debounced 150ms
- Search is fuzzy/contains — split query into tokens, all must match

### Filter UI (`components/Filters.tsx`)
- **Mobile**: three dropdown chips in a row (Category, Sub-category, Brand)
- **Desktop**: sidebar with radio lists for category/sub-category, checkbox + brand-search for brand
- Sub-category is only enabled after a category is picked
- Brand list is dynamic — populates from the manifest based on selected category/sub-category
- "Clear all" link visible only when any filter is active

### Result count + sort (`components/ResultMeta.tsx`)
- "Showing N of M" — M is the total post-filter count
- "Updated 2h ago" — relative time from `manifest.generatedAt`
- Sort dropdown: "Price low to high", "Price high to low", "Name A-Z", "Newest"

### SKU list (`components/SKUList.tsx` + `components/SKURow.tsx`)
- **Virtualized** — use `@tanstack/react-virtual` (preferred, smaller bundle than `react-window`)
- Each row 72px tall on mobile, 64px on desktop
- Row content:
  - Top line: product name, bold, 16px, truncate if too long with ellipsis
  - Bottom line: brand · sub-category, 14px, slate-500
  - Right: price, 18px, bold, brand-blue
  - Far right: `+` button (32×32px tap target) for adding to order list
- Tap row anywhere = same as tap `+` (adds to order list, shows brief toast)
- Hover state on desktop only: slight bg change

### Repeated Viber card (`components/ViberCard.tsx`)
- Injected into the virtualized list every 20 SKUs (index % 20 === 19)
- Styled like an SKU row but with brand-yellow background, brand-blue text, and a "Join channel →" button
- Renders as a list item, not absolutely positioned

### FAB (`components/OrderFAB.tsx`)
- Visible only on mobile (`md:hidden`)
- Fixed bottom-right, 24px margin
- 56px diameter circle, brand-red background, white icon + "Order na!" label
- Same expand-on-tap behavior as the header Order button
- Hides when keyboard is open (use VisualViewport API)

### Footer (`components/Footer.tsx`)
- Below the list
- Brand color light yellow background
- Settings values: address, footer note, copyright
- Small text, slate-500

## Interaction patterns

### Filtering changes
- All filter changes are instant client-side. No loading spinner.
- If a category file isn't loaded yet, show a tiny inline spinner inside the list (1-2 sec on first category open).

### Empty states
- "No products match your filters." with a "Clear all filters" link
- Don't show empty state during initial load — show a skeleton

### Loading states
- Initial page load: show logo + a subtle skeleton list (5 grey blocks)
- Category file fetch: tiny spinner in the result count area, don't replace the list

### Order list state
- Stored in `localStorage` (key: `xyris-order-list`)
- Indicator on the FAB and header CTA showing count: `Order (3)`
- Tapping the indicator opens a bottom sheet listing items with quantities, remove buttons, total, and "Send via Messenger / Viber / SMS" buttons (see `10-order-list.md`)

## Accessibility

- All interactive elements ≥ 44×44px tap target on mobile
- Focus rings visible (use `focus-visible:ring-2 focus-visible:ring-xyris-blue`)
- Semantic HTML: `<header>`, `<main>`, `<nav>`, `<ul>` for the list
- Alt text on logo: "Xyris Supermart"
- `aria-label` on icon-only buttons
- Color contrast ≥ 4.5:1 on all text

## Performance budget

- First Contentful Paint < 1.5s on Slow 4G
- Largest Contentful Paint < 2.5s
- Total JS bundle < 150KB gzipped
- Manifest fetch + first category render < 800ms
- Smooth 60fps scroll on 10k SKU virtualized list
