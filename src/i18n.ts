// 介面文字（中／英）。分工：
//   - 這裡只放「網站自己的介面文字」（標題、按鈕、狀態列、提示）
//   - 遊戲文字（邊界詞綴、海圖名稱）走 data/mods.ts 的 text / textEn
//   - 策略卡片的名稱與打法說明維持中文，見 data/strategies.ts
// 有帶數字/變數的字串一律做成函式，避免在 JSX 裡拼字串拼到走鐘。

export type Lang = 'zh' | 'en'

export interface UiStrings {
  eyebrow: string
  title: string
  subtitle: string

  // ① 外框邊界詞綴
  bordersPanel: string
  bordersSet: (n: number) => string
  quickDelete: string
  quickDeleteHint: string
  clearBorders: string

  // 九宮格
  startCell: string
  copyChartAria: (name: string) => string
  copied: string
  copyFailed: string
  hoverArea: string
  hoverLevel: string
  hoverShape: string
  hoverImplicit: string
  hoverOther: string
  hoverOtherNone: string

  // ② 海圖倉庫
  libraryPanel: string
  chartsAvailable: (n: number) => string
  libraryEmpty: string
  unknownShape: string
  chartLevel: (n: number) => string
  remove: string
  clearLibrary: string
  clearLibraryConfirm: (n: number) => string

  // 複製貼上區
  importPanel: string
  importPlaceholder: string
  addToLibrary: string
  importedAuto: (n: number, skipped: string[]) => string
  imported: (n: number, skipped: string[]) => string
  autoWatch: string
  autoWatchHint: string
  autoWatchDenied: string
  autoWatchUnsupported: string
  autoWatchAdded: (n: number) => string
  autoWatchDeniedTitle: string
  noticeClose: string
  /** 條列多個名稱時用的分隔符號 */
  listSeparator: string

  // ③ 選擇策略
  strategyPanel: string
  requirementsTitle: string
  rolled: (label: string) => string

  // 求解
  solve: string
  solving: string
  result: (score: string, valid: boolean) => string

  // 邊界選擇器
  borderPillEmpty: string
  borderPillTitle: string
  borderSearch: string
  borderClear: string
  borderNoMatch: string

  githubLink: string
  feedbackLink: string
}

// 跳過項目的說明；理由字串本身由 logic/parser.ts 依照「貼上的那張圖是哪國語言」產生
const skippedZh = (r: string[]) => (r.length ? `，跳過 ${r.length} 項（${r.join('；')}）` : '')
const skippedEn = (r: string[]) => (r.length ? `, skipped ${r.length} (${r.join('; ')})` : '')

const zh: UiStrings = {
  eyebrow: 'PATH OF EXILE · 亡焰咒海',
  title: '亡焰咒海',
  subtitle:
    '設定 12 段外框邊界詞綴，貼上你的海圖倉庫，選擇策略後按「開始規劃」自動選出最佳九張並排出擺放方式。',

  bordersPanel: '① 外框邊界詞綴',
  bordersSet: (n) => `${n} / 12 已設定`,
  quickDelete: '快速刪除',
  quickDeleteHint: '根據九宮格中的海圖，刪除倉庫裡相對應的九個海圖',
  clearBorders: '清空邊界',

  startCell: '起點',
  copyChartAria: (name) => `複製海圖名稱：${name}`,
  copied: '已複製',
  copyFailed: '複製失敗',
  hoverArea: '區域',
  hoverLevel: '等級',
  hoverShape: '形狀',
  hoverImplicit: '固定詞綴',
  hoverOther: '其他詞綴',
  hoverOtherNone: '其他詞綴：未解析到其他詞綴',

  libraryPanel: '② 海圖倉庫',
  chartsAvailable: (n) => `${n} 張可用海圖`,
  libraryEmpty: '尚無海圖，貼上文字後按「加入倉庫」',
  unknownShape: '形狀未知',
  chartLevel: (n) => `等級 ${n}`,
  remove: '移除',
  clearLibrary: '清空倉庫',
  clearLibraryConfirm: (n) => `確定要清空倉庫裡的 ${n} 張海圖嗎？`,

  importPanel: '複製貼上區',
  importPlaceholder: 'Ctrl+V 貼上海圖（遊戲內 Ctrl+C 複製）',
  addToLibrary: '加入倉庫',
  importedAuto: (n, skipped) => `已自動加入 ${n} 張` + skippedZh(skipped),
  imported: (n, skipped) => `已加入 ${n} 張` + skippedZh(skipped),
  autoWatch: '自動偵測剪貼簿',
  autoWatchHint:
    '打開後，在遊戲裡 Ctrl+C 複製海圖，切回這個分頁就會自動入庫，不用再手動貼上。瀏覽器規定只有「這個分頁有焦點」時才讀得到剪貼簿，所以還是要切回來一次，沒辦法在你還在遊戲裡的時候就先收好。',
  autoWatchDenied: '瀏覽器擋掉了剪貼簿讀取權限。請點網址列左邊的圖示，把「剪貼簿」設成允許後再打開一次。',
  autoWatchUnsupported: '這個瀏覽器不支援讀取剪貼簿，請用下面的貼上框。',
  autoWatchAdded: (n) => `已自動加入 ${n} 張海圖`,
  autoWatchDeniedTitle: '讀不到剪貼簿',
  noticeClose: '關閉通知',
  listSeparator: '、',

  strategyPanel: '③ 選擇策略',
  requirementsTitle: '建議需求',
  rolled: (label) => `已擲出${label}`,

  solve: '開始規劃',
  solving: '規劃中…',
  result: (score, valid) =>
    `分數：${score}　${valid ? '✅ 航道可行' : '⚠️ 航道有問題（接口未接上或有格子空白）'}`,

  borderPillEmpty: '邊界詞',
  borderPillTitle: '點擊設定這段邊界',
  borderSearch: '輸入關鍵字快速搜尋…',
  borderClear: '（清空邊界詞）',
  borderNoMatch: '找不到符合的邊界詞綴',

  githubLink: 'GITHUB頁面',
  feedbackLink: '意見反饋區',
}

const en: UiStrings = {
  eyebrow: 'PATH OF EXILE · CURSE OF THE ALLFLAME',
  title: 'Curse of the Allflame',
  subtitle:
    'Set the 12 border rolls, paste in your chart library, pick a strategy, then hit Start Planning to auto-pick the best nine charts and lay them out.',

  bordersPanel: '① Board Borders',
  bordersSet: (n) => `${n} / 12 set`,
  quickDelete: 'Quick Delete',
  quickDeleteHint: 'Remove the nine charts currently placed on the board from your library',
  clearBorders: 'Clear Borders',

  startCell: 'Start',
  copyChartAria: (name) => `Copy chart name: ${name}`,
  copied: 'Copied',
  copyFailed: 'Copy failed',
  hoverArea: 'Area',
  hoverLevel: 'Level',
  hoverShape: 'Shape',
  hoverImplicit: 'Implicit',
  hoverOther: 'Other mods',
  hoverOtherNone: 'Other mods: none parsed',

  libraryPanel: '② Chart Library',
  chartsAvailable: (n) => `${n} charts available`,
  libraryEmpty: 'No charts yet — paste chart text, then press Add to Library.',
  unknownShape: 'Unknown shape',
  chartLevel: (n) => `Level ${n}`,
  remove: 'Remove',
  clearLibrary: 'Clear Library',
  clearLibraryConfirm: (n) => `Clear all ${n} charts from your library?`,

  importPanel: 'Paste Charts',
  importPlaceholder: 'Ctrl+V paste a Chart (Ctrl+C in-game).',
  addToLibrary: 'Add to Library',
  importedAuto: (n, skipped) => `Auto-added ${n} chart${n === 1 ? '' : 's'}` + skippedEn(skipped),
  imported: (n, skipped) => `Added ${n} chart${n === 1 ? '' : 's'}` + skippedEn(skipped),
  autoWatch: 'Auto-detect clipboard',
  autoWatchHint:
    'When on, Ctrl+C a Chart in game and it is added to your library as soon as you switch back to this tab — no pasting. Browsers only allow reading the clipboard while this tab is focused, so you do still have to switch back once; a web page cannot pick charts up while you are still in the game.',
  autoWatchDenied:
    'The browser blocked clipboard read access. Click the icon at the left of the address bar, allow "Clipboard", then turn this on again.',
  autoWatchUnsupported: 'This browser cannot read the clipboard — use the paste box below.',
  autoWatchAdded: (n) => `Auto-added ${n} chart${n === 1 ? '' : 's'}`,
  autoWatchDeniedTitle: 'Cannot read clipboard',
  noticeClose: 'Dismiss notification',
  listSeparator: ', ',

  strategyPanel: '③ Pick a Strategy',
  requirementsTitle: 'Suggested requirements',
  rolled: (label) => `Rolled: ${label}`,

  solve: 'Start Planning',
  solving: 'Planning…',
  result: (score, valid) =>
    `Score: ${score}  ${valid ? '✅ Route is runnable' : '⚠️ Route has problems (connectors unmatched, or squares left empty)'}`,

  borderPillEmpty: 'Not rolled',
  borderPillTitle: 'Click to set this border',
  borderSearch: 'Type to search…',
  borderClear: '(clear / not rolled)',
  borderNoMatch: 'No matching border mod',

  githubLink: 'GITHUB',
  feedbackLink: 'Feedback',
}

export const UI: Record<Lang, UiStrings> = { zh, en }
