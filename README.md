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

## 策略與演算法介紹

<details>
<summary><strong>▶ 點此展開：策略、評分方式與求解演算法</strong></summary>

本工具不是使用 AI 判斷海圖好壞，而是根據 [Milkybk_](https://www.youtube.com/@Milkybk_) 提供的策略與權重資料，將每張海圖的固定詞綴、海域效果、邊界詞綴及擺放位置轉換成分數，再透過求解演算法尋找收益較高的九宮格排列。

### 計算流程

1. **讀取海圖資料**：辨識海圖名稱、形狀、固定詞綴、相鄰區域效果及其他相關詞綴。

2. **套用策略權重**：不同策略重視的海圖效果不同，例如保險箱、罪魂、稀有怪、魔法怪與海洋之柱，都有各自的加權分數。

3. **套用位置規則**：部分海圖必須放在特定位置才能發揮較高收益，例如：
   - 技工、命運等保險箱海圖優先放在中央。
   - 巨大海星優先放在上方或下方的中央格。
   - 罪魂囚牢優先放在右側中央格。
   - 海洋之柱會依照策略安排在角落，或放在能接觸「神聖邊界」的位置。

4. **檢查海圖連線**：演算法會旋轉海圖並檢查相鄰格子的航線是否正確連接。無效連線會受到非常高的扣分，避免產生無法使用的排列。

5. **反覆嘗試不同排列**：求解器會從多個起始排列開始，持續嘗試：
   - 交換兩張海圖的位置。
   - 將九宮格內的海圖替換成倉庫中的其他海圖。
   - 旋轉海圖方向。

   只要新排列的分數更高或相同，就保留該次調整；分數降低則還原。

6. **選出最高分結果**：每次規劃會進行約 60 次重新起步，每次最多嘗試 5,000 次調整，最後從所有結果中選出分數最高的排列。

### 評分概念

最終分數大致由以下項目組成：

> 海圖與邊界收益分數<br>
> ＋ 策略指定的位置加分<br>
> ＋ 有效連線的小幅加分<br>
> － 錯誤位置扣分<br>
> － 無效連線的大量扣分

因此，演算法不只是找出「詞綴分數最高」的九張海圖，也會同時考慮海圖的位置、旋轉方向、相鄰效果、邊界詞綴及整體連線。

### 四種策略

#### 1. 速刷保險箱

將技工、命運、奧術師、瓶中信等保險箱海圖優先放在中央，再使用高數量、高收益的海圖包圍中央格，強化相鄰區域的保險箱收益。

#### 2. 稀有怪傳說裝掉落特化

主要利用巨大海星、罪魂囚牢、燈籠、海洋之柱及稀有怪相關詞綴，集中增加稀有怪數量與傳說裝備掉落機會。

#### 3. 魔法怪流

優先選擇荒林幽光、最低魔法怪數量、額外魔法怪及燈籠等效果，集中提高區域中的魔法怪數量與相關收益。

#### 4. 稀有怪神聖雨

必須先設定「相鄰區域內的稀有怪額外掉落神聖石」邊界詞綴。演算法會優先讓海洋之柱接觸神聖邊界，再把巨大海星、保險箱與其他稀有怪來源集中在該區域附近。

### 注意事項

目前網頁實際使用的是「爬山法＋多次重新起步」的近似求解方式。它能在合理時間內找到分數很高的排列，但不保證一定是數學上的全域最佳解。

由於起始排列包含隨機因素，相同的海圖與邊界設定重複規劃時，結果可能略有不同；可以多按幾次「開始規劃」，比較不同結果的總分。

</details>

## 海圖倉庫批次複製工具

> [!CAUTION]
> **疑似踩線，禁止錄影直播，珍惜自己帳號。**

這個工具會在 Path of Exile 視窗內逐格掃描海圖倉庫，將找到的海圖文字集中複製到剪貼簿；不會自動貼到網站。

### 使用步驟

1. 下載 AHK2：[AutoHotkey v2 官網](https://www.autohotkey.com/v2/)／[**Latest Installer**](https://www.autohotkey.com/download/ahk-v2.exe)（或下載 [latest zip](https://www.autohotkey.com/download/ahk-v2.zip)）
2. 安裝完成後：[直接下載海圖倉庫批次複製 AHK（ZIP）](https://raw.githubusercontent.com/xlox123456789/3.29_Allframe_voyage_planning/main/downloads/%E6%B5%B7%E5%9C%96%E5%80%89%E5%BA%AB%E6%89%B9%E6%AC%A1%E8%A4%87%E8%A3%BD-AHK.zip)
3. 剩下步驟心領神會，不教學。

<details>
<summary>檔案 SHA-256</summary>

- `海圖倉庫批次複製-AHK.zip`：`CD98F468E8BB9BBAB2605AF6B100F5A5908CBD358D11A603F96BFBE99E6134B8`
- `海圖倉庫批次複製.ahk`：`41A5CB908325F80545A027C13448C6D0B800DDCED5AA76F2C3B0C7DE84381F2D`

</details>

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

## MIT License

Copyright 2026 3.29_Allframe_voyage_planning

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
