# 06 — Validation Rules

The Apps Script applies these rules to every row in `SKUs_Master` on every Publish or Validate run.

`SKUs_Master` holds the **POS native export pasted verbatim** (see `03-data-pipeline.md`), so validation reads POS columns directly: `dept_desc` + `cat_desc` for categorization, `sup_desc` for the DELETE marker.

## Direction A — "Trust the POS"

The script **accepts any `dept_desc` + `cat_desc` combination that exists in the `Categories` tab** and hides anything else. There is no flag-and-block outcome: a POS quirk can never stop a publish. Unknown combinations are surfaced in the report as a to-do list, not as an error.

## Rule order

Apply in this exact order. Each rule's outcome categorizes the row.

### Row outcomes (one per row)

- **PUBLISH** — row goes into the public JSON
- **HIDE_DELETE** — supplier marked "DELETE", silently excluded
- **HIDE_NO_CATEGORY** — `dept_desc` or `cat_desc` blank or #N/A, silently excluded
- **HIDE_NO_PRICE** — invalid or zero `sell_price`, silently excluded
- **HIDE_UNKNOWN_COMBO** — POS dept+cat pair not present in the `Categories` tab, silently excluded but listed in the report

## The rules

### Rule 1: DELETE filter (silent)
```
IF row.sup_desc.trim().toUpperCase() == "DELETE"
THEN outcome = HIDE_DELETE
```

### Rule 2: Category required (silent)
```
posDept = row.dept_desc.trim().toUpperCase()
posCat  = row.cat_desc.trim().toUpperCase()
IF posDept == "" OR posCat == "" OR posDept == "#N/A" OR posCat == "#N/A"
THEN outcome = HIDE_NO_CATEGORY
```

### Rule 3: Price parsing (silent if invalid)
```
priceStr = row.sell_price.toString().replace(/,/g, "").trim()
price = parseFloat(priceStr)
IF isNaN(price) OR price <= 0
THEN outcome = HIDE_NO_PRICE
```

### Rule 4: POS dept+cat must exist in the Categories tab (silent, reported)
```
key = posDept + "|" + posCat
IF POS_LOOKUP[key] is undefined
THEN outcome = HIDE_UNKNOWN_COMBO
     AND increment unknownCombos[key]   // listed in the report modal
```

`POS_LOOKUP` is built from the `Categories` tab: `POS_Dept|POS_Cat` (both upper-cased) → `{ Display_Category, Display_Sub_Category }`.

### Default: PUBLISH
If no rule above triggered, the row goes into the public JSON.

## Output transformations (PUBLISH rows only)

```
mapping = POS_LOOKUP[posDept + "|" + posCat]

output.code        = row.prod_code.trim()
output.name        = row.prod_desc1.trim()
output.price       = Math.round(parseFloat(row.sell_price.replace(/,/g, "")) * 100) / 100
output.category    = mapping.category      // Display_Category, not the raw POS string
output.subCategory = mapping.subCategory   // Display_Sub_Category
```

The raw POS strings are never published — they are UPPERCASE and often truncated (`CANNED FRUIT OR VEGE`). The `Categories` tab supplies the display names the site shows.

## Pre-publish summary report

The confirmation modal shows counts in this format:

```
✅ 10,450 SKUs will go live

HIDDEN (SILENT)
  • 292 marked DELETE
  • 4 uncategorized (blank or #N/A dept/cat)
  • 0 with invalid or ₱0 price
  • 21 with unknown POS dept+cat combination (not in Categories tab)

⚠ UNKNOWN POS COMBINATIONS (AUTO-HIDDEN)
Add these to Categories tab if you want them on the site:
  • GROCERY > CANNED FRUIT OR VEGE — 8 SKUs
  • ... (top 20 shown, by SKU count)

Total rows in sheet: 10,767

[Cancel]  [Publish anyway]
```

Publish is never blocked by these counts — `Publish anyway` is always available.

## What "unknown combination" means

The row's POS dept+cat pair has no entry in the `Categories` tab, so the script has no display name for it. Such rows are **excluded from publish** and listed in the modal by `DEPT > CAT` with a SKU count, so the team can decide whether to add a mapping row. Adding one and re-publishing brings those SKUs online — no change to `SKUs_Master` required.

## Why not auto-fix anything?

The script never modifies the master sheet. All fixes are manual, and they happen in the `Categories` tab rather than row-by-row in `SKUs_Master`. This prevents subtle bugs where a "helpful" auto-fix mis-categorizes a SKU and no one notices — and it means the next POS export can be pasted in verbatim without re-doing any work.

## Edge cases

- **`prod_code` in scientific notation** → import the POS file with **Convert text to numbers: No**, otherwise barcodes become `4.8E+12` and are published wrong
- **Whitespace-only strings** → treated as empty (trim everywhere)
- **POS casing differences** → `dept_desc`/`cat_desc` and the `Categories` tab's first two columns are both upper-cased before lookup, so casing never causes a miss
- **Truncated `cat_desc`** → expected; match the truncated POS string exactly in the `Categories` tab's `POS_Cat` column
- **`#N/A` in any non-category field** → ignored, no special handling (only in `dept_desc`/`cat_desc` does it trigger HIDE_NO_CATEGORY)
- **Duplicate `prod_code`s** → not validated for now. If a barcode appears twice, both rows publish if they pass other rules. (Future enhancement: warn on duplicate barcodes.)
- **Very long product names** → no truncation in the data layer. The UI handles overflow with CSS.
