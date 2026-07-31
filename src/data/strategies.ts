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
import type { ChartMatcher } from '../logic/chartMatching'

export interface PositionRule extends ChartMatcher {
  cells?: number[]
  nearBorderId?: string
  adjacentToBorder?: boolean
  rewardStat?: { stat: Stat; per: number }
  bonus: number
}

export interface StrategyRequirement extends ChartMatcher {
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
    name: 'Speedrun Strongboxes（速刷保險箱）',
    tagline: '把一張保險箱海圖釘在中心，旁邊塞滿高數量海圖，衝一輪就走。',
    guide: [
      '中心格優先放「技工保險箱」海圖，沒有的話退而求其次放「奧術師保險箱」、「命運保險箱」或「瓶中信」海圖。',
      '中心格以外如果放了保險箱海圖反而會扣分——這類海圖要集中在中心才划算。',
      '其餘格子盡量放「物品數量」較高的圖表，並留意邊界是否擲到神聖石／崇高石／古變石相關詞綴，能大幅提升單趟收益。',
      '目標是快速把 9 張圖跑完，不追求極致收益，講究翻頁速度。',
    ],
    weights: {
      'adjacent:opbox': 10,
      'adjacent:arcanistbox': 7,
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
      {
        cells: [CENTER],
        modIds: ['adj-opbox-1', 'adj-opbox-2'],
        implicitTextMatch: ["Operative's Strongbox", '技工保險箱', '特工的保險箱'],
        bonus: 55,
      },
      {
        cells: [CENTER],
        modIds: ['adj-arcanistbox-1', 'adj-arcanistbox-2', 'adj-divbox-1', 'adj-divbox-2', 'adj-msg-1', 'adj-msg-2'],
        implicitTextMatch: [
          "Arcanist's Strongbox",
          "Diviner's Strongbox",
          'Messages in Bottles',
          'Message in a Bottle',
          '奧術師的保險箱',
          '命運保險箱',
          '命運的保險箱',
          '瓶中信',
        ],
        bonus: 40,
      },
      {
        cells: [0, 1, 2, 3, 5, 6, 7, 8],
        modIds: [
          'adj-opbox-1',
          'adj-opbox-2',
          'adj-arcanistbox-1',
          'adj-arcanistbox-2',
          'adj-divbox-1',
          'adj-divbox-2',
          'adj-msg-1',
          'adj-msg-2',
        ],
        implicitTextMatch: [
          "Operative's Strongbox",
          "Arcanist's Strongbox",
          "Diviner's Strongbox",
          'Messages in Bottles',
          'Message in a Bottle',
          '技工保險箱',
          '特工的保險箱',
          '奧術師的保險箱',
          '命運保險箱',
          '命運的保險箱',
          '瓶中信',
        ],
        bonus: -40,
      },
    ],
    requirements: [
      {
        modIds: [
          'adj-opbox-1',
          'adj-opbox-2',
          'adj-arcanistbox-1',
          'adj-arcanistbox-2',
          'adj-divbox-1',
          'adj-divbox-2',
          'adj-msg-1',
          'adj-msg-2',
        ],
        implicitTextMatch: [
          "Operative's Strongbox",
          "Arcanist's Strongbox",
          "Diviner's Strongbox",
          'Messages in Bottles',
          'Message in a Bottle',
          '技工保險箱',
          '特工的保險箱',
          '奧術師的保險箱',
          '命運保險箱',
          '命運的保險箱',
          '瓶中信',
        ],
        count: 1,
        label: '技工／奧術師／命運保險箱或瓶中信海圖 × 1（放中心用）',
      },
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'meatfish',
    name: 'Meatfish（稀有怪傳說裝掉落特化）',
    tagline: '集中巨大海星、罪魂、金燈籠與海洋之柱，堆出被罪魂附身的巨型稀有怪，拚傳說裝掉落。',
    guide: [
      '巨大海星海圖放上／下中央格，罪魂海圖放右中央格。',
      '金燈籠圖表優先放中心，收集越多燈籠 = 越多數量與稀有度加成。',
      '海洋之柱海圖放四個角落。',
      '這套很吃資源、風險也高（容易被巨怪反殺，俗稱 very rippy），收穫是成堆的稀有怪掉落與 Mageblood / Headhunter 級別的傳說裝機會。',
    ],
    weights: {
      'adjacent:star': 10,
      'adjacent:pantheon': 10,
      'adjacent:prison': 10,
      'adjacent:lantern': 10,
      'voyage:possess': 10,
      'voyage:fracture': 8,
      'voyage:rare': 8,
      'adjacent:rare': 6,
      'border:rare': 9,
    },
    rules: [
      { cells: TOP_BOTTOM_MID, modIds: ['adj-star-1', 'adj-star-2'], bonus: 80 },
      {
        cells: [RIGHT_MID],
        modIds: ['adj-pantheon-1', 'adj-prison-1', 'adj-prison-2'],
        implicitTextMatch: ['關滿罪魂的囚牢', 'cage of Tormented Spirits', 'cages of Tormented Spirits'],
        bonus: 80,
      },
      { cells: [CENTER], modIds: ['adj-lantern-1'], bonus: 40 },
      { cells: CORNERS, nameMatch: NAME_MATCH_PILLAR, bonus: 40 },
    ],
    requirements: [
      { modIds: ['adj-star-1', 'adj-star-2'], count: 2, label: '巨大海星海圖 × 2' },
      {
        modIds: ['adj-pantheon-1', 'adj-prison-1', 'adj-prison-2'],
        implicitTextMatch: ['關滿罪魂的囚牢', 'cage of Tormented Spirits', 'cages of Tormented Spirits'],
        count: 1,
        label: '罪魂海圖 × 1',
      },
      { nameMatch: NAME_MATCH_PILLAR, count: 2, label: '海洋之柱海圖 × 2' },
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
    name: 'Divine Border Rares（稀有怪神聖雨）',
    tagline: '擲出神聖邊界，把海洋之柱海圖釘在那一格，讓整格淹沒在稀有怪中——每隻稀有怪都會掉神聖石。',
    guide: [
      '先在左邊「外框邊界詞綴」把 12 段邊界擲出來，只要有一段是「相鄰區域內的稀有怪物掉落額外 1 個神聖石」（神聖邊界）就能觸發此策略。',
      '求解器會自動把倉庫裡名稱含「柱」的海洋之柱海圖，優先放在神聖邊界貼著的那一格。',
      '接著求解器會把「稀有怪物數量」相關的圖表盡量集中在同一格與其相鄰格，最大化神聖石產出。',
      '沒有神聖邊界、或倉庫裡沒有海洋之柱海圖時，這個策略效果會大打折扣，建議先換別的邊界或先囤積海圖。',
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
    requirements: [{ nameMatch: NAME_MATCH_PILLAR, count: 1, label: '海洋之柱海圖 × 1' }],
    requiresBorderId: { id: 'b-divine', label: '神聖邊界（稀有怪掉神聖石）' },
    waitHint: '沒有神聖邊界時，建議先用別的策略跑一般海圖，等重擲到神聖邊界再切回這個策略。',
  },
]

export const strategyById = new Map(STRATEGIES.map((s) => [s.id, s]))
