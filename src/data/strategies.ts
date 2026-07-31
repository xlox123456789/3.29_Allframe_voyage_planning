// 中文版策略定義。選定策略後會覆蓋使用者的手動權重，並加上「位置規則」引導
// 求解器把特定圖表釘在特定格子上。
//
// 權重數字與位置規則參考自：
//   - one-more-map/one-more-map.github.io（原站策略邏輯）
//   - Milkybk_ 的策略試算表（YouTube《Curse of the Allflame Buffs and My Strategy》
//     https://www.youtube.com/watch?v=E6GMu9Z5j5U 的隨附試算表）
// 所有海圖固定詞綴（相鄰/航程）已對照玩家提供的完整英文清單校正過，
// Sea-Pillar（區域名稱「海洋之柱」）、命運的保險箱＝Diviner's Strongbox 均已確認。

import type { Edges, Stat, Weights } from '../types'

export interface PositionRule {
  cells?: number[]
  nearBorderId?: string
  adjacentToBorder?: boolean
  modIds?: string[]
  nameMatch?: string
  rewardStat?: { stat: Stat; per: number }
  bonus: number
}

export interface StrategyRequirement {
  modIds?: string[]
  nameMatch?: string
  count: number
  label: string
}

export interface StrategyDef {
  id: string
  name: string
  tagline: string
  guide: string[]
  weights: Weights
  rules: PositionRule[]
  layout?: Edges[]
  layoutPenalty?: number
  requirements?: StrategyRequirement[]
  requiresBorderId?: { id: string; label: string }
  waitHint?: string
}

// 棋盤格位置（0-8）：
// 0 1 2
// 3 4 5   <- 4 = 中心
// 6 7 8   <- 6 = 起點（左下）
const CENTER = 4
const CORNERS = [0, 2, 6, 8]
const TOP_BOTTOM_MID = [1, 7]
const RIGHT_MID = 5

// ✅ 確認：「Sea Pillars」= 區域名稱「海洋之柱」（不是海圖本身的花名），
// 判斷邏輯已經改成同時比對 chart.name 與 chart.areaName。
const NAME_MATCH_PILLAR = '柱'

export const STRATEGIES: StrategyDef[] = [
  // -------------------------------------------------------------------------
  {
    id: 'speedrun-strongboxes',
    name: 'Speedrun Strongboxes（速刷強化寶箱）',
    tagline: '把一張寶箱系圖表釘在中心，旁邊塞滿高數量圖表，衝一輪就走。',
    guide: [
      '中心格優先放「Operative\'s 強化寶箱」相關圖表，沒有的話退而求其次放「Diviner\'s」或「Message in a Bottle」類型。',
      '中心格以外如果放了寶箱系圖表反而會扣分——這類圖表要集中在中心才划算。',
      '其餘格子盡量放「物品數量」較高的圖表，並留意邊界是否擲到神聖石／崇高石／古變石相關詞綴，能大幅提升單趟收益。',
      '目標是快速把 9 張圖跑完，不追求極致收益，講究翻頁速度。',
    ],
    weights: {
      'adjacent:opbox': 10,
      'adjacent:divbox': 7,
      'adjacent:msg': 7,
      'voyage:quant': 5,
      'voyage:sulph': 3,
      'border:quantconn': 6,
      'border:divine': 4,
      'border:exalt': 3,
      'border:ancient': 3,
    },
    rules: [
      { cells: [CENTER], modIds: ['adj-opbox-1', 'adj-opbox-2'], bonus: 55 },
      { cells: [CENTER], modIds: ['adj-divbox-1', 'adj-divbox-2', 'adj-msg-1', 'adj-msg-2'], bonus: 40 },
      {
        cells: [0, 1, 2, 3, 5, 6, 7, 8],
        modIds: ['adj-opbox-1', 'adj-opbox-2', 'adj-divbox-1', 'adj-divbox-2', 'adj-msg-1', 'adj-msg-2'],
        bonus: -40,
      },
    ],
    requirements: [
      {
        modIds: ['adj-opbox-1', 'adj-opbox-2', 'adj-divbox-1', 'adj-divbox-2', 'adj-msg-1', 'adj-msg-2'],
        count: 1,
        label: '任一寶箱系圖表 × 1（放中心用）',
      },
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'meatfish',
    name: 'Meatfish（巨怪暗金流）',
    tagline: '集中星魚、神憑附、金燈籠與 Sea-Pillar，堆出被神憑附的巨型稀有怪，拚暗金掉落。',
    guide: [
      '星魚（Giant Starfish）圖表放上/下中央格，神憑附（Pantheon Touched）圖表放右中央格。',
      '金燈籠圖表優先放中心，收集越多燈籠 = 越多數量與稀有度加成。',
      'Sea-Pillar 類型圖表放四個角落。',
      '這套很吃資源、風險也高（容易被巨怪反殺，俗稱 very rippy），收穫是成堆的稀有怪掉落與 Mageblood / Headhunter 級別的暗金機會。',
    ],
    weights: {
      'adjacent:star': 10,
      'adjacent:pantheon': 10,
      'adjacent:lantern': 10,
      'voyage:possess': 10,
      'voyage:fracture': 8,
      'voyage:rare': 8,
      'adjacent:rare': 6,
      'border:rare': 9,
    },
    rules: [
      { cells: TOP_BOTTOM_MID, modIds: ['adj-star-1', 'adj-star-2'], bonus: 80 },
      { cells: [RIGHT_MID], modIds: ['adj-pantheon-1'], bonus: 80 },
      { cells: [CENTER], modIds: ['adj-lantern-1'], bonus: 40 },
      { cells: CORNERS, nameMatch: NAME_MATCH_PILLAR, bonus: 40 },
    ],
    requirements: [
      { modIds: ['adj-star-1', 'adj-star-2'], count: 2, label: '星魚（Giant Starfish）圖表 × 2' },
      { modIds: ['adj-pantheon-1'], count: 1, label: '神憑附（Pantheon Touched）圖表 × 1' },
      { nameMatch: NAME_MATCH_PILLAR, count: 2, label: 'Sea-Pillar 類型圖表 × 2' },
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'magic-ethereal',
    name: 'Magic Ethereal（魔法怪流）',
    tagline: '堆疊荒林妖精與魔法怪詞綴，讓整趟航程的怪物至少都是魔法稀有度。',
    guide: [
      '荒林妖精（Wildwood Wisps）圖表放在四個邊中央格（上/下/左/右）。',
      '金燈籠圖表優先放三個角落。',
      '中心格放魔法怪相關或荒林妖精圖表都可以。',
      '這套流派收益主打機制堆疊本身帶來的怪物密度與經驗值，對亡者硫酸產出的幫助有限。',
    ],
    weights: {
      'adjacent:wisps': 10,
      'voyage:minmagic': 10,
      'adjacent:magic': 9,
      'voyage:magic': 9,
      'adjacent:lantern': 8,
      'border:magicmin': 8,
    },
    rules: [
      { cells: TOP_BOTTOM_MID.concat([3, 5]), modIds: ['adj-wisps-1', 'adj-wisps-2'], bonus: 6 },
      { cells: CORNERS, modIds: ['adj-lantern-1'], bonus: 5 },
      { cells: [CENTER], modIds: ['adj-wisps-1', 'adj-wisps-2', 'adj-magic-1', 'adj-magic-2'], bonus: 5 },
    ],
    requirements: [{ modIds: ['adj-wisps-1', 'adj-wisps-2'], count: 1, label: '荒林妖精圖表 × 1' }],
  },

  // -------------------------------------------------------------------------
  {
    id: 'divine-border-rares',
    name: 'Divine Border Rares（神聖邊界稀有怪）',
    tagline: '擲出神聖邊界，把 Sea-Pillar 圖表釘在那一格，讓整格淹沒在稀有怪中——每隻稀有怪都會掉神聖石。',
    guide: [
      '先在左邊「外框邊界詞綴」把 12 段邊界擲出來，只要有一段是「相鄰區域內的稀有怪物掉落額外 1 個神聖石」（神聖邊界）就能觸發此策略。',
      '求解器會自動把倉庫裡名稱含「柱」（Sea-Pillar 類型）的圖表，優先放在神聖邊界貼著的那一格。',
      '接著求解器會把「稀有怪物數量」相關的圖表盡量集中在同一格與其相鄰格，最大化神聖石產出。',
      '沒有神聖邊界、或倉庫裡沒有 Sea-Pillar 類型圖表時，這個策略效果會大打折扣，建議先換別的邊界或先囤積圖表。',
    ],
    weights: {
      'adjacent:rare': 10,
      'voyage:rare': 10,
      'border:rare': 10,
      'border:divine': 10,
      'adjacent:star': 8,
      'adjacent:box': 8,
      'voyage:possess': 6,
      'voyage:fracture': 6,
    },
    rules: [
      { nearBorderId: 'b-divine', nameMatch: NAME_MATCH_PILLAR, bonus: 100 },
      { nearBorderId: 'b-divine', adjacentToBorder: true, modIds: ['adj-star-1', 'adj-star-2'], bonus: 30 },
      { nearBorderId: 'b-divine', adjacentToBorder: true, modIds: ['adj-box-1', 'adj-box-2', 'adj-box-3'], bonus: 20 },
    ],
    requirements: [{ nameMatch: NAME_MATCH_PILLAR, count: 1, label: 'Sea-Pillar 類型圖表 × 1' }],
    requiresBorderId: { id: 'b-divine', label: '神聖邊界（稀有怪掉神聖石）' },
    waitHint: '沒有神聖邊界時，建議先用別的策略跑一般海圖，等重擲到神聖邊界再切回這個策略。',
  },
]

export const strategyById = new Map(STRATEGIES.map((s) => [s.id, s]))
