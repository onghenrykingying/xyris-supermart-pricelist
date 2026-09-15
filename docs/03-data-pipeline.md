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

Row order also defines display order: sub-categories appear within a category in the order they first appear in this tab. Seed it from `data/pos-category-mapping.csv` (70 mappings).

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

## Weekly update run

The whole run is a straight import-and-publish — no conversion script, no editing of individual rows.

1. **Export from the POS.** You get an xlsx with the ten columns above.
2. **Save it as CSV.** Open it in Excel, `File → Save As`, format **CSV UTF-8**.
   This step is not optional. Google Sheets only offers *Replace current sheet* for CSV/TSV; an xlsx can only replace the **entire spreadsheet**, which would destroy the `Categories`, `Settings` and `Publish_Log` tabs. Excel keeps text cells as text when it writes the CSV, so barcodes survive.
3. **Clear `SKUs_Master`.** Select all (`Cmd+A`), `Delete`.
4. **Import the CSV.** `File → Import → Upload`, then:
   - Import location: **Replace current sheet**
   - Separator type: Comma (or Detect automatically)
   - Convert text to numbers, dates, and formulas: **No**
5. **Validate.** `Xyris → Validate (preview only)`. Check the counts look sane before going further.
6. **Publish.** `Xyris → Publish to Site → Publish anyway`. Vercel redeploys in about 60 seconds.

### Convert text to numbers must be No

This is the one setting that silently corrupts data. `prod_code` is a text column and roughly 400 of the barcodes begin with a zero (`000048036016`). Left to convert, Sheets reads them as numbers and drops the leading zeros, and **the damage cannot be repaired afterwards**: a stripped 13-digit code is indistinguishable from a genuine 12-digit one, so no padding rule can tell them apart. The only fix is to re-import with the setting off.

Formatting the column as plain text beforehand does *not* protect it — a paste from Excel carries its own cell formatting and overrides the destination.

To check an import went through cleanly, look up a barcode you know starts with a zero and confirm the zeros are still there.

### When the POS adds a category

Validate reports unmapped `dept_desc` + `cat_desc` pairs under "Unknown POS combinations (auto-hidden)", with a SKU count for each. Add a row to the `Categories` tab pointing the pair at the display names you want, then publish again. `SKUs_Master` is never touched, and no code changes.

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

Typical cadence: weekly to twice-weekly, occasionally daily during price-volatile periods. A run takes about three minutes end to end.
