# 01 — Architecture

## High-level flow

```
┌─────────────────────────┐
│  Google Sheet (Master)  │  ← Xyris team edits here
│  ~10,623 rows × 14 cols │
└────────────┬────────────┘
             │ team clicks "Publish to Site"
             ▼
┌─────────────────────────┐
│  Google Apps Script     │
│  - validates            │
│  - filters DELETE rows  │
│  - strips commas        │
│  - splits by category   │
│  - builds JSON          │
└────────────┬────────────┘
             │ commits via GitHub API
             ▼
┌─────────────────────────┐
│  GitHub repo            │
│  public/data/*.json     │
└────────────┬────────────┘
             │ Vercel detects push
             ▼
┌─────────────────────────┐
│  Vercel deploys site    │
│  static Next.js export  │
└────────────┬────────────┘
             │ user visits site
             ▼
┌─────────────────────────┐
│  Sari-sari store owner  │
│  on Android, 4G         │
└─────────────────────────┘
```

## Why this architecture

- **No backend server** = no monthly hosting cost, no scaling concerns, no database to maintain
- **JSON files committed to repo** = built-in version history of every price change (git log)
- **Static generation** = page loads in <1 second even on slow connections
- **Google Sheets as backend** = the team already knows spreadsheets; no admin panel to build

## Data flow in detail

1. **Master Sheet** contains all 14 columns including sensitive ones (cost, supplier, wholesale price)
2. **Apps Script** runs only when a publisher clicks the menu item
3. **Validation step** produces a flag report — counts of rows that will be hidden/skipped
4. **Confirmation modal** shows the report; publisher reviews and confirms
5. **Build step** emits ONLY the 6 public columns into JSON files, one per category
6. **Manifest file** (`manifest.json`) lists all available categories, sub-categories, brands per category, last-updated timestamp, and Settings tab content (phone, Messenger URL, Viber links, brand info)
7. **GitHub commit** via Apps Script using the GitHub REST API
8. **Vercel** auto-deploys on push (free tier, no config needed)
9. **Frontend** fetches `manifest.json` first, then category JSON on demand as user filters

## Why split by category (not one big JSON)?

The total catalog is ~10,500 SKUs × ~120 bytes = ~1.3 MB JSON. Loading 1.3 MB on a 3G connection takes 5+ seconds. By splitting into ~12 category files (each 50-200 KB), the user only loads the data they need when they pick a category. The manifest (which loads first) is only ~10 KB.

## Why no auth?

Sari-sari store owners need fast access. Login screens are friction. Pricing is public information once stores quote it to their customers anyway. The only "sensitive" data (cost, margin, supplier) never leaves the Google Sheet.

## What happens if the Apps Script fails mid-publish?

- The script first writes to a temp branch/PR or to a staging path, then atomically swaps. (Implementation detail: use GitHub API to commit all files in one tree commit, so partial publishes are impossible.)
- The previous `manifest.json` and category JSONs stay intact until the new commit succeeds.
- Worst case: the team re-clicks Publish.

## Versioning and rollback

Every Publish creates a Git commit with a message like `Publish 2026-05-19 14:32 (10,107 SKUs, 1,234 flagged)`. To roll back:

1. Find the previous commit on GitHub
2. Revert it (one click via GitHub UI)
3. Vercel re-deploys the previous data automatically

No "undo" button needed in the Apps Script — Git is the undo button.
