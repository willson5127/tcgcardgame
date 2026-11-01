import { checkPackage, loadLibrary, saveLibrary } from './library.js';

/** @type {import('./library.js').GamePackage[]} */
let packages = [];
let selectedId = '';
let busy = false;
const fileInput = /** @type {HTMLInputElement} */ (document.querySelector('#package-file'));
const gameSelect = /** @type {HTMLSelectElement} */ (document.querySelector('#game-select'));
const grid = /** @type {HTMLElement} */ (document.querySelector('#card-grid'));
const detail = /** @type {HTMLElement} */ (document.querySelector('#card-detail'));
const notice = /** @type {HTMLElement} */ (document.querySelector('#notice'));

/** @param {string} tag @param {string} text @param {string} [className] */
function element(tag, text, className = '') {
  const node = document.createElement(tag);
  node.textContent = text;
  node.className = className;
  return node;
}

/** @param {string} message @param {boolean} [error] */
function tell(message, error = false) {
  notice.textContent = message;
  notice.hidden = false;
  notice.classList.toggle('error', error);
}

/** @param {import('./library.js').Card} card */
function image(card) {
  const img = document.createElement('img');
  img.src = card.image;
  img.alt = card.name;
  img.addEventListener('error', () => { tell(`卡片「${card.name}」的圖片無法顯示，請檢查來源套件。`, true); }, { once: true });
  return img;
}

/** @param {import('./library.js').Card} card */
function showDetail(card) {
  detail.replaceChildren(element('p', 'CARD DETAILS', 'eyebrow'), image(card), element('p', card.id, 'detail-id'), element('h2', card.name), element('span', card.type, 'type-badge'), element('p', card.text, 'card-text'));
  const attributes = document.createElement('dl');
  for (const [key, value] of Object.entries(card.attributes)) attributes.append(element('dt', key), element('dd', value));
  detail.append(attributes);
  for (const button of grid.querySelectorAll('button')) button.setAttribute('aria-pressed', String(button.dataset.id === card.id));
}

function render() {
  const game = packages.find(item => item.id === selectedId);
  gameSelect.replaceChildren();
  if (!packages.length) gameSelect.add(new Option('尚未匯入套件', ''));
  for (const item of packages) gameSelect.add(new Option(item.name, item.id));
  gameSelect.value = selectedId;
  gameSelect.disabled = !packages.length || busy;
  document.querySelector('#package-count')?.replaceChildren(String(packages.length).padStart(2, '0'));
  document.querySelector('#card-count')?.replaceChildren(String(game?.cards.length ?? 0).padStart(2, '0'));
  /** @type {HTMLElement} */ (document.querySelector('#onboarding')).hidden = !!game;
  /** @type {HTMLElement} */ (document.querySelector('#collection')).hidden = !game;
  grid.replaceChildren();
  detail.replaceChildren(element('p', '選一張卡片，開始探索。'));
  if (!game) return;
  document.querySelector('#collection-title')?.replaceChildren(game.name);
  document.querySelector('#package-description')?.replaceChildren(`${game.description} · v${game.version}`);
  for (const card of game.cards) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'card-tile';
    button.dataset.id = card.id;
    button.setAttribute('aria-pressed', 'false');
    button.append(image(card), element('span', card.id, 'card-code'), element('strong', card.name), element('span', card.type, 'card-kind'));
    button.addEventListener('click', () => showDetail(card));
    grid.append(button);
  }
  showDetail(game.cards[0]);
}

/** @param {boolean} value */
function setBusy(value) {
  busy = value;
  fileInput.disabled = value;
  gameSelect.disabled = value || !packages.length;
  document.querySelector('.import-button')?.classList.toggle('busy', value);
}

fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  if (!file || busy) return;
  setBusy(true);
  try {
    if (file.size > 30 * 1024 * 1024) throw new Error('此初始版本支援 30 MB 以內的 JSON 範例套件。');
    let candidate;
    try { candidate = JSON.parse(await file.text()); } catch { throw new Error('無法讀取 JSON，請確認選擇的是遊戲套件檔案。'); }
    checkPackage(candidate);
    const existing = packages.find(game => game.id === candidate.id);
    if (existing && JSON.stringify(existing) !== JSON.stringify(candidate)) throw new Error('此遊戲已存在不同內容；套件更新功能尚未開放，原套件已保留。');
    await saveLibrary(candidate, candidate.id);
    if (!existing) packages.push(candidate);
    selectedId = candidate.id;
    render();
    tell(existing ? `「${candidate.name}」已安裝，已切換至此卡表。` : `已匯入「${candidate.name}」的 ${candidate.cards.length} 張卡片，並保存在此瀏覽器。`);
  } catch (error) { tell(error instanceof Error ? error.message : '匯入失敗，請重試。', true); }
  finally { fileInput.value = ''; setBusy(false); }
});

gameSelect.addEventListener('change', async () => {
  const nextId = gameSelect.value;
  setBusy(true);
  try {
    await saveLibrary(null, nextId);
    selectedId = nextId;
    render();
    notice.hidden = true;
  } catch (error) { gameSelect.value = selectedId; tell(error instanceof Error ? error.message : '切換失敗，請重試。', true); }
  finally { setBusy(false); }
});

setBusy(true);
try {
  const saved = await loadLibrary();
  for (const game of saved.packages) checkPackage(game);
  packages = saved.packages;
  selectedId = packages.some(game => game.id === saved.selectedId) ? saved.selectedId : packages[0]?.id ?? '';
  render();
} catch (error) { tell(error instanceof Error ? error.message : '讀取失敗，請重新開啟。', true); }
finally { setBusy(false); }
