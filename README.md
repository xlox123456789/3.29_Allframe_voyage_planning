# 航海圖規劃器（中文版）— MVP

《流放之路》3.29「全焰之咒」航海板（Voyage Board）規劃工具中文版。
複刻自 [one-more-map/one-more-map.github.io](https://github.com/one-more-map/one-more-map.github.io)，
資料改用實測遊戲貼上文字，介面全中文化。

**目前進度：只做了 1 個策略（Divine Border Rares），其餘 4 個之後陸續補上。**

## 現在能做什麼

1. 貼上遊戲內複製（Ctrl+C）的海圖文字，一次可貼多張
2. 設定 12 段邊界（下拉選單，已內建完整 65 條邊界詞綴池）
3. 按「開始規劃」，用 Divine Border Rares 策略的權重跑求解器，
   把「Sea-Pillar 類型」圖表釘在神聖邊界那一格，其餘格子盡量塞滿稀有怪相關詞綴
4. 顯示建議擺放結果（3×3 板子 + 分數 + 航道是否可行）

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
3. **重要**：如果 repo 名稱不是 `你的帳號.github.io`（也就是不是根網域），
   要在 `vite.config.ts` 加上 `base`，否則部署後資源路徑會 404：
   ```ts
   export default defineConfig({
     plugins: [react()],
     base: '/voyage-solver-zh/', // 改成你的 repo 名稱，前後都要有斜線
   })
   ```
4. 到 repo 的 **Settings → Pages**，Source 選 **GitHub Actions**
   （已經幫你寫好 `.github/workflows/deploy.yml`，push 到 `main` 就會自動建置部署）
5. 幾分鐘後，網站會出現在 `https://你的帳號.github.io/voyage-solver-zh/`

## 資料現況與已知缺口

| 項目 | 狀態 |
|---|---|
| 5 種海圖形狀（終點/直線/轉角/交界處/十字口） | 完整 |
| 12 段邊界詞綴池（65 條） | 完整（`src/data/mods.ts` 的 `BORDER_MODS`） |
| 海圖固定詞綴（相鄰/航程效果） | 只收錄了實測樣本出現過的幾條，其餘遇到會保留原文但不參與計分 |
| Sea-Pillar 類型圖表判定 | 還不知道真實中文名稱，暫時用「名稱含『柱』」比對，需要實測樣本校正 |
| 星魚(star) / 神憑附(pantheon) / 金燈籠(box) / 附身(possess) / 破裂(fracture) 詞綴 | 尚無中文原文，Divine Border Rares 的次要權重目前不會生效 |
| 其他 4 個策略（Speedrun Strongboxes / Meatfish / Magic Ethereal / Alc & Go） | 尚未實作 |

要補齊缺口，只要把對應的海圖貼上文字丟給 Claude 就能持續擴充
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
