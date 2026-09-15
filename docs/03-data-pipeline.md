# 03 — Data Pipeline

## Source of truth

A single Google Sheet owned by the dedicated `xyris.system@gmail.com` (or similar) company Gmail account. Editors are individual team members with their personal Gmails granted Edit access.

## Sheet structure

The master sheet has these tabs:

### Tab 1: `SKUs_Master` (the product list)

This tab holds the **POS native export, pasted verbatim** — no transformation step. Columns (10, as the POS emits them):

1. `prod_code` — barcode (string, 13 digits typically)
2. `prod_desc1` — product name (string)
3. `unit_cost` — what Xyris pays (number) **🚫 NEVER published**
4. `sell_price` — retail price per piece (number, may contain commas like "1,437.10")
5. `dept_code` — POS department code **⛔ ignored entirely**
6. `dept_desc` — POS department name, UPPERCASE → filter L1 source (string)
7. `cat_code` — POS category code **⛔ ignored entirely**
8. `cat_desc` — POS category name, UPPERCASE and possibly truncated → filter L2 source (string)
9. `sup_code` — supplier code **🚫 NEVER published**
10. `sup_desc` — supplier name **🚫 NEVER published** (but read internally to filter "DELETE")

Column order does not matter — the script matches by header name. Required headers: `prod_code`, `prod_desc1`, `sell_price`, `sup_desc`, `dept_desc`, `cat_desc`. A missing one aborts the publish with an explicit error.

To refresh: clear the tab, then `File → Import → Upload` the POS xlsx with **Replace current sheet** and **Convert text to numbers: No** (keeps `prod_code` out of scientific notation).

### Tab 2: `Categories` (POS → display-name mapping)

Four columns: `POS_Dept`, `POS_Cat`, `Display_Category`, `Display_Sub_Category`.

The first two hold the raw POS values (matched case-insensitively, upper-cased before lookup); the last two hold the human-readable names the website shows. This is both the reference list that validation checks against **and** the translation layer — POS ships UPPERCASE, truncated strings like `CANNED FRUIT OR VEGE`, which would look wrong on the site.

Row order also defines display order: sub-categories appear within a category in the order they first appear in this tab. Seed it from `xyris-migration/Categories_POS_native.csv` (59 mappings).

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
├── manifest.json              # ~10 KB — index of categories, sub-categories, settings
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

- ❌ A file for any POS dept+cat combination absent from the `Categories` tab (hidden, not flagged — publish never blocks on POS quirks)
- ❌ A file containing #N/A or uncategorized SKUs
- ❌ A single combined file with all SKUs (we split by category for performance)
- ❌ Any file containing cost, supplier, or wholesale price columns

## Frequency

Manual trigger only. The team clicks Publish whenever they want updates live. No scheduled job.

Typical cadence (expected): weekly to twice-weekly. Occasionally daily during price-volatile periods.
