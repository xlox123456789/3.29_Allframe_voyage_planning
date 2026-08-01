# 亡焰咒海

🔗 **網站：https://xlox123456789.github.io/3.29_Allframe_voyage_planning/**

《流放之路（Path of Exile）》3.29「全焰之咒（Curse of the Allflame）」版本的**航海板（Voyage Board）擺放規劃工具**，中文化版本。

## 這個網站在幹嘛

3.29 版本裡，玩家會拿到一堆「海圖（Chart）」，每張圖各自帶有不同的接口形狀跟固定詞綴（相鄰效果 / 航程效果），要把 9 張圖拼進一個 3×3 的航海板裡出航；航海板外圍還有 12 段隨機擲出的邊界詞綴會加成板子裡的內容。

怎麼擺、擺哪張，會直接影響這趟航程能撈到多少稀有怪、神聖石、亡者硫酸等收益——但排列組合非常多，光靠人腦排很難排出最佳解。

這個網站幫你做這件事：

1. **設定外框邊界**：把船上擲出的 12 段邊界詞綴輸入進去（可打字搜尋，內建完整 65 條邊界詞綴池）
2. **貼上你的海圖倉庫**：遊戲內 Ctrl+C 複製海圖，直接貼進網站，一次可以貼很多張，會自動解析出每張圖的形狀、等級、固定詞綴
3. **選一個玩法策略**：目前做了社群常見的四種打法——
   - **Speedrun Strongboxes**：衝寶箱數量的效率流
   - **Meatfish**：堆疊巨怪詞綴，拚暗金掉落
   - **Magic Ethereal**：堆疊魔法怪機制密度
   - **Divine Border Rares**：靠神聖邊界 + 稀有怪，穩定產出神聖石
4. **按「開始規劃」**：程式會自動從倉庫裡選出最佳 9 張、決定每張圖該轉幾度、排在哪一格，讓所有海圖的接口能沿著路徑一路連回左下角的出發點，同時把選定策略的收益最大化

網站支援中文與英文兩種遊戲客戶端的貼上格式（可以混著貼），介面本身維持全中文。

## 策略與權重來源

本工具採用的策略來自這部 YouTube 影片：[Curse of the Allflame Buffs and My Strategy](https://www.youtube.com/watch?v=E6GMu9Z5j5U)。

這不是 AI 判斷；程式會根據影片作者提供的權重表格，計算海圖如何排列才能讓收益最大化。

**權重表格：** [Google 試算表](https://docs.google.com/spreadsheets/d/1WbjX2wjllotu4CTks3ZTDAskgafGqyKvgcNql7xRczU/htmlview?usp=sharing&pru=AAABn9R9FXc*-GqzDLF8z-wBGbz5WXXyHQ#gid=0)

## 目前的限制

- 資料是根據玩家實測遊戲畫面 + 社群整理的清單建立的，多數詞綴文字已核對過，少數效果如果之後發現對不上，歡迎回報
- 目前只做了以上四種策略，其餘玩法還沒實作

## 開發者資訊

<details>
<summary>本機執行 / 部署方式（一般玩家不需要看這段）</summary>

```bash
npm install
npm run dev       # 本機預覽，預設 http://localhost:5173
npm run build     # 正式建置到 dist/
```

專案是 Vite + React + TypeScript，`.github/workflows/deploy.yml` 已經設定好 push 到 `main` 分支會自動建置部署到 GitHub Pages。

```
src/
  types.ts               # 核心資料型別
  logic/
    parser.ts            # 貼上文字解析器（中/英文）
    connectivity.ts       # 接口連通性檢查
    scoring.ts            # 板子計分邏輯
    solver.ts             # 窮舉 / 爬山法+多次重啟 求解器
    rewards.ts            # 獎勵權重分組
  data/
    mods.ts               # 邊界詞綴 + 海圖固定詞綴資料表
    strategies.ts          # 四個策略的權重與位置規則定義
  App.tsx                 # 主要介面
  index.css               # 樣式
```

</details>
