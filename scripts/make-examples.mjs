import { mkdir, writeFile } from 'node:fs/promises';

const games = [
  { id: 'sample-astral-garden', name: '星庭紀行', file: 'astral-garden', color: '#567c68', accent: '#f4cf7c', cards: [
    ['AG-001', '晨光旅人', '角色', '巡遊者', '沿著晨光啟程，讓每一場相遇成為新的風景。'],
    ['AG-002', '月下花園', '場地', '星庭', '月光落下的地方，沉睡的花朵悄悄甦醒。'],
    ['AG-003', '流星手札', '道具', '手札', '記下尚未抵達的遠方，也記下回家的方向。'],
  ] },
  { id: 'sample-clockwork-harbor', name: '發條港灣', file: 'clockwork-harbor', color: '#526d86', accent: '#e1a179', cards: [
    ['CH-001', '發條信使', '船員', '信使', '穿過港口的霧氣，把遠方的消息送到你手中。'],
    ['CH-002', '暮色燈塔', '建築', '燈塔', '最後一盞燈，永遠為晚歸的人亮著。'],
    ['CH-003', '潮汐羅盤', '裝備', '航具', '指針不指向北方，而是指向你最想抵達的地方。'],
  ] },
];
const output = new URL('../app/examples/', import.meta.url);
await mkdir(output, { recursive: true });
for (const game of games) {
  const cards = game.cards.map(([id, name, type, motif, text], index) => {
    const art = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 660"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="${game.color}"/><stop offset="1" stop-color="#183e3d"/></linearGradient><radialGradient id="glow"><stop stop-color="${game.accent}" stop-opacity=".5"/><stop offset="1" stop-color="${game.accent}" stop-opacity="0"/></radialGradient></defs><rect width="480" height="660" rx="24" fill="#f5f0e4"/><rect x="14" y="14" width="452" height="632" rx="16" fill="url(#sky)"/><rect x="30" y="30" width="420" height="600" rx="8" fill="none" stroke="${game.accent}" stroke-opacity=".6"/><circle cx="290" cy="215" r="170" fill="url(#glow)"/><circle cx="${280 - index * 35}" cy="${180 + index * 25}" r="${65 - index * 8}" fill="${game.accent}"/><path d="M30 390 Q130 280 250 410 T450 360 V630 H30Z" fill="#8ca492"/><path d="M30 470 Q180 350 300 470 T450 420 V630 H30Z" fill="#3e6a60"/><path d="M30 540 Q160 440 300 520 T450 490 V630 H30Z" fill="#214b48"/><path d="M230 505 L245 320 L260 505 Z M204 372 L245 292 L283 372 Z" fill="#efe3b8"/><path d="M80 140L84 150L94 154L84 158L80 168L76 158L66 154L76 150Z M365 300L369 310L379 314L369 318L365 328L361 318L351 314L361 310Z" fill="#f3e3ac"/><text x="50" y="78" fill="#f8efda" font-family="sans-serif" font-size="17" letter-spacing="3">${id}</text><text x="240" y="572" fill="#f8efda" text-anchor="middle" font-family="sans-serif" font-size="24">${motif}</text><text x="240" y="604" fill="#d7d9c9" text-anchor="middle" font-family="sans-serif" font-size="11" letter-spacing="3">ORIGINAL DEMO · ${index + 1}</text></svg>`;
    return { id, name, type, text, attributes: { '系列': game.name, '版本': '原創範例' }, image: 'data:image/svg+xml;base64,' + Buffer.from(art).toString('base64') };
  });
  await writeFile(new URL(`${game.file}.json`, output), JSON.stringify({ schemaVersion: 1, id: game.id, name: game.name, version: '0.1.0', description: '原創介面測試範例，非正式 hololive 卡表。', cards }, null, 2) + '\n');
}
console.log('已產生兩個自含卡圖的原創範例套件。');
