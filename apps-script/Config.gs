/**
 * Xyris Pricelist — Configuration
 *
 * Edit these values for your environment.
 * Do NOT commit a real GITHUB_TOKEN to the public GitHub repo.
 * The token only lives inside this Apps Script (which is private to your sheet).
 */

// GitHub repo settings
const GITHUB_OWNER   = "REPLACE_ME";              // e.g. "xyris-supermart"
const GITHUB_REPO    = "xyris-supermart-pricelist";
const GITHUB_BRANCH  = "main";

// Fine-grained personal access token with Contents: read+write on the repo above.
// Create at https://github.com/settings/personal-access-tokens
const GITHUB_TOKEN   = "REPLACE_ME_ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx";

// Emails allowed to click "Publish to Site". Editors not on this list
// can still edit the sheet and run "Validate (preview only)".
const ALLOWED_PUBLISHERS = [
  "REPLACE_ME@gmail.com",
];
