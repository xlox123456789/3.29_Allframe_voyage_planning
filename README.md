# 亡焰咒海 — MVP

🔗 **上線網址：https://xlox123456789.github.io/3.29_Allframe_voyage_planning/**

《流放之路》3.29「全焰之咒」航海板（Voyage Board）規劃工具中文版。
複刻自 [one-more-map/one-more-map.github.io](https://github.com/one-more-map/one-more-map.github.io)，
資料改用實測遊戲貼上文字，介面全中文化。

**目前進度：4 個策略都已建立（Speedrun Strongboxes / Meatfish / Magic Ethereal / Divine Border Rares），
但部分策略需要的海圖固定詞綴中文原文還沒收集齊，詳見下方「資料現況」。**

## 現在能做什麼

1. 設定 12 段邊界（點格子彈出可打字搜尋的選單，已內建完整 65 條邊界詞綴池）
2. 貼上遊戲內複製（Ctrl+C）的海圖文字到「海圖倉庫」，一次可貼多張
3. 選擇策略（Speedrun Strongboxes / Meatfish / Magic Ethereal / Divine Border Rares），
   下方會顯示這個策略的玩法說明與「需求檢查」（缺邊界或缺特定圖表會標紅提醒）
4. 按「開始規劃」，求解器會依選定策略的權重與位置規則排出建議擺放
5. 結果直接顯示在左邊的九宮格裡（含每張圖的接口形狀圖示）

## 本機開發

```bash
npm install
npm run dev       # 本機預覽，預設 http://localhost:5173
npm run build     # 正式建置到 dist/
```

## 部署到 GitHub Pages（步驟）

1. 在 GitHub 建立一個新 repo（例如 `你的帳號/voyage-solver-zh`）
2. 把這個資料夾的內容全部 push 上去：
   ```bash
   git init
   git add .
   git commit -m "init: 中文版航海圖規劃器 MVP"
   git branch -M main
   git remote add origin https://github.com/你的帳號/voyage-solver-zh.git
   git push -u origin main
   ```
3. `vite.config.ts` 裡的 `base` 已經幫你設定成 `/3.29_Allframe_voyage_planning/`，跟你現在的 repo 名稱一致，不用再改。
   如果之後改了 repo 名稱，記得同步修改這裡（前後都要有斜線），不然部署後會空白 404：
   ```ts
   export default defineConfig({
     plugins: [react()],
     base: '/新的repo名稱/',
   })
   ```
4. 到 repo 的 **Settings → Pages**，Source 選 **GitHub Actions**
   （已經幫你寫好 `.github/workflows/deploy.yml`，push 到 `main` 就會自動建置部署）
5. 幾分鐘後，網站會出現在 `https://你的帳號.github.io/voyage-solver-zh/`

## 資料現況與已知缺口

| 項目 | 狀態 |
|---|---|
| 5 種海圖形狀（終點/直線/轉角/交界處/十字口） | 完整（中/英文都支援） |
| 12 段邊界詞綴池（65 條） | 完整，中英文對照（`src/data/mods.ts` 的 `BORDER_MODS`） |
| 海圖固定詞綴（相鄰/航程效果） | 完整，中英文對照 |
| Sea-Pillar 類型圖表判定 | ✅ 已確認：Sea Pillars／海洋之柱是「區域名稱」不是海圖本身的花名，判斷邏輯已修正為比對 `areaName` 欄位 |
| 「命運的保險箱」= Diviner's Strongbox | ✅ 已確認 |
| 中／英文貼上格式 | 都支援，可以同時貼中文跟英文海圖，程式會自動判斷語言分別解析 |
| 右上角語言切換 | 切換後「邊界選單」與「海圖貼上框」的提示文字會改成英文，其餘介面維持中文 |
| 4 個策略的權重與位置規則 | 已全部生效 |

如果之後遇到目前清單裡沒有的詞綴，把貼上文字丟給 Claude 就能持續擴充
`src/data/mods.ts`、`src/data/strategies.ts`，不用改動其他程式邏輯。

## 專案結構

```
src/
  types.ts              # 核心資料型別（語言無關，直接沿用原站）
  logic/
    parser.ts           # 中文版貼上文字解析器
    connectivity.ts      # 接口連通性檢查（沿用原站，語言無關）
    scoring.ts            # 板子計分邏輯（沿用原站，語言無關）
    solver.ts               # 窮舉 / 爬山法+多次重啟 求解器（沿用原站，語言無關）
    rewards.ts               # 獎勵權重分組（沿用原站，語言無關）
  data/
    mods.ts              # 中文版邊界詞綴 + 海圖固定詞綴資料表
    strategies.ts         # 中文版策略定義（目前只有 Divine Border Rares）
  App.tsx                # 主要介面
  index.css              # 樣式
```
