import { useMemo, useState } from 'react'
import type { Board, Borders, ChartData } from './types'
import { emptyBorders } from './types'
import { parseChartText } from './logic/parser'
import { solve, type SolverResult } from './logic/solver'
import { BORDER_MODS, borderModById } from './data/mods'
import { STRATEGIES } from './data/strategies'
import './index.css'

const STRATEGY = STRATEGIES[0] // MVP：目前只做 Divine Border Rares

// 12 段邊界，依畫面上的視覺位置排列（順時針編號 1-12，從左上角開始）
// 對應到 types.ts 的 borderTouches 索引：0-2 上、3-5 右、6-8 下、9-11 左
const BORDER_LAYOUT: { seg: number; badge: number }[] = [
  { seg: 0, badge: 1 }, { seg: 1, badge: 2 }, { seg: 2, badge: 3 }, // 上排
  { seg: 3, badge: 4 }, { seg: 4, badge: 5 }, { seg: 5, badge: 6 }, // 右排
  { seg: 8, badge: 7 }, { seg: 7, badge: 8 }, { seg: 6, badge: 9 }, // 下排（右→左）
  { seg: 11, badge: 10 }, { seg: 10, badge: 11 }, { seg: 9, badge: 12 }, // 左排（下→上）
]

function BorderSlot({
  badge,
  value,
  onChange,
}: {
  badge: number
  value: string | null
  onChange: (v: string | null) => void
}) {
  const mod = value ? borderModById.get(value) : null
  return (
    <label className={`border-slot ${mod ? 'set' : ''}`}>
      <span className="badge">{badge}</span>
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value || null)}>
        <option value="">未擲出</option>
        {BORDER_MODS.map((m) => (
          <option key={m.id} value={m.id}>
            {m.short ?? m.text}
          </option>
        ))}
      </select>
      <span className="border-slot-label">{mod?.short ?? '未擲出'}</span>
    </label>
  )
}

function BoardWithBorders({
  borders,
  onBorderChange,
  board,
  charts,
}: {
  borders: Borders
  onBorderChange: (seg: number, v: string | null) => void
  board: Board | null
  charts: Map<string, ChartData>
}) {
  const byBadgeRow = (badges: number[]) => BORDER_LAYOUT.filter((b) => badges.includes(b.badge))
  return (
    <div className="board-frame">
      <div className="frame-row top">
        {byBadgeRow([1, 2, 3]).map((b) => (
          <BorderSlot key={b.seg} badge={b.badge} value={borders[b.seg]} onChange={(v) => onBorderChange(b.seg, v)} />
        ))}
      </div>
      <div className="frame-mid">
        <div className="frame-col left">
          {byBadgeRow([12, 11, 10]).map((b) => (
            <BorderSlot key={b.seg} badge={b.badge} value={borders[b.seg]} onChange={(v) => onBorderChange(b.seg, v)} />
          ))}
        </div>
        <div className="board-grid">
          {Array.from({ length: 9 }, (_, i) => {
            const p = board?.[i]
            const chart = p ? charts.get(p.chartUid) : null
            return (
              <div key={i} className={`cell ${chart ? 'filled' : ''} ${i === 6 ? 'start' : ''}`}>
                <span className="cell-index">{i + 1}</span>
                {chart ? (
                  <div className="cell-name">{chart.name}</div>
                ) : (
                  <div className="cell-empty">{i === 6 ? '⚓ 起點' : ''}</div>
                )}
              </div>
            )
          })}
        </div>
        <div className="frame-col right">
          {byBadgeRow([4, 5, 6]).map((b) => (
            <BorderSlot key={b.seg} badge={b.badge} value={borders[b.seg]} onChange={(v) => onBorderChange(b.seg, v)} />
          ))}
        </div>
      </div>
      <div className="frame-row bottom">
        {byBadgeRow([9, 8, 7]).map((b) => (
          <BorderSlot key={b.seg} badge={b.badge} value={borders[b.seg]} onChange={(v) => onBorderChange(b.seg, v)} />
        ))}
      </div>
    </div>
  )
}

function ChartLibrary({
  charts,
  onImport,
  onRemove,
  onClear,
}: {
  charts: ChartData[]
  onImport: (charts: ChartData[]) => void
  onRemove: (uid: string) => void
  onClear: () => void
}) {
  const [text, setText] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const usable = charts.length
  return (
    <div className="library">
      <div className="library-header">
        <div>
          <strong>{usable}</strong> 張可用海圖
        </div>
        <button className="ghost-btn" onClick={onClear} disabled={charts.length === 0}>
          清空倉庫
        </button>
      </div>
      <textarea
        placeholder="Ctrl+V 貼上海圖（遊戲內 Ctrl+C 複製），可一次貼多張"
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
            <div className="chart-row-main">
              <div className="chart-row-name">{c.name}</div>
              <div className="chart-row-meta">
                {c.shape ?? '形狀未知'} · Lv.{c.level}
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

export default function App() {
  const [charts, setCharts] = useState<ChartData[]>([])
  const [borders, setBorders] = useState<Borders>(emptyBorders())
  const [result, setResult] = useState<SolverResult | null>(null)
  const [running, setRunning] = useState(false)

  const chartMap = useMemo(() => new Map(charts.map((c) => [c.uid, c])), [charts])

  const hasDivineBorder = borders.includes('b-divine')
  const hasPillarChart = charts.some((c) => c.name.includes('柱'))

  function runSolver() {
    setRunning(true)
    setTimeout(() => {
      const results = solve(charts, borders, STRATEGY.weights, {
        mode: 'connected',
        allowRotation: true,
        adjacencyMode: 'physical',
        adjacentAffectsSelf: false,
        topK: 1,
        strategyRules: STRATEGY.rules,
      })
      setResult(results[0] ?? null)
      setRunning(false)
    }, 10)
  }

  return (
    <div className="app">
      <header>
        <div className="eyebrow">PATH OF EXILE · 深海全焰之咒</div>
        <h1>航海圖規劃器</h1>
        <p className="subtitle">
          設定 12 段外框邊界詞綴，貼上你的海圖倉庫，按「開始規劃」自動選出最佳九張並排出擺放方式。
        </p>
        <div className="strategy-badge">
          目前策略：<strong>{STRATEGY.name}</strong>
        </div>
      </header>

      <div className="main-grid">
        <section className="panel">
          <h2>① 外框邊界詞綴 <span className="panel-sub">{borders.filter(Boolean).length} / 12 已設定</span></h2>
          <BoardWithBorders
            borders={borders}
            onBorderChange={(seg, v) => {
              const next = [...borders]
              next[seg] = v
              setBorders(next)
            }}
            board={result?.board ?? null}
            charts={chartMap}
          />
        </section>

        <section className="panel">
          <h2>② 海圖倉庫</h2>
          <ChartLibrary
            charts={charts}
            onImport={(cs) => setCharts((prev) => [...prev, ...cs])}
            onRemove={(uid) => setCharts((prev) => prev.filter((c) => c.uid !== uid))}
            onClear={() => setCharts([])}
          />
        </section>
      </div>

      <section className="panel">
        <h2>③ 策略需求檢查</h2>
        <ul className="checklist">
          <li className={hasDivineBorder ? 'ok' : 'bad'}>
            {hasDivineBorder ? '✅' : '❌'} 已擲出神聖邊界（稀有怪掉神聖石）
          </li>
          <li className={hasPillarChart ? 'ok' : 'bad'}>
            {hasPillarChart ? '✅' : '❌'} 倉庫內有 Sea-Pillar 類型圖表（名稱含「柱」）
          </li>
        </ul>
        {(!hasDivineBorder || !hasPillarChart) && <div className="hint">{STRATEGY.waitHint}</div>}
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
