// 右上角通知的狀態管理（畫面在 ../NoticeHost.tsx）。
// 拆成兩個檔是因為同一個檔案同時 export hook 和元件會讓 Vite 的 fast refresh 失效。

import { useCallback, useEffect, useRef, useState } from 'react'

export type NoticeType = 'success' | 'error' | 'info'

export interface Notice {
  id: number
  type: NoticeType
  title: string
  body?: string
  /** 淡出動畫播放中；播完才真的從陣列移除 */
  leaving?: boolean
}

/** 淡出動畫長度，要跟 index.css 的 notice-out 一致 */
const LEAVE_MS = 220
/** 預設停留時間。1 秒對「剛切回分頁」的情境太短，來不及看到就沒了 */
export const DEFAULT_DURATION = 3000

let nextId = 1

export function useNotices(duration: number = DEFAULT_DURATION) {
  const [notices, setNotices] = useState<Notice[]>([])
  const timers = useRef<number[]>([])

  // 元件卸載時把還沒到期的計時器清掉，避免對已卸載的元件 setState
  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((t) => window.clearTimeout(t))
  }, [])

  const dismiss = useCallback((id: number) => {
    setNotices((prev) => prev.map((n) => (n.id === id && !n.leaving ? { ...n, leaving: true } : n)))
    timers.current.push(
      window.setTimeout(() => setNotices((prev) => prev.filter((n) => n.id !== id)), LEAVE_MS),
    )
  }, [])

  const notify = useCallback(
    (type: NoticeType, title: string, body?: string) => {
      const id = nextId++
      setNotices((prev) => [...prev, { id, type, title, body }])
      timers.current.push(window.setTimeout(() => dismiss(id), duration))
      return id
    },
    [duration, dismiss],
  )

  return { notices, notify, dismiss }
}
