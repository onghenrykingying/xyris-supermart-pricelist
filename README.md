# Xyris Supermart Pricelist

A mobile-first public price list for sari-sari store owners in the Philippines. Browse ~10,500 SKUs by category, sub-category, and brand. Contact us directly via Call, Messenger, or Viber to place orders.

**Live site:** _(deploy to Vercel; URL will be `https://<project>.vercel.app`)_

## What's in this repo

- `app/`, `components/`, `lib/` — Next.js 14 frontend (App Router, TypeScript, Tailwind)
- `public/data/` — JSON files generated weekly by Google Apps Script from the master sheet
- `apps-script/` — Google Apps Script source code (validates the master sheet, publishes JSON to this repo)
- `docs/` — full specification (read these before contributing)
- `data/master-categories.csv` — canonical category list

## Tech stack

- Next.js 14 + TypeScript + Tailwind CSS
- Vercel (hosting)
- Google Sheets + Google Apps Script (data backend)
- GitHub (data files versioned alongside code)

## Local development

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

The site reads JSON from `public/data/`. Sample data is committed so dev works without the Apps Script setup.

## Updating the price list (for the Xyris team)

1. Open the master Google Sheet
2. Edit prices, add/remove SKUs, fix categories
3. Click **Xyris → Publish to Site** in the sheet menu
4. Review the publish summary modal (it shows hidden/flagged SKUs)
5. Confirm. The site updates within ~1 minute.

See `docs/07-publish-flow.md` for details.

## License

Internal use only. © Xyris Supermart.
