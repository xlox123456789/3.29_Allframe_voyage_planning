// 海圖貼上解析器，支援中文與英文兩種遊戲客戶端貼上格式（2026-08 3.29 全焰之咒）。
// 兩種語言的每一行都用同一組「語言包」規則解析，逐項對應：
//
//   中文                          英文
//   ─────────────────────────────────────────────
//   物品種類: 海圖                Item Class: Chart
//   稀有度: 稀有                  Rarity: Rare
//   <名稱 1-2 行>                 <名稱 1-2 行>
//   --------                      --------
//   <區域名稱>                    <區域名稱>          <- Sea-Pillar 判斷依據
//   區域等級: N                   Area Level: N
//   物品數量: +N% (augmented)     Item Quantity: +N% (augmented)
//   --------                      --------
//   需求: 等級: N                 Requirements: Level: N
//   --------                      --------
//   物品等級: N                   Item Level: N
//   --------                      --------
//   { 固定詞綴 }                  { Implicit Modifier }
//   <相鄰/航程效果原文一行>        <adjacent/voyage effect line>
//   --------                      --------
//   海圖形狀： <形狀>              Chart Shape: <Shape>
//   --------                      --------
//   { 前綴 "x"(階層：N)— 標籤 }    { Prefix Modifier "x" (Tier: N) — tags }
//   ...

import { VOYAGE_MODS } from '../data/mods'
import type { ChartData, Edges, Stat } from '../types'

let uidCounter = 0
export function newUid(): string {
  uidCounter += 1
  return `c${Date.now().toString(36)}-${uidCounter}`
}

export type ParseLang = 'zh' | 'en'

/** 海圖形狀 -> 接口 [北,東,南,西]。方向任意（求解器可旋轉），只有接口數量/排列重要 */
const SHAPE_EDGES_ZH: Record<string, Edges> = {
  '終點': [true, false, false, false],
  '直線': [true, false, true, false],
  '轉角': [true, true, false, false],
  '交界處': [true, true, true, false],
  '十字口': [true, true, true, true],
}
const SHAPE_EDGES_EN: Record<string, Edges> = {
  'End': [true, false, false, false],
  'Straight': [true, false, true, false],
  'Corner': [true, true, false, false],
  'Junction': [true, true, true, false],
  'Crossing': [true, true, true, true],
}

interface LangPack {
  itemMarker: RegExp
  rarityLine: RegExp
  levelLine: RegExp
  shapeLine: RegExp
  shapeEdges: Record<string, Edges>
  implicitHeader: RegExp
  affixHeader: RegExp
  notYetCharted: RegExp
  headerStats: { re: RegExp; stat: Stat }[]
}

const ZH: LangPack = {
  itemMarker: /^物品種類:\s*海圖/,
  rarityLine: /^稀有度:/,
  levelLine: /區域等級:\s*(\d+)/,
  shapeLine: /海圖形狀[：:]\s*([^\n]+)/,
  shapeEdges: SHAPE_EDGES_ZH,
  implicitHeader: /^\{\s*固定詞綴\s*\}$/,
  affixHeader: /^\{\s*(前綴|後綴)\s*"([^"]+)"\(階層[：:]\s*(\d+)\)(?:—\s*([^}]+))?\s*\}$/,
  notYetCharted: /尚未測繪|測繪後將揭露|航程詞綴會於測繪後揭露/,
  headerStats: [
    { re: /物品數量:\s*\+?(\d+)%/, stat: 'quantity' },
    { re: /物品稀有度:\s*\+?(\d+)%/, stat: 'rarity' },
    { re: /已找到金幣:\s*\+?(\d+)%/, stat: 'gold' },
    { re: /亡者硫酸:\s*\+?(\d+)%/, stat: 'sulphur' },
    { re: /怪物群大小:\s*\+?(\d+)%/, stat: 'packsize' },
    { re: /找到的探索員:\s*\+?(\d+)%/, stat: 'scarabs' },
    { re: /找到的通貨:\s*\+?(\d+)%/, stat: 'currency' },
  ],
}

const EN: LangPack = {
  itemMarker: /^Item Class:\s*Chart/i,
  rarityLine: /^Rarity:/i,
  levelLine: /Area Level:\s*(\d+)/i,
  shapeLine: /Chart Shape:\s*([^\n]+)/i,
  shapeEdges: SHAPE_EDGES_EN,
  implicitHeader: /^\{\s*Implicit Modifier\s*\}$/i,
  affixHeader: /^\{\s*(Prefix|Suffix) Modifier\s*"([^"]+)"\s*(?:\(Tier:\s*(\d+)\))?\s*(?:—\s*([^}]+))?\s*\}$/i,
  notYetCharted: /will be revealed once Charted/i,
  headerStats: [
    { re: /Item Quantity:\s*\+?(\d+)%/i, stat: 'quantity' },
    { re: /Item Rarity:\s*\+?(\d+)%/i, stat: 'rarity' },
    { re: /Gold Found:\s*\+?(\d+)%/i, stat: 'gold' },
    { re: /Dead Man's Sulphur:\s*\+?(\d+)%/i, stat: 'sulphur' },
    { re: /Monster Pack Size:\s*\+?(\d+)%/i, stat: 'packsize' },
    { re: /Scarabs Found:\s*\+?(\d+)%/i, stat: 'scarabs' },
    { re: /Currency Found:\s*\+?(\d+)%/i, stat: 'currency' },
  ],
}

function detectLang(item: string): ParseLang {
  return EN.itemMarker.test(item) ? 'en' : 'zh'
}

/** 拿掉數值/括號/標點，只留下用來比對的字元（模糊比對用） */
function cleanForMatch(s: string): string {
  return s
    .replace(/\([^)]*\)/g, '')
    .replace(/（[^）]*）/g, '')
    .replace(/[0-9%+.\-~～]/g, '')
    .replace(/[\s,，、！!。.：:「」『』]/g, '')
    .toLowerCase()
}

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

/** 把一行固定詞綴文字比對到已知的 VOYAGE_MODS（同時檢查中文與英文原文）。
 *  優先做「精確文字比對」（遊戲文字是固定模板套數值，本來就該一字不差），
 *  只有在完全找不到精確符合時，才退回模糊比對（字元 bigram 相似度）當作備援，
 *  這樣才不會把同一模板、不同階別（例如 4-5 群跟 6-7 群）互相比對錯誤。 */
function matchImplicit(line: string): string | null {
  const exactTarget = line.trim().replace(/\s+/g, '').toLowerCase()
  for (const m of VOYAGE_MODS) {
    if (m.text.trim().replace(/\s+/g, '').toLowerCase() === exactTarget) return m.id
    if (m.textEn && m.textEn.trim().replace(/\s+/g, '').toLowerCase() === exactTarget) return m.id
  }

  const target = cleanForMatch(line)
  if (!target) return null
  let best: { id: string; score: number } | null = null
  for (const m of VOYAGE_MODS) {
    const score = Math.max(similarity(target, cleanForMatch(m.text)), m.textEn ? similarity(target, cleanForMatch(m.textEn)) : 0)
    if (score >= 0.6 && (!best || score > best.score)) best = { id: m.id, score }
  }
  return best?.id ?? null
}

export interface AffixLine {
  type: string
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
    .split(/\n(?=物品種類:\s*海圖|Item Class:\s*Chart)/gi)
    .map((s) => s.trim())
    .filter(Boolean)

  const charts: ChartData[] = []
  const rejected: { name: string; reason: string }[] = []

  for (const item of items) {
    const lang = detectLang(item)
    const L = lang === 'en' ? EN : ZH
    const lines = item.split('\n').map((l) => l.trim())

    if (!L.itemMarker.test(item) && !(lang === 'zh' && /物品種類:\s*海圖/.test(item))) {
      rejected.push({ name: lang === 'en' ? 'Unknown item' : '未知物品', reason: lang === 'en' ? 'Not a Chart item' : '不是海圖物品' })
      continue
    }

    const rarityIdx = lines.findIndex((l) => L.rarityLine.test(l))
    const nameLineIdxs: number[] = []
    if (rarityIdx >= 0) {
      for (let i = rarityIdx + 1; i < lines.length && !/^-{3,}$/.test(lines[i]); i++) {
        if (lines[i]) nameLineIdxs.push(i)
      }
    }
    const name = nameLineIdxs.length ? nameLineIdxs.map((i) => lines[i]).join(' ') : lang === 'en' ? 'Unknown Chart' : '未知海圖'
    const rarity = lines[rarityIdx]?.replace(L.rarityLine, '').replace(/^(稀有度|Rarity):/i, '').trim()

    // 區域名稱（第一個 -------- 分隔線後的下一行），像「深海平原」「海洋之柱」/ "Sea Pillars"，
    // Sea-Pillar 這種特殊區域類型是靠這個判斷，不是靠海圖本身的名稱
    let areaName: string | undefined
    const firstDashIdx = lines.findIndex((l, i) => i > rarityIdx && /^-{3,}$/.test(l))
    if (firstDashIdx >= 0) {
      const next = lines[firstDashIdx + 1]
      if (next && !/^-{3,}$/.test(next) && !L.levelLine.test(next) && !/^(區域等級|Area Level):/i.test(next)) areaName = next
    }

    // 尚未測繪（固定詞綴尚未揭露）先擋掉，避免資料不完整誤算
    if (L.notYetCharted.test(item)) {
      rejected.push({
        name,
        reason: lang === 'en' ? 'Not yet Charted (implicit not revealed) — Chart it once first' : '尚未測繪（固定詞綴未揭露），先出航一次再貼上',
      })
      continue
    }

    const level = parseInt(item.match(L.levelLine)?.[1] ?? '0', 10)

    const rewards = []
    for (const { re, stat } of L.headerStats) {
      const m = item.match(re)
      if (m) rewards.push({ stat, percent: parseInt(m[1], 10) })
    }

    const shapeName = item.match(L.shapeLine)?.[1]?.trim() ?? ''
    const edges: Edges = L.shapeEdges[shapeName] ?? [true, true, true, true]

    // 固定詞綴（相鄰/航程效果）
    const modIds: string[] = []
    let implicitText: string | undefined
    const fixedIdx = lines.findIndex((l) => L.implicitHeader.test(l))
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
      const head = l.match(L.affixHeader)
      if (head) {
        if (cur) affixes.push(cur)
        cur = {
          type: head[1],
          name: head[2],
          tier: head[3] ? parseInt(head[3], 10) : 0,
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

    const rarityLabel = rarity ? (lang === 'en' ? ` (${rarity})` : `（${rarity}）`) : ''
    charts.push({
      uid: newUid(),
      name: `${name}${rarityLabel}`,
      level,
      edges,
      modIds,
      implicitText,
      rewards: rewards.length ? rewards : undefined,
      shape: shapeName || undefined,
      areaName,
      rawText,
    })
  }

  return { charts, rejected }
}
