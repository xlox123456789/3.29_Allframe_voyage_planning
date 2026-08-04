// 自動偵測剪貼簿：讓玩家在遊戲裡 Ctrl+C 複製海圖後，切回這個分頁就自動入庫，
// 不用再點貼上框、Ctrl+V、按「加入倉庫」。
//
// ⚠️ 瀏覽器的硬限制（不是這裡沒寫好）：navigator.clipboard.readText() 只有在
// 「這個分頁是焦點」時才讀得到，背景分頁一律丟 NotAllowedError:
//     Failed to execute 'readText' on 'Clipboard': Document is not focused.
// 所以網頁不可能在玩家還在遊戲裡的時候就背景收單，一定要等玩家切回瀏覽器那一刻。
// 真的要全背景自動蒐集，得走 tools/ 底下的 AHK 或瀏覽器擴充功能。
//
// 另外 clipboardchange 事件目前多數瀏覽器還沒有（實測 Chrome 沒有），
// 所以主要靠 focus/visibilitychange，再加一個低頻輪詢當保險。

import { useEffect, useRef, useState } from 'react'

export type ClipboardWatchStatus = 'unsupported' | 'watching' | 'denied'

export const clipboardWatchSupported = (): boolean =>
  typeof navigator !== 'undefined' &&
  typeof navigator.clipboard?.readText === 'function' &&
  window.isSecureContext

/** 分頁有焦點時的輪詢間隔；只是保險，主要事件是 focus */
const POLL_MS = 1500

/**
 * 開啟後監看剪貼簿，內容有變就把文字丟給 onText。
 * 同樣的文字只會通報一次，避免每次切回分頁就重複加同一張。
 */
export function useClipboardWatch(
  enabled: boolean,
  onText: (text: string) => void,
): ClipboardWatchStatus {
  const [denied, setDenied] = useState(false)
  const lastText = useRef('')
  const callback = useRef(onText)
  callback.current = onText

  useEffect(() => {
    if (!enabled || !clipboardWatchSupported()) return
    let stopped = false
    setDenied(false)

    const read = async () => {
      // 沒有焦點時瀏覽器一定擋，連試都不用試（也不該因此判定成「被拒絕」）
      if (stopped || !document.hasFocus()) return
      let text: string
      try {
        text = await navigator.clipboard.readText()
      } catch (err) {
        if ((err as DOMException)?.name === 'NotAllowedError') setDenied(true)
        return
      }
      if (stopped || !text || text === lastText.current) return
      lastText.current = text
      callback.current(text)
    }

    void read()
    window.addEventListener('focus', read)
    document.addEventListener('visibilitychange', read)
    document.addEventListener('clipboardchange', read)
    const timer = window.setInterval(read, POLL_MS)

    return () => {
      stopped = true
      window.removeEventListener('focus', read)
      document.removeEventListener('visibilitychange', read)
      document.removeEventListener('clipboardchange', read)
      window.clearInterval(timer)
    }
  }, [enabled])

  if (!clipboardWatchSupported()) return 'unsupported'
  return denied ? 'denied' : 'watching'
}
