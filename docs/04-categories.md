# 04 — Categories

The canonical mapping. **This is the only category structure allowed on the public site.** Any SKU whose POS `dept_desc` + `cat_desc` pair is not in this list is hidden until a mapping row is added.

The machine-readable version is `xyris-migration/Categories_POS_native.csv`, and the Xyris team maintains the live copy in the `Categories` tab of the Google Sheet.

## Why a mapping table

The POS exports `dept_desc` and `cat_desc` as UPPERCASE strings truncated to 20 characters — `CANNED FRUIT OR VEGE`, `SUGAR SALT FLOUR & B`, `CRACKERS, CAKES & CO`. Those are the values the sheet receives verbatim, and they are not fit to show shoppers.

So the `Categories` tab carries four columns:

| Column | Holds | Example |
|---|---|---|
| `POS_Dept` | raw POS department, as exported | `CANNED GOODS` |
| `POS_Cat` | raw POS category, as exported (may be truncated) | `CANNED FRUIT OR VEGE` |
| `Display_Category` | filter L1 shown on the site | `Canned Goods` |
| `Display_Sub_Category` | filter L2 shown on the site | `Canned Fruits or Vegetables` |

The first two are the lookup key (upper-cased on both sides, so casing never causes a miss); the last two are what the website publishes. Only the display names reach `manifest.json` and the category JSON files.

Filtering is **two levels only** — Category → Sub-Category. There is no Brand level.

## Display order

Category order in the filter UI is fixed by the `DISPLAY_ORDER` constant in `Code.gs`, not by the sheet. Order is intentional — frequently-bought / high-volume categories first for sari-sari shopping patterns:

1. Beverages
2. Liquor & Tobacco
3. Dairy & Bakery
4. Pantry & Cooking
5. Canned Goods
6. Snacks & Confectionery
7. Personal Care
8. Health & Pharmacy
9. Household
10. Baby
11. Misc

A display category that appears in the `Categories` tab but not in `DISPLAY_ORDER` still publishes — it is appended after the listed ones.

**Sub-category order comes from the sheet**: within a category, sub-categories appear in the order their rows first appear in the `Categories` tab. Reordering rows there reorders the dropdown; no code change needed.

## Full mapping (59 rows)

### Beverages

| POS_Dept | POS_Cat | Display_Sub_Category |
|---|---|---|
| `BEVERAGES` | `TEA & JUICE` | Tea & Juice |
| `BEVERAGES` | `BOTTLED WATER` | Bottled Water |
| `BEVERAGES` | `SOFT DRINKS` | Soft Drinks |
| `BEVERAGES` | `YOGURT DRINKS` | Yogurt Drinks |
| `BEVERAGES` | `ENERGY DRINKS` | Energy Drinks |

### Liquor & Tobacco

| POS_Dept | POS_Cat | Display_Sub_Category |
|---|---|---|
| `LIQUOR & TOBACCO` | `SPIRITS` | Spirits |
| `LIQUOR & TOBACCO` | `CIGARETTES & LIGHTER` | Cigarettes & Lighters |
| `LIQUOR & TOBACCO` | `BEER & WINE` | Beer & Wine |

### Dairy & Bakery

| POS_Dept | POS_Cat | Display_Sub_Category |
|---|---|---|
| `DAIRY & BAKERY` | `FROZEN & CHILLED MEA` | Frozen & Chilled Meat |
| `DAIRY & BAKERY` | `LIQUID MILK & CREAM` | Liquid Milk & Cream |
| `DAIRY & BAKERY` | `ICE CREAM` | Ice Cream |
| `DAIRY & BAKERY` | `CHEESE & MARGARINE` | Cheese & Margarine |
| `DAIRY & BAKERY` | `BREAD & BAKERY` | Bread & Bakery |

### Pantry & Cooking

| POS_Dept | POS_Cat | Display_Sub_Category |
|---|---|---|
| `PANTRY & COOKING` | `BOUILLON & SEASONING` | Bouillon & Seasoning |
| `PANTRY & COOKING` | `COFFEE & HOT DRINKS` | Coffee & Hot Drinks |
| `PANTRY & COOKING` | `INSTANT NOODLES` | Instant Noodles |
| `PANTRY & COOKING` | `SUGAR SALT FLOUR & B` | Sugar Salt Flour & Baking |
| `PANTRY & COOKING` | `POWDERED MILK` | Powdered Milk |
| `PANTRY & COOKING` | `SOY VINEGAR & PATIS` | Soy Vinegar & Patis |
| `PANTRY & COOKING` | `PASTA & NOODLES` | Pasta & Noodles |
| `PANTRY & COOKING` | `SPREADS` | Spreads |
| `PANTRY & COOKING` | `PASTA SAUCE` | Pasta Sauce |
| `PANTRY & COOKING` | `COOKING OIL` | Cooking Oil |
| `PANTRY & COOKING` | `KETCHUP & SAUCES` | Ketchup & Sauces |
| `PANTRY & COOKING` | `CEREALS & OATS` | Cereals & Oats |
| `PANTRY & COOKING` | `CONDENSED & EVAP MIL` | Condensed & Evap Milk |

### Canned Goods

| POS_Dept | POS_Cat | Display_Sub_Category |
|---|---|---|
| `CANNED GOODS` | `CANNED MEAT` | Canned Meat |
| `CANNED GOODS` | `CANNED FISH` | Canned Fish |
| `CANNED GOODS` | `CANNED FRUIT OR VEGE` | Canned Fruits or Vegetables |

### Snacks & Confectionery

| POS_Dept | POS_Cat | Display_Sub_Category |
|---|---|---|
| `SNACKS & CONFECTIONERY` | `CRACKERS, CAKES & CO` | Crackers, Cakes & Cookies |
| `SNACKS & CONFECTIONERY` | `CHOCOLATE & CANDY` | Chocolate & Candy |
| `SNACKS & CONFECTIONERY` | `CHIPS & CURLS` | Chips & Curls |

### Personal Care

| POS_Dept | POS_Cat | Display_Sub_Category |
|---|---|---|
| `PERSONAL CARE` | `HAIR CARE` | Hair Care |
| `PERSONAL CARE` | `DEODORANT & COLOGNE` | Deodorant & Cologne |
| `PERSONAL CARE` | `BATH SOAP` | Bath Soap |
| `PERSONAL CARE` | `LOTION & SKIN CARE` | Lotion & Skin Care |
| `PERSONAL CARE` | `ORAL CARE` | Oral Care |
| `PERSONAL CARE` | `SANITARY NAPKINS` | Sanitary Napkins |

### Health & Pharmacy

| POS_Dept | POS_Cat | Display_Sub_Category |
|---|---|---|
| `HEALTH & PHARMACY` | `FIRST AID & OTC` | First Aid & OTC |
| `HEALTH & PHARMACY` | `FEMALE HYGIENE WASH` | Female Hygiene Wash |

### Household

| POS_Dept | POS_Cat | Display_Sub_Category |
|---|---|---|
| `HOUSEHOLD` | `LAUNDRY` | Laundry |
| `HOUSEHOLD` | `DISHWASHING` | Dishwashing |
| `HOUSEHOLD` | `TISSUE & COTTON` | Tissue & Cotton |
| `HOUSEHOLD` | `BLEACH & CLEANERS` | Bleach & Cleaners |
| `HOUSEHOLD` | `ALCOHOL & SANITIZER` | Alcohol & Sanitizer |
| `HOUSEHOLD` | `AIR FRESHENER` | Air Freshener |
| `HOUSEHOLD` | `INSECT KILLER` | Insect Killer |

### Baby

| POS_Dept | POS_Cat | Display_Sub_Category |
|---|---|---|
| `BABY` | `DIAPERS` | Diapers |
| `BABY` | `BABY TOILETRIES` | Baby Toiletries |
| `BABY` | `INFANT FORMULA` | Infant Formula |
| `BABY` | `BABY WIPES & COTTON` | Baby Wipes & Cotton |

### Misc

| POS_Dept | POS_Cat | Display_Sub_Category |
|---|---|---|
| `MISC` | `KITCHEN & HOUSEHOLD` | Kitchen & Household Tools |
| `MISC` | `PLASTIC & PACKAGING` | Plastic & Packaging |
| `MISC` | `CANDLES & MATCHES` | Candles & Matches |
| `MISC` | `SCHOOL & OFFICE SUPP` | School & Office Supplies |
| `MISC` | `PET FOOD` | Pet Food |
| `MISC` | `OPERATIONS` | Operations |
| `MISC` | `BATTERIES` | Batteries |
| `MISC` | `OTHERS` | Others |

## Maintenance

**A new POS category appears.** The publish report lists it under "Unknown POS combinations (auto-hidden)" as `DEPT > CAT` with a SKU count. Add a row to the `Categories` tab mapping it to a display name, then publish again — the SKUs come online. `SKUs_Master` is never edited.

**A display name needs changing.** Edit `Display_Category` / `Display_Sub_Category` and publish. The POS side stays untouched.

**A category should be hidden from the site.** Delete its mapping row. Its SKUs then fall into the unknown-combination bucket and stay hidden, still listed in the report so no one forgets they exist.

> The old `Outsource` category no longer exists as a special case. Under the POS-native structure, anything without a mapping row is hidden by the same rule — there is nothing to hard-code.

## Validation rules

- A SKU's `dept_desc` + `cat_desc` pair must exist in the `Categories` tab (matched case-insensitively after trimming)
- Unmatched pairs are **hidden, not flagged** — publish is never blocked (see `06-validation-rules.md`, Direction A)
- The fix always happens in the `Categories` tab, never row-by-row in `SKUs_Master`
