# 04 — Categories

The canonical list. **This is the only category structure allowed on the public site.** Any SKU with a category or sub-category outside this list is hidden until corrected.

The machine-readable version is in `data/master-categories.csv` and the Xyris team maintains the live copy in the `Categories` tab of the Google Sheet.

## Display order

This is the order categories appear in the filter UI. Order is intentional — frequently-bought / high-volume categories first for sari-sari shopping patterns:

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

(The 12th category, `Outsource`, exists in the sheet but is **hidden from the public site** like #N/A.)

## Full list

### Beverages
- Yogurt Drinks
- Energy Drinks
- Bottled Water
- Soft Drinks
- Tea & Juice

### Liquor & Tobacco
- Cigarettes & Lighters
- Beer & Wine
- Spirits

### Dairy & Bakery
- Liquid Milk & Cream
- Cheese & Margarine
- Bread & Bakery
- Ice Cream
- Frozen & Chilled Meat

### Pantry & Cooking
- Powdered Milk
- Condensed & Evap Milk
- Instant Noodles
- Pasta & Noodles
- Pasta Sauce
- Soy Vinegar & Patis
- Ketchup & Sauces
- Bouillon & Seasoning
- Cooking Oil
- Sugar Salt Flour & Baking
- Coffee & Hot Drinks
- Spreads
- Cereals & Oats

### Canned Goods
- Canned Fish
- Canned Meat
- Canned Fruits or Vegetables

### Snacks & Confectionery
- Crackers, Cakes & Cookies
- Chips & Curls
- Chocolate & Candy

### Personal Care
- Bath Soap
- Hair Care
- Oral Care
- Deodorant & Cologne
- Lotion & Skin Care
- Sanitary Napkins

### Health & Pharmacy
- First Aid & OTC
- Female Hygiene Wash

### Household
- Laundry
- Dishwashing
- Bleach & Cleaners
- Insect Killer
- Air Freshener
- Alcohol & Sanitizer
- Tissue & Cotton

### Baby
- Infant Formula
- Diapers
- Baby Toiletries
- Baby Wipes & Cotton

### Misc
- Pet Food
- Candles & Matches
- Batteries
- School & Office Supplies
- Kitchen & Household Tools
- Plastic & Packaging
- Others
- Operations

### Outsource (HIDDEN from public site)
- Outsource

## Validation rules

- A SKU's `New Category` must exactly match one of the 11 public categories (case-sensitive)
- Its `New Sub Category` must exactly match one of the sub-categories listed under that exact parent
- Mismatches are **flagged** (not auto-fixed) and the SKU is hidden until a human fixes it in the sheet
