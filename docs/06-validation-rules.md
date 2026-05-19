# 06 — Validation Rules

The Apps Script applies these rules to every row in `SKUs_Master` on every Publish or Validate run.

## Rule order

Apply in this exact order. Each rule's outcome categorizes the row.

### Row outcomes (one per row)

- **PUBLISH** — row goes into the public JSON
- **HIDE_DELETE** — supplier marked "DELETE", silently excluded
- **HIDE_NO_PRICE** — invalid or zero sell_price, silently excluded
- **HIDE_NO_CATEGORY** — category blank or #N/A, silently excluded
- **HIDE_OUTSOURCE** — category = "Outsource", silently excluded
- **FLAG_BAD_CATEGORY** — category not in master list, excluded + flagged in report
- **FLAG_BAD_SUBCATEGORY** — sub-category not in master list, or wrong parent, excluded + flagged in report

## The rules

### Rule 1: DELETE filter (silent)
```
IF row.sup_desc.trim().toUpperCase() == "DELETE"
THEN outcome = HIDE_DELETE
```

### Rule 2: Outsource filter (silent)
```
IF row.New_Category.trim() == "Outsource"
THEN outcome = HIDE_OUTSOURCE
```

### Rule 3: Category required (silent)
```
cat = row.New_Category.trim()
IF cat == "" OR cat == "#N/A"
THEN outcome = HIDE_NO_CATEGORY
```

### Rule 4: Price parsing (silent if invalid)
```
priceStr = row.sell_price.toString().replace(/,/g, "").trim()
price = parseFloat(priceStr)
IF isNaN(price) OR price <= 0
THEN outcome = HIDE_NO_PRICE
```

### Rule 5: Category exists in master (flagged)
```
IF row.New_Category NOT IN MASTER_CATEGORIES
THEN outcome = FLAG_BAD_CATEGORY
```

### Rule 6: Sub-category exists under that category (flagged)
```
sub = row.New_Sub_Category.trim()
IF sub NOT IN MASTER_SUBCATEGORIES[row.New_Category]
THEN outcome = FLAG_BAD_SUBCATEGORY
```

### Default: PUBLISH
If no rule above triggered, the row goes into the public JSON.

## Output transformations (PUBLISH rows only)

```
output.code        = row.prod_code.trim()
output.name        = row.prod_desc1.trim()
output.price       = parseFloat(row.sell_price.replace(/,/g, ""))
output.category    = row.New_Category.trim()
output.subCategory = row.New_Sub_Category.trim()
output.brand       = row.Brands.trim() || "Others"   // fallback for blank brand
```

## Pre-publish summary report

The confirmation modal shows counts in this format:

```
Publish summary

✅ 10,107 SKUs will go live

Hidden (silent):
  • 323 SKUs marked "DELETE"
  • 101 SKUs without a category
  • 88 SKUs with invalid or ₱0 price
  • 0 SKUs in "Outsource" category

⚠ Flagged (please review in sheet):
  • 6 SKUs with sub-category under wrong parent
  • 0 SKUs with unknown category

Total in sheet: 10,623
                                            
[Cancel]  [Publish anyway]
```

## What "flagged" means

Flagged rows are **excluded from publish** (they will not show on the site) **and** logged so the team can find and fix them. The publish report shows the row's `prod_code` and `prod_desc1` so the team can locate it in the sheet.

A future version could write a `Flag_Report` tab in the sheet listing every flagged row. For Phase 1, just list them in the modal text and in `Publish_Log`.

## Why not auto-fix anything?

The team chose **flag-only** validation. The script never modifies the master sheet. All fixes are manual. This prevents subtle bugs where a "helpful" auto-fix mis-categorizes a SKU and no one notices.

## Edge cases

- **Brand is blank** → falls back to `"Others"` in the output (per Rule 6 transformation). Brand is not required for publish.
- **Whitespace-only strings** → treated as empty (trim everywhere)
- **`#N/A` in any non-category field** → ignored, no special handling (only #N/A in `New_Category` triggers HIDE_NO_CATEGORY)
- **Duplicate `prod_code`s** → not validated for now. If a barcode appears twice, both rows publish if they pass other rules. (Future enhancement: warn on duplicate barcodes.)
- **Very long product names** → no truncation in the data layer. The UI handles overflow with CSS.
