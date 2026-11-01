# tcgcardgame

透過遊戲套件加入不同 TCG 的卡片平台。目前完成第一個可操作版本：匯入套件、切換遊戲、瀏覽卡表與詳情，以及保存本機資料。

這份指南寫給尚未安裝開發工具的 Windows 使用者。指令使用 PowerShell；一般試用不需要寫程式，也不需安裝 Docker、IIS、資料庫或 AI 工具。

> 「星庭紀行」「發條港灣」是各三張卡的原創測試套件，並非正式 hololive 卡表。組牌、正式卡片資料、對局及完整備份仍是後續工作。

## 閱讀路線

| 目的 | 順序 |
| --- | --- |
| 在自己的電腦試用 | 安裝工具 → 取得專案 → 啟動 → 手動試用 |
| 修改程式 | 完成試用 → 開發環境 → DEBUG → 自動測試 |
| 在另一台電腦測試 | 完成試用 → 本機部署測試 → 記錄結果 |

## 目錄

- [目前功能與架構](#目前功能與架構)
- [一、安裝工具](#一安裝工具)
- [二、建立工作目錄與取得專案](#二建立工作目錄與取得專案)
- [三、第一次啟動](#三第一次啟動)
- [四、手動試用與資料保存](#四手動試用與資料保存)
- [五、建立開發與測試環境](#五建立開發與測試環境)
- [六、DEBUG 與除錯](#六debug-與除錯)
- [七、本機部署測試](#七本機部署測試)
- [常見問題](#常見問題)
- [日常操作速查](#日常操作速查)
- [來源與授權](#來源與授權)

## 目前功能與架構

| 功能 | 狀態 |
| --- | --- |
| 繁中介面、清單、卡圖與詳情 | 可使用 |
| 匯入自含卡圖的 JSON 範例套件 | 可使用，單檔最多 30 MB |
| 多款遊戲分開管理與切換 | 可使用 |
| 同一瀏覽器關閉重開後保留資料 | 可使用，資料保存在 IndexedDB |
| Chrome／Edge 自動操作測試 | 可執行 |
| 搜尋、篩選、組牌與合法性檢查 | 尚未提供 |
| 外部牌組格式與原始卡片資料轉換 | 尚未提供 |
| 完整套件驗證、更新與移除 | 尚未提供 |
| 離線重新啟動、完整備份還原 | 尚未提供 |
| 實際對局、登入、雲端同步 | 尚未提供 |

目前由 **Node.js 本機靜態伺服器**提供網頁，**瀏覽器**負責畫面及資料保存，沒有後端資料庫。伺服器需要保持運行，網頁才可重新載入。

## 一、安裝工具

### 1. 開啟 PowerShell

在 Windows 開始選單搜尋「PowerShell」並開啟。以下程式區塊是要貼到 PowerShell 的指令，不要把區塊外的說明文字一起貼入。每個步驟完成後再繼續。

日常啟動與測試使用一般使用者權限；工具安裝程式可能另外要求 Windows 確認。

### 2. 安裝 Node.js 與 npm

Node.js 用來啟動網站，npm 是隨它提供的指令工具。

1. 前往 [Node.js 官方下載頁](https://nodejs.org/en/download)。
2. 選 Windows 的 **LTS** 版本與符合電腦架構的安裝程式。一般電腦使用 x64，ARM 電腦選 ARM64。
3. 本專案以 Node.js 22 以上為基準，初次安裝建議選 Node.js 24 LTS；目前實測為 Node.js 24.21.0。其他版本未逐版驗證。
4. 執行安裝程式，保留 npm 與加入 PATH 的選項，不需額外安裝 Python 或 C++ 編譯工具。
5. 關閉 PowerShell 後重新開啟，使新的 PATH 生效。
6. 檢查安裝：

```powershell
node --version
npm.cmd --version
```

**完成標準：** 兩行都顯示版本號，不是「無法辨識指令」。數字不需要完全一致。安裝方式參考 [npm 官方說明](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/)。

本文件使用 `npm.cmd`，避免 PowerShell 選到 `npm.ps1` 而遇到腳本執行原則問題。

### 3. 安裝 Git

Git 用來下載、更新原始碼，與 GitHub／Gitea 的帳號是不同的東西。

1. 開啟 [Git for Windows 官方下載頁](https://git-scm.com/install/windows)，下載符合架構的安裝程式。
2. 執行安裝。詢問 PATH 時，選擇讓命令列及其他程式能使用 Git 的選項，其餘可先用預設值。
3. 重新開啟 PowerShell，執行：

```powershell
git --version
```

**完成標準：** 顯示 Git 版本。下載與試用不需設定 Git 提交姓名；要提交自己的修改時再設定自己的身分，不要複製 AI 代理人的身分。

### 4. 準備瀏覽器

- 一般試用可先使用已安裝的 Microsoft Edge。
- 下載來源：[Microsoft Edge](https://www.microsoft.com/edge/download)、[Google Chrome](https://www.google.com/chrome/)。
- 執行完整自動測試時，**兩款都要安裝**，因為測試指定使用 `chrome` 與 `msedge`。
- 不必另外執行 Playwright 的瀏覽器下載指令；本專案使用電腦上已安裝的瀏覽器。

### 5. 安裝 VS Code（修改程式才需要）

依 [VS Code 官方 Windows 安裝說明](https://code.visualstudio.com/docs/setup/windows) 安裝 User Installer。需要在終端機使用 `code` 時，保留加入 PATH 選項，安裝後重新開啟 PowerShell。

只想試用卡表的人可以跳過。

## 二、建立工作目錄與取得專案

### 1. 選定工作區

在自己的電腦選一個可以寫入的工作區。以下 `$workspaceRoot` 是你自行輸入的位置，不是開發者目前電腦的固定路徑。可在同一個 PowerShell 視窗整段執行：

```powershell
$workspaceRoot = Read-Host '請輸入你的工作區完整路徑'
New-Item -ItemType Directory -Path $workspaceRoot -Force | Out-Null
Set-Location -LiteralPath $workspaceRoot
New-Item -ItemType Directory -Path Document, Repository, Tools, Temporary -Force | Out-Null
Set-Location -LiteralPath (Join-Path $workspaceRoot 'Repository')
```

```text
你的工作區/
├── Document/                  長期文件與操作紀錄
├── Repository/
│   └── tcgcardgame/            原始碼，後續指令在這裡執行
├── Tools/
│   └── tcgcardgame/            測試工具與快取
└── Temporary/
    └── tcgcardgame/            測試暫存檔
```

請保留 `Repository/tcgcardgame` 布局，工具腳本依它定位工作區的 `Tools` 與 `Temporary`。任意更改層級可能讓工具安裝到非預期位置。

### 2. 取得原始碼

在 Gitea 專案頁複製 HTTP Clone 網址，貼到提示中：

```powershell
$repoUrl = Read-Host '請貼上 tcgcardgame 的 Clone 網址'
git clone $repoUrl tcgcardgame
Set-Location -LiteralPath '.\tcgcardgame'
git status
git branch --show-current
```

**完成標準：** Git 正常顯示倉庫狀態，目前目錄內有 `package.json`、`app` 及 `scripts`。

- 開發環境的倉庫網址是 `http://localhost:3000/(username)/tcgcardgame.git`。
- **另一台電腦的 localhost 指的是那台電腦自己。** 如果 Gitea 位於維護者電腦，請取得你能連線的實際網址；複製 localhost 網址不會自動連上維護者的服務。
- 私有倉庫需要存取權，請使用 Git 的登入提示，不把密碼或 Token 寫進 Clone 網址、指令或文件。
- 一般使用者使用 `main`；尚未合併的功能請依維護者指定分支測試，不必永久追蹤某個開發分支。
- 已經有專案時直接進入既有目錄，不要重複 clone 或覆蓋。

### 3. 確認目前位置

後續指令除非另有說明，都在 `Repository/tcgcardgame` 內執行：

```powershell
Get-Location
Test-Path -LiteralPath '.\package.json'
```

第二行應是 `True`。若是 `False`，先進正確目錄，不要反覆安裝工具。

## 三、第一次啟動

一般試用目前不需要在倉庫執行 `npm install`、`npm ci` 或安裝測試工具。應用程式使用瀏覽器原生功能，伺服器使用 Node.js 內建模組。

```powershell
npm.cmd start
```

成功時會顯示：

```text
tcgcardgame：http://127.0.0.1:5173
```

1. 保持這個 PowerShell 視窗運行。
2. 在 Chrome 或 Edge 開啟 [http://127.0.0.1:5173](http://127.0.0.1:5173)。
3. 看到「卡片圖書館」與範例下載按鈕，即啟動成功。

伺服器只監聽 `127.0.0.1`，供本機使用。請透過 HTTP 網址操作，不要直接雙擊 `app/index.html` 或使用 `file://`。

### 停止與下次啟動

- 回到伺服器的 PowerShell 按 **Ctrl+C**。若 npm 詢問是否終止批次工作，依提示確認。
- 下次在同一專案目錄執行 `npm.cmd start`，再開啟同一網址。
- 停伺服器不會主動清除已保存卡表，但重新載入網頁仍需伺服器運行。
- 目前不是 Docker、IIS 或 Windows 自動啟動服務。

### 連接埠被占用

`EADDRINUSE` 通常表示已有程式使用同一連接埠。先看是否已有自己先前啟動的 tcgcardgame；若需要改用 5174：

```powershell
$env:PORT = '5174'
npm.cmd start
```

改開 [http://127.0.0.1:5174](http://127.0.0.1:5174)。停止後可在同一視窗移除設定：

```powershell
Remove-Item Env:PORT
```

**不同連接埠是不同的網站儲存空間。** 5174 不會自動顯示 5173 匯入的卡表，這不表示原資料被刪除。

## 四、手動試用與資料保存

1. 在首頁下載「星庭紀行」JSON，再按「匯入遊戲套件」選取下載檔。
2. 確認出現三張卡片，點選「晨光旅人」查看名稱、卡號、圖片與說明。
3. 從卡表下方下載「發條港灣」，再次匯入。
4. 使用「目前遊戲」切換，確認兩款遊戲的卡片不混在一起。
5. 關閉頁面，再使用同一瀏覽器、同一網址開啟，確認套件仍在。
6. 重複匯入同一檔案，應提示已安裝，不新增第二份遊戲。

**完成標準：** 兩個遊戲各有三張卡，切換與詳情正常，關閉重開保留資料。

### 保存範圍

- 資料位於目前瀏覽器、設定檔及網站來源的 IndexedDB，不在伺服器資料庫。
- Chrome／Edge、一般／無痕視窗不共用資料。
- `localhost`／`127.0.0.1`、HTTP／HTTPS、不同連接埠都可能是不同來源，請固定使用同一網址。
- 無痕／InPrivate 通常在關閉所有無痕視窗後清除資料。驗證長期保存請使用一般視窗。
- 清除網站資料會移除卡表，目前沒有完整備份功能，請保留來源套件 JSON。
- 目前只接受平台初始範例格式。外部工具的原始卡片資料可能缺少套件資訊及卡圖，需要先轉換；不是檔名為 JSON 就一定相容。

## 五、建立開發與測試環境

只想試用的人可以跳過。要改程式或自動驗證時，再執行本節。

### 1. 安裝測試工具

確認 Chrome 與 Edge 都已安裝，在專案目錄執行：

```powershell
npm.cmd run setup:tools
```

需要網路下載固定版本的 Playwright 與 TypeScript，產物放於工作區 `Tools/tcgcardgame`，不放進原始碼倉庫。預設工具腳本支援 Windows PowerShell 5.1；Windows 必須能執行 `powershell`。

**完成標準：** 指令成功結束並顯示工具已安裝。npm 的新版通知不是錯誤，不需要為本次測試立即全域升級 npm。

### 2. 執行檢查與測試

```powershell
npm.cmd run check
npm.cmd test
```

- `check`：檢查應用程式 JavaScript 型別，不建置產品，也不啟動瀏覽器。成功時沒有型別錯誤清單。
- `test`：以公開介面操作 Chrome 與 Edge，不直接查內部資料庫。

| 瀏覽器 | 測試行為 |
| --- | --- |
| Chrome | 兩遊戲匯入、切換、卡圖與詳情、實際關閉瀏覽器再重開保存 |
| Chrome | 無效 JSON 保留原卡表、重複匯入不新增 |
| Edge | 兩遊戲匯入、切換、卡圖與詳情、實際關閉瀏覽器再重開保存 |
| Edge | 無效 JSON 保留原卡表、重複匯入不新增 |

測試自行啟動隨機連接埠的伺服器，使用 `Temporary/tcgcardgame/browser-tests` 內新建的隔離設定檔並於結束清理，不使用你日常瀏覽器的資料；不必先啟動 5173 預覽。

**完成標準：** 摘要顯示 `tests 4`、`pass 4`、`fail 0`。缺少瀏覽器、工具安裝失敗、失敗或未執行的測試都不能算通過。

### 3. 日常修改流程

1. 在專案目錄執行 `code .`，或在 VS Code「檔案 → 開啟資料夾」選擇專案。
2. 開啟終端機，執行 `npm.cmd start`。
3. 修改 `app` 的 HTML、CSS 或 JavaScript，手動重新整理瀏覽器查看結果。
4. 修改伺服器 `scripts/serve.mjs` 後要 Ctrl+C 停止再啟動。
5. 執行 `check` 與 `test`，依結果修正。

目前沒有熱更新、自動重啟或 `npm run dev`、`npm run debug`、`npm run build` 指令。

## 六、DEBUG 與除錯

DEBUG 是觀察程式執行、找出問題的過程。目前沒有獨立的測試資料庫、登入帳號或正式／測試環境切換開關。

### 方法 A：瀏覽器開發者工具

適用「匯入沒反應」「畫面出錯」「卡圖不見」。

1. 啟動網站，在網頁按 **F12** 或 **Ctrl+Shift+I**。
2. **Console／主控台**：保留紅色錯誤及操作步驟。
3. **Network／網路**：重新整理，確認首頁、`main.js`、`library.js`、`styles.css` 沒有 404 或連線失敗。
4. **Sources／來源**：找到網站的 `main.js`，在匯入處理的 `checkPackage(candidate)` 行號點一下設中斷點。
5. 再次匯入範例，停下時查看 `candidate`，用 F10 逐行執行、F8 繼續。
6. 結束後移除中斷點，避免下次誤以為網站卡住。

卡圖內含於 JSON，不一定有獨立 HTTP 圖片請求。網頁錯誤提示也請一併保留。

### 方法 B：VS Code 除錯畫面

VS Code 內建 Chrome／Edge 除錯功能，參考 [官方瀏覽器除錯文件](https://code.visualstudio.com/docs/nodejs/browser-debugging)。

1. 在 VS Code 開啟專案根目錄，終端機執行 `npm.cmd start`。
2. 建立 `.vscode/launch.json`。若檔案已存在，把以下項目合併到原 `configurations`，不要覆蓋既有設定。

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "tcgcardgame：Edge 畫面除錯",
      "type": "msedge",
      "request": "launch",
      "url": "http://127.0.0.1:5173",
      "webRoot": "${workspaceFolder}/app"
    }
  ]
}
```

3. 在 `app/main.js` 設中斷點，開啟「執行與偵錯」，選上述設定按 F5。
4. 在開出的 Edge 匯入範例，觀察變數與呼叫堆疊。
5. 停止偵錯後，終端機的伺服器仍要另外 Ctrl+C 停止。

偵錯可能使用獨立瀏覽器設定檔，看不到日常卡表是正常的。換 PORT 時同步修改 `url`。此為可選設定範例，專案未預建這個檔案，本次也未在 VS Code 互動重演此流程。

### 方法 C：Node.js 伺服器除錯

適用「啟動失敗」「檔案回傳不正確」。先停止原伺服器，再執行：

```powershell
node --inspect-brk scripts/serve.mjs
```

程式會先停住，網站還不能連線是正常的。Edge 開啟 `edge://inspect`，或 Chrome 開啟 `chrome://inspect`，找到 Node 工作階段並 inspect，繼續執行後再開網站。結束時 Ctrl+C，之後用一般 `npm.cmd start` 啟動即可。

伺服器除錯與畫面除錯是兩件事：前者看 Node 靜態伺服器，後者看匯入與卡表程式。一般試用不用開 inspector。本次只核對 inspector 啟動並暫停，不宣稱完整操作過每個開發者工具畫面。

## 七、本機部署測試

此處指把指定版本帶到另一個乾淨工作區或另一台 Windows 電腦，確認能獨立啟動；不是正式對外發佈。專案目前沒有 Dockerfile、IIS、Windows 服務、HTTPS 或反向代理設定。

### 1. 準備目標電腦

- 依本文安裝 Node.js、Git 及瀏覽器，建立四目錄布局。
- 從目標電腦能連線的 Clone 網址取得專案，不能直接沿用別台電腦的 localhost。
- 使用維護者指定版本，記錄 `git log -1 --oneline` 的結果。

### 2. 啟動指定版本

在目標電腦的 `Repository/tcgcardgame` 執行：

```powershell
node --version
npm.cmd --version
git log -1 --oneline
npm.cmd start
```

用目標電腦自己的瀏覽器開啟 `http://127.0.0.1:5173`。目前無編譯步驟，也不產生 `dist`，直接提供 `app` 內靜態檔案。

### 3. 驗收清單

- 首頁及兩個範例下載正常。
- 可匯入兩款遊戲並各自切換。
- 列表及詳情中的圖片與文字正常。
- 固定同一瀏覽器、同一網址，關閉重開後保留資料。
- 無效 JSON 顯示錯誤但保留原卡表。
- 如需自動驗證，另執行 `setup:tools`、`check` 及 `test`。

### 4. 記錄結果

```text
測試提交編號：
Windows 與瀏覽器版本：
網址／連接埠：
執行指令與操作步驟：
預期結果：
實際結果：
已通過項目：
失敗／未執行項目：
錯誤文字或截圖：
```

只有實際執行成功才能寫通過。未測的離線、未安裝的瀏覽器及未部署的 IIS／Docker 均須明示。

### 對外部署的邊界

- 伺服器只綁定 loopback，其他電腦無法用這台電腦的 IP:5173 直接連入，不需要為本機試用開放防火牆。
- 搬到 IIS、Docker 或其他靜態伺服器仍需另行設定 MIME、路徑與網址；本次沒有實作或驗證這些部署方式。
- 更換部署網址時，舊瀏覽器資料不會自動搬移，目前也沒有完整備份還原；請保留來源套件。

## 常見問題

| 問題 | 處理方式 |
| --- | --- |
| 無法辨識 node／npm.cmd／git | 安裝後重新開啟 PowerShell，核對 PATH，先執行版本檢查。 |
| npm.ps1 cannot be loaded | 改用 `npm.cmd`，不必永久放寬全機腳本原則。 |
| 找不到 package.json／ENOENT | 進入 `Repository/tcgcardgame`，確認 `Test-Path .\package.json` 是 True。 |
| Clone 連不上 localhost:3000 | Gitea 可能不在本機或未啟動，取得實際可用網址。 |
| 網站無法連線 | 確認啟動終端機仍運行，網址與 PORT 相符。 |
| EADDRINUSE | 停止自己先前的預覽，或按本文改 PORT。 |
| 修改沒更新 | 手動重新整理；改伺服器檔案要停掉重開。 |
| 無痕關閉後卡表消失 | 無痕資料是暫時的，請用一般視窗；無法從已清除設定檔恢復。 |
| 換瀏覽器／網址後卡表不見 | 回到原設定檔及原網址，或重匯來源套件。 |
| 外部 JSON 顯示格式錯誤 | 尚不支援直接匯入外部原始資料，先用首頁下載的範例。 |
| 缺少 TypeScript／Playwright | 核對四目錄布局並重新執行 `npm.cmd run setup:tools`。 |
| 測試找不到 Chrome／Edge | 安裝缺少的瀏覽器，兩者都必須存在。 |
| 受管環境阻擋本機測試連線 | 向管理者取得所需權限，不停用整體保護。 |
| 儲存失敗／無法開啟本機空間 | 檢查空間、網站儲存權限及政策，保留來源檔，不先清除重要資料。 |

## 日常操作速查

在專案根目錄執行，不必每次全部執行：

| 操作 | 指令 |
| --- | --- |
| 啟動 | `npm.cmd start` |
| 停止 | 在原終端機 Ctrl+C |
| 首次安裝測試工具 | `npm.cmd run setup:tools` |
| 型別檢查 | `npm.cmd run check` |
| Chrome／Edge 自動測試 | `npm.cmd test` |
| 重現產生兩份範例 | `node scripts/make-examples.mjs` |
| 查看版本 | `git log -1 --oneline` |
| 查看未提交修改 | `git status` |

更新前先停止伺服器並檢查 `git status`。若有自己的修改，先保留並與維護者協調，不要 reset 或強制覆蓋。工作區乾淨且確認目標版本後，可用 `git pull --ff-only` 更新目前分支，再重新啟動。ZIP 下載沒有 Git 更新歷史，建議在另一個新目錄取得新版並保留原資料。

`package.json` 暫時保留原技能包名稱、版本及 changeset 指令，所以 npm 可能顯示 `mattpocock-skills@1.3.2`。這不代表啟動了另一款產品；插件中繼資料尚未獨立整理。原插件版本檢查不等於遊戲測試，原 `.github` 工作流程也不代表 Gitea 產品部署已設定完成。

## 文件驗證範圍

- 產品既有基準：Node.js 24.21.0、Windows、Chrome／Edge 四項公開介面測試與型別檢查。
- 本輪已在獨立乾淨副本驗證工具安裝、型別檢查、Chrome／Edge 測試 4/4、範例重現產生、PORT 5176 預覽與靜態資源、Node inspector 啟動暫停；副本及其工具與暫存檔已清理。
- 沒有在現用電腦解除安裝再重裝 Node.js、Git、瀏覽器或 VS Code。安裝步驟依官方文件整理，不宣稱全新 Windows 已完整重演。
- VS Code F5 設定是官方方法對照範例，未互動操作；其他作業系統及 IIS／Docker 未驗證。

## 來源與授權

隨附的 Matt Pocock 工程技能包用於需求訪談、規格、拆分工作、TDD 與審查，一般使用者不需要安裝技能才能試用網站。

- 原始專案：[mattpocock/skills](https://github.com/mattpocock/skills)。
- 原技能包完整介紹：[保存的 Matt Pocock 說明](docs/matt-pocock/README.md)。
- 原版權：Copyright (c) 2026 Matt Pocock。
- 完整 MIT 文字保留於 [LICENSE](LICENSE)。
- MIT 允許修改與散布，須保留相應版權與授權文字，參考 [MIT 原文](https://opensource.org/license/mit)。不代表取得其他來源卡圖或卡片資料的權利，也不代表原作者為遊戲背書。

<details>
<summary>開發者用：隨附技能索引（一般使用者可略過）</summary>

### User-invoked

- [ask-matt](skills/engineering/ask-matt/SKILL.md)
- [grill-with-docs](skills/engineering/grill-with-docs/SKILL.md)
- [triage](skills/engineering/triage/SKILL.md)
- [improve-codebase-architecture](skills/engineering/improve-codebase-architecture/SKILL.md)
- [setup-matt-pocock-skills](skills/engineering/setup-matt-pocock-skills/SKILL.md)
- [to-spec](skills/engineering/to-spec/SKILL.md)
- [to-tickets](skills/engineering/to-tickets/SKILL.md)
- [implement](skills/engineering/implement/SKILL.md)
- [implement-spec](skills/engineering/implement-spec/SKILL.md)
- [wayfinder](skills/engineering/wayfinder/SKILL.md)
- [retro](skills/engineering/retro/SKILL.md)
- [grill-me](skills/productivity/grill-me/SKILL.md)
- [handoff](skills/productivity/handoff/SKILL.md)
- [teach](skills/productivity/teach/SKILL.md)
- [to-questionnaire](skills/productivity/to-questionnaire/SKILL.md)
- [wait-what](skills/productivity/wait-what/SKILL.md)

### Model-invoked

- [prototype](skills/engineering/prototype/SKILL.md)
- [diagnosing-bugs](skills/engineering/diagnosing-bugs/SKILL.md)
- [research](skills/engineering/research/SKILL.md)
- [tdd](skills/engineering/tdd/SKILL.md)
- [domain-modeling](skills/engineering/domain-modeling/SKILL.md)
- [codebase-design](skills/engineering/codebase-design/SKILL.md)
- [code-review](skills/engineering/code-review/SKILL.md)
- [pr](skills/engineering/pr/SKILL.md)
- [wizard](skills/engineering/wizard/SKILL.md)
- [grilling](skills/productivity/grilling/SKILL.md)
- [writing-for-agents](skills/productivity/writing-for-agents/SKILL.md)

</details>
