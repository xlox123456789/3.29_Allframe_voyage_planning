import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Board, Borders, ChartData, Edges } from './types'
import { emptyBorders } from './types'
import { parseChartText } from './logic/parser'
import { solve, type SolverResult } from './logic/solver'
import { rotateEdges } from './logic/connectivity'
import { chartMatches } from './logic/chartMatching'
import { BORDER_MODS, borderModById } from './data/mods'
import { STRATEGIES, type StrategyDef, type StrategyRequirement } from './data/strategies'
import './index.css'

// 12 段邊界，每段對應九宮格外圍固定的一格：上排/下排各對齊 3 個直欄，
// 左排/右排各對齊 3 個橫列。segment 索引沿用 types.ts 的 borderTouches。
const TOP = [0, 1, 2]
const RIGHT = [3, 4, 5]
const BOTTOM = [6, 7, 8]
const LEFT = [9, 10, 11]

type GaEventParams = Record<string, string | number | boolean>
type GtagWindow = Window & {
  gtag?: (command: 'event', eventName: string, params?: GaEventParams) => void
}

function trackGaEvent(eventName: string, params?: GaEventParams) {
  const gaWindow = window as GtagWindow
  gaWindow.gtag?.('event', eventName, params)
}

// ---------------------------------------------------------------------------
// 可打字搜尋的邊界選擇器
// ---------------------------------------------------------------------------
function BorderPicker({
  value,
  onChange,
  align,
  lang,
}: {
  value: string | null
  onChange: (v: string | null) => void
  align: 'top' | 'bottom' | 'left' | 'right'
  lang: 'zh' | 'en'
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, visible: false })
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const mod = value ? borderModById.get(value) : null
  const labelOf = useCallback(
    (m: (typeof BORDER_MODS)[number]) => (lang === 'en' ? m.textEn ?? m.text : m.text),
    [lang],
  )

  const updateDropdownPosition = useCallback(() => {
    const button = buttonRef.current
    if (!button) return

    const viewportPadding = 8
    const gap = 6
    const width = 280
    const buttonRect = button.getBoundingClientRect()
    const dropdownHeight = dropdownRef.current?.offsetHeight ?? 320
    const preferredLeft =
      align === 'left' || align === 'right'
        ? buttonRect.left
        : buttonRect.left + buttonRect.width / 2 - width / 2
    const maxLeft = Math.max(viewportPadding, window.innerWidth - width - viewportPadding)
    const left = Math.min(Math.max(preferredLeft, viewportPadding), maxLeft)
    const below = buttonRect.bottom + gap
    const above = buttonRect.top - dropdownHeight - gap
    const top = below + dropdownHeight <= window.innerHeight - viewportPadding || above < viewportPadding ? below : above

    setDropdownPosition({ top, left, visible: true })
  }, [align])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (!rootRef.current?.contains(target) && !dropdownRef.current?.contains(target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useLayoutEffect(() => {
    if (!open) {
      setDropdownPosition((position) => ({ ...position, visible: false }))
      return
    }

    updateDropdownPosition()
    window.addEventListener('resize', updateDropdownPosition)
    window.addEventListener('scroll', updateDropdownPosition, true)
    return () => {
      window.removeEventListener('resize', updateDropdownPosition)
      window.removeEventListener('scroll', updateDropdownPosition, true)
    }
  }, [open, updateDropdownPosition])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return BORDER_MODS
    return BORDER_MODS.filter((m) => labelOf(m).toLowerCase().includes(q) || m.short?.includes(query.trim()))
  }, [query, labelOf])

  const dropdown = open ? (
    <div
      ref={dropdownRef}
      className="border-dropdown"
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        visibility: dropdownPosition.visible ? 'visible' : 'hidden',
      }}
    >
      <input
        autoFocus
        className="border-search"
        placeholder={lang === 'en' ? 'Type to search…' : '輸入關鍵字快速搜尋…'}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="border-options">
        <div
          className="border-option clear"
          onClick={() => {
            onChange(null)
            setOpen(false)
          }}
        >
          {lang === 'en' ? '(clear / not rolled)' : '（清空邊界詞）'}
        </div>
        {filtered.map((m) => (
          <div
            key={m.id}
            className={`border-option ${m.id === value ? 'active' : ''}`}
            onClick={() => {
              onChange(m.id)
              setOpen(false)
            }}
          >
            {labelOf(m)}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="border-option empty">{lang === 'en' ? 'No matching border mod' : '找不到符合的邊界詞綴'}</div>
        )}
      </div>
    </div>
  ) : null

  return (
    <div className={`border-picker align-${align}`} ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className={`border-pill ${mod ? 'set' : ''}`}
        onClick={() => {
          setOpen((o) => !o)
          setQuery('')
        }}
        title={mod ? labelOf(mod) : lang === 'en' ? 'Click to set this border' : '點擊設定這段邊界'}
      >
        {mod ? (lang === 'en' ? mod.textEn ?? mod.short ?? mod.text : mod.short ?? mod.text) : lang === 'en' ? 'Not rolled' : '邊界詞'}
      </button>
      {dropdown && createPortal(dropdown, document.body)}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 海圖接口形狀小圖示（依 N/E/S/W 接口畫線，貼近遊戲內圖示風格）
// ---------------------------------------------------------------------------
function ShapeIcon({ edges }: { edges: Edges }) {
  const [n, e, s, w] = edges
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" className="shape-icon">
      <rect x="0.5" y="0.5" width="29" height="29" rx="4" fill="#0a120e" stroke="#2c3f33" />
      {n && <line x1="15" y1="1" x2="15" y2="13" className="on" />}
      {s && <line x1="15" y1="17" x2="15" y2="29" className="on" />}
      {w && <line x1="1" y1="15" x2="13" y2="15" className="on" />}
      {e && <line x1="17" y1="15" x2="29" y2="15" className="on" />}
      <circle cx="15" cy="15" r="2.5" className={n || e || s || w ? 'on' : 'off'} />
    </svg>
  )
}

function chartHoverText(chart: ChartData): string {
  const details = [chart.name]
  if (chart.areaName) details.push(`區域：${chart.areaName}`)
  details.push(`等級：${chart.level}`)
  if (chart.shape) details.push(`形狀：${chart.shape}`)
  if (chart.implicitText) details.push(`固定詞綴：${chart.implicitText}`)
  details.push(chart.rawText ? `其他詞綴：\n${chart.rawText}` : '其他詞綴：未解析到其他詞綴')
  return details.join('\n')
}

async function copyTextToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch {
      // 剪貼簿權限被瀏覽器拒絕時，改用舊式複製方式。
    }
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  const copied = document.execCommand('copy')
  textarea.remove()
  if (!copied) throw new Error('Clipboard copy failed')
}

// ---------------------------------------------------------------------------
// 九宮格 + 對齊的 12 段邊界
// ---------------------------------------------------------------------------
function VoyageBoard({
  borders,
  onBorderChange,
  board,
  charts,
  lang,
}: {
  borders: Borders
  onBorderChange: (seg: number, v: string | null) => void
  board: Board | null
  charts: Map<string, ChartData>
  lang: 'zh' | 'en'
}) {
  const [copyNotice, setCopyNotice] = useState<{ chartUid: string; ok: boolean } | null>(null)

  useEffect(() => {
    if (!copyNotice) return
    const timer = window.setTimeout(() => setCopyNotice(null), 1400)
    return () => window.clearTimeout(timer)
  }, [copyNotice])

  async function copyChartName(chart: ChartData) {
    try {
      await copyTextToClipboard(chart.name)
      trackGaEvent('chart_copy_success')
      setCopyNotice({ chartUid: chart.uid, ok: true })
    } catch {
      setCopyNotice({ chartUid: chart.uid, ok: false })
    }
  }

  const cell = (col: number, row: number, node: React.ReactNode, key: string) => (
    <div key={key} style={{ gridColumn: col, gridRow: row }} className="grid-slot">
      {node}
    </div>
  )

  const items: React.ReactNode[] = []
  TOP.forEach((seg, i) =>
    items.push(
      cell(
        i + 2,
        1,
        <BorderPicker align="top" lang={lang} value={borders[seg]} onChange={(v) => onBorderChange(seg, v)} />,
        `t${seg}`,
      ),
    ),
  )
  BOTTOM.forEach((seg, i) =>
    items.push(
      cell(
        i + 2,
        5,
        <BorderPicker align="bottom" lang={lang} value={borders[seg]} onChange={(v) => onBorderChange(seg, v)} />,
        `b${seg}`,
      ),
    ),
  )
  LEFT.forEach((seg, i) =>
    items.push(
      cell(
        1,
        i + 2,
        <BorderPicker align="left" lang={lang} value={borders[seg]} onChange={(v) => onBorderChange(seg, v)} />,
        `l${seg}`,
      ),
    ),
  )
  RIGHT.forEach((seg, i) =>
    items.push(
      cell(
        5,
        i + 2,
        <BorderPicker align="right" lang={lang} value={borders[seg]} onChange={(v) => onBorderChange(seg, v)} />,
        `r${seg}`,
      ),
    ),
  )

  for (let i = 0; i < 9; i++) {
    const row = Math.floor(i / 3)
    const col = i % 3
    const p = board?.[i]
    const chart = p ? charts.get(p.chartUid) : null
    items.push(
      cell(
        col + 2,
        row + 2,
        <div
          className={`cell ${chart ? 'filled' : ''} ${i === 6 ? 'start' : ''}`}
          title={chart ? chartHoverText(chart) : undefined}
          role={chart ? 'button' : undefined}
          tabIndex={chart ? 0 : undefined}
          aria-label={chart ? `複製海圖名稱：${chart.name}` : undefined}
          onClick={chart ? () => void copyChartName(chart) : undefined}
          onKeyDown={
            chart
              ? (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    void copyChartName(chart)
                  }
                }
              : undefined
          }
        >
          {chart ? (
            <>
              <ShapeIcon edges={rotateEdges(chart.edges, p!.rotation)} />
              <div className="cell-name">{chart.name}</div>
              {copyNotice?.chartUid === chart.uid && (
                <div className={`cell-copy-notice ${copyNotice.ok ? 'success' : 'error'}`} role="status">
                  {copyNotice.ok ? '已複製' : '複製失敗'}
                </div>
              )}
            </>
          ) : i === 6 ? (
            <div className="cell-empty">⚓<span>起點</span></div>
          ) : (
            <div className="cell-plus">＋</div>
          )}
        </div>,
        `c${i}`,
      ),
    )
  }

  return <div className="voyage-board">{items}</div>
}

// ---------------------------------------------------------------------------
// 海圖倉庫
// ---------------------------------------------------------------------------
function ChartLibrary({
  charts,
  selectedUids,
  onRemove,
  onClear,
}: {
  charts: ChartData[]
  selectedUids: ReadonlySet<string>
  onRemove: (uid: string) => void
  onClear: () => void
}) {
  return (
    <div className="library">
      <div className="library-header">
        <div>
          <strong>{charts.length}</strong> 張可用海圖
        </div>
        <button className="ghost-btn" onClick={onClear} disabled={charts.length === 0}>
          清空倉庫
        </button>
      </div>
      <div className="chart-list">
        {charts.length === 0 && <div className="empty-hint">尚無海圖，貼上文字後按「加入倉庫」</div>}
        {charts.map((c) => (
          <div key={c.uid} className={`chart-row ${selectedUids.has(c.uid) ? 'selected' : ''}`}>
            <ShapeIcon edges={c.edges} />
            <div className="chart-row-main">
              <div className="chart-row-name">{c.name}</div>
              <div className="chart-row-meta">
                {c.shape ?? '形狀未知'} · 等級 {c.level}
                {c.implicitText ? ` · ${c.implicitText}` : ''}
              </div>
            </div>
            <button className="remove-btn" onClick={() => onRemove(c.uid)} title="移除">
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 策略選擇器
// ---------------------------------------------------------------------------
function StrategyPicker({
  selected,
  onSelect,
}: {
  selected: StrategyDef
  onSelect: (s: StrategyDef) => void
}) {
  return (
    <div className="strategy-picker">
      {STRATEGIES.map((s) => (
        <button
          key={s.id}
          className={`strategy-tab ${s.id === selected.id ? 'active' : ''}`}
          onClick={() => onSelect(s)}
        >
          {s.name}
        </button>
      ))}
    </div>
  )
}

function requirementMet(req: StrategyRequirement, charts: ChartData[]): boolean {
  const count = charts.filter((chart) => chartMatches(chart, req)).length
  return count >= req.count
}

const SAVED_TEXT_STORAGE_KEY = 'voyage-saved-texts-v1'
const LANGUAGE_STORAGE_KEY = 'voyage-language-v1'
const THEME_STORAGE_KEY = 'voyage-theme-v1'

function loadLanguage(): 'zh' | 'en' {
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'en' ? 'en' : 'zh'
  } catch {
    return 'zh'
  }
}

function loadTheme(): 'green' | 'black' | 'white' {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return stored === 'black' || stored === 'white' ? stored : 'green'
  } catch {
    return 'green'
  }
}

function loadSavedTexts(): string[] {
  try {
    const stored = JSON.parse(localStorage.getItem(SAVED_TEXT_STORAGE_KEY) ?? '[]')
    return Array.from({ length: 4 }, (_, index) => (typeof stored[index] === 'string' ? stored[index] : ''))
  } catch {
    return ['', '', '', '']
  }
}

function SavedTextTools() {
  const [texts, setTexts] = useState<string[]>(loadSavedTexts)
  const [copyNotice, setCopyNotice] = useState<{ index: number; ok: boolean } | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_TEXT_STORAGE_KEY, JSON.stringify(texts))
    } catch {
      // 瀏覽器停用本機儲存時仍可輸入與複製，只是不保留到下次開啟。
    }
  }, [texts])

  useEffect(() => {
    if (!copyNotice) return
    const timer = window.setTimeout(() => setCopyNotice(null), 1400)
    return () => window.clearTimeout(timer)
  }, [copyNotice])

  async function copySavedText(index: number) {
    try {
      await copyTextToClipboard(texts[index])
      setCopyNotice({ index, ok: true })
    } catch {
      setCopyNotice({ index, ok: false })
    }
  }

  return (
    <div className="saved-text-panel">
      <h3>儲存文字區</h3>
      <p>可快速複製一堆字，輸入後 F5 也不會消失。</p>
      <div className="saved-text-rows">
        {texts.map((text, index) => (
          <div className="saved-text-row" key={index}>
            <button type="button" disabled={!text} onClick={() => void copySavedText(index)}>
              {copyNotice?.index === index ? (copyNotice.ok ? '已複製' : '失敗') : '複製'}
            </button>
            <input
              type="text"
              value={text}
              aria-label={`儲存文字 ${index + 1}`}
              onChange={(event) => {
                const next = [...texts]
                next[index] = event.target.value
                setTexts(next)
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export default function App() {
  const [charts, setCharts] = useState<ChartData[]>([])
  const [borders, setBorders] = useState<Borders>(emptyBorders())
  const [result, setResult] = useState<SolverResult | null>(null)
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [strategy, setStrategy] = useState<StrategyDef>(STRATEGIES[0])
  const [lang, setLang] = useState<'zh' | 'en'>(loadLanguage)
  const [theme, setTheme] = useState<'green' | 'black' | 'white'>(loadTheme)
  const progressTimer = useRef<number | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
    } catch {
      // 瀏覽器停用本機儲存時，語言仍可在本次開啟期間切換。
    }
  }, [lang])

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // 瀏覽器停用本機儲存時，主題仍可在本次開啟期間切換。
    }
  }, [theme])

  const chartMap = useMemo(() => new Map(charts.map((c) => [c.uid, c])), [charts])
  const plannedChartUids = useMemo(
    () => new Set(result?.board.flatMap((placement) => (placement ? [placement.chartUid] : [])) ?? []),
    [result],
  )

  const borderOk = !strategy.requiresBorderId || borders.includes(strategy.requiresBorderId.id)
  const reqStates = (strategy.requirements ?? []).map((r) => ({ req: r, ok: requirementMet(r, charts) }))
  const allOk = borderOk && reqStates.every((r) => r.ok)

  function runSolver() {
    trackGaEvent('start_planning_click', {
      strategy: strategy.id,
      chart_count: charts.length,
      border_count: borders.filter(Boolean).length,
    })
    setRunning(true)
    setProgress(0)
    if (progressTimer.current) window.clearTimeout(progressTimer.current)

    // 假進度條：solve() 本身是同步、會卡住畫面重繪的計算，所以不能一邊跑一邊用
    // setInterval 更新（瀏覽器在計算期間完全沒空重繪，畫面只會看到 0 直接跳 100）。
    // 改成先用一串各自獨立的 setTimeout 把進度條「演」到 92%，每一步都是獨立的
    // 排程任務，瀏覽器才有機會真的重繪；演完之後才真正呼叫 solve()。
    const steps = [12, 28, 46, 63, 78, 92]
    let i = 0
    const tick = () => {
      if (i < steps.length) {
        setProgress(steps[i])
        i++
        progressTimer.current = window.setTimeout(tick, 140)
        return
      }
      const results = solve(charts, borders, strategy.weights, {
        mode: 'connected',
        allowRotation: true,
        adjacencyMode: 'physical',
        adjacentAffectsSelf: false,
        topK: 1,
        strategyRules: strategy.rules,
      })
      setResult(results[0] ?? null)
      setProgress(100)
      progressTimer.current = window.setTimeout(() => {
        setRunning(false)
        setProgress(0)
      }, 350)
    }
    progressTimer.current = window.setTimeout(tick, 140)
  }

  function quickDeletePlannedCharts() {
    if (plannedChartUids.size === 0) return
    setCharts((prev) => prev.filter((chart) => !plannedChartUids.has(chart.uid)))
    setResult(null)
  }

  function clearBorders() {
    setBorders(emptyBorders())
    setResult(null)
  }

  return (
    <div className="app">
      <header>
        <div className="header-top">
          <div className="header-copy">
            <div className="eyebrow">PATH OF EXILE · 亡焰咒海</div>
            <h1>亡焰咒海</h1>
            <p className="subtitle">
              設定 12 段外框邊界詞綴，貼上你的海圖倉庫，選擇策略後按「開始規劃」自動選出最佳九張並排出擺放方式。
            </p>
          </div>
          <div className="header-controls">
            <div className="lang-toggle">
              <button className={lang === 'zh' ? 'active' : ''} onClick={() => setLang('zh')}>
                中
              </button>
              <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>
                EN
              </button>
            </div>
            <div className="theme-toggle" aria-label="主題顏色">
              <button className={theme === 'green' ? 'active' : ''} onClick={() => setTheme('green')}>
                綠
              </button>
              <button className={theme === 'black' ? 'active' : ''} onClick={() => setTheme('black')}>
                黑
              </button>
              <button className={theme === 'white' ? 'active' : ''} onClick={() => setTheme('white')}>
                白
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="main-grid">
        <section className="panel board-panel">
          <h2>
            ① 外框邊界詞綴 <span className="panel-sub">{borders.filter(Boolean).length} / 12 已設定</span>
          </h2>
          <VoyageBoard
            borders={borders}
            onBorderChange={(seg, v) => {
              const next = [...borders]
              next[seg] = v
              setBorders(next)
            }}
            board={result?.board ?? null}
            charts={chartMap}
            lang={lang}
          />
          <div className="board-quick-delete">
            <button
              className="quick-delete-btn"
              type="button"
              disabled={running || plannedChartUids.size === 0}
              onClick={quickDeletePlannedCharts}
            >
              快速刪除
            </button>
            <span>根據九宮格中的海圖，刪除倉庫裡相對應的九個海圖</span>
          </div>
          <div className="board-clear-borders">
            <button
              className="clear-borders-btn"
              type="button"
              disabled={running || borders.every((border) => !border)}
              onClick={clearBorders}
            >
              清空邊界
            </button>
          </div>
        </section>

        <section className="panel library-panel">
          <h2>② 海圖倉庫</h2>
          <ChartLibrary
            charts={charts}
            selectedUids={plannedChartUids}
            onRemove={(uid) => setCharts((prev) => prev.filter((c) => c.uid !== uid))}
            onClear={() => setCharts([])}
          />
        </section>

        <section className="panel import-panel">
          <h2>複製貼上區</h2>
          <ChartImporter onImport={(cs) => setCharts((prev) => [...prev, ...cs])} lang={lang} />
        </section>
      </div>

      <section className="panel">
        <h2>③ 選擇策略</h2>
        <StrategyPicker selected={strategy} onSelect={setStrategy} />
        <p className="strategy-tagline">{strategy.tagline}</p>
        <ul className="guide-list">
          {strategy.guide.map((g, i) => (
            <li key={i}>{g}</li>
          ))}
        </ul>

        {(strategy.requiresBorderId || reqStates.length > 0) && (
          <>
            <div className="checklist-title">建議需求</div>
            <ul className="checklist">
              {strategy.requiresBorderId && (
                <li className={borderOk ? 'ok' : 'bad'}>
                  {borderOk ? '✅' : '❌'} 已擲出{strategy.requiresBorderId.label}
                </li>
              )}
              {reqStates.map(({ req, ok }, i) => (
                <li key={i} className={ok ? 'ok' : 'bad'}>
                  {ok ? '✅' : '❌'} {req.label}
                </li>
              ))}
            </ul>
          </>
        )}
        {!allOk && strategy.waitHint && <div className="hint">{strategy.waitHint}</div>}
      </section>

      <section className="panel">
        <button className="solve-btn" disabled={charts.length === 0 || running} onClick={runSolver}>
          {running ? '規劃中…' : '開始規劃'}
        </button>
        {running && (
          <div className="progress-wrap">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="progress-pct">{Math.round(progress)}%</div>
          </div>
        )}
        {!running && result && (
          <div className="result-meta">
            分數：{result.reward.toFixed(1)}　{result.valid ? '✅ 航道可行' : '⚠️ 航道有問題（接口未接上或有格子空白）'}
          </div>
        )}
      </section>

      <section className="panel extra-features-panel">
        <h2>額外功能</h2>
        <SavedTextTools />
      </section>

      <footer className="site-footer">
        <div>2026/7/31 夏烏拉</div>
        <div className="site-footer-links">
          <a
            href="https://github.com/xlox123456789/3.29_Allframe_voyage_planning"
            target="_blank"
            rel="noreferrer"
          >
            GITHUB頁面
          </a>
          <a
            href="https://github.com/xlox123456789/3.29_Allframe_voyage_planning/discussions"
            target="_blank"
            rel="noreferrer"
          >
            意見反饋區
          </a>
        </div>
      </footer>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 海圖複製貼上區
// ---------------------------------------------------------------------------
function ChartImporter({
  onImport,
  lang,
}: {
  onImport: (charts: ChartData[]) => void
  lang: 'zh' | 'en'
}) {
  const [text, setText] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  return (
    <div className="library">
      <textarea
        placeholder={
          lang === 'en'
            ? 'Ctrl+V paste a Chart (Ctrl+C in-game).'
            : 'Ctrl+V 貼上海圖（遊戲內 Ctrl+C 複製）'
        }
        value={text}
        onChange={(e) => setText(e.target.value)}
        onPaste={(e) => {
          const pastedText = e.clipboardData.getData('text')
          const { charts: cs, rejected } = parseChartText(pastedText)
          const chart = cs[0]
          const isSingleCompleteChart = cs.length === 1 && chart.level > 0 && Boolean(chart.shape)
          if (!isSingleCompleteChart) return

          e.preventDefault()
          onImport(cs)
          setText('')
          setMsg(
            '已自動加入 1 張' +
              (rejected.length ? `，跳過 ${rejected.length} 項（${rejected.map((r) => r.reason).join('；')}）` : ''),
          )
        }}
        rows={10}
      />
      <button
        className="primary-btn"
        onClick={() => {
          const { charts: cs, rejected } = parseChartText(text)
          onImport(cs)
          setText('')
          setMsg(
            `已加入 ${cs.length} 張` +
              (rejected.length ? `，跳過 ${rejected.length} 項（${rejected.map((r) => r.reason).join('；')}）` : ''),
          )
        }}
        disabled={!text.trim()}
      >
        加入倉庫
      </button>
      {msg && <div className="import-msg">{msg}</div>}
    </div>
  )
}
