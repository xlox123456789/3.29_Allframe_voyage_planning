// 把海圖倉庫與 12 段邊界存進瀏覽器 localStorage，重新整理或關掉分頁後還在。
// 讀回來時逐筆驗證形狀：資料損毀、手動改壞、或改版後 id 對不上，就當那筆不存在，
// 不要讓壞資料一路傳到求解器炸掉整個畫面。

import { borderModById } from '../data/mods'
import type { Borders, ChartData, Edges } from '../types'
import { emptyBorders } from '../types'

const CHARTS_KEY = 'voyage:charts:v1'
const BORDERS_KEY = 'voyage:borders:v1'
const AUTOWATCH_KEY = 'voyage:autowatch:v1'

function readJson(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 無痕模式或容量已滿：存不進去就算了，至少不影響這次的使用
  }
}

const isEdges = (v: unknown): v is Edges =>
  Array.isArray(v) && v.length === 4 && v.every((e) => typeof e === 'boolean')

function isChart(v: unknown): v is ChartData {
  if (!v || typeof v !== 'object') return false
  const c = v as Record<string, unknown>
  return (
    typeof c.uid === 'string' &&
    typeof c.name === 'string' &&
    typeof c.level === 'number' &&
    isEdges(c.edges) &&
    Array.isArray(c.modIds) &&
    c.modIds.every((m) => typeof m === 'string')
  )
}

export function loadCharts(): ChartData[] {
  const data = readJson(CHARTS_KEY)
  return Array.isArray(data) ? data.filter(isChart) : []
}

export const saveCharts = (charts: ChartData[]) => writeJson(CHARTS_KEY, charts)

export function loadBorders(): Borders {
  const data = readJson(BORDERS_KEY)
  if (!Array.isArray(data) || data.length !== 12) return emptyBorders()
  // 只留現在的詞綴池裡還存在的 id，其餘視為未擲出
  return data.map((v) => (typeof v === 'string' && borderModById.has(v) ? v : null))
}

export const saveBorders = (borders: Borders) => writeJson(BORDERS_KEY, borders)

/** 自動偵測剪貼簿的開關；預設關閉（會讀剪貼簿，要玩家自己點開才算數） */
export const loadAutoWatch = (): boolean => readJson(AUTOWATCH_KEY) === true

export const saveAutoWatch = (on: boolean) => writeJson(AUTOWATCH_KEY, on)
