# 03 — Data Pipeline

## Source of truth

A single Google Sheet owned by the dedicated `xyris.system@gmail.com` (or similar) company Gmail account. Editors are individual team members with their personal Gmails granted Edit access.

## Sheet structure

The master sheet has these tabs:

### Tab 1: `SKUs_Master` (the product list)

Columns (14, in this exact order):

1. `prod_code` — barcode (string, 13 digits typically)
2. `prod_desc1` — product name (string)
3. `unit_cost` — what Xyris pays (number) **🚫 NEVER published**
4. `sell_price` — retail price per piece (number, may contain commas like "1,437.10")
5. `sup_code` — supplier code **🚫 NEVER published**
6. `sup_desc` — supplier name **🚫 NEVER published** (but read internally to filter "DELETE")
7. `dept_code` — old categorization **⛔ ignored entirely**
8. `dept_desc` — old categorization **⛔ ignored entirely**
9. `whole_code` — wholesale barcode **⛔ ignored entirely**
10. `uom_code` — units per case **⛔ ignored entirely**
11. `wholeprice` — case price **🚫 NEVER published**
12. `New Category` — filter L1 (string)
13. `New Sub Category` — filter L2 (string)
14. `Brands` — filter L3 (string)

### Tab 2: `Categories` (canonical category list)

Two columns: `Category`, `Sub-Category`. This is the reference list that validation checks against. Copy `data/master-categories.csv` into this tab on initial setup.

### Tab 3: `Settings` (editable site config)

Two columns: `key`, `value`. The Apps Script reads this tab and includes its content in `manifest.json` so the site can use it without redeployment.

Required keys:

| key | example value | used for |
|---|---|---|
| `brand_name` | `Xyris Supermart` | site header |
| `brand_tagline` | `Save More Live Bright` | header subtitle |
| `phone_call` | `+639171234567` | "Call us" CTA (E.164 format) |
| `phone_display` | `0917 123 4567` | text shown to user |
| `messenger_url` | `https://m.me/xyrissupermart` | Messenger CTA |
| `viber_chat` | `viber://chat?number=%2B639171234567` | Viber 1-on-1 chat |
| `viber_channel_url` | `https://invite.viber.com/?g2=...` | Viber channel join |
| `viber_channel_label` | `Join Viber for weekly promos` | banner text |
| `footer_address` | `Manila, Philippines` | footer line |
| `footer_note` | `Prices subject to change without notice.` | footer disclaimer |

### Tab 4: `Publish_Log` (audit trail, auto-written)

The Apps Script appends a row here on every publish: timestamp, publisher email, SKU counts (live / hidden / flagged), Git commit SHA. Team never edits this tab.

## Publish trigger

A custom menu in the sheet:

```
Xyris ▼
├─ Validate (preview only)
├─ Publish to Site
└─ View Publish Log
```

**Validate** runs validation, opens a dialog showing the report, makes no changes. Anyone can run this.

**Publish to Site** does the full pipeline: validate → confirmation modal → emit JSON → commit to GitHub. Restricted to specific email addresses (see `apps-script/Config.gs`).

**View Publish Log** opens the `Publish_Log` tab.

## What the Apps Script produces

The script generates these files and commits them to `public/data/` in the GitHub repo:

```
public/data/
├── manifest.json              # ~10 KB — index of categories, brands, settings
├── baby.json                  # ~80 KB
├── beverages.json             # ~65 KB
├── canned-goods.json          # ~55 KB
├── dairy-bakery.json          # ~80 KB
├── health-pharmacy.json       # ~15 KB
├── household.json             # ~190 KB
├── liquor-tobacco.json        # ~25 KB
├── misc.json                  # ~50 KB
├── pantry-cooking.json        # ~240 KB
├── personal-care.json         # ~250 KB
└── snacks-confectionery.json  # ~190 KB
```

File names: lowercase, spaces → hyphens, `&` removed. `Pantry & Cooking` → `pantry-cooking.json`.

## What the Apps Script does NOT produce

- ❌ A file for the `Outsource` category (hidden from public site by design)
- ❌ A file containing #N/A or uncategorized SKUs
- ❌ A single combined file with all SKUs (we split by category for performance)
- ❌ Any file containing cost, supplier, or wholesale price columns

## Frequency

Manual trigger only. The team clicks Publish whenever they want updates live. No scheduled job.

Typical cadence (expected): weekly to twice-weekly. Occasionally daily during price-volatile periods.
