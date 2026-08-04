import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Board, Borders, ChartData, Edges } from './types'
import { emptyBorders } from './types'
import { parseChartText } from './logic/parser'
import { solve, type SolverResult } from './logic/solver'
import { rotateEdges } from './logic/connectivity'
import { chartMatches } from './logic/chartMatching'
import {
  loadAutoWatch,
  loadBorders,
  loadCharts,
  saveAutoWatch,
  saveBorders,
  saveCharts,
} from './logic/storage'
import {
  clipboardWatchSupported,
  useClipboardWatch,
  type ClipboardWatchStatus,
} from './logic/useClipboardWatch'
import { UI, type Lang } from './i18n'
import { BORDER_MODS, borderModById } from './data/mods'
import { STRATEGIES, type StrategyDef, type StrategyRequirement } from './data/strategies'
import './index.css'

// 12 段邊界，每段對應九宮格外圍固定的一格：上排/下排各對齊 3 個直欄，
// 左排/右排各對齊 3 個橫列。segment 索引沿用 types.ts 的 borderTouches。
const TOP = [0, 1, 2]
const RIGHT = [3, 4, 5]
const BOTTOM = [6, 7, 8]
const LEFT = [9, 10, 11]

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
  lang: Lang
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, visible: false })
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const t = UI[lang]
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

  // 下拉選單第一次 render 時是 visibility: hidden（要先量完位置才顯示），而瀏覽器
  // 不會 focus 一個 visibility: hidden 的元素，React 的 autoFocus 因此無聲失效，
  // 使用者得再點一次搜尋框。改成等真的顯示出來之後自己 focus，點開就能直接打字。
  useLayoutEffect(() => {
    if (open && dropdownPosition.visible) searchRef.current?.focus()
  }, [open, dropdownPosition.visible])

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
        ref={searchRef}
        className="border-search"
        placeholder={t.borderSearch}
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
          {t.borderClear}
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
          <div className="border-option empty">{t.borderNoMatch}</div>
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
        title={mod ? labelOf(mod) : t.borderPillTitle}
      >
        {mod
          ? lang === 'en'
            ? mod.textEn ?? mod.short ?? mod.text
            : mod.short ?? mod.text
          : t.borderPillEmpty}
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

function chartHoverText(chart: ChartData, lang: Lang): string {
  const t = UI[lang]
  const sep = lang === 'en' ? ': ' : '：'
  const details = [chart.name]
  if (chart.areaName) details.push(`${t.hoverArea}${sep}${chart.areaName}`)
  details.push(`${t.hoverLevel}${sep}${chart.level}`)
  if (chart.shape) details.push(`${t.hoverShape}${sep}${chart.shape}`)
  if (chart.implicitText) details.push(`${t.hoverImplicit}${sep}${chart.implicitText}`)
  details.push(chart.rawText ? `${t.hoverOther}${sep}\n${chart.rawText}` : t.hoverOtherNone)
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
  lang: Lang
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
          title={chart ? chartHoverText(chart, lang) : undefined}
          role={chart ? 'button' : undefined}
          tabIndex={chart ? 0 : undefined}
          aria-label={chart ? UI[lang].copyChartAria(chart.name) : undefined}
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
                  {copyNotice.ok ? UI[lang].copied : UI[lang].copyFailed}
                </div>
              )}
            </>
          ) : i === 6 ? (
            <div className="cell-empty">⚓<span>{UI[lang].startCell}</span></div>
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
  onRemove,
  onClear,
  lang,
}: {
  charts: ChartData[]
  onRemove: (uid: string) => void
  onClear: () => void
  lang: Lang
}) {
  const t = UI[lang]
  return (
    <div className="library">
      <div className="library-header">
        <div>{t.chartsAvailable(charts.length)}</div>
        <button className="ghost-btn" onClick={onClear} disabled={charts.length === 0}>
          {t.clearLibrary}
        </button>
      </div>
      <div className="chart-list">
        {charts.length === 0 && <div className="empty-hint">{t.libraryEmpty}</div>}
        {charts.map((c) => (
          <div key={c.uid} className="chart-row">
            <ShapeIcon edges={c.edges} />
            <div className="chart-row-main">
              <div className="chart-row-name">{c.name}</div>
              <div className="chart-row-meta">
                {c.shape ?? t.unknownShape} · {t.chartLevel(c.level)}
                {c.implicitText ? ` · ${c.implicitText}` : ''}
              </div>
            </div>
            <button className="remove-btn" onClick={() => onRemove(c.uid)} title={t.remove}>
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

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export default function App() {
  // 倉庫與邊界從 localStorage 接續上次（見 logic/storage.ts）
  const [charts, setCharts] = useState<ChartData[]>(loadCharts)
  const [borders, setBorders] = useState<Borders>(loadBorders)
  const [result, setResult] = useState<SolverResult | null>(null)
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [strategy, setStrategy] = useState<StrategyDef>(STRATEGIES[0])
  const [lang, setLang] = useState<Lang>('zh')
  const [autoWatch, setAutoWatch] = useState<boolean>(loadAutoWatch)
  const [autoAdded, setAutoAdded] = useState<number | null>(null)
  const progressTimer = useRef<number | null>(null)
  const t = UI[lang]

  const chartMap = useMemo(() => new Map(charts.map((c) => [c.uid, c])), [charts])
  const plannedChartUids = useMemo(
    () => new Set(result?.board.flatMap((placement) => (placement ? [placement.chartUid] : [])) ?? []),
    [result],
  )

  useEffect(() => saveCharts(charts), [charts])
  useEffect(() => saveBorders(borders), [borders])
  useEffect(() => saveAutoWatch(autoWatch), [autoWatch])

  // 剪貼簿自動偵測：切回分頁時讀到的新內容，只要解析得出完整海圖就直接入庫；
  // 剪貼簿裡是別的東西（網址、聊天紀錄…）就安靜略過，不要跳錯誤嚇人。
  const onClipboardText = useCallback((text: string) => {
    const { charts: parsed } = parseChartText(text)
    const usable = parsed.filter((c) => c.level > 0 && Boolean(c.shape))
    if (usable.length === 0) return
    setCharts((prev) => [...prev, ...usable])
    setAutoAdded(usable.length)
  }, [])

  const watchStatus = useClipboardWatch(autoWatch, onClipboardText)

  /** 開啟時先在使用者的點擊手勢裡讀一次，權限提示才會正常跳出來 */
  async function toggleAutoWatch(on: boolean) {
    setAutoAdded(null)
    if (on && clipboardWatchSupported()) {
      try {
        await navigator.clipboard.readText()
      } catch {
        // 使用者拒絕或還沒授權都沒關係，狀態列會由 watchStatus 反映
      }
    }
    setAutoWatch(on)
  }

  // index.html 的 <title> 是靜態的，切語言時同步一下分頁標題
  useEffect(() => {
    document.title = t.title
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-Hant'
  }, [t.title, lang])

  const borderCount = borders.filter(Boolean).length

  function clearCharts() {
    if (charts.length === 0) return
    if (!window.confirm(t.clearLibraryConfirm(charts.length))) return
    setCharts([])
    setResult(null)
  }

  const borderOk = !strategy.requiresBorderId || borders.includes(strategy.requiresBorderId.id)
  const reqStates = (strategy.requirements ?? []).map((r) => ({ req: r, ok: requirementMet(r, charts) }))
  const allOk = borderOk && reqStates.every((r) => r.ok)

  function runSolver() {
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

  return (
    <div className="app">
      <header>
        <div className="header-top">
          <div className="eyebrow">{t.eyebrow}</div>
          <div className="lang-toggle">
            <button className={lang === 'zh' ? 'active' : ''} onClick={() => setLang('zh')}>
              中
            </button>
            <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>
              EN
            </button>
          </div>
        </div>
        <h1>{t.title}</h1>
        <p className="subtitle">{t.subtitle}</p>
      </header>

      <div className="main-grid">
        <section className="panel board-panel">
          <h2>
            {t.bordersPanel} <span className="panel-sub">{t.bordersSet(borderCount)}</span>
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
              {t.quickDelete}
            </button>
            <button
              className="quick-delete-btn subtle"
              type="button"
              onClick={() => setBorders(emptyBorders())}
              disabled={borderCount === 0}
            >
              {t.clearBorders}
            </button>
            <span>{t.quickDeleteHint}</span>
          </div>
        </section>

        <section className="panel library-panel">
          <h2>{t.libraryPanel}</h2>
          <ChartLibrary
            charts={charts}
            onRemove={(uid) => setCharts((prev) => prev.filter((c) => c.uid !== uid))}
            onClear={clearCharts}
            lang={lang}
          />
        </section>

        <section className="panel import-panel">
          <h2>{t.importPanel}</h2>
          <ChartImporter
            onImport={(cs) => setCharts((prev) => [...prev, ...cs])}
            lang={lang}
            autoWatch={autoWatch}
            onAutoWatchChange={toggleAutoWatch}
            watchStatus={watchStatus}
            autoAdded={autoAdded}
          />
        </section>
      </div>

      <section className="panel">
        <h2>{t.strategyPanel}</h2>
        <StrategyPicker selected={strategy} onSelect={setStrategy} />
        <p className="strategy-tagline">{strategy.tagline}</p>
        <ul className="guide-list">
          {strategy.guide.map((g, i) => (
            <li key={i}>{g}</li>
          ))}
        </ul>

        {(strategy.requiresBorderId || reqStates.length > 0) && (
          <>
            <div className="checklist-title">{t.requirementsTitle}</div>
            <ul className="checklist">
              {strategy.requiresBorderId && (
                <li className={borderOk ? 'ok' : 'bad'}>
                  {borderOk ? '✅' : '❌'} {t.rolled(strategy.requiresBorderId.label)}
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
          {running ? t.solving : t.solve}
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
          <div className="result-meta">{t.result(result.reward.toFixed(1), result.valid)}</div>
        )}
      </section>

      <footer className="site-footer">
        <div>2026/7/31 夏烏拉</div>
        <div className="site-footer-links">
          <a
            href="https://github.com/xlox123456789/3.29_Allframe_voyage_planning"
            target="_blank"
            rel="noreferrer"
          >
            {t.githubLink}
          </a>
          <a
            href="https://github.com/xlox123456789/3.29_Allframe_voyage_planning/discussions"
            target="_blank"
            rel="noreferrer"
          >
            {t.feedbackLink}
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
  autoWatch,
  onAutoWatchChange,
  watchStatus,
  autoAdded,
}: {
  onImport: (charts: ChartData[]) => void
  lang: Lang
  autoWatch: boolean
  onAutoWatchChange: (on: boolean) => void
  watchStatus: ClipboardWatchStatus
  autoAdded: number | null
}) {
  const [text, setText] = useState('')
  // 存下「加了幾張、跳過哪些」而不是存已經拼好的句子，切語言時訊息才會跟著翻譯
  const [msg, setMsg] = useState<{ auto: boolean; added: number; skipped: string[] } | null>(null)
  const t = UI[lang]

  return (
    <div className="library">
      <textarea
        placeholder={t.importPlaceholder}
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
          setMsg({ auto: true, added: cs.length, skipped: rejected.map((r) => r.reason) })
        }}
        rows={10}
      />
      <button
        className="primary-btn"
        onClick={() => {
          const { charts: cs, rejected } = parseChartText(text)
          onImport(cs)
          setText('')
          setMsg({ auto: false, added: cs.length, skipped: rejected.map((r) => r.reason) })
        }}
        disabled={!text.trim()}
      >
        {t.addToLibrary}
      </button>
      {msg && (
        <div className="import-msg">
          {msg.auto ? t.importedAuto(msg.added, msg.skipped) : t.imported(msg.added, msg.skipped)}
        </div>
      )}

      <div className="watch-box">
        <label className="watch-toggle">
          <input
            type="checkbox"
            checked={autoWatch}
            disabled={watchStatus === 'unsupported'}
            onChange={(e) => onAutoWatchChange(e.target.checked)}
          />
          <span>{t.autoWatch}</span>
        </label>
        <div className="watch-hint">
          {watchStatus === 'unsupported'
            ? t.autoWatchUnsupported
            : autoWatch && watchStatus === 'denied'
              ? t.autoWatchDenied
              : t.autoWatchHint}
        </div>
        {autoWatch && autoAdded !== null && watchStatus === 'watching' && (
          <div className="watch-added">✅ {t.autoWatchAdded(autoAdded)}</div>
        )}
      </div>
    </div>
  )
}
