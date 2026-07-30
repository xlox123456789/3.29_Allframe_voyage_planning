// 中文版海圖貼上解析器，依實測遊戲文字格式撰寫（2026-07 3.29 全焰之咒）。
//
// 一張海圖貼上文字大致長這樣：
//   物品種類: 海圖
//   稀有度: 稀有
//   <稀有名 1-2 行 / 魔法或普通只有 1 行>
//   --------
//   <深海區域類型>
//   區域等級: N
//   物品稀有度: +N% (augmented)      <- 表頭獎勵百分比，可有可無、可多個
//   --------
//   需求: 等級: N
//   --------
//   物品等級: N
//   --------
//   { 固定詞綴 }
//   <相鄰/航程效果原文一行>
//   --------
//   海圖形狀： <終點|直線|轉角|交界處|十字口>
//   --------
//   { 前綴 "xxx"(階層：N)— 標籤,標籤 }
//   <效果文字，可能多行，括號說明文字會被跳過>
//   { 後綴 ... }
//   ...
//   --------
//   將此物品帶給君王號上的薇洛里，以測繪這片區域。

import { VOYAGE_MODS } from '../data/mods'
import type { ChartData, Edges, Stat } from '../types'

let uidCounter = 0
export function newUid(): string {
  uidCounter += 1
  return `c${Date.now().toString(36)}-${uidCounter}`
}

/** 海圖形狀 -> 接口 [北,東,南,西]。方向任意（求解器可旋轉），只有接口數量/排列重要 */
export const SHAPE_EDGES: Record<string, Edges> = {
  '終點': [true, false, false, false],
  '直線': [true, false, true, false],
  '轉角': [true, true, false, false],
  '交界處': [true, true, true, false],
  '十字口': [true, true, true, true],
}

/** 表頭獎勵百分比欄位 -> 我們的 Stat */
const HEADER_STATS: { re: RegExp; stat: Stat }[] = [
  { re: /物品數量:\s*\+?(\d+)%/, stat: 'quantity' },
  { re: /物品稀有度:\s*\+?(\d+)%/, stat: 'rarity' },
  { re: /已找到金幣:\s*\+?(\d+)%/, stat: 'gold' },
  { re: /亡者硫酸:\s*\+?(\d+)%/, stat: 'sulphur' },
  { re: /怪物群大小:\s*\+?(\d+)%/, stat: 'packsize' },
  { re: /找到的探索員:\s*\+?(\d+)%/, stat: 'scarabs' },
  { re: /找到的通貨:\s*\+?(\d+)%/, stat: 'currency' },
]

/** 拿掉數值/括號/標點，只留下用來比對的中文字元 */
function cleanForMatch(s: string): string {
  return s
    .replace(/\([^)]*\)/g, '')
    .replace(/（[^）]*）/g, '')
    .replace(/[0-9%+.\-~～]/g, '')
    .replace(/[\s,，、！!。.：:「」『』]/g, '')
}

/** 中文沒有天然分詞，改用字元 bigram 重疊率做模糊比對 */
function bigrams(s: string): Set<string> {
  const out = new Set<string>()
  for (let i = 0; i < s.length - 1; i++) out.add(s.slice(i, i + 2))
  return out
}

function similarity(a: string, b: string): number {
  const A = bigrams(a)
  const B = bigrams(b)
  if (A.size === 0 || B.size === 0) return 0
  let overlap = 0
  for (const g of A) if (B.has(g)) overlap++
  return overlap / Math.min(A.size, B.size)
}

/** 把一行固定詞綴文字比對到已知的 VOYAGE_MODS，回傳最相似的 id（門檻以上才算） */
function matchImplicit(line: string): string | null {
  const target = cleanForMatch(line)
  if (!target) return null
  let best: { id: string; score: number } | null = null
  for (const m of VOYAGE_MODS) {
    const score = similarity(target, cleanForMatch(m.text))
    if (score >= 0.6 && (!best || score > best.score)) best = { id: m.id, score }
  }
  return best?.id ?? null
}

export interface AffixLine {
  type: '前綴' | '後綴'
  name: string
  tier: number
  tags: string[]
  lines: string[]
}

export interface ParseResult {
  charts: ChartData[]
  rejected: { name: string; reason: string }[]
}

export function parseChartText(text: string): ParseResult {
  const items = text
    .split(/\n(?=物品種類:\s*海圖)/g)
    .map((s) => s.trim())
    .filter(Boolean)

  const charts: ChartData[] = []
  const rejected: { name: string; reason: string }[] = []

  for (const item of items) {
    const lines = item.split('\n').map((l) => l.trim())

    if (!/物品種類:\s*海圖/.test(item)) {
      rejected.push({ name: '未知物品', reason: '不是海圖物品' })
      continue
    }

    const rarityIdx = lines.findIndex((l) => /^稀有度:/.test(l))
    const nameLineIdxs: number[] = []
    if (rarityIdx >= 0) {
      for (let i = rarityIdx + 1; i < lines.length && !/^-{3,}$/.test(lines[i]); i++) {
        if (lines[i]) nameLineIdxs.push(i)
      }
    }
    const name = nameLineIdxs.length ? nameLineIdxs.map((i) => lines[i]).join(' ') : '未知海圖'
    const rarity = lines[rarityIdx]?.replace('稀有度:', '').trim()

    // 未測繪（固定詞綴尚未揭露）先擋掉，避免資料不完整誤算
    if (/尚未測繪|測繪後將揭露/.test(item)) {
      rejected.push({ name, reason: '尚未測繪（固定詞綴未揭露），先出航一次再貼上' })
      continue
    }

    const level = parseInt(item.match(/區域等級:\s*(\d+)/)?.[1] ?? '0', 10)

    const rewards = []
    for (const { re, stat } of HEADER_STATS) {
      const m = item.match(re)
      if (m) rewards.push({ stat, percent: parseInt(m[1], 10) })
    }

    const shapeName = item.match(/海圖形狀[：:]\s*([^\n]+)/)?.[1]?.trim() ?? ''
    const edges: Edges = SHAPE_EDGES[shapeName] ?? [true, true, true, true]

    // 固定詞綴（相鄰/航程效果）
    const modIds: string[] = []
    let implicitText: string | undefined
    const fixedIdx = lines.findIndex((l) => /^\{\s*固定詞綴\s*\}$/.test(l))
    if (fixedIdx >= 0) {
      const implicitLine = lines[fixedIdx + 1] ?? ''
      if (implicitLine && !/^-{3,}$/.test(implicitLine)) {
        implicitText = implicitLine
        const id = matchImplicit(implicitLine)
        if (id) modIds.push(id)
      }
    }

    // 前綴/後綴區塊，保留原文供人工檢視（目前不參與計分，理由同原站：
    // 表頭獎勵百分比已經是這些詞綴的加總結果，重複計分會灌水）
    const affixes: AffixLine[] = []
    let cur: AffixLine | null = null
    for (const l of lines) {
      const head = l.match(/^\{\s*(前綴|後綴)\s*"([^"]+)"\(階層[：:]\s*(\d+)\)(?:—\s*([^}]+))?\s*\}$/)
      if (head) {
        if (cur) affixes.push(cur)
        cur = {
          type: head[1] as '前綴' | '後綴',
          name: head[2],
          tier: parseInt(head[3], 10),
          tags: head[4]?.split(',').map((s) => s.trim()) ?? [],
          lines: [],
        }
        continue
      }
      if (cur) {
        if (/^-{3,}$/.test(l)) {
          affixes.push(cur)
          cur = null
          continue
        }
        if (l.startsWith('（') || l.startsWith('(')) continue
        if (l) cur.lines.push(l)
      }
    }
    if (cur) affixes.push(cur)
    const rawText = affixes.length
      ? affixes.map((a) => `{${a.type} "${a.name}"} ${a.lines.join(' / ')}`).join('\n')
      : undefined

    charts.push({
      uid: newUid(),
      name: `${name}${rarity ? `（${rarity}）` : ''}`,
      level,
      edges,
      modIds,
      implicitText,
      rewards: rewards.length ? rewards : undefined,
      shape: shapeName || undefined,
      rawText,
    })
  }

  return { charts, rejected }
}
