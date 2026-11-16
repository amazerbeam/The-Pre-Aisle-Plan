// Node smoke for the Pip room mockups (pip-room-dragon.html, pip-room-robot.html).
// Usage: node mockup-smoke.mjs <path-to-room-html> [--expect-complete]
//
// 1. Runs the five pure script blocks (room-geometry, room-iso, room-creature, room-pack, room-engine) in one vm context.
// 2. Geometry check: every `// source: <file>:<line>` comment in the geometry block cites a live line; every number on the
//    code since the previous source comment must appear on the cited line(s) (file path is relative to foodbytes-app/client/src/).
// 3. Renders every style, station level, decor id, effect state, creature form and thumbnail; no output may hold NaN / undefined.
// 4. Counts the red "missing" boxes. With --expect-complete any missing art, or any unnamed id or station level, is a failure.
// 5. Fit: art that is drawn must sit inside its live footprint / spot volume (tolerance in the page's FIT_TOLERANCE).
// 6. Ambience: every pack.ambience entry must have its room-fx class in the art it targets.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const [, , htmlArg, ...flags] = process.argv;
if (!htmlArg) {
  console.error('usage: node mockup-smoke.mjs <path-to-room-html> [--expect-complete]');
  process.exit(2);
}
const expectComplete = flags.includes('--expect-complete');
const htmlPath = path.resolve(htmlArg);
const html = fs.readFileSync(htmlPath, 'utf8');
const liveRoot = path.resolve(path.dirname(htmlPath), '..', 'client', 'src');
const errors = [];
const fail = msg => errors.push(msg);

const blockIds = ['room-geometry', 'room-iso', 'room-creature', 'room-pack', 'room-engine'];
const blocks = {};
for (const id of blockIds) {
  const m = html.match(new RegExp(`<script id="${id}">([\\s\\S]*?)</script>`));
  if (!m) { console.error(`missing <script id="${id}">`); process.exit(1); }
  blocks[id] = m[1];
}

/* ---------- 2. geometry vs the live code ---------- */
const NUMBER = /(?<![A-Za-z_\d.])-?\d+(?:\.\d+)?/g;
const numbersOf = text => new Set((text.match(NUMBER) || []).map(Number));
// Code of one line with // and /* */ comments removed (block comments may span lines).
let inBlock = false;
function stripComment(line) {
  let out = line;
  if (inBlock) {
    const end = out.indexOf('*/');
    if (end < 0) return '';
    inBlock = false;
    out = out.slice(end + 2);
  }
  out = out.replace(/\/\*.*?\*\//g, '');
  const open = out.indexOf('/*');
  if (open >= 0) { inBlock = true; out = out.slice(0, open); }
  return out.replace(/\/\/.*$/, '');
}
const fileCache = new Map();
const liveLines = file => {
  if (!fileCache.has(file)) fileCache.set(file, fs.readFileSync(path.join(liveRoot, file), 'utf8').split(/\r?\n/));
  return fileCache.get(file);
};

let checked = 0;
let pending = new Set();
const geometryLines = blocks['room-geometry'].split('\n');
geometryLines.forEach((line, i) => {
  const cite = line.match(/\/\/\s*source:\s*(\S+?):(\d+)(?:-(\d+))?\s*$/);
  const code = stripComment(line);
  for (const n of numbersOf(code)) pending.add(n);
  if (!cite) return;
  const [, file, from, to] = cite;
  const lines = liveLines(file).slice(Number(from) - 1, Number(to ?? from));
  const live = numbersOf(lines.join('\n'));
  for (const n of pending) {
    checked++;
    if (!live.has(n)) fail(`geometry: ${n} (room-geometry line ${i + 1}) is not on ${file}:${from}${to ? '-' + to : ''}`);
  }
  pending = new Set();
});
if (pending.size) fail(`geometry: numbers after the last source comment: ${[...pending].join(', ')}`);

/* ---------- 1. load ---------- */
const context = vm.createContext({});
try {
  vm.runInContext(blockIds.map(id => blocks[id]).join('\n;\n'), context, { filename: 'room-blocks.js' });
} catch (e) {
  console.error('room blocks failed to run:', e);
  process.exit(1);
}
const room = vm.runInContext(`({
  GEOMETRY, IDS, SPOT_OF, DECOR_SPOTS, ROOM_NAME, HERB_REFERENCE, defaultState, renderRoomSVG, thumbSVG, effectThumbSVG, fitReport,
  stationParts, decorArtWorld,
  pack: typeof DRAGON_ROOM !== 'undefined' ? DRAGON_ROOM : ROBOT_ROOM
})`, context);
const { IDS, GEOMETRY, SPOT_OF, DECOR_SPOTS, pack } = room;

/* ---------- 3. render every case ---------- */
const outputs = [];
const render = (label, fn) => {
  let out;
  try { out = fn(); } catch (e) { fail(`${label}: threw ${e.message}`); return; }
  if (/NaN|undefined/.test(out)) fail(`${label}: output contains NaN or undefined (${(out.match(/.{0,40}(?:NaN|undefined).{0,40}/) || [''])[0]})`);
  outputs.push({ label, out });
};
const base = () => room.defaultState();

for (const night of [false, true]) {
  for (const id of IDS.styles) {
    const wall = id.startsWith('wall-');
    render(`style ${id} ${night ? 'night' : 'day'}`, () => room.renderRoomSVG(pack, { ...base(), night, wallStyle: wall ? id : 'wall-white', floorStyle: wall ? 'floor-lilac' : id }));
  }
}
for (const station of IDS.stations) {
  for (let level = 1; level <= 4; level++) {
    render(`${station} L${level}`, () => room.renderRoomSVG(pack, { ...base(), levels: { ...base().levels, [station]: level } }));
    render(`${station} L${level} overlay`, () => room.renderRoomSVG(pack, { ...base(), overlay: true, levels: { ...base().levels, [station]: level } }));
  }
}
for (const [id, spot] of Object.entries(SPOT_OF)) {
  render(`decor ${id}`, () => room.renderRoomSVG(pack, { ...base(), placements: { ...base().placements, [spot]: id } }));
}
for (const pct of [0, 50, 100]) render(`gauge ${pct}`, () => room.renderRoomSVG(pack, { ...base(), fridgePct: pct }));
for (let level = 1; level <= 4; level++) {
  const levels = { bed: level, fridge: level, cooker: level, cabinet: level, wardrobe: level };
  render(`cooking L${level}`, () => room.renderRoomSVG(pack, { ...base(), levels, cooking: true }));
  render(`served L${level}`, () => room.renderRoomSVG(pack, { ...base(), levels, served: true }));
  render(`sleeping L${level}`, () => room.renderRoomSVG(pack, { ...base(), levels, sleeping: true, night: true }));
  render(`herb L${level}`, () => room.renderRoomSVG(pack, { ...base(), levels, herb: true }));
  for (const kind of ['gauge', 'steam', 'zzz', 'servedPlate']) render(`effect ${kind} L${level}`, () => room.effectThumbSVG(pack, kind, level, 50));
}
for (const form of [1, 2, 3]) {
  for (const mood of [{ cooking: true }, { sleeping: true }, {}]) render(`form ${form} ${Object.keys(mood)[0] || 'rug'}`, () => room.renderRoomSVG(pack, { ...base(), ...mood, form }));
}
for (const station of IDS.stations) for (let level = 1; level <= 4; level++) render(`thumb ${station} L${level}`, () => room.thumbSVG(pack, 'station', station, level));
for (const id of Object.keys(SPOT_OF)) render(`thumb decor ${id}`, () => room.thumbSVG(pack, 'decor', id));
for (const id of IDS.styles) render(`thumb style ${id}`, () => room.thumbSVG(pack, 'style', id));
for (const { label, out } of outputs) if (!out.includes('<svg')) fail(`${label}: no <svg> in the output`);

/* ---------- 4. missing art ---------- */
let missingCount = 0;
const missingIds = new Set();
for (const { out } of outputs) {
  missingCount += (out.match(/class="missing"/g) || []).length;
  for (const m of out.matchAll(/>missing: ([^<]+)</g)) missingIds.add(m[1]);
}
const groups = {};
for (const id of missingIds) {
  const kind = id.startsWith('decor:') ? 'decor' : id.startsWith('style:') ? 'styles' : id.startsWith('effect:') ? 'effects' : id.startsWith('backdrop.') ? 'backdrop' : 'stations';
  (groups[kind] ||= []).push(id);
}
console.log(`missing: ${missingIds.size} unique ids (${missingCount} boxes across ${outputs.length} renders)`);
for (const [kind, list] of Object.entries(groups)) console.log(`  ${kind}: ${list.length}${list.length <= 12 ? ' -> ' + list.join(', ') : ''}`);
if (expectComplete && missingIds.size > 0) fail(`--expect-complete: ${missingIds.size} missing ids`);

/* ---------- 5. fit ---------- */
const fit = room.fitReport(pack);
const drawn = fit.filter(r => !r.missing);
for (const r of drawn) if (!r.ok) fail(`fit: ${r.id} exceeds its box: ${r.note}`);
const stationFit = fit.filter(r => r.kind === 'station');
const decorFit = fit.filter(r => r.kind === 'decor');
console.log(`fit: stations ${stationFit.filter(r => r.ok).length}/${stationFit.length} fit (${stationFit.filter(r => r.missing).length} not drawn); decor ${decorFit.filter(r => r.ok).length}/${decorFit.length} fit (${decorFit.filter(r => r.missing).length} not drawn)`);

/* ---------- 6. ambience ---------- */
const probe = target => {
  if (IDS.stations.includes(target)) return [1, 2, 3, 4].map(l => { const p = room.stationParts(pack, target, l); return p ? p.back + p.front : ''; }).join('');
  if (SPOT_OF[target]) return room.decorArtWorld(pack, target) || '';
  // 'shell' and 'window' live in the backdrop: day and night, walls only
  return [false, true].map(night => room.renderRoomSVG(pack, { ...base(), night }, { bare: true })).join('');
};
for (const a of pack.ambience || []) {
  if (!probe(a.target).includes(`room-fx--${a.effect}`)) fail(`ambience: ${a.target} has no room-fx--${a.effect} in its art`);
}

/* ---------- 7. names ---------- */
if (expectComplete) {
  const names = pack.labels;
  const countOf = o => Object.keys(o || {}).length;
  if (countOf(names.stations) !== 5) fail(`labels.stations has ${countOf(names.stations)} keys, expected 5`);
  if (countOf(names.decor) !== 55) fail(`labels.decor has ${countOf(names.decor)} keys, expected 55`);
  if (countOf(names.styles) !== 10) fail(`labels.styles has ${countOf(names.styles)} keys, expected 10`);
  for (const [group, map] of Object.entries(names)) {
    if (group === 'levels') continue; // checked below: arrays of 4
    for (const [id, v] of Object.entries(map)) if (typeof v !== 'string' || !v.trim()) fail(`labels.${group}.${id} is empty`);
  }
  // station level names (the live shop names each level): 5 stations x 4 non-empty strings
  if (countOf(names.levels) !== 5) fail(`labels.levels has ${countOf(names.levels)} keys, expected 5`);
  for (const station of IDS.stations) {
    const lv = names.levels?.[station];
    if (!Array.isArray(lv) || lv.length !== 4) fail(`labels.levels.${station} must be an array of 4 names`);
    else lv.forEach((v, i) => { if (typeof v !== 'string' || !v.trim()) fail(`labels.levels.${station}[${i}] is empty`); });
  }
  for (const id of Object.keys(IDS.decor)) if (!names.decor?.[id]) fail(`labels.decor.${id} missing`);
  for (const id of IDS.styles) if (!names.styles?.[id]) fail(`labels.styles.${id} missing`);
  for (const id of IDS.stations) if (!names.stations?.[id]) fail(`labels.stations.${id} missing`);
  console.log(`labels: stations ${countOf(names.stations)}, levels ${countOf(names.levels)} x ${IDS.stations.map(s => names.levels?.[s]?.length ?? 0).join('/')}, decor ${countOf(names.decor)}, styles ${countOf(names.styles)}`);
}

console.log(`geometry: ${checked} numbers checked against the live code`);
if (errors.length) {
  console.error(`\n${errors.length} problem(s):`);
  for (const e of errors.slice(0, 60)) console.error(' - ' + e);
  process.exit(1);
}
console.log('mockup smoke OK');
