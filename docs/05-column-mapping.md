# 05 — Column Mapping

## Source columns (Google Sheet) → public output

`SKUs_Master` holds the POS native export verbatim — 10 columns. Only **3** are published as-is; `category` and `subCategory` are looked up, not copied.

| # | POS column | Disposition | Public field name | Type |
|---:|---|---|---|---|
| 1 | `prod_code` | ✅ Publish | `code` | string |
| 2 | `prod_desc1` | ✅ Publish | `name` | string |
| 3 | `unit_cost` | 🚫 Hidden | — | — |
| 4 | `sell_price` | ✅ Publish (strip commas, round to 2dp) | `price` | number |
| 5 | `dept_code` | ⛔ Ignored | — | — |
| 6 | `dept_desc` | 🔁 Lookup key (not published raw) | → `category` | string |
| 7 | `cat_code` | ⛔ Ignored | — | — |
| 8 | `cat_desc` | 🔁 Lookup key (not published raw) | → `subCategory` | string |
| 9 | `sup_code` | 🚫 Hidden | — | — |
| 10 | `sup_desc` | 🚫 Hidden (used internally to filter `"DELETE"`) | — | — |

**🚫 Hidden** = sensitive, must NEVER appear in public JSON, API responses, or HTML.
**⛔ Ignored** = read from sheet but not used anywhere.
**🔁 Lookup key** = the raw UPPERCASE/truncated POS value is used to find a row in the `Categories` tab; the tab's `Display_Category` / `Display_Sub_Category` is what gets published. See `04-categories.md`.

Columns are matched by header name, so POS column order can change without breaking the publish. The POS no longer exports `whole_code`, `uom_code` or `wholeprice`; none of the three were ever published.

## TypeScript types

Create these in `lib/types.ts`:

```ts
// A single product
export interface SKU {
  code: string;          // barcode, used as React key
  name: string;          // full product name with pack size
  price: number;         // pesos, no currency symbol
  category: string;      // Display_Category from the Categories tab
  subCategory: string;   // Display_Sub_Category from the Categories tab
}

// Top-level index file, loaded first
export interface Manifest {
  generatedAt: string;            // ISO 8601 timestamp
  totalSKUs: number;
  categories: CategoryMeta[];
  settings: Settings;
}

export interface CategoryMeta {
  slug: string;                   // e.g. "pantry-cooking"
  label: string;                  // e.g. "Pantry & Cooking"
  skuCount: number;
  subCategories: SubCategoryMeta[];
}

export interface SubCategoryMeta {
  label: string;
  skuCount: number;
}

export interface Settings {
  brandName: string;
  brandTagline: string;
  phoneCall: string;              // E.164, e.g. "+639171234567"
  phoneDisplay: string;           // e.g. "0917 123 4567"
  messengerUrl: string;
  viberChat: string;              // viber:// or https:// URL
  viberChannelUrl: string;
  viberChannelLabel: string;
  footerAddress: string;
  footerNote: string;
}

// A category JSON file (e.g. pantry-cooking.json)
export interface CategoryFile {
  category: string;
  generatedAt: string;
  skus: SKU[];
}
```

## Sample JSON shapes

### `manifest.json` (sketch)

```json
{
  "generatedAt": "2026-05-19T07:32:00Z",
  "totalSKUs": 10107,
  "categories": [
    {
      "slug": "beverages",
      "label": "Beverages",
      "skuCount": 540,
      "subCategories": [
        { "label": "Tea & Juice",   "skuCount": 289 },
        { "label": "Bottled Water", "skuCount": 69 }
      ]
    }
  ],
  "settings": {
    "brandName": "Xyris Supermart",
    "brandTagline": "Save More Live Bright",
    "phoneCall": "+639171234567",
    "phoneDisplay": "0917 123 4567",
    "messengerUrl": "https://m.me/xyrissupermart",
    "viberChat": "viber://chat?number=%2B639171234567",
    "viberChannelUrl": "https://invite.viber.com/?g2=AAAAA",
    "viberChannelLabel": "Join Viber for weekly promos",
    "footerAddress": "Manila, Philippines",
    "footerNote": "Prices subject to change without notice."
  }
}
```

### `beverages.json` (sketch)

```json
{
  "category": "Beverages",
  "generatedAt": "2026-05-19T07:32:00Z",
  "skus": [
    {
      "code": "4800361286145",
      "name": "C2 APPLE 230MLX24",
      "price": 14.50,
      "category": "Beverages",
      "subCategory": "Tea & Juice"
    }
  ]
}
```

## Why these specific shapes?

- **Manifest first, categories on demand**: keeps initial page weight tiny (~10 KB). The user pays the cost of loading 200 KB only when they actually open a category.
- **Slugs in manifest, labels everywhere else**: slugs are URL-safe identifiers for file names; labels are what humans see.
- **No brand data in the output**: filtering is two levels only (Category → Sub-Category), so brand is neither published nor indexed.
- **Pre-counted SKU counts in manifest**: lets the UI show "Beverages (540)" without loading the file.
