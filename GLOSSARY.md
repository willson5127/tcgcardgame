# tcgcardgame

可擴充的多 TCG 平台，提供卡表查詢、組牌、卡片收藏管理與實際對局。

## 遊戲領域用語

**TCG 遊戲**：平台中一套可加入或移除的卡牌遊戲，具有自己的卡片、卡片規則、牌局規則與牌局布局。

**卡表**：某個 TCG 遊戲可供查詢及組牌的卡片目錄。

**牌組**：玩家為某個 TCG 遊戲選定的卡片及數量組合。

**卡片收藏**：玩家管理的個人卡片集合；與遊戲完整卡表區分。

**對局**：玩家依某個 TCG 遊戲的規則進行的一次遊玩。

**遊戲套件**：玩家可匯入或移除的一組 TCG 遊戲內容，可包含卡圖、卡片資料、卡片規則、牌局規則、布局及規則程式。

**通用牌組格式**：tcgcardgame 用來表達各 TCG 牌組的共用交換格式。

**相容格式**：外部工具使用的牌組交換格式，可與平台通用牌組格式轉換。

**卡片**：由遊戲規則識別的卡牌概念，可有多個卡片版本；組牌數量限制的歸組方式由各遊戲規則決定。

**卡片版本**：某張卡片的特定插畫及語言版本，供玩家在牌組中選用。

**待解析卡片**：匯入牌組中尚無法對應目前套件資料的卡片項目，保留原始識別碼及數量。

**牌組分區**：遊戲規則定義的牌組組成區別，例如主牌組或額外牌組，各區可有不同的卡片及張數限制。

## 規範包用語（原有內容）

以下用語屬於隨專案提供的 Matt Pocock 技能包。

A collection of agent skills (slash commands and behaviors) loaded by Claude Code. Skills are organized into buckets and consumed by per-repo configuration emitted by `/setup-matt-pocock-skills`.

## Language

**Issue tracker**:
The tool that hosts a repo's issues: GitHub Issues, Linear, a local `.scratch/` markdown convention, or similar. Skills like `to-tickets`, `to-spec`, and `triage` read from and write to it.
_Avoid_: backlog manager, backlog backend, issue host

**Issue**:
A single tracked unit of work inside an **Issue tracker**: a bug, task, spec, or slice produced by `to-tickets`.
_Avoid_: ticket (use only when quoting external systems that call them tickets, or for a **Decision ticket**, see below)

**Decision ticket**:
A `wayfinder` unit: a child **Issue** of a `wayfinder:map` holding a *question* whose resolution is a decision, not a slice of a build to execute. The **decision** qualifier is what keeps it distinct from an implementation ticket; `wayfinder` introduces the term, then uses "ticket".

**Triage role**:
A canonical state-machine label applied to an **Issue** during triage (e.g. `needs-triage`, `ready-for-afk`). Each role maps to a real label string in the **Issue tracker** via `docs/agents/triage-labels.md`.

## Relationships

- An **Issue tracker** holds many **Issues**
- An **Issue** carries one **Triage role** at a time
- A **Decision ticket** is an **Issue** (a child of a `wayfinder:map`)

## Flagged ambiguities

- "backlog" was previously used to mean both the *tool* hosting issues and the *body of work* inside it. Resolved: the tool is the **Issue tracker**; "backlog" is no longer used as a domain term.
- "backlog backend" / "backlog manager". Resolved: collapsed into **Issue tracker**.
