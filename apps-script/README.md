# Google Apps Script — Xyris Pricelist Publisher

This folder contains the Apps Script source that lives **inside the master Google Sheet** (not in this Next.js project). It validates the sheet and publishes JSON to the GitHub repo.

## Files

- `Code.gs` — main script: menu setup, validate, publish, GitHub commit
- `Config.gs` — configuration: GitHub repo, token, allowed publishers, brand metadata
- `appsscript.json` — Apps Script manifest

## Installation (one-time, ~10 minutes)

### 1. Open the Apps Script editor

1. Open the master Google Sheet (the one with `SKUs_Master`, `Categories`, `Settings`, `Publish_Log` tabs)
2. Menu: `Extensions → Apps Script`
3. A new tab opens with the script editor

### 2. Add the script files

In the script editor:

1. Delete the default `Code.gs` content
2. Paste the contents of this folder's `Code.gs`
3. Click the `+` next to "Files" → "Script" → name it `Config`
4. Paste the contents of this folder's `Config.gs`
5. Save (Ctrl+S / Cmd+S). Name the project `Xyris Publisher`.

### 3. Configure secrets

Open `Config.gs` and update:

```js
const GITHUB_OWNER     = "your-github-username";   // e.g. "xyris-supermart"
const GITHUB_REPO      = "xyris-supermart-pricelist";
const GITHUB_BRANCH    = "main";
const GITHUB_TOKEN     = "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx";  // fine-grained PAT

const ALLOWED_PUBLISHERS = [
  "owner@gmail.com",
  "backup-publisher@gmail.com",
];
```

**To create the GitHub token:**

1. Log into GitHub with the company Gmail account
2. Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token
3. Repository access: select only `xyris-supermart-pricelist`
4. Permissions → Contents: `Read and write`
5. Expiration: 1 year (set a calendar reminder to rotate)
6. Generate, copy the token starting with `ghp_`, paste into `Config.gs`
7. **Save the script.**

### 4. Reload the sheet

Close and reopen the Google Sheet. A new menu "Xyris" appears at the right end of the menu bar.

### 5. First authorization

The first time you click `Xyris → Validate (preview only)`:

1. Google asks for permissions (read sheet, fetch external URLs)
2. Review and accept
3. The validation modal appears

### 6. First publish

1. Click `Xyris → Publish to Site`
2. Review the summary
3. Click "Publish anyway"
4. The script commits to GitHub
5. Wait ~60 seconds, check the Vercel site URL — data should be live

## Troubleshooting

| Problem | Fix |
|---|---|
| "Xyris" menu missing | Reload the sheet. Check the script has the `onOpen` trigger. |
| "Not authorized to publish" | Add your email to `ALLOWED_PUBLISHERS` in `Config.gs` |
| GitHub commit fails with 401 | Token expired or wrong. Regenerate, update `Config.gs`. |
| GitHub commit fails with 404 | Wrong owner or repo name in `Config.gs` |
| Site shows zero SKUs | Publish_Log tab will show the commit SHA. Check that commit exists in GitHub. |
| Modal shows wrong counts | The Categories tab in the sheet may not match `data/master-categories.csv`. Re-sync. |

## Updating the script

When the team needs to change validation rules or add features:

1. Open the Apps Script editor (Extensions → Apps Script from the sheet)
2. Edit `Code.gs` or `Config.gs`
3. Save
4. Test with `Xyris → Validate (preview only)` first
5. If good, publish

There's no separate "deploy" step — saving the script makes it live immediately.

## Keep the source in sync with this repo

This folder (`apps-script/`) in the Git repo is the canonical version. When a team member changes the Apps Script inside Google, they should also update these files and commit. Otherwise the repo and the live script drift apart.
