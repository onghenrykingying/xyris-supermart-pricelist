# 11 — Deployment

## One-time setup

### 1. Create the dedicated company Gmail account

Sign up at <https://accounts.google.com> with a name like `xyris.system@gmail.com`. Set a strong password, enable 2FA, and store recovery info (phone + recovery email) in a place only the owner controls.

This account owns the Google Sheet, the GitHub repo, the Vercel project, and the Apps Script. Treat it as the master key.

### 2. Create the Google Sheet

While logged into the company Gmail:

1. Go to <https://sheets.new>
2. Rename to `Xyris Pricelist Master`
3. Create four tabs: `SKUs_Master`, `Categories`, `Settings`, `Publish_Log`
4. Set up `Categories` tab with two columns: `Category` and `Sub-Category`. Paste contents from `data/master-categories.csv`.
5. Set up `Settings` tab with columns: `key` and `value`. Add the keys listed in `docs/03-data-pipeline.md`.
6. Paste your initial SKU data into `SKUs_Master`. Make sure column headers match exactly: `prod_code`, `prod_desc1`, `unit_cost`, `sell_price`, `sup_code`, `sup_desc`, `dept_code`, `dept_desc`, `whole_code`, `uom_code`, `wholeprice`, `New Category`, `New Sub Category`, `Brands`

Share Editor access with team members' personal Gmail addresses. Do NOT give them Owner access.

### 3. Create the GitHub repo

While logged into the company Gmail (use a GitHub account tied to the company Gmail):

1. Create a new repo: `xyris-supermart-pricelist` (public is fine — only the public price list lives here, no secrets)
2. Clone it locally, copy this scaffolded project in, push to `main`
3. Create a fine-grained personal access token (PAT) with `Contents: read and write` permission scoped only to this repo. Save the token — you'll paste it into the Apps Script config.

### 4. Deploy to Vercel

While logged into the company Gmail (use Sign in with GitHub for Vercel):

1. Go to <https://vercel.com/new>
2. Import the GitHub repo
3. Framework preset: Next.js (auto-detected)
4. Click Deploy
5. Once deployed, you'll get a `*.vercel.app` URL — share this with users

No environment variables needed for the frontend.

### 5. Install the Apps Script

See `apps-script/README.md` for step-by-step. Summary:

1. Open the master sheet
2. Extensions → Apps Script
3. Paste the contents of `apps-script/Code.gs` and `apps-script/Config.gs`
4. Replace placeholder values in `Config.gs` (GitHub token, repo, allowed publishers)
5. Save, reload the sheet — the "Xyris" menu appears

### 6. First Publish

1. In the sheet, click `Xyris → Validate (preview only)`
2. Confirm the SKU counts look reasonable
3. Click `Xyris → Publish to Site`
4. Confirm the modal
5. Wait ~1 minute, check the Vercel URL — data should be live

## Ongoing operations

### Daily / weekly

- Editors update SKUs_Master in Sheets (any changes — prices, new SKUs, removals, category fixes)
- Publisher clicks `Xyris → Publish to Site` when ready to push changes live
- Confirm the publish summary
- Done. Site updates within ~1 minute.

### Adding a new sub-category

1. Edit the `Categories` tab in the sheet (add a row)
2. Update `docs/04-categories.md` in this repo (so the master list stays in sync)
3. Tag relevant SKUs with the new sub-category in `SKUs_Master`
4. Publish

### Adding a new editor

1. Owner opens sheet → Share
2. Add their email with Editor permission
3. They can now edit but not publish

### Adding a new publisher

1. Open `apps-script/Config.gs` in the Apps Script editor
2. Add their email to the `ALLOWED_PUBLISHERS` array
3. Save
4. They can now publish

## Custom domain (optional, later)

When ready (~3-6 months in):

1. Buy a domain — `.ph` via PhilNS or Dynadot, `.com` via Namecheap
2. In Vercel: project → Settings → Domains → Add your domain
3. Update the domain's DNS to point to Vercel (Vercel shows the exact records)
4. SSL is automatic, free
5. Update any printed marketing materials with the new URL

The `*.vercel.app` URL keeps working forever as a backup.

## Monitoring

- **Vercel Dashboard**: deployment history, error logs, basic analytics
- **GitHub commits**: every publish creates a commit — git log is your audit trail
- **Apps Script execution log**: View → Executions in the Apps Script editor
- **Plausible or Google Analytics** (optional): add the script tag to `app/layout.tsx` to track which categories users visit most

## What can go wrong, and how to fix it

| Symptom | Cause | Fix |
|---|---|---|
| Site shows old data after publish | Vercel hasn't redeployed yet | Wait 60 seconds. If still old, check GitHub for the commit. |
| Publish button shows "Not authorized" | Email not in `ALLOWED_PUBLISHERS` | Add it to `Config.gs` |
| Publish fails with GitHub error | PAT expired or revoked | Regenerate token, update `Config.gs` |
| Site shows zero SKUs in a category | JSON file missing or empty | Check the GitHub repo's `public/data/` folder for the file |
| Categories drop down is missing items | Manifest doesn't list them | Likely zero SKUs assigned to that category. Check the sheet. |
