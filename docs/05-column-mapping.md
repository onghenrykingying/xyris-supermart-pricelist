# 05 — Column Mapping

## Source columns (Google Sheet) → public output

The master sheet has 14 columns. Only **6** make it to the public site.

| # | Sheet column | Disposition | Public field name | Type |
|---:|---|---|---|---|
| 1 | `prod_code` | ✅ Publish | `code` | string |
| 2 | `prod_desc1` | ✅ Publish | `name` | string |
| 3 | `unit_cost` | 🚫 Hidden | — | — |
| 4 | `sell_price` | ✅ Publish (clean commas) | `price` | number |
| 5 | `sup_code` | 🚫 Hidden | — | — |
| 6 | `sup_desc` | 🚫 Hidden (used internally to filter `"DELETE"`) | — | — |
| 7 | `dept_code` | ⛔ Ignored | — | — |
| 8 | `dept_desc` | ⛔ Ignored | — | — |
| 9 | `whole_code` | ⛔ Ignored | — | — |
| 10 | `uom_code` | ⛔ Ignored | — | — |
| 11 | `wholeprice` | 🚫 Hidden | — | — |
| 12 | `New Category` | ✅ Publish | `category` | string |
| 13 | `New Sub Category` | ✅ Publish | `subCategory` | string |
| 14 | `Brands` | ✅ Publish | `brand` | string |

**🚫 Hidden** = sensitive, must NEVER appear in public JSON, API responses, or HTML.
**⛔ Ignored** = read from sheet but not used anywhere.

## TypeScript types

Create these in `lib/types.ts`:

```ts
// A single product
export interface SKU {
  code: string;          // barcode, used as React key
  name: string;          // full product name with pack size
  price: number;         // pesos, no currency symbol
  category: string;      // matches a Category in the master list
  subCategory: string;   // matches a Sub-Category under that Category
  brand: string;         // free-text brand name
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
  brands: string[];               // sorted alphabetically
}

export interface SubCategoryMeta {
  label: string;
  skuCount: number;
  brands: string[];               // brands available within this sub-cat
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
        { "label": "Tea & Juice",   "skuCount": 289, "brands": ["C2", "Del Monte", "..."] },
        { "label": "Bottled Water", "skuCount": 69,  "brands": ["Absolute", "Nature Spring", "..."] }
      ],
      "brands": ["C2", "Del Monte", "Absolute", "..."]
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
      "subCategory": "Tea & Juice",
      "brand": "C2"
    }
  ]
}
```

## Why these specific shapes?

- **Manifest first, categories on demand**: keeps initial page weight tiny (~10 KB). The user pays the cost of loading 200 KB only when they actually open a category.
- **Slugs in manifest, labels everywhere else**: slugs are URL-safe identifiers for file names; labels are what humans see.
- **Brands list at both category and sub-category level**: lets the filter UI populate brand dropdowns without scanning all SKUs.
- **Pre-counted SKU counts in manifest**: lets the UI show "Beverages (540)" without loading the file.
