# 10 — Order List Feature

A lightweight, browser-local order builder. **No checkout, no cart, no payment.** Its only purpose is to generate a pre-filled chat message that the user sends via Messenger / Viber / SMS to place an actual order with Xyris's human team.

## Storage

```ts
// localStorage key: "xyris-order-list"
interface OrderListEntry {
  code: string;       // SKU barcode
  name: string;       // product name (snapshot — doesn't update if price changes)
  price: number;      // price at time of adding
  quantity: number;   // user-controlled
}

type OrderList = OrderListEntry[];
```

The list survives page reloads but lives only in the user's browser. Clearing site data wipes it. No server-side persistence.

## UI

### Order list bottom sheet

Opened from the Order CTA "View list" link, or from the FAB count badge.

```
┌────────────────────────────────────────┐
│  Your order (3 items)              ×   │
├────────────────────────────────────────┤
│  LAMPEIN MEDIUM 12'SX16                │
│  ₱81.55 each                           │
│  [ − ] 2 [ + ]              ₱163.10    │
│                          [Remove]      │
├────────────────────────────────────────┤
│  SURF KALAMANSI 70G                    │
│  ₱8.50 each                            │
│  [ − ] 10 [ + ]              ₱85.00    │
│                          [Remove]      │
├────────────────────────────────────────┤
│  ...                                   │
├────────────────────────────────────────┤
│                                        │
│  Total: ₱248.10                        │
│                                        │
│  Send your order via:                  │
│  [ Messenger ]  [ Viber ]  [ SMS ]     │
│                                        │
│  [Clear list]                          │
└────────────────────────────────────────┘
```

### Empty state

When the list is empty (and the sheet is somehow opened):

```
Your order list is empty.

Tap the + on any product to add it.

[Browse products]
```

## Pre-filled message format

When the user taps Messenger, Viber, or SMS, build a message string and open the appropriate URL:

```
Hi Xyris! I'd like to order:

• LAMPEIN MEDIUM 12'SX16 × 2 — ₱163.10
• SURF KALAMANSI 70G × 10 — ₱85.00
• LUCKY ME PANCIT CANTON 60g × 24 — ₱192.00

Total: ₱440.10

Thank you!
```

Format rules:
- Greeting line: `Hi {settings.brandName}! I'd like to order:`
- One line per item: `• {name} × {quantity} — ₱{lineTotal}`
- Blank line, then: `Total: ₱{grandTotal}`
- Blank line, then: `Thank you!`
- All prices formatted with 2 decimal places, comma thousands separator (Philippine convention)

## Link targets

### Messenger
```
{settings.messengerUrl}
```
Messenger doesn't reliably support URL-pre-filled messages. Copy the message to clipboard automatically and show a toast: "Order copied — paste it in Messenger". Then open the URL.

### Viber
```
viber://forward?text={encodeURIComponent(message)}
```
On mobile, this opens Viber with a share sheet pre-populated with the message. Note: on some Android versions this is unreliable; fall back to the same clipboard-copy + toast pattern as Messenger.

### SMS
```
sms:{settings.phoneCall}?body={encodeURIComponent(message)}
```
Works reliably on both iOS and Android. Opens the user's default SMS app with the message and the Xyris number pre-filled.

## Empty list behavior

- If the order list is empty when the user opens the Order CTA, **skip the "Your order" summary** at the top of the sheet. Show only the three contact options.
- The Messenger / Viber / SMS targets are then just `tel:` / `messenger url` / `viber:` with no pre-filled message.

## Quantity controls

- Minimum quantity: 1 (tapping `−` at quantity 1 → removes item, with confirmation toast)
- Maximum quantity: 999 (sanity limit)
- Direct edit: tapping the quantity number opens a small number input

## Clear list

- "Clear list" button at the bottom of the sheet
- Shows confirmation: "Clear all items?" → [Cancel] [Clear]
- On confirm: empties localStorage, updates badges, shows toast "Order list cleared"

## Edge cases

- **User adds an item, then the price changes via a republish**: the order list keeps the old price (it's a snapshot of what the user agreed to). When they send the message, the team sees the snapshot price and can clarify if it differs. This is acceptable behavior — pricing is a conversation, not a contract.
- **User clears browser data**: the list is gone. We accept this. No recovery mechanism.
- **User has two devices**: lists don't sync. Each device has its own. Acceptable.
- **User shares the URL**: the receiving user gets a fresh empty list. Lists are not shareable via URL.
