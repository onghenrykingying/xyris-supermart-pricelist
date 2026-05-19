/**
 * Xyris Pricelist — Publisher
 *
 * Reads SKUs_Master, validates, and commits public JSON files to the GitHub repo.
 * Config lives in Config.gs.
 *
 * Menu entries (see onOpen):
 *   - Validate (preview only): runs validation, shows summary, makes no changes
 *   - Publish to Site: validates + commits to GitHub
 *   - View Publish Log: jumps to the Publish_Log tab
 */

// ---------- Menu ----------

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Xyris")
    .addItem("Validate (preview only)", "menuValidate")
    .addItem("Publish to Site", "menuPublish")
    .addSeparator()
    .addItem("View Publish Log", "menuViewLog")
    .addToUi();
}

function menuValidate() {
  const report = buildReport_();
  const html = renderReportHtml_(report, /*publishable=*/ false);
  SpreadsheetApp.getUi().showModalDialog(html, "Validation report");
}

function menuPublish() {
  const email = Session.getActiveUser().getEmail();
  if (ALLOWED_PUBLISHERS.indexOf(email) === -1) {
    SpreadsheetApp.getUi().alert(
      "Not authorized to publish.\n\n" +
      "Your account (" + email + ") is not in the publisher list.\n" +
      "Contact the site owner to be added."
    );
    return;
  }
  const report = buildReport_();
  const html = renderReportHtml_(report, /*publishable=*/ true);
  SpreadsheetApp.getUi().showModalDialog(html, "Publish summary");
}

function menuViewLog() {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName("Publish_Log") || ss.insertSheet("Publish_Log");
  ss.setActiveSheet(sheet);
}

// ---------- Validation + build ----------

/**
 * Reads the master sheet and produces a structured report:
 *   { live: SKU[], hidden: {...counts}, flagged: {...rows}, masterCats, settings }
 */
function buildReport_() {
  const ss = SpreadsheetApp.getActive();

  // Load Categories tab (master list)
  const catSheet = ss.getSheetByName("Categories");
  if (!catSheet) throw new Error("Categories tab is missing");
  const catValues = catSheet.getDataRange().getValues();
  const masterCats = {}; // cat -> Set of subcats
  for (let i = 1; i < catValues.length; i++) {
    const cat = String(catValues[i][0] || "").trim();
    const sub = String(catValues[i][1] || "").trim();
    if (!cat) continue;
    if (!masterCats[cat]) masterCats[cat] = {};
    masterCats[cat][sub] = true;
  }

  // Load Settings tab
  const setSheet = ss.getSheetByName("Settings");
  if (!setSheet) throw new Error("Settings tab is missing");
  const setValues = setSheet.getDataRange().getValues();
  const settings = {};
  for (let i = 1; i < setValues.length; i++) {
    const key = String(setValues[i][0] || "").trim();
    const val = String(setValues[i][1] || "").trim();
    if (key) settings[key] = val;
  }

  // Load SKUs_Master
  const skuSheet = ss.getSheetByName("SKUs_Master");
  if (!skuSheet) throw new Error("SKUs_Master tab is missing");
  const skuData = skuSheet.getDataRange().getValues();
  const headers = skuData[0].map(function(h){ return String(h).trim(); });
  const colIdx = {};
  headers.forEach(function(h, i){ colIdx[h] = i; });

  // Required columns
  const required = ["prod_code","prod_desc1","sell_price","sup_desc","New Category","New Sub Category","Brands"];
  for (let r = 0; r < required.length; r++) {
    if (colIdx[required[r]] === undefined) {
      throw new Error("SKUs_Master is missing required column: " + required[r]);
    }
  }

  const live = [];
  const hidden = { delete: 0, noCategory: 0, noPrice: 0, outsource: 0 };
  const flagged = { badCategory: [], badSubCategory: [] };

  for (let i = 1; i < skuData.length; i++) {
    const row = skuData[i];

    const sup = String(row[colIdx["sup_desc"]] || "").trim().toUpperCase();
    if (sup === "DELETE") { hidden.delete++; continue; }

    const cat = String(row[colIdx["New Category"]] || "").trim();
    if (cat === "Outsource") { hidden.outsource++; continue; }
    if (!cat || cat === "#N/A") { hidden.noCategory++; continue; }

    const priceStr = String(row[colIdx["sell_price"]] || "").replace(/,/g, "").trim();
    const price = parseFloat(priceStr);
    if (isNaN(price) || price <= 0) { hidden.noPrice++; continue; }

    if (!masterCats[cat]) {
      flagged.badCategory.push({
        code: String(row[colIdx["prod_code"]] || "").trim(),
        name: String(row[colIdx["prod_desc1"]] || "").trim(),
        cat: cat
      });
      continue;
    }

    const sub = String(row[colIdx["New Sub Category"]] || "").trim();
    if (!masterCats[cat][sub]) {
      flagged.badSubCategory.push({
        code: String(row[colIdx["prod_code"]] || "").trim(),
        name: String(row[colIdx["prod_desc1"]] || "").trim(),
        cat: cat, sub: sub
      });
      continue;
    }

    live.push({
      code: String(row[colIdx["prod_code"]] || "").trim(),
      name: String(row[colIdx["prod_desc1"]] || "").trim(),
      price: Math.round(price * 100) / 100,
      category: cat,
      subCategory: sub,
      brand: (String(row[colIdx["Brands"]] || "").trim()) || "Others"
    });
  }

  return {
    totalInSheet: skuData.length - 1,
    live: live,
    hidden: hidden,
    flagged: flagged,
    masterCats: masterCats,
    settings: settings
  };
}

// ---------- Modal rendering ----------

function renderReportHtml_(report, publishable) {
  const lh = report.live.length;
  const h = report.hidden;
  const fbc = report.flagged.badCategory.length;
  const fbs = report.flagged.badSubCategory.length;

  const escape = function(s) {
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  };

  let flagRows = "";
  report.flagged.badCategory.slice(0, 20).forEach(function(r){
    flagRows += "<li>" + escape(r.code) + " — " + escape(r.name) + " (category \"" + escape(r.cat) + "\" not in master list)</li>";
  });
  report.flagged.badSubCategory.slice(0, 20).forEach(function(r){
    flagRows += "<li>" + escape(r.code) + " — " + escape(r.name) + " (sub \"" + escape(r.sub) + "\" not under \"" + escape(r.cat) + "\")</li>";
  });
  if (fbc + fbs > 20) {
    flagRows += "<li><em>... and " + (fbc + fbs - 20) + " more. See Publish_Log after publish.</em></li>";
  }

  const buttons = publishable
    ? '<button onclick="google.script.run.withSuccessHandler(close_).doPublish()">Publish anyway</button>' +
      '<button onclick="google.script.host.close()">Cancel</button>'
    : '<button onclick="google.script.host.close()">Close</button>';

  const html =
    '<style>' +
    'body{font:14px Arial,sans-serif;padding:0 8px;color:#1F2937}' +
    'h3{margin:8px 0}' +
    '.live{color:#15803D;font-size:18px;font-weight:bold;margin:12px 0}' +
    '.section{margin:12px 0}' +
    '.section h4{margin:6px 0;font-size:13px;color:#64748B;font-weight:600;text-transform:uppercase}' +
    'ul{margin:6px 0;padding-left:20px}' +
    'li{margin:3px 0}' +
    '.flag{background:#FEF3C7;padding:8px;border-radius:4px;margin-top:8px}' +
    '.actions{margin-top:16px;text-align:right}' +
    'button{padding:8px 16px;margin-left:8px;border-radius:4px;border:1px solid #CBD5E1;background:#fff;cursor:pointer;font-size:14px}' +
    'button:first-child{background:#264DAC;color:#fff;border-color:#264DAC}' +
    '</style>' +
    '<div class="live">✅ ' + lh.toLocaleString() + ' SKUs will go live</div>' +
    '<div class="section"><h4>Hidden (silent)</h4><ul>' +
      '<li>' + h.delete + ' marked DELETE</li>' +
      '<li>' + h.noCategory + ' uncategorized (blank or #N/A)</li>' +
      '<li>' + h.noPrice + ' with invalid or ₱0 price</li>' +
      '<li>' + h.outsource + ' in "Outsource" category</li>' +
    '</ul></div>' +
    (fbc + fbs > 0
      ? '<div class="section flag"><h4>⚠ Flagged (excluded — please fix in sheet)</h4>' +
        '<div>' + fbc + ' with unknown category, ' + fbs + ' with sub under wrong parent</div>' +
        '<ul>' + flagRows + '</ul></div>'
      : '<div class="section"><h4>⚠ Flagged</h4><div>None 🎉</div></div>') +
    '<div style="color:#64748B;font-size:12px;margin-top:12px">Total rows in sheet: ' + report.totalInSheet + '</div>' +
    '<div class="actions">' + buttons + '</div>' +
    '<script>function close_(){google.script.host.close()}</script>';

  return HtmlService.createHtmlOutput(html).setWidth(560).setHeight(520);
}

// ---------- Publish (called from modal) ----------

function doPublish() {
  const report = buildReport_();
  const now = new Date();
  const isoTs = now.toISOString();

  // Build manifest + per-category files
  const files = buildOutputFiles_(report, isoTs);

  // Commit to GitHub
  const commitSha = commitFilesToGithub_(files, report, isoTs);

  // Log
  appendPublishLog_({
    timestamp: isoTs,
    publisher: Session.getActiveUser().getEmail(),
    skusLive: report.live.length,
    skusHidden: report.hidden.delete + report.hidden.noCategory + report.hidden.noPrice + report.hidden.outsource,
    skusFlagged: report.flagged.badCategory.length + report.flagged.badSubCategory.length,
    commitSha: commitSha,
    status: "success"
  });

  SpreadsheetApp.getActiveSpreadsheet().toast(
    "Published " + report.live.length.toLocaleString() + " SKUs. Site updates in ~60 sec.",
    "Xyris", 7
  );
}

function buildOutputFiles_(report, isoTs) {
  // Display order from docs/04-categories.md
  const DISPLAY_ORDER = [
    "Beverages","Liquor & Tobacco","Dairy & Bakery","Pantry & Cooking",
    "Canned Goods","Snacks & Confectionery","Personal Care",
    "Health & Pharmacy","Household","Baby","Misc"
  ];

  function slugify(s) {
    return String(s).toLowerCase()
      .replace(/ & /g, " ")
      .replace(/&/g, " ")
      .replace(/,/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/ /g, "-");
  }

  // Group live SKUs by category
  const byCat = {};
  report.live.forEach(function(s){
    if (!byCat[s.category]) byCat[s.category] = [];
    byCat[s.category].push(s);
  });

  const categories = [];
  const categoryFiles = {};

  for (let i = 0; i < DISPLAY_ORDER.length; i++) {
    const cat = DISPLAY_ORDER[i];
    const skus = byCat[cat] || [];
    if (skus.length === 0) continue;

    // Sub-category meta in master order
    const subOrder = Object.keys(report.masterCats[cat] || {});
    const bySub = {};
    skus.forEach(function(s){
      if (!bySub[s.subCategory]) bySub[s.subCategory] = [];
      bySub[s.subCategory].push(s);
    });

    const subMeta = [];
    subOrder.forEach(function(sub){
      const subSkus = bySub[sub] || [];
      if (subSkus.length === 0) return;
      const brands = {};
      subSkus.forEach(function(s){ brands[s.brand] = true; });
      subMeta.push({
        label: sub,
        skuCount: subSkus.length,
        brands: Object.keys(brands).sort()
      });
    });

    const catBrands = {};
    skus.forEach(function(s){ catBrands[s.brand] = true; });

    const slug = slugify(cat);
    categories.push({
      slug: slug,
      label: cat,
      skuCount: skus.length,
      subCategories: subMeta,
      brands: Object.keys(catBrands).sort()
    });

    categoryFiles[slug] = {
      category: cat,
      generatedAt: isoTs,
      skus: skus
    };
  }

  // Settings mapping (sheet keys → manifest field names)
  const s = report.settings;
  const manifest = {
    generatedAt: isoTs,
    totalSKUs: report.live.length,
    categories: categories,
    settings: {
      brandName: s.brand_name || "Xyris Supermart",
      brandTagline: s.brand_tagline || "",
      phoneCall: s.phone_call || "",
      phoneDisplay: s.phone_display || "",
      messengerUrl: s.messenger_url || "",
      viberChat: s.viber_chat || "",
      viberChannelUrl: s.viber_channel_url || "",
      viberChannelLabel: s.viber_channel_label || "Join Viber for promos",
      footerAddress: s.footer_address || "",
      footerNote: s.footer_note || ""
    }
  };

  const out = { "public/data/manifest.json": JSON.stringify(manifest, null, 2) };
  Object.keys(categoryFiles).forEach(function(slug){
    out["public/data/" + slug + ".json"] = JSON.stringify(categoryFiles[slug], null, 2);
  });
  return out;
}

// ---------- GitHub commit (Trees API for atomic multi-file commit) ----------

function commitFilesToGithub_(files, report, isoTs) {
  const headers = {
    Authorization: "token " + GITHUB_TOKEN,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
  };
  const repoBase = "https://api.github.com/repos/" + GITHUB_OWNER + "/" + GITHUB_REPO;

  // 1. Get the SHA of the current branch HEAD
  const refResp = UrlFetchApp.fetch(repoBase + "/git/ref/heads/" + GITHUB_BRANCH, { headers: headers, muteHttpExceptions: true });
  if (refResp.getResponseCode() >= 300) throw new Error("GitHub ref error: " + refResp.getContentText());
  const headSha = JSON.parse(refResp.getContentText()).object.sha;

  // 2. Get the commit to find tree sha
  const commitResp = UrlFetchApp.fetch(repoBase + "/git/commits/" + headSha, { headers: headers });
  const baseTreeSha = JSON.parse(commitResp.getContentText()).tree.sha;

  // 3. Create blobs for each file
  const treeEntries = [];
  Object.keys(files).forEach(function(path){
    const blobResp = UrlFetchApp.fetch(repoBase + "/git/blobs", {
      method: "post", headers: headers, contentType: "application/json",
      payload: JSON.stringify({ content: files[path], encoding: "utf-8" })
    });
    if (blobResp.getResponseCode() >= 300) throw new Error("GitHub blob error: " + blobResp.getContentText());
    treeEntries.push({
      path: path, mode: "100644", type: "blob",
      sha: JSON.parse(blobResp.getContentText()).sha
    });
  });

  // 4. Create new tree (based on existing tree, with our files overlaid)
  const treeResp = UrlFetchApp.fetch(repoBase + "/git/trees", {
    method: "post", headers: headers, contentType: "application/json",
    payload: JSON.stringify({ base_tree: baseTreeSha, tree: treeEntries })
  });
  if (treeResp.getResponseCode() >= 300) throw new Error("GitHub tree error: " + treeResp.getContentText());
  const newTreeSha = JSON.parse(treeResp.getContentText()).sha;

  // 5. Create commit
  const ts = isoTs.substring(0, 16).replace("T", " ");
  const flagged = report.flagged.badCategory.length + report.flagged.badSubCategory.length;
  const msg = "Publish " + ts + " (" + report.live.length + " SKUs, " + flagged + " flagged) by " + Session.getActiveUser().getEmail();
  const commitNewResp = UrlFetchApp.fetch(repoBase + "/git/commits", {
    method: "post", headers: headers, contentType: "application/json",
    payload: JSON.stringify({ message: msg, tree: newTreeSha, parents: [headSha] })
  });
  if (commitNewResp.getResponseCode() >= 300) throw new Error("GitHub commit error: " + commitNewResp.getContentText());
  const newCommitSha = JSON.parse(commitNewResp.getContentText()).sha;

  // 6. Update branch ref
  const refUpdate = UrlFetchApp.fetch(repoBase + "/git/refs/heads/" + GITHUB_BRANCH, {
    method: "patch", headers: headers, contentType: "application/json",
    payload: JSON.stringify({ sha: newCommitSha })
  });
  if (refUpdate.getResponseCode() >= 300) throw new Error("GitHub ref update error: " + refUpdate.getContentText());

  return newCommitSha;
}

// ---------- Publish log ----------

function appendPublishLog_(entry) {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName("Publish_Log");
  if (!sheet) {
    sheet = ss.insertSheet("Publish_Log");
    sheet.appendRow(["timestamp","publisher","skus_live","skus_hidden","skus_flagged","commit_sha","status"]);
  }
  sheet.appendRow([
    entry.timestamp, entry.publisher, entry.skusLive, entry.skusHidden,
    entry.skusFlagged, entry.commitSha, entry.status
  ]);
}
