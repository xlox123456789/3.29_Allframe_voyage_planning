import type { ChartData } from '../types'

export interface ChartMatcher {
  modIds?: string[]
  implicitTextMatch?: string[]
  nameMatch?: string
}

export function chartMatches(chart: ChartData, matcher: ChartMatcher): boolean {
  if (matcher.modIds?.some((modId) => chart.modIds.includes(modId))) return true

  const implicitText = chart.implicitText?.toLowerCase()
  if (implicitText && matcher.implicitTextMatch?.some((text) => implicitText.includes(text.toLowerCase()))) return true

  if (matcher.nameMatch) {
    const needle = matcher.nameMatch.toLowerCase()
    if (chart.name.toLowerCase().includes(needle)) return true
    if (chart.areaName?.toLowerCase().includes(needle)) return true
  }

  return false
}
