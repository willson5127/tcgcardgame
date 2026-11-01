/** @typedef {{id: string, name: string, type: string, text: string, image: string, attributes: Record<string, string>}} Card */
/** @typedef {{schemaVersion: number, id: string, name: string, version: string, description: string, cards: Card[]}} GamePackage */

const databaseName = 'tcgcardgame-library';

/** @returns {Promise<IDBDatabase>} */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => { request.result.createObjectStore('packages', { keyPath: 'id' }); request.result.createObjectStore('settings'); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('無法開啟本機儲存空間。請確認瀏覽器允許儲存網站資料。'));
  });
}

/** @returns {Promise<{packages: GamePackage[], selectedId: string}>} */
export async function loadLibrary() {
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(['packages', 'settings'], 'readonly');
      const packages = transaction.objectStore('packages').getAll();
      const selected = transaction.objectStore('settings').get('selectedId');
      transaction.oncomplete = () => resolve({ packages: packages.result, selectedId: selected.result ?? '' });
      transaction.onabort = () => reject(new Error('無法讀取本機卡表，尚未更動已儲存資料。'));
    });
  } finally { db.close(); }
}

/** @param {GamePackage | null} game @param {string} selectedId */
export async function saveLibrary(game, selectedId) {
  const db = await openDatabase();
  try {
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(['packages', 'settings'], 'readwrite');
      if (game) transaction.objectStore('packages').put(game);
      transaction.objectStore('settings').put(selectedId, 'selectedId');
      transaction.oncomplete = () => resolve(undefined);
      transaction.onabort = () => reject(new Error('儲存失敗。請確認本機空間足夠後重試，既有資料不會被部分覆寫。'));
    });
  } finally { db.close(); }
}

/** @param {unknown} value @returns {asserts value is GamePackage} */
export function checkPackage(value) {
  if (!value || typeof value !== 'object') throw new Error('請選擇有效的遊戲套件 JSON。');
  const game = /** @type {Record<string, unknown>} */ (value);
  if (game.schemaVersion !== 1 || !isText(game.id) || !isText(game.name) || !isText(game.version) || !isText(game.description) || !Array.isArray(game.cards) || !game.cards.length) {
    throw new Error('套件需要 schemaVersion: 1、id、name、version、description 與非空的 cards。');
  }
  const ids = new Set();
  for (const [index, card] of game.cards.entries()) {
    if (!card || !isText(card.id) || !isText(card.name) || !isText(card.type) || !isText(card.text) || !isText(card.image)) throw new Error(`第 ${index + 1} 張卡片缺少必要內容。`);
    if (ids.has(card.id)) throw new Error(`卡片識別碼重複：${card.id}`);
    ids.add(card.id);
    if (!/^data:image\/(png|jpeg|webp|gif|svg\+xml);base64,[A-Za-z0-9+/=\s]+$/.test(card.image)) throw new Error(`卡片 ${card.id} 需要套件內含的 base64 卡圖。`);
    if (!card.attributes || typeof card.attributes !== 'object' || Array.isArray(card.attributes) || !Object.values(card.attributes).every(isText)) throw new Error(`卡片 ${card.id} 的 attributes 必須為文字屬性。`);
  }
}

/** @param {unknown} value @returns {value is string} */
function isText(value) { return typeof value === 'string' && value.trim().length > 0; }
