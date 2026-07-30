// 中文版策略定義。選定策略後會覆蓋使用者的手動權重，並加上「位置規則」引導
// 求解器把特定圖表釘在特定格子上。
//
// 目前只做「Divine Border Rares」一個策略（MVP），其餘策略之後陸續補上，
// 介面與原站（Milkybk_ 社群策略）保持一致，方便日後對照擴充。

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

export interface StrategyDef {
  id: string
  name: string
  tagline: string
  guide: string[]
  weights: Weights
  rules: PositionRule[]
  layout?: Edges[]
  layoutPenalty?: number
  reserveModIds?: string[]
  reserveNames?: string[]
  requirements?: { modIds?: string[]; nameMatch?: string; count: number; label: string }[]
  requiresBorderId?: { id: string; label: string }
  waitHint?: string
}

// ⚠️ 「Sea-Pillar」圖表目前還沒有取得真實中文名稱樣本，先用「柱」這個字做暫時比對，
// 等你撿到符合的圖表後，把正確名稱貼給我，我會更新這裡。
const NAME_MATCH_PILLAR = '柱'

export const STRATEGIES: StrategyDef[] = [
  {
    id: 'divine-border-rares',
    name: 'Divine Border Rares（神聖邊界稀有怪）',
    tagline: '擲出神聖邊界，把 Sea-Pillar 圖表釘在那一格，讓整格淹沒在稀有怪中——每隻稀有怪都會掉神聖石。',
    guide: [
      '先在下方「邊界設定」把 12 段邊界擲出來，只要有一段是「相鄰區域內的稀有怪物掉落額外 1 個神聖石」（神聖邊界）就能觸發此策略。',
      '求解器會自動把你圖表庫裡名稱含「柱」（Sea-Pillar 類型）的圖表，優先放在神聖邊界貼著的那一格。',
      '接著求解器會把「稀有怪物數量」相關的圖表盡量集中在同一格與其相鄰格，最大化神聖石產出。',
      '沒有神聖邊界、或圖表庫裡沒有 Sea-Pillar 類型圖表時，這個策略效果會大打折扣，建議先換別的邊界或先囤積圖表。',
    ],
    weights: {
      'adjacent:rare': 10,
      'global:rare': 10,
      'border:rare': 10,
      'border:divine': 10,
      'adjacent:star': 8,
      'adjacent:box': 8,
      'global:possess': 6,
      'global:fracture': 6,
      'self:packsize': 3,
    },
    rules: [
      // Sea-Pillar 圖表釘在神聖邊界貼著的那一格
      { nearBorderId: 'b-divine', nameMatch: NAME_MATCH_PILLAR, bonus: 100 },
    ],
    requirements: [{ nameMatch: NAME_MATCH_PILLAR, count: 1, label: 'Sea-Pillar 類型圖表 × 1' }],
    requiresBorderId: { id: 'b-divine', label: '神聖邊界（稀有怪掉神聖石）' },
    waitHint: '沒有神聖邊界時，建議先用「純手動」規劃跑一般海圖，等重擲到神聖邊界再切回這個策略。',
  },
]

export const strategyById = new Map(STRATEGIES.map((s) => [s.id, s]))
