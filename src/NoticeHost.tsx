// 右上角浮出的通知（類似 Naive UI 的 notification）：滑入、停留一段時間後自動淡出，
// 也可以手動按 ✕ 關掉。用 portal 掛到 body，才不會被卡片的 overflow 裁掉。
// 狀態管理在 logic/useNotices.ts。

import { createPortal } from 'react-dom'
import type { Notice, NoticeType } from './logic/useNotices'

const ICON: Record<NoticeType, string> = { success: '✅', error: '⚠️', info: 'ℹ️' }

export function NoticeHost({
  notices,
  onDismiss,
  closeLabel,
}: {
  notices: Notice[]
  onDismiss: (id: number) => void
  closeLabel: string
}) {
  if (notices.length === 0) return null
  return createPortal(
    <div className="notice-host" aria-live="polite">
      {notices.map((n) => (
        <div
          key={n.id}
          className={`notice notice-${n.type} ${n.leaving ? 'leaving' : ''}`}
          role="status"
        >
          <span className="notice-icon" aria-hidden="true">
            {ICON[n.type]}
          </span>
          <div className="notice-main">
            <div className="notice-title">{n.title}</div>
            {n.body && <div className="notice-body">{n.body}</div>}
          </div>
          <button
            className="notice-close"
            type="button"
            aria-label={closeLabel}
            onClick={() => onDismiss(n.id)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>,
    document.body,
  )
}
