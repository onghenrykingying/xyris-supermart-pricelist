# Xyris Pricelist — POS 原生格式改造指南（已完成，存查用）

> **狀態：改造已於 2026-09-15 完成並上線。** 這份文件保留作為歷史紀錄，不是待辦清單。
> 現行的資料流程請看 [`docs/03-data-pipeline.md`](../03-data-pipeline.md)，分類對照看 [`docs/04-categories.md`](../04-categories.md)。
>
> 文件中有兩處與實際執行結果不符，已在原處標註修正（見 5.1、5.2）。

---

## 一、改造目標

目前 Xyris Supermart Pricelist 系統的架構是：
- Google Sheet 用 14 欄「客製格式」（包含 `New Category`, `New Sub Category)`, `Brands`）
- 每次要從 POS 匯入資料時，必須先跑一個 Python 轉換腳本
- 網站前端有 3 層篩選：Category → Sub-Category → Brand

**改造後：**
- Google Sheet 用 10 欄「POS 原生格式」（直接匯入 POS 匯出檔，不用轉換）
- Categories 分頁改用 POS 的 UPPERCASE 命名（含截斷）+ 顯示名對照
- Apps Script 改成讀 POS 欄位（`dept_desc` + `cat_desc`）而不是 `New Category` + `New Sub Category)`
- **網站前端拿掉 Brand 篩選器**（只剩 Category → Sub-Category 2 層）
- Brand 相關的所有程式碼、UI、資料結構全部移除

**改造完成後的工作流程：**
1. 從 POS 系統匯出 xlsx
2. 打開 Google Sheet → 清空 `SKUs_Master` 分頁 → 匯入 POS 檔案
3. 上方選單 `Xyris → Publish to Site`
4. 完成（不需要中間任何轉換）

---

## 二、改造工程總覽

改造分成 3 個階段。**建議按順序執行**，每階段做完先驗證再進下一階段。

### 階段 1：改網站前端（拿掉 Brand 篩選器）
在你本地電腦執行，改完 push 到 GitHub，Vercel 自動 deploy 舊資料版本（先確認前端沒 Brand 也能正常運作）。

### 階段 2：改 Google Sheet 結構 + Apps Script
在瀏覽器操作 Sheet，複製新的 Apps Script 程式碼進去。

### 階段 3：測試新流程
貼原始 POS 檔案 → Validate → Publish → 驗證網站。

---

## 三、階段 1：改網站前端（Claude Code 主要負責）

### 3.1 需要改的檔案（給 Claude Code 分析）

打開專案，看看以下這些檔案哪些存在：

**類型定義（TypeScript）**
- `lib/types.ts`（如果有，改 `SKU` 型別移除 `brand`，改 `Manifest` 相關型別移除 brand 相關）
- 其他有 `Brand` 相關 interface 的檔案

**元件（React）**
- `components/Filters.tsx` 或 `components/Filter.tsx`（拿掉 Brand 篩選器 UI）
- `components/SKURow.tsx` 或 `components/ProductRow.tsx`（拿掉顯示 Brand 的地方）
- `components/SKUList.tsx`（可能有 brand-related 邏輯）
- 桌面版側邊欄（如果有分開）

**頁面 / 資料層**
- `app/page.tsx`（主頁面的 filter state 管理，可能有 selectedBrand 之類的 state）
- `lib/data.ts` 或 `lib/fetch.ts`（讀 JSON 的地方，可能有 brand 相關 parsing）

**docs（改造後也要同步更新）**
- `docs/05-column-mapping.md` — 更新 SKU 型別、Manifest 結構
- `docs/08-ui-spec.md` — 移除 Brand 篩選器的描述
- `docs/04-categories.md` — 更新為新的 POS 格式

### 3.2 具體改動指令

**移除以下所有東西：**

1. **`SKU` 型別的 `brand` 欄位**
   ```ts
   // Before
   export interface SKU {
     code: string;
     name: string;
     price: number;
     category: string;
     subCategory: string;
     brand: string;    // ← 移除
   }
   
   // After
   export interface SKU {
     code: string;
     name: string;
     price: number;
     category: string;
     subCategory: string;
   }
   ```

2. **`CategoryMeta` 和 `SubCategoryMeta` 的 `brands` 欄位**
   ```ts
   // Before
   export interface CategoryMeta {
     slug: string;
     label: string;
     skuCount: number;
     subCategories: SubCategoryMeta[];
     brands: string[];    // ← 移除
   }
   
   export interface SubCategoryMeta {
     label: string;
     skuCount: number;
     brands: string[];    // ← 移除
   }
   ```

3. **Filter 元件的 Brand 下拉選單 / 側邊欄品牌搜尋 / 品牌 checkbox**
   - 移除品牌下拉選單（mobile chip）
   - 移除品牌側邊欄（desktop sidebar 的整段品牌區塊）
   - 移除相關的 state（例如 `selectedBrand`, `brandSearchQuery` 等）
   - 移除品牌搜尋輸入框

4. **SKU Row 顯示 brand 的地方**
   ```tsx
   // Before
   <div className="text-sm text-slate-500">
     {sku.brand} · {sku.subCategory}
   </div>
   
   // After
   <div className="text-sm text-slate-500">
     {sku.subCategory}
   </div>
   ```

5. **主頁面 filter state 中的 `selectedBrand`**
   - 移除該 state
   - 移除相關的 filter 邏輯（例如 `.filter(sku => !selectedBrand || sku.brand === selectedBrand)`）

6. **`Clear all` 或類似 reset 邏輯中的 brand**
   - 移除 reset brand 的部分

### 3.3 測試

改完後：
1. `npm install`（如果第一次跑）
2. `npm run dev`
3. 打開 <http://localhost:3000>
4. 確認：
   - 頁面正常載入
   - 只剩 Category 和 Sub-Category 兩層篩選
   - SKU 列表不顯示品牌
   - 沒有 console error
5. 確認 build 成功：`npm run build`
6. 確認型別沒錯：`npm run type-check`（如果 package.json 有這個 script）

### 3.4 Commit + Push

```bash
git add .
git commit -m "refactor: remove Brand filter and brand field from UI"
git push origin main
```

Vercel 會自動 deploy。**先等 deploy 完成，確認網站還在正常運作**（會用舊 JSON 資料，暫時沒有 brand 顯示，這是正常的）。

**⚠️ 這邊先停下來，讓使用者確認網站前端沒 Brand 也能正常運作，才進階段 2。**

---

## 四、階段 2：改 Google Sheet + Apps Script（使用者手動操作）

### 4.1 這階段 Claude Code 不需要做事，只需要指引使用者

告訴使用者：「階段 1 完成，網站前端已經拿掉 Brand。現在請你打開 Google Sheet 和 Apps Script，照著這些步驟操作。」

### 4.2 使用者操作步驟

**步驟 A：備份 Apps Script（1 分鐘）**

1. 打開 Google Sheet
2. `Extensions → Apps Script`
3. 打開 `Code.gs`，選取全部 → 複製 → 貼到一個本機文字檔（例如 `Code.gs.backup`）存起來
4. 打開 `Config.gs`，做同樣的事（存成 `Config.gs.backup`）

**⚠️ 這是安全網。如果改壞了要回滾，靠這兩個檔案還原。**

**步驟 B：清空 SKUs_Master 分頁**

1. 打開 `SKUs_Master` 分頁
2. 選取第 2 行到最後（點行號 2 → `Ctrl+Shift+↓`）
3. 按 `Delete` 鍵（清內容，不刪行）
4. **同時也要刪除舊的欄位標題**：第 1 行整行內容清掉（等一下匯入 POS 檔會帶新的標題）

**步驟 C：清空並重建 Categories 分頁**

1. 打開 `Categories` 分頁
2. 選取全部（`Ctrl+A`）→ Delete
3. `File → Import → Upload` 選 `Categories_POS_native_v2.csv`（70 組對照的版本）
4. Import location 選 **`Replace current sheet`**
5. Import

**步驟 D：貼上新的 Apps Script 程式碼**

1. 回到 Apps Script 編輯器
2. 打開 `Code.gs`
3. 全選現有內容 → 刪除
4. 打開改造包的 `Code_new.gs` 檔案 → 全選複製 → 貼上到 `Code.gs`
5. 按 `Ctrl+S` 儲存
6. **Config.gs 不用動**（GitHub token 和設定保留）

**步驟 E：重新載入 Sheet**

- 關掉瀏覽器分頁，重新打開 Google Sheet
- 確認上方選單「Xyris」還在

---

## 五、階段 3：測試 + Publish

### 5.1 匯入原始 POS 檔案

> **⚠️ 實際執行修正：xlsx 無法直接匯入單一分頁。**
> Google Sheets 對 `.xlsx` 只開放「整份試算表」層級的選項（Create new / Insert new sheet(s) / Replace spreadsheet），
> `Replace current sheet` 是灰的。必須先用 Excel 另存成 **CSV UTF-8** 再匯入。
> 另外，直接複製貼上也不可行 —— 會吃掉約 400 個條碼開頭的 0，且事後無法修復。

1. 打開 POS 匯出的 xlsx 檔案
2. Excel `File → Save As` → 格式選 **CSV UTF-8**
3. 在 Google Sheet 的 `SKUs_Master` 分頁，`Cmd+A` → `Delete`
4. `File → Import → Upload` 那個 **.csv**
5. Import location: **`Replace current sheet`**
6. Convert text to numbers: **No**（避免 `prod_code` 開頭的 0 被吃掉）
7. Import

### 5.2 Validate

上方選單 `Xyris → Validate (preview only)`

**預期會看到：**

> **⚠️ 實際執行修正：那 21 筆「分類組合怪異」的 SKU 不會上線。**
> 方向 A 接受的是「**存在於 `Categories` 分頁的**組合」，而原始的 `Categories_POS_native.csv`（59 行）
> 並不包含那 11 組怪異組合，所以它們會被判為 unknown combination 而隱藏。
> 解法是在 `Categories` 分頁補上那 11 組對照，指向正確的顯示分類
> （已產生為 `Categories_POS_native_v2.csv`，70 組對照）。不需要改 POS，也不需要改 `SKUs_Master`。

用 59 行對照表（原版）：
- ✅ 10,447 SKUs 上線
- 🚫 292 marked DELETE / 4 分類空白 / 5 價格無效
- 🚫 **21 筆 unknown combination（隱藏，並在黃色警告框列出 11 組）**

用 70 行對照表（v2，最終採用）：
- ✅ **10,468 SKUs 上線**
- 🚫 292 marked DELETE / 4 分類空白 / 5 價格無效
- ✅ **0 筆 unknown combination，無警告框**
- Total rows in sheet: 10,769

如果數字合理，繼續。如果數字明顯有問題，先停下來檢查。

### 5.3 Publish

上方選單 `Xyris → Publish to Site → Publish anyway`

等 60 秒，Vercel 自動 deploy。

### 5.4 驗證網站

打開 <https://xyris-supermart-pricelist.vercel.app>

- ✅ 有商品顯示
- ✅ 沒有 Brand 篩選器
- ✅ 只有 Category → Sub-Category 兩層篩選
- ✅ 「Last updated」是今天
- ✅ 隨機挑幾個商品確認新價格

---

## 六、回滾計畫（改壞了怎麼救）

### 情境 A：網站前端改壞了（階段 1）

```bash
git log  # 找到改造前的 commit SHA
git revert <commit-sha>
git push
```

Vercel 會 rollback。

### 情境 B：Google Sheet 或 Apps Script 改壞了（階段 2）

1. **Sheet 資料**：用你當初做的備份 `Xyris Pricelist Master - Backup 2026-09-14`
   - 打開備份 sheet → `File → Make a copy` → 命名為新的 master
   - 更新 Apps Script 的 spreadsheet ID（如果有需要）
   
2. **Apps Script**：用步驟 A 存的 `Code.gs.backup`
   - 打開 Apps Script 編輯器
   - 全選現有 Code.gs 內容刪除
   - 貼上 backup 內容 → 儲存

### 情境 C：Publish 失敗

- 打開 GitHub repo → Commits
- 找到上一次成功的 Publish commit
- 點 `Revert` → confirm
- Vercel 重新 deploy 舊資料

**網站不會壞，只會顯示上一次成功 publish 的資料。**

---

## 七、改造包含的檔案清單

在這個資料夾（`migration-package/`）裡有以下檔案：

1. **`MIGRATION_GUIDE.md`**（你現在讀的這份）
2. **`Categories_POS_native.csv`** — 新的 Categories 分頁內容（4 欄結構）
3. **`Code_new.gs`** — 新的 Apps Script 程式碼（貼進 Code.gs）
4. **`POS_分類問題清單_2026-09-14.xlsx`** — 25 筆分類問題的參考清單

---

## 八、給 Claude Code 的重要提醒

1. **不要動 `Config.gs`**（含 GitHub token，機密）
2. **不要動 `apps-script/appsscript.json`**（Apps Script 的 manifest）
3. **改網站前端時，找不到某個檔案就跟使用者確認，不要瞎猜**
4. **修改 docs/ 裡的檔案時，只更新受影響的部分，不要重寫整份**
5. **每個階段結束都要跟使用者確認才進下一階段**
6. **如果發現這份文件跟實際 code 有落差**（例如你發現 `lib/types.ts` 已經沒有 `brand` 欄位了），就跟使用者說明現況，不要照著文件盲改
7. **測試永遠比動作重要**：改完 `npm run build` 一定要跑，確認沒 error

---

## 九、常見疑問

**Q：為什麼不改到「網站也用 POS 原生大寫顯示」？**
A：POS 的 `cat_desc` 是全大寫且會截斷（例如 `CANNED FRUIT OR VEGE`），直接顯示很醜。所以 Categories 分頁有第 3、4 欄的「Display Name」，網站用漂亮的顯示名。

**Q：SKUs_Master 少了 3 個欄位（`whole_code`, `uom_code`, `wholeprice`）會不會影響什麼？**
A：不會。這 3 個欄位本來就沒 publish 出去（是內部欄位）。POS 也沒提供了，所以直接不要即可。

**Q：Publish_Log 要不要動？**
A：不用動。它只是稽核記錄。

**Q：改造完後每週流程有多快？**
A：POS 匯出 → Sheet Import Replace → Publish → 完成。**大約 3 分鐘**。

---

---

## 十、實際執行結果（2026-09-15）

| 項目 | 結果 |
|---|---|
| 階段 1 — 前端移除 Brand | commit `123994a`，16 個檔案 |
| 階段 2 — Sheet + Apps Script | `SKUs_Master` 10 欄、`Categories` 70 組對照、`Code.gs` 已置換 |
| 階段 3 — Publish | commit `31938aa`，**10,468 SKUs 上線**，301 hidden |
| 線上驗證 | 兩層篩選、無 brand 欄位、無機密欄位外洩、402 個前導 0 條碼完整 |

改造過程中發現的三件事，已反映到現行文件：
1. xlsx 不能匯入單一分頁，必須先轉 CSV（見 5.1 修正）
2. `Convert text to numbers: No` 是必要設定，漏掉會毀掉約 400 個條碼且無法修復
3. 對照表的**行順序**會決定子分類在下拉選單的排序（腳本用「首次出現順序」），補充行要放檔案最後面
