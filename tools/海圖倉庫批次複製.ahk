#Requires AutoHotkey v2.0
#SingleInstance Force
#MaxThreadsPerHotkey 2
SetWorkingDir A_ScriptDir
SetTitleMatchMode 2
CoordMode "Mouse", "Screen"
CoordMode "ToolTip", "Screen"

; =====================================================================
;  海圖倉庫批次複製（AutoHotkey v2）
;
;  預設只使用一個快捷鍵 F9：
;    尚未定位：F9 記錄左上角，再按 F9 記錄右下角
;    已完成定位：F9 開始掃描 6 欄 x 10 列
;    掃描進行中：F9 終止掃描，已找到的海圖仍會放進剪貼簿
;
;  程式只會在 Path of Exile 視窗作用，不會自動切到或貼到任何網站。
;  設定視窗採精簡流程設計，保持最上層並可用標題列最小化。
; =====================================================================

; ---------------- 基本設定 ----------------
PoeWindowGroup := "PoEWindows"
GroupAdd PoeWindowGroup, "ahk_exe PathOfExile.exe"
GroupAdd PoeWindowGroup, "ahk_exe PathOfExileSteam.exe"
GroupAdd PoeWindowGroup, "ahk_exe PathOfExile_x64.exe"
GroupAdd PoeWindowGroup, "Path of Exile"
PoeWinSpec := "ahk_group " PoeWindowGroup

IniFile := A_ScriptDir "\海圖倉庫複製設定檔.ini"
LegacyIniFile := A_ScriptDir "\voyage-copy.ini"

; 第一次使用新版時，自動把舊設定檔改成新名稱，保留快捷鍵與定位資料。
if !FileExist(IniFile) && FileExist(LegacyIniFile) {
    try FileMove LegacyIniFile, IniFile
}

GridCols := IniRead(IniFile, "grid", "Cols", "6") + 0
GridRows := IniRead(IniFile, "grid", "Rows", "10") + 0
if GridCols < 1
    GridCols := 6
if GridRows < 1
    GridRows := 10

TLx := IniRead(IniFile, "grid", "TLx", "0") + 0
TLy := IniRead(IniFile, "grid", "TLy", "0") + 0
BRx := IniRead(IniFile, "grid", "BRx", "0") + 0
BRy := IniRead(IniFile, "grid", "BRy", "0") + 0

ActivateDelay := 80   ; 切換到 PoE 後等待時間（毫秒）
HoverDelay := 35      ; 滑鼠移到格子後等待時間（毫秒）
ClipTimeout := 0.25   ; 等待 Ctrl+C 的秒數

Running := false
Locating := false
LocateStep := 1

SettingsGui := 0
PoeStatusCtl := 0
LocationStatusCtl := 0
NextActionCtl := 0
MainHotkeyCtl := 0
ScanButtonCtl := 0
LocateButtonCtl := 0

; ---------------- 快捷鍵 ----------------
DefaultMainKey := "F9"
MainKey := IniRead(IniFile, "keys", "MainAction", DefaultMainKey)
RegisteredKey := ""

KeyLabel(hk) {
    label := ""
    i := 1
    while i <= StrLen(hk) {
        c := SubStr(hk, i, 1)
        if c = "^"
            label .= "Ctrl+"
        else if c = "!"
            label .= "Alt+"
        else if c = "+"
            label .= "Shift+"
        else if c = "#"
            label .= "Win+"
        else
            break
        i++
    }
    return label . SubStr(hk, i)
}

ApplyMainHotkey() {
    global MainKey, RegisteredKey, DefaultMainKey, IniFile, PoeWinSpec

    ; 讓快捷鍵只有 PoE 在前景時才成立，不會吃掉其他程式的 F9。
    HotIfWinActive PoeWinSpec

    if RegisteredKey != ""
        try Hotkey RegisteredKey, "Off"

    try {
        Hotkey MainKey, MainAction, "On"
        RegisteredKey := MainKey
    } catch {
        MainKey := DefaultMainKey
        IniWrite MainKey, IniFile, "keys", "MainAction"
        Hotkey MainKey, MainAction, "On"
        RegisteredKey := MainKey
    }

    HotIf
}

; ---------------- 共用功能 ----------------
Flash(text, ms := 2200) {
    ToolTip text, 20, 20
    SetTimer () => ToolTip(), -ms
}

FindPoeWindow() {
    global PoeWinSpec
    return WinExist(PoeWinSpec)
}

IsPoeActive() {
    global PoeWinSpec
    return WinActive(PoeWinSpec) != 0
}

ActivatePoe() {
    global PoeWinSpec, ActivateDelay
    hwnd := FindPoeWindow()
    if !hwnd
        return 0

    if !WinActive("ahk_id " hwnd) {
        WinActivate "ahk_id " hwnd
        if !WinWaitActive("ahk_id " hwnd, , 2)
            return 0
        Sleep ActivateDelay
    }
    return hwnd
}

Calibrated() {
    global TLx, TLy, BRx, BRy
    return TLx != 0 && TLy != 0 && BRx != 0 && BRy != 0
}

UpdateGuiStatus() {
    global PoeStatusCtl, LocationStatusCtl, NextActionCtl
    global ScanButtonCtl, LocateButtonCtl
    global Locating, LocateStep, Running, MainKey, GridCols, GridRows

    poeFound := FindPoeWindow()
    poeActive := IsPoeActive()
    keyName := KeyLabel(MainKey)

    if IsObject(PoeStatusCtl) {
        if poeFound
            PoeStatusCtl.Text := poeActive ? "PoE：已偵測（作用中）" : "PoE：已偵測（背景）"
        else
            PoeStatusCtl.Text := "PoE：未偵測"
    }

    if IsObject(LocationStatusCtl) {
        if Locating
            LocationStatusCtl.Text := LocateStep = 1 ? "倉庫：等待左上角" : "倉庫：等待右下角"
        else if Calibrated()
            LocationStatusCtl.Text := "倉庫：已定位 " GridCols "×" GridRows
        else
            LocationStatusCtl.Text := "倉庫：尚未定位"
    }

    if IsObject(LocateButtonCtl) {
        LocateButtonCtl.Text := Calibrated() ? "重新定位" : "開始定位"
        LocateButtonCtl.Enabled := !Running
    }

    if IsObject(NextActionCtl) {
        if Running {
            NextActionCtl.Text := "掃描中……`n按 " keyName " 可立即終止，已找到的內容仍會保留。"
        } else if Locating {
            if LocateStep = 1
                NextActionCtl.Text := "1 / 2　把滑鼠移到左上角第一格，按 " keyName
            else
                NextActionCtl.Text := "1 / 2　把滑鼠移到右下角最後一格，按 " keyName
        } else if !poeFound {
            NextActionCtl.Text := "現在要做：先開啟 Path of Exile。"
        } else if !Calibrated() {
            NextActionCtl.Text := "1 / 2　點「開始定位」，依序記錄左上角與右下角。"
        } else if !poeActive {
            NextActionCtl.Text := "2 / 2　切回 PoE，按 " keyName " 開始掃描。"
        } else {
            NextActionCtl.Text := "2 / 2　按 " keyName " 開始掃描 " GridCols "×" GridRows "。"
        }
    }

    if IsObject(ScanButtonCtl) {
        if Running {
            ScanButtonCtl.Text := "終止掃描（" keyName "）"
            ScanButtonCtl.Enabled := true
        } else if Locating {
            ScanButtonCtl.Text := "請先完成倉庫定位"
            ScanButtonCtl.Enabled := false
        } else if Calibrated() {
            ScanButtonCtl.Text := "開始掃描（" keyName "）"
            ScanButtonCtl.Enabled := true
        } else {
            ScanButtonCtl.Text := "請先定位倉庫"
            ScanButtonCtl.Enabled := false
        }
    }
}

CellPos(row, col) {
    global TLx, TLy, BRx, BRy, GridCols, GridRows
    dx := GridCols > 1 ? (BRx - TLx) / (GridCols - 1) : 0
    dy := GridRows > 1 ? (BRy - TLy) / (GridRows - 1) : 0
    return [Round(TLx + col * dx), Round(TLy + row * dy)]
}

IsChartText(text) {
    ; 英文、繁體中文、簡體中文、韓文常見標頭。
    return InStr(text, "Item Class: Chart")
        || InStr(text, "Item Class: Maps")
        || InStr(text, "物品種類: 海圖")
        || InStr(text, "物品種類：海圖")
        || InStr(text, "物品类别: 海图")
        || InStr(text, "物品类别：海图")
        || InStr(text, "아이템 종류: 해도")
}

; ---------------- 單一 F9 狀態操作 ----------------
MainAction(*) {
    global Running, Locating

    ; 掃描中再按同一顆快捷鍵：終止。
    if Running {
        AbortSweep()
        return
    }

    ; 定位模式中：依序記錄左上、右下。
    if Locating {
        CaptureGridPoint()
        return
    }

    ; 第一次使用尚未定位時，直接把這次 F9 當作左上角定位。
    if !Calibrated() {
        BeginLocate(false)
        CaptureGridPoint()
        return
    }

    ; 已定位：開始掃描。
    RunSweep()
}

; ---------------- 倉庫定位 ----------------
BeginLocate(fromButton := true) {
    global Running, Locating, LocateStep

    if Running {
        Flash "掃描中，請先按快捷鍵終止掃描。"
        return
    }

    if !FindPoeWindow() {
        MsgBox "找不到 Path of Exile 視窗。請先開啟遊戲，再進行定位。", "海圖倉庫批次複製"
        return
    }

    Locating := true
    LocateStep := 1
    UpdateGuiStatus()

    if fromButton {
        if ActivatePoe()
            Flash "請把滑鼠移到倉庫左上角第一格，按 " KeyLabel(MainKey) "。", 3500
    }
}

CaptureGridPoint() {
    global TLx, TLy, BRx, BRy, Locating, LocateStep, IniFile, MainKey

    if !IsPoeActive() {
        Flash "請先切回 Path of Exile 視窗再定位。", 2500
        return
    }

    MouseGetPos &x, &y

    if LocateStep = 1 {
        TLx := x
        TLy := y
        BRx := 0
        BRy := 0
        LocateStep := 2

        IniWrite TLx, IniFile, "grid", "TLx"
        IniWrite TLy, IniFile, "grid", "TLy"
        IniWrite 0, IniFile, "grid", "BRx"
        IniWrite 0, IniFile, "grid", "BRy"

        UpdateGuiStatus()
        Flash "左上角已記錄：" TLx ", " TLy
            . "`n請移到右下角最後一格，再按 " KeyLabel(MainKey) "。", 3500
        return
    }

    if x <= TLx || y <= TLy {
        Flash "右下角座標必須在左上角的右方及下方，請重新移動後再按 " KeyLabel(MainKey) "。", 3500
        return
    }

    BRx := x
    BRy := y
    IniWrite BRx, IniFile, "grid", "BRx"
    IniWrite BRy, IniFile, "grid", "BRy"

    Locating := false
    LocateStep := 1
    UpdateGuiStatus()
    Flash "倉庫定位完成：" TLx ", " TLy " → " BRx ", " BRy
        . "`n按 " KeyLabel(MainKey) " 開始掃描。", 4000
}

ResetGrid(*) {
    global TLx, TLy, BRx, BRy, Locating, LocateStep, IniFile, Running

    if Running {
        Flash "掃描中無法重設定位，請先終止掃描。"
        return
    }

    TLx := 0
    TLy := 0
    BRx := 0
    BRy := 0
    Locating := false
    LocateStep := 1

    IniWrite 0, IniFile, "grid", "TLx"
    IniWrite 0, IniFile, "grid", "TLy"
    IniWrite 0, IniFile, "grid", "BRx"
    IniWrite 0, IniFile, "grid", "BRy"

    UpdateGuiStatus()
    Flash "倉庫定位已清除。按「開始定位」，或在 PoE 左上角格直接按 " KeyLabel(MainKey) "。", 3500
}

; ---------------- 掃描與剪貼簿 ----------------
RunSweep(*) {
    global Running, Locating, GridRows, GridCols, HoverDelay, ClipTimeout, MainKey

    if Running
        return

    if Locating {
        Flash "目前正在定位倉庫，請先完成右下角定位。"
        return
    }

    if !Calibrated() {
        BeginLocate(true)
        return
    }

    poeHwnd := ActivatePoe()
    if !poeHwnd {
        MsgBox "找不到或無法切換到 Path of Exile 視窗。", "海圖倉庫批次複製"
        return
    }

    Running := true
    UpdateGuiStatus()

    oldClipboard := ClipboardAll()
    blob := ""
    copied := 0
    skipped := 0
    lostFocus := false

    Loop GridRows {
        if !Running
            break
        row := A_Index - 1

        Loop GridCols {
            if !Running
                break

            ; 使用者切出 PoE 時立即停止，避免 Ctrl+C 送到其他程式。
            if !WinActive("ahk_id " poeHwnd) {
                lostFocus := true
                Running := false
                break
            }

            col := A_Index - 1
            pos := CellPos(row, col)

            A_Clipboard := ""
            MouseMove pos[1], pos[2], 0
            Sleep HoverDelay
            Send "^c"

            if !ClipWait(ClipTimeout) {
                skipped++
                continue
            }

            clip := Trim(A_Clipboard, " `t`r`n")
            if !IsChartText(clip) {
                skipped++
                continue
            }

            blob .= (blob = "" ? "" : "`n") clip
            copied++

            ToolTip "掃描中：第 " (row + 1) " 列／第 " (col + 1) " 欄"
                . "`n已找到 " copied " 張；跳過 " skipped " 格"
                . "`n按 " KeyLabel(MainKey) " 終止", 20, 20
        }
    }

    ToolTip()
    completed := Running
    Running := false

    if copied > 0 {
        A_Clipboard := blob
        ClipWait 1
    } else {
        A_Clipboard := oldClipboard
    }

    UpdateGuiStatus()

    if lostFocus {
        msg := "已停止：偵測到你切離 Path of Exile 視窗。"
    } else if completed {
        msg := "掃描完成。"
    } else {
        msg := "掃描已終止。"
    }

    msg .= "`n找到 " copied " 張海圖，跳過 " skipped " 格空白或非海圖項目。"
    if copied > 0
        msg .= "`n已把找到的內容放進剪貼簿，不會自動貼到網站。"
    else
        msg .= "`n沒有找到海圖，原本的剪貼簿內容已保留。"

    Flash msg, 6500
}

AbortSweep(*) {
    global Running
    if Running {
        Running := false
        UpdateGuiStatus()
        Flash "正在終止掃描；已找到的內容仍會保留到剪貼簿。", 2500
    }
}

StartOrStopFromButton(*) {
    global Running
    if Running {
        AbortSweep()
        return
    }
    RunSweep()
}

; ---------------- 設定視窗 ----------------
ShowSettings(*) {
    global SettingsGui, PoeStatusCtl, LocationStatusCtl, NextActionCtl
    global MainHotkeyCtl, ScanButtonCtl, LocateButtonCtl
    global MainKey, IniFile, DefaultMainKey

    if IsObject(SettingsGui) {
        SettingsGui.Show()
        UpdateGuiStatus()
        return
    }

    ; 不可把區域變數命名為 gui：AHK v2 不分大小寫，會遮蔽內建 Gui()。
    settingsWin := Gui("+AlwaysOnTop +MinimizeBox -MaximizeBox", "海圖倉庫批次複製")
    settingsWin.BackColor := "F7F7F7"
    settingsWin.MarginX := 12
    settingsWin.MarginY := 11

    settingsWin.SetFont("s11 Bold", "Microsoft JhengHei UI")
    settingsWin.Add("Text", "xm w390", "掃描 PoE 海圖倉庫，複製結果到剪貼簿")

    settingsWin.SetFont("s9 Norm", "Microsoft JhengHei UI")
    settingsWin.Add("Text", "xm y+3 w390 c666666", "不會自動開網站或貼上；快捷鍵只在 PoE 視窗內生效，縮小仍可使用。")

    settingsWin.SetFont("s9 Bold", "Microsoft JhengHei UI")
    settingsWin.Add("Text", "xm y+12 w118 h26 +0x200", "快捷鍵（預設 F9）")
    settingsWin.SetFont("s9 Norm", "Microsoft JhengHei UI")
    MainHotkeyCtl := settingsWin.Add("Hotkey", "x+4 yp w86 h26")
    MainHotkeyCtl.Value := MainKey
    saveKeyBtn := settingsWin.Add("Button", "x+6 yp w66 h26", "套用")

    settingsWin.Add("Text", "xm y+10 w390 h1 0x10")

    PoeStatusCtl := settingsWin.Add("Text", "xm y+9 w200 h24 +0x200", "")
    LocationStatusCtl := settingsWin.Add("Text", "xm y+2 w245 h28 +0x200", "")
    LocateButtonCtl := settingsWin.Add("Button", "x+6 yp w104 h28", "開始定位")

    settingsWin.SetFont("s9 Bold", "Microsoft JhengHei UI")
    settingsWin.Add("Text", "xm y+11 w390 cFF0000", "現在要做")
    settingsWin.SetFont("s10 Norm", "Microsoft JhengHei UI")
    NextActionCtl := settingsWin.Add("Text", "xm y+4 w390 h42 c202020", "")

    settingsWin.SetFont("s10 Bold", "Microsoft JhengHei UI")
    ScanButtonCtl := settingsWin.Add("Button", "xm y+7 w390 h34 Default", "開始掃描")

    settingsWin.SetFont("s8 Norm", "Microsoft JhengHei UI")
    settingsWin.Add("Text", "xm y+7 w390 Center c777777", "固定掃描 6×10｜完成後內容會留在剪貼簿")

    websiteLink := settingsWin.Add("Link", "xm y+6 w390 Center",
        '<a href="https://xlox123456789.github.io/3.29_Allframe_voyage_planning/">前往 亡焰咒海</a>')
    websiteLink.OnEvent("Click", (*) => Run("https://xlox123456789.github.io/3.29_Allframe_voyage_planning/"))

    settingsWin.SetFont("s8 Bold", "Microsoft JhengHei UI")
    settingsWin.Add("Text", "xm y+7 w390 Center cFF0000", "疑似踩線，禁止錄影直播，珍惜自己帳號")

    SaveHotkey(*) {
        global MainKey, MainHotkeyCtl, IniFile, DefaultMainKey
        newKey := MainHotkeyCtl.Value
        if newKey = ""
            newKey := MainKey

        oldKey := MainKey
        MainKey := newKey
        try {
            ApplyMainHotkey()
            IniWrite MainKey, IniFile, "keys", "MainAction"
            MainHotkeyCtl.Value := MainKey
            UpdateGuiStatus()
            Flash "快捷鍵已改成 " KeyLabel(MainKey) "。", 2200
        } catch as err {
            MainKey := oldKey != "" ? oldKey : DefaultMainKey
            ApplyMainHotkey()
            MainHotkeyCtl.Value := MainKey
            MsgBox "無法使用這組快捷鍵：" err.Message, "快捷鍵設定失敗"
        }
    }

    saveKeyBtn.OnEvent("Click", SaveHotkey)
    LocateButtonCtl.OnEvent("Click", (*) => BeginLocate(true))
    ScanButtonCtl.OnEvent("Click", StartOrStopFromButton)

    ; 按右上角 X 直接結束程式。
    settingsWin.OnEvent("Close", (*) => ExitApp())

    SettingsGui := settingsWin
    UpdateGuiStatus()
    settingsWin.Show("w414 AutoSize")
}

; ---------------- 系統匣 ----------------
TraySetIcon "shell32.dll", 44
A_TrayMenu.Delete()
A_TrayMenu.Add("開啟設定視窗", ShowSettings)
A_TrayMenu.Add("開始定位", (*) => BeginLocate(true))
A_TrayMenu.Add("開始／終止掃描", StartOrStopFromButton)
A_TrayMenu.Add()
A_TrayMenu.Add("清除定位", ResetGrid)
A_TrayMenu.Add()
A_TrayMenu.Add("結束", (*) => ExitApp())
A_TrayMenu.Default := "開啟設定視窗"
A_IconTip := "海圖倉庫批次複製"

ApplyMainHotkey()
ShowSettings()
SetTimer UpdateGuiStatus, 500

if Calibrated() {
    Flash "海圖倉庫批次複製已啟動。`n按 " KeyLabel(MainKey) " 開始掃描；掃描中再按一次可終止。", 4500
} else {
    Flash "海圖倉庫批次複製已啟動。`n請按設定視窗的「開始定位」，或在 PoE 左上角格按 " KeyLabel(MainKey) "。", 5000
}
