# 09 — CTA Specification

## CTA inventory

Three CTAs in total. Each has a single purpose. Don't mix them.

| CTA | Intent | Where |
|---|---|---|
| **Order CTA** | Place an order via chat or call | Top-right header + bottom FAB (mobile) |
| **Viber Channel CTA** | Subscribe for weekly promos | Dismissible banner + repeated card every 20 SKUs + footer |
| **Add to Order** | Build an order list in-browser | `+` button on every SKU row |

## 1. Order CTA (the primary)

### Behavior

Click → reveals a sheet/menu with three options:

```
┌──────────────────────────────────┐
│  How would you like to order?    │
│                                  │
│  ☎  Call us                      │
│      0917 123 4567               │
│                                  │
│  💬 Message on Messenger          │
│                                  │
│  ◉  Chat on Viber                 │
│                                  │
│  [Cancel]                        │
└──────────────────────────────────┘
```

### Targets

All three open in the user's device app:

- **Call**: `<a href="tel:{settings.phoneCall}">`
- **Messenger**: `<a href="{settings.messengerUrl}">` (e.g., `https://m.me/xyrissupermart`)
- **Viber**: `<a href="{settings.viberChat}">` (e.g., `viber://chat?number=%2B639171234567`)

If the user has items in their order list, the Messenger and Viber options pre-fill a message with the order (see `10-order-list.md`). Call doesn't pre-fill anything (it's a voice call).

### Placement

- **Top-right header**: a single pill button labeled "Order ▾" with a phone icon. On tap, opens the sheet above.
- **Floating FAB (mobile only)**: 56px round button, bottom-right, brand-red, white phone+chat icon. Label: "Order na!" (extends into a pill on tap).
  - When order list has items: shows a badge with count, label changes to "Order (3)"

### Styling

- Header button: white background, brand-blue text, `rounded-full`, `shadow-sm`, height 40px
- FAB: brand-red background, white icon and text, `shadow-lg`, height 56px when collapsed, expands to ~140px wide when label is shown
- Sheet/menu: bottom sheet on mobile (slides up), dropdown menu on desktop (anchored to header button)

## 2. Viber Channel CTA (the secondary)

### Intent

Get the user to **subscribe** to a Viber channel where Xyris posts weekly promotions and price drops. This is a subscribe, not an order. **Do not place it next to the Order CTA** — the intents conflict.

### Placements

#### a) Dismissible banner (top of page)
- Renders below the header, above the search bar
- Background: brand-blue with white text
- Content: "📢 {settings.viberChannelLabel} →"
- Right side: `×` close button
- Dismissal persists in `sessionStorage` (per-tab): stays dismissed across refreshes in the same tab, re-shows on a new tab or after the browser is closed

#### b) Repeated card in the SKU list
- Every 20 SKUs, insert a card row (not absolutely positioned — it scrolls with the list)
- Card style: yellow background, blue text, "Join channel →" button on the right
- This is the highest-value placement — users scrolling through prices are warm leads

#### c) Footer link
- Plain text link in the footer area
- "Get weekly promos on Viber"

### Click target

All Viber Channel CTAs go to `{settings.viberChannelUrl}` — opens in a new tab.

## 3. Add to Order CTA

### Behavior

`+` button on every SKU row. On tap:

1. Adds the SKU to the in-browser order list (`localStorage`, key `xyris-order-list`)
2. Shows a brief toast: "Added to order"
3. Updates the count badges on the header Order button and FAB

If the SKU is already in the list, tapping `+` increments its quantity by 1.

### Styling

- 32×32px circular button, brand-yellow background, brand-blue `+` icon
- On press: brief scale-down animation (100ms)
- Disabled state: never disabled
- After tap: brief checkmark for 800ms, then back to `+`

### Removing items

Done via the order list bottom sheet (see `10-order-list.md`), not from the SKU row directly.

## Spec: what the Order CTA opens

A bottom sheet (mobile) or dropdown (desktop) with the three contact options listed above. The sheet has:

- A title: "How would you like to order?" (or "Pumili ng paraan ng pag-order" — optional Filipino)
- Three large tap targets (60px tall each), with icon + label + sublabel
- Each target is a full-width button. No styling on hover that suggests "primary" vs "secondary" — all three are equal
- The sheet closes when:
  - User taps an option (and the link opens)
  - User taps Cancel
  - User taps outside the sheet (mobile: backdrop tap; desktop: click outside)

## Order CTA with items in the list

When the order list has 1+ items, the sheet additionally shows a small summary at the top:

```
┌──────────────────────────────────┐
│  Your order: 3 items, ₱245.50    │
│  [View list]                     │
│  ────────────────────────────    │
│  How would you like to send it?  │
│  ...                             │
└──────────────────────────────────┘
```

Tapping "View list" navigates to the order list bottom sheet (see `10-order-list.md`).

The Messenger and Viber options now pre-fill the message with the order items.
