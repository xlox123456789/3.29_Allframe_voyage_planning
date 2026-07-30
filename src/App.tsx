import { useMemo, useState } from 'react'
import type { Board, Borders, ChartData } from './types'
import { emptyBorders } from './types'
import { parseChartText } from './logic/parser'
import { solve, type SolverResult } from './logic/solver'
import { BORDER_MODS, borderModById } from './data/mods'
import { STRATEGIES } from './data/strategies'
import './index.css'

const STRATEGY = STRATEGIES[0] // MVP：目前只做 Divine Border Rares

const SEGMENT_GROUPS: { label: string; indices: number[] }[] = [
  { label: '上', indices: [0, 1, 2] },
  { label: '右', indices: [3, 4, 5] },
  { label: '下', indices: [6, 7, 8] },
  { label: '左', indices: [9, 10, 11] },
]

function BorderEditor({ borders, onChange }: { borders: Borders; onChange: (b: Borders) => void }) {
  return (
    <div className="border-editor">
      {SEGMENT_GROUPS.map((group) => (
        <div key={group.label} className="border-group">
          <div className="border-group-label">{group.label}邊</div>
          {group.indices.map((seg) => (
            <select
              key={seg}
              value={borders[seg] ?? ''}
              onChange={(e) => {
                const next = [...borders]
                next[seg] = e.target.value || null
                onChange(next)
              }}
            >
              <option value="">（未擲出 / 空白）</option>
              {BORDER_MODS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.short ?? m.text}
                </option>
              ))}
            </select>
          ))}
        </div>
      ))}
    </div>
  )
}

function ChartImporter({ onImport }: { onImport: (charts: ChartData[]) => void }) {
  const [text, setText] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  return (
    <div className="importer">
      <textarea
        placeholder="在遊戲內複製海圖（Ctrl+C）後貼在這裡，可一次貼多張，按「加入圖表庫」"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
      />
      <button
        onClick={() => {
          const { charts, rejected } = parseChartText(text)
          onImport(charts)
          setText('')
          setMsg(
            `成功匯入 ${charts.length} 張圖表` +
              (rejected.length ? `，${rejected.length} 項被跳過（${rejected.map((r) => r.reason).join('；')}）` : ''),
          )
        }}
      >
        加入圖表庫
      </button>
      {msg && <div className="import-msg">{msg}</div>}
    </div>
  )
}

function EdgeGlyph({ edges }: { edges: [boolean, boolean, boolean, boolean] }) {
  const [n, e, s, w] = edges
  return (
    <div className="edge-glyph">
      <span className={n ? 'on' : ''}>▲</span>
      <div>
        <span className={w ? 'on' : ''}>◀</span>
        <span className={e ? 'on' : ''}>▶</span>
      </div>
      <span className={s ? 'on' : ''}>▼</span>
    </div>
  )
}

function BorderPill({ id, vertical }: { id: string | null; vertical?: boolean }) {
  const mod = id ? borderModById.get(id) : null
  return <div className={`border-pill ${vertical ? 'vertical' : ''} ${mod ? 'set' : ''}`}>{mod?.short ?? '—'}</div>
}

function BoardView({ board, charts, borders }: { board: Board; charts: Map<string, ChartData>; borders: Borders }) {
  return (
    <div className="board-wrap">
      <div className="board-row-borders top">
        {[0, 1, 2].map((i) => (
          <BorderPill key={i} id={borders[i]} />
        ))}
      </div>
      <div className="board-mid">
        <div className="board-col-borders left">
          {[9, 10, 11].map((i) => (
            <BorderPill key={i} id={borders[i]} vertical />
          ))}
        </div>
        <div className="board-grid">
          {board.map((p, i) => {
            const chart = p ? charts.get(p.chartUid) : null
            return (
              <div key={i} className={`cell ${chart ? 'filled' : ''} ${i === 6 ? 'start' : ''}`}>
                {chart ? (
                  <>
                    <div className="cell-name">{chart.name}</div>
                    <EdgeGlyph edges={chart.edges} />
                  </>
                ) : (
                  <div className="cell-empty">{i === 6 ? '⚓ 起點' : '空'}</div>
                )}
              </div>
            )
          })}
        </div>
        <div className="board-col-borders right">
          {[3, 4, 5].map((i) => (
            <BorderPill key={i} id={borders[i]} vertical />
          ))}
        </div>
      </div>
      <div className="board-row-borders bottom">
        {[6, 7, 8].map((i) => (
          <BorderPill key={i} id={borders[i]} />
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
        <h1>航海圖規劃器（中文版）</h1>
        <div className="strategy-badge">
          目前策略：<strong>{STRATEGY.name}</strong>
        </div>
      </header>

      <section className="panel">
        <h2>① 貼上海圖</h2>
        <ChartImporter onImport={(cs) => setCharts((prev) => [...prev, ...cs])} />
        <div className="library-count">圖表庫：{charts.length} 張</div>
      </section>

      <section className="panel">
        <h2>② 設定 12 段邊界</h2>
        <BorderEditor borders={borders} onChange={setBorders} />
      </section>

      <section className="panel">
        <h2>③ 策略需求檢查</h2>
        <ul className="checklist">
          <li className={hasDivineBorder ? 'ok' : 'bad'}>
            {hasDivineBorder ? '✅' : '❌'} 已擲出神聖邊界（稀有怪掉神聖石）
          </li>
          <li className={hasPillarChart ? 'ok' : 'bad'}>
            {hasPillarChart ? '✅' : '❌'} 圖表庫內有 Sea-Pillar 類型圖表（名稱含「柱」）
          </li>
        </ul>
        {(!hasDivineBorder || !hasPillarChart) && <div className="hint">{STRATEGY.waitHint}</div>}
      </section>

      <section className="panel">
        <button className="solve-btn" disabled={charts.length === 0 || running} onClick={runSolver}>
          {running ? '規劃中…' : '開始規劃'}
        </button>
      </section>

      {result && (
        <section className="panel">
          <h2>④ 建議擺放</h2>
          <div className="result-meta">
            分數：{result.reward.toFixed(1)}　{result.valid ? '✅ 航道可行' : '⚠️ 航道有問題（接口未接上或有格子空白）'}
          </div>
          <BoardView board={result.board} charts={chartMap} borders={borders} />
        </section>
      )}
    </div>
  )
}
