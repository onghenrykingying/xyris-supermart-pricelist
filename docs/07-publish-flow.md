# 07 — Publish Flow

## End-to-end timeline

1. **Editor** updates rows in `SKUs_Master` (any time, any number of changes)
2. **Publisher** clicks `Xyris → Publish to Site` in the sheet menu
3. **Apps Script** runs validation → shows confirmation modal
4. **Publisher** reviews the modal and clicks Publish anyway (or Cancel)
5. **Apps Script** builds JSON files → commits to GitHub via API
6. **GitHub** webhook fires → Vercel rebuilds
7. **Vercel** deploys updated static site (~30-60 seconds)
8. **Site** is live with new data; users see updated prices within ~1 minute

## Publisher restriction

In `apps-script/Config.gs`:

```js
const ALLOWED_PUBLISHERS = [
  "owner@gmail.com",
  "backup-publisher@gmail.com",
];
```

The menu shows the "Publish to Site" item to everyone, but the function checks `Session.getActiveUser().getEmail()` against the list and refuses with a polite message if the user isn't authorized.

## Confirmation modal flow

```
Click "Publish to Site"
        ↓
Apps Script runs validation
        ↓
Modal opens with summary:
┌────────────────────────────────────────┐
│  Publish summary                       │
│                                        │
│  ✅ 10,107 SKUs will go live           │
│                                        │
│  Hidden (silent):                      │
│  • 323 marked DELETE                   │
│  • 101 uncategorized                   │
│  • 88 invalid/₱0 price                 │
│                                        │
│  ⚠ Flagged (excluded):                 │
│  • 6 sub-category wrong parent         │
│                                        │
│  Total in sheet: 10,623                │
│                                        │
│  [Cancel]    [Publish anyway]          │
└────────────────────────────────────────┘
        ↓ (Publish anyway)
Build JSON files in memory
        ↓
Commit all files in single Git tree commit
        ↓
Append row to Publish_Log tab
        ↓
Show success toast:
"Published 10,107 SKUs. Site will update in ~1 min."
```

## GitHub commit details

- **Branch**: `main` (commits go directly; no PRs)
- **Commit message format**: `Publish YYYY-MM-DD HH:MM (N SKUs, M flagged) by {email}`
- **Commit author**: a bot identity using the company Gmail (set in Apps Script `git config`)
- **Single atomic commit**: use the GitHub Trees API to commit `manifest.json` + all 11 category files in one operation, so the site never sees a partial update

## What if the publisher closes the modal without confirming?

Nothing happens. No changes to the repo, no log entry. The sheet stays as-is.

## What if the GitHub API call fails?

- Apps Script catches the error
- Shows a toast: "Publish failed: {error}. Please retry or contact support."
- Logs the error to a `Publish_Errors` tab (auto-created if it doesn't exist)
- The site continues serving the previous successful publish
- No partial state is possible because the commit is atomic

## Rollback

To revert to a previous publish:

1. Go to the GitHub repo
2. Find the previous "Publish ..." commit
3. Click "Revert" (one click)
4. Vercel re-deploys automatically

There is no rollback button inside the Apps Script. The Git history is the rollback mechanism.

## Validate-only mode

For previewing without publishing:

`Xyris → Validate (preview only)` opens the same modal but the only button is "Close". Anyone in the team can run this. Useful before a publish to spot-check what would change.

## Publish_Log tab

Each row:

| timestamp | publisher | skus_live | skus_hidden | skus_flagged | commit_sha | status |
|---|---|---|---|---|---|---|
| 2026-05-19 14:32 | owner@gmail.com | 10107 | 512 | 6 | a3f8d2c | success |
| 2026-05-19 09:15 | owner@gmail.com | 10103 | 514 | 8 | b8e1c4f | success |

Useful for the team to see who published what and when.
