# 02 — Brand Guide

## Identity

- **Name**: Xyris Supermart
- **Tagline**: Save More Live Bright
- **Audience**: Sari-sari store owners in the Philippines (mostly Filipino, mostly mobile, mostly price-conscious)
- **Tone**: Friendly, direct, no fluff. Use English with occasional Filipino warmth ("Order na!", "Salamat").

## Colors (LOCKED — from logo)

| Color | Hex | Usage |
|---|---|---|
| **Brand Yellow** | `#F8E27C` | Primary background, hero sections, accents |
| **Brand Blue** | `#264DAC` | Logo, primary buttons, links, headings |
| **Brand Red** | `#B51C1E` | Tagline, urgent CTAs, sale/promo highlights |
| **White** | `#FFFFFF` | Card backgrounds, text on dark, logo outline |
| **Charcoal** | `#1F2937` | Body text |
| **Slate-500** | `#64748B` | Secondary text, captions |
| **Slate-200** | `#E2E8F0` | Dividers, borders |

### Tailwind config

Add these to `tailwind.config.ts`:

```ts
export default {
  theme: {
    extend: {
      colors: {
        xyris: {
          yellow: '#F8E27C',
          blue: '#264DAC',
          red: '#B51C1E',
          'blue-dark': '#1E3A8A',  // hover state
          'red-dark': '#991B1B',   // hover state
        },
      },
    },
  },
}
```

Use as: `bg-xyris-yellow`, `text-xyris-blue`, `border-xyris-red`, etc.

## Typography

- **Primary font**: Inter (free, loaded from Google Fonts)
- **Logo font**: a chunky display font similar to the bubble lettering in the provided logo. For the website header, use the actual logo PNG/SVG — don't try to recreate it in CSS text.
- **Numerals**: use `font-variant-numeric: tabular-nums` for prices so they align in columns

### Type scale (mobile-first)

| Element | Size | Weight | Notes |
|---|---|---|---|
| Logo area | image asset | — | use the actual logo image |
| Page H1 | `text-2xl` (24px) | 700 | rarely used; logo serves as H1 |
| Section heading | `text-lg` (18px) | 600 | |
| SKU name | `text-base` (16px) | 600 | |
| SKU price | `text-lg` (18px) | 700 | brand blue, tabular-nums |
| Brand/category labels | `text-sm` (14px) | 400 | slate-500 |
| Button text | `text-base` (16px) | 600 | |
| Footnote / timestamp | `text-xs` (12px) | 400 | slate-500 |

## Logo usage

- The logo file (the provided PNG with "XYRIS SUPERMART" bubble lettering + tagline on yellow background) sits in `public/logo.png`
- Use as a single image asset in the site header — don't recreate it in CSS
- Recommended header height on mobile: 64px; the logo image scales to fit
- Don't add drop shadows, recolor, or modify the logo

## Voice and copy

### Yes
- "Browse by category"
- "Order now"
- "Get weekly promos on Viber"
- "10,107 products available"
- "Last updated 2 hours ago"

### No (too corporate / cold)
- "Welcome to our digital catalog"
- "Initiate a procurement request"
- "Subscribe to our newsletter"

### Filipino touches (use sparingly)
- "Order na!" — on the FAB button
- "Tumawag" — secondary label on the Call option
- "Salamat!" — confirmation toast

## Visual style notes

- **Rounded corners**: `rounded-lg` (8px) for cards, `rounded-full` for pill buttons and the FAB
- **Shadows**: subtle. `shadow-sm` on cards, `shadow-lg` on the FAB. No heavy shadows.
- **Borders**: 1px slate-200 on cards. Avoid borders on buttons.
- **Spacing**: generous on mobile. `p-4` (16px) minimum padding inside cards. SKU rows: ~72px tall on mobile.
- **Density**: medium. Not Walmart-dense, not luxury-airy. Store owners want to scan many prices fast, but the screen is small.

## What to avoid

- ❌ Stock photos of products, shoppers, or stores
- ❌ Gradients (except a very subtle yellow → lighter yellow on the header if desired)
- ❌ Drop shadows on text
- ❌ Multiple font families
- ❌ Animations on scroll
- ❌ Emojis in primary UI (acceptable in CTA copy and toasts)
