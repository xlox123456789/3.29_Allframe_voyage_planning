import { useEffect, useMemo, useRef, useState } from 'react'
import type { Board, Borders, ChartData, Edges } from './types'
import { emptyBorders } from './types'
import { parseChartText } from './logic/parser'
import { solve, type SolverResult } from './logic/solver'
import { rotateEdges } from './logic/connectivity'
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
  lang: 'zh' | 'en'
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const mod = value ? borderModById.get(value) : null
  const labelOf = (m: (typeof BORDER_MODS)[number]) => (lang === 'en' ? m.textEn ?? m.text : m.text)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return BORDER_MODS
    return BORDER_MODS.filter((m) => labelOf(m).toLowerCase().includes(q) || m.short?.includes(query.trim()))
  }, [query, lang])

  return (
    <div className={`border-picker align-${align}`} ref={rootRef}>
      <button
        type="button"
        className={`border-pill ${mod ? 'set' : ''}`}
        onClick={() => {
          setOpen((o) => !o)
          setQuery('')
        }}
        title={mod ? labelOf(mod) : lang === 'en' ? 'Click to set this border' : '點擊設定這段邊界'}
      >
        {mod ? (lang === 'en' ? mod.textEn ?? mod.short ?? mod.text : mod.short ?? mod.text) : lang === 'en' ? 'Not rolled' : '未擲出'}
      </button>
      {open && (
        <div className="border-dropdown">
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
              {lang === 'en' ? '(clear / not rolled)' : '（清空 / 未擲出）'}
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
      )}
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
        <div className={`cell ${chart ? 'filled' : ''} ${i === 6 ? 'start' : ''}`}>
          {chart ? (
            <>
              <ShapeIcon edges={rotateEdges(chart.edges, p!.rotation)} />
              <div className="cell-name">{chart.name}</div>
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
  onImport,
  onRemove,
  onClear,
  lang,
}: {
  charts: ChartData[]
  onImport: (charts: ChartData[]) => void
  onRemove: (uid: string) => void
  onClear: () => void
  lang: 'zh' | 'en'
}) {
  const [text, setText] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
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
      <textarea
        placeholder={
          lang === 'en'
            ? 'Ctrl+V paste a Chart (Ctrl+C in-game). You can paste several at once.'
            : 'Ctrl+V 貼上海圖（遊戲內 Ctrl+C 複製），可一次貼多張'
        }
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
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

      <div className="chart-list">
        {charts.length === 0 && <div className="empty-hint">尚無海圖，貼上文字後按「加入倉庫」</div>}
        {charts.map((c) => (
          <div key={c.uid} className="chart-row">
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
  const count = charts.filter(
    (c) =>
      (req.modIds && c.modIds.some((id) => req.modIds!.includes(id))) ||
      (req.nameMatch &&
        (c.name.toLowerCase().includes(req.nameMatch.toLowerCase()) ||
          c.areaName?.toLowerCase().includes(req.nameMatch.toLowerCase()))),
  ).length
  return count >= req.count
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export default function App() {
  const [charts, setCharts] = useState<ChartData[]>([])
  const [borders, setBorders] = useState<Borders>(emptyBorders())
  const [result, setResult] = useState<SolverResult | null>(null)
  const [running, setRunning] = useState(false)
  const [strategy, setStrategy] = useState<StrategyDef>(STRATEGIES[0])
  const [lang, setLang] = useState<'zh' | 'en'>('zh')

  const chartMap = useMemo(() => new Map(charts.map((c) => [c.uid, c])), [charts])

  const borderOk = !strategy.requiresBorderId || borders.includes(strategy.requiresBorderId.id)
  const reqStates = (strategy.requirements ?? []).map((r) => ({ req: r, ok: requirementMet(r, charts) }))
  const allOk = borderOk && reqStates.every((r) => r.ok)

  function runSolver() {
    setRunning(true)
    setTimeout(() => {
      const results = solve(charts, borders, strategy.weights, {
        mode: 'connected',
        allowRotation: true,
        adjacencyMode: 'physical',
        adjacentAffectsSelf: false,
        topK: 1,
        strategyRules: strategy.rules,
      })
      setResult(results[0] ?? null)
      setRunning(false)
    }, 10)
  }

  return (
    <div className="app">
      <header>
        <div className="header-top">
          <div className="eyebrow">PATH OF EXILE · 亡焰咒海</div>
          <div className="lang-toggle">
            <button className={lang === 'zh' ? 'active' : ''} onClick={() => setLang('zh')}>
              中
            </button>
            <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>
              EN
            </button>
          </div>
        </div>
        <h1>亡焰咒海</h1>
        <p className="subtitle">
          設定 12 段外框邊界詞綴，貼上你的海圖倉庫，選擇策略後按「開始規劃」自動選出最佳九張並排出擺放方式。
        </p>
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
        </section>

        <section className="panel">
          <h2>② 海圖倉庫</h2>
          <ChartLibrary
            charts={charts}
            onImport={(cs) => setCharts((prev) => [...prev, ...cs])}
            onRemove={(uid) => setCharts((prev) => prev.filter((c) => c.uid !== uid))}
            onClear={() => setCharts([])}
            lang={lang}
          />
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
        {result && (
          <div className="result-meta">
            分數：{result.reward.toFixed(1)}　{result.valid ? '✅ 航道可行' : '⚠️ 航道有問題（接口未接上或有格子空白）'}
          </div>
        )}
      </section>
    </div>
  )
}
