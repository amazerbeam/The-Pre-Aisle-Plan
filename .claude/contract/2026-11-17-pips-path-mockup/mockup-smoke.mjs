import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import strict from 'node:assert/strict';
// vm-realm arrays/objects have a different prototype, so deepEqual compares JSON-normalised values; reference checks (assert.equal) stay as is.
const plain = (v) => JSON.parse(JSON.stringify(v));
const assert = Object.assign((...a) => strict(...a), strict, { deepEqual: (a, b, m) => strict.deepEqual(plain(a), plain(b), m) });

const html = readFileSync(new URL('../../../foodbytes-app/mockup/pips-path.html', import.meta.url), 'utf8');
const blocks = Object.fromEntries([...html.matchAll(/<script id="(pp-[a-z]+)">([\s\S]*?)<\/script>/g)].map(m => [m[1], m[2]]));
const PURE = ['pp-pip', 'pp-levels', 'pp-engine', 'pp-sequencer', 'pp-skins'];
for (const id of PURE) {
  assert.ok(id in blocks, `missing block ${id}`);
  assert.doesNotMatch(blocks[id], /\b(document|window|localStorage|matchMedia|requestAnimationFrame)\b/, `${id} must be pure`);
}
const names = ['GARDEN_PATH_LEVELS', 'LEVEL_MAX_COLS', 'validateLevel', 'parseLevel', 'neighbours', 'newRun', 'canStep', 'step', 'moveTo', 'restart',
  'isCleared', 'isStuck', 'keyToDelta', 'countSolutions', 'FAMILIES', 'chapterQueue', 'nextPuzzle', 'REWARD', 'rewardFor'];
const optional = ['THEME_LINE', 'SKIN_ART_KEYS', 'SKIN_LINE_KEYS', 'SKINS', 'lineFor', 'pipLineFor', 'pip'];
const src = PURE.map(id => blocks[id]).join('\n;\n') + `\n;({ ${names.join(', ')}, ${optional.map(n => `${n}: typeof ${n} === 'undefined' ? undefined : ${n}`).join(', ')} })`;
const X = vm.runInNewContext(src, {});

// Levels
assert.equal(X.GARDEN_PATH_LEVELS.length, 10);
const ids = new Set();
for (const lv of X.GARDEN_PATH_LEVELS) {
  assert.ok(!ids.has(lv.id), `duplicate ${lv.id}`); ids.add(lv.id);
  assert.equal(lv.family, 'garden-path'); assert.equal(lv.kind, 'core');
  const w = lv.rows[0].length;
  assert.ok(lv.rows.every(r => r.length === w && /^[S.#]+$/.test(r)), `${lv.id} rows`);
  assert.ok(w <= X.LEVEL_MAX_COLS, `${lv.id} wider than ${X.LEVEL_MAX_COLS}`);
  assert.equal((lv.rows.join('').match(/S/g) || []).length, 1, `${lv.id} start`);
  const { count, first } = X.countSolutions(lv);
  assert.equal(count, lv.solutions, `${lv.id} solution count`);
  // Replay the first solution through the engine: every step legal, ends cleared.
  const g = X.parseLevel(lv); let run = X.newRun(g);
  for (const j of first.slice(1)) { assert.ok(X.canStep(g, run, j), `${lv.id} illegal step ${j}`); run = X.step(g, run, j); }
  assert.ok(X.isCleared(g, run), `${lv.id} not cleared`);
}

// Engine rules on garden-03 ('.#..','....','..S.','....', W=4, start=10)
{
  const g = X.parseLevel(X.GARDEN_PATH_LEVELS[2]); let r = X.newRun(g);
  assert.equal(g.start, 10); assert.equal(g.total, 15);
  assert.equal(X.step(g, r, 12), r, 'non-adjacent step refused');
  assert.equal(X.step(g, r, 1), r, 'rock refused');
  r = X.step(g, r, 9); r = X.step(g, r, 5);
  assert.deepEqual(r.path, [10, 9, 5]);
  assert.equal(X.step(g, r, 9), r, 'revisit refused');
  assert.deepEqual(X.moveTo(g, r, 9).path, [10], 'adjacent visited restarts');
  assert.equal(X.moveTo(g, r, 9).reset, true);
  assert.equal(X.moveTo(g, r, 5), r, 'head tap is a no-op');
  assert.equal(X.moveTo(g, r, 10), r, 'non-adjacent visited is a no-op');
  assert.deepEqual(X.restart(g).path, [10]);
  // Stuck: walk into the top-left corner pocket: 10→9→8→4→0, whose only neighbour (1) is a rock.
  let s = X.newRun(g); for (const j of [9, 8, 4, 0]) s = X.step(g, s, j);
  assert.ok(X.isStuck(g, s) && !X.isCleared(g, s), 'stuck detected');
}

// Sequencer
const pools = { 'garden-path': { core: X.GARDEN_PATH_LEVELS.map(l => l.id), refreshers: ['garden-r1', 'garden-r2'] },
                'thin-ice': { core: Array.from({ length: 10 }, (_, i) => `thin-ice-${String(i + 1).padStart(2, '0')}`), refreshers: ['thin-ice-r1'] } };
assert.equal(X.chapterQueue(1, pools).length, 10);
assert.deepEqual(X.chapterQueue(2, pools).slice(-1), ['garden-r1']);
assert.equal(X.chapterQueue(2, pools).length, 11);
let seed = 7; const rng = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
assert.deepEqual(X.nextPuzzle({ cleared: [], endlessSeen: [], earned: {} }, pools, rng), { id: 'garden-01', mode: 'chapter', resetSeen: false });
assert.deepEqual(X.nextPuzzle({ cleared: ['garden-01', 'garden-02', 'garden-03'], endlessSeen: [], earned: {} }, pools, rng), { id: 'garden-04', mode: 'chapter', resetSeen: false });
{
  const p = { cleared: [...pools['garden-path'].core], endlessSeen: [], earned: {} }, drawn = new Set();
  for (let i = 0; i < 10; i++) { const n = X.nextPuzzle(p, pools, rng); assert.equal(n.mode, 'endless'); assert.ok(!drawn.has(n.id), 'no repeat before pool used'); drawn.add(n.id); p.endlessSeen.push(n.id); }
  assert.equal(drawn.size, 10);
  const again = X.nextPuzzle(p, pools, rng);
  assert.equal(again.mode, 'endless'); assert.equal(again.resetSeen, true, 'pool used up: the caller is told to reset');
  assert.equal(p.endlessSeen.length, 10, 'nextPuzzle is pure: it never mutates progress');
  assert.ok(pools['garden-path'].core.includes(X.nextPuzzle(p, pools, () => 1).id), 'rng() === 1 still yields a real id');
  assert.equal(X.nextPuzzle({ cleared: [], endlessSeen: [], earned: {} }, { 'garden-path': { core: [], refreshers: [] } }, rng), null, 'empty pool: nothing to play');
}
// chapterQueue guards
assert.ok(!X.chapterQueue(2, { ...pools, 'garden-path': { core: pools['garden-path'].core, refreshers: [] } }).includes(undefined), 'missing refresher never enters the queue');
assert.equal(X.chapterQueue(2, { ...pools, 'garden-path': { core: pools['garden-path'].core, refreshers: [] } }).length, 10);
assert.throws(() => X.chapterQueue(2, { 'garden-path': pools['garden-path'] }), /chapterQueue: no pool for family "thin-ice"/);
assert.throws(() => X.chapterQueue(1, {}), /chapterQueue: no pool for family "garden-path"/);
assert.throws(() => X.chapterQueue(3, pools), /chapterQueue: no family for chapter 3/);
// validateLevel / parseLevel reject bad levels
assert.equal(X.validateLevel(X.GARDEN_PATH_LEVELS[0]), true);
assert.throws(() => X.parseLevel({ id: 'bad-ragged', rows: ['S..', '..'] }), /invalid level: bad-ragged/);
assert.throws(() => X.parseLevel({ id: 'bad-nostart', rows: ['...', '...'] }), /invalid level: bad-nostart/);
assert.throws(() => X.parseLevel({ id: 'bad-two', rows: ['S.S'] }), /invalid level: bad-two/);
assert.throws(() => X.parseLevel({ id: 'bad-wide', rows: ['S......'] }), /invalid level: bad-wide/);
assert.throws(() => X.parseLevel({ id: 'bad-chars', rows: ['S.x'] }), /invalid level: bad-chars/);
assert.throws(() => X.parseLevel({ id: 'bad-empty', rows: [] }), /invalid level: bad-empty/);

// Rewards
{
  const day = '2026-11-17', p = { cleared: [], endlessSeen: [], earned: {} };
  // Decided 2026-11-17: 5 per cleared level, cap 50 a day (every play is a fresh server-generated map).
  assert.deepEqual(X.REWARD, { LEVEL_CLEAR: 5, DAILY_CAP: 50 });
  assert.deepEqual(X.rewardFor(p, day), { amount: 5, capped: false });
  assert.deepEqual(X.rewardFor({ ...p, cleared: ['garden-01'] }, day), { amount: 5, capped: false }, 'a cleared level pays again: the next map is new');
  assert.deepEqual(X.rewardFor({ ...p, earned: { [day]: 45 } }, day), { amount: 5, capped: false });
  assert.deepEqual(X.rewardFor({ ...p, earned: { [day]: 47 } }, day), { amount: 3, capped: true });
  assert.deepEqual(X.rewardFor({ ...p, earned: { [day]: 50 } }, day), { amount: 0, capped: true });
  assert.deepEqual(X.rewardFor({ ...p, earned: { '2026-11-16': 50 } }, day), { amount: 5, capped: false }, 'cap resets each day');
}

// Skins
assert.deepEqual(Object.keys(X.SKINS).sort(), ['dragon', 'herb', 'robot']);
assert.deepEqual(X.THEME_LINE, { default: 'herb', parchment: 'dragon', cyberpunk: 'robot' });
assert.equal(X.lineFor('nope'), 'herb');
const titles = new Set();
for (const [line, skin] of Object.entries(X.SKINS)) {
  titles.add(skin.title);
  for (const k of X.SKIN_ART_KEYS) { assert.match(skin.art[k], /^<svg[^>]*viewBox="0 0 48 48"[\s\S]*<\/svg>$/, `${line}.art.${k}`); assert.doesNotMatch(skin.art[k], /NaN|undefined/, `${line}.art.${k} clean`); }
  for (const k of X.SKIN_LINE_KEYS) assert.ok(typeof skin.lines[k] === 'string' && skin.lines[k].length > 0, `${line}.lines.${k}`);
  assert.match(skin.art.mark, /pp-mark-(bloom|flame|led)/, `${line} mark hook`);
  assert.ok(['path', 'ember', 'trace'].includes(skin.trail));
  const svg = X.pip(line, 1, 'happy', {}); assert.doesNotMatch(svg, /NaN|undefined/, `${line} pip`);
}
assert.equal(titles.size, 3, 'skin titles distinct');
assert.deepEqual([...titles].sort(), ['Circuit Run', 'Ember Trail', 'Garden Path']);
{ // pipLineFor on garden-01 (9 tiles: half at 5)
  const g = X.parseLevel(X.GARDEN_PATH_LEVELS[0]); let r = X.newRun(g);
  assert.equal(X.pipLineFor(r, g), 'intro');
  for (const j of [1, 2, 5, 4]) r = X.step(g, r, j); assert.equal(X.pipLineFor(r, g), 'half');
  for (const j of [3, 6, 7, 8]) r = X.step(g, r, j); assert.equal(X.pipLineFor(r, g), 'cleared');
}
// No franchise names in the page's game copy
assert.doesNotMatch(html.replace(/<aside class="pp-notes"[\s\S]*?<\/aside>/, ''), /pok[eé]mon|sootopolis|flow free|rush hour|lights out|sokoban|baba is you/i, 'franchise names only in the notes panel');

// --pp-* tokens: present in every frame, hex, and AA for text pairs
const frameBlock = (t) => html.match(new RegExp(`\\.frame\\[data-theme="${t}"\\]\\s*\\{([\\s\\S]*?)\\n\\}`))[1];
const tok = (block, name) => { const m = block.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})\\b`)); assert.ok(m, `missing hex ${name}`); return m[1]; };
const lum = (hex) => { const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const PP = ['--pp-board-bg', '--pp-tile-bg', '--pp-tile-border', '--pp-tile-visited-bg', '--pp-trail', '--pp-trail-glow', '--pp-rock', '--pp-start-ring',
  '--pp-node-cleared-bg', '--pp-node-cleared-text', '--pp-node-current-ring', '--pp-node-locked-bg', '--pp-node-text', '--pp-hud-text'];
const PAIRS = [['--pp-hud-text', '--pp-board-bg'], ['--pp-node-text', '--pp-node-locked-bg'], ['--pp-node-cleared-text', '--pp-node-cleared-bg'], ['--pp-node-text', '--pp-board-bg']];
let pairCount = 0;
for (const t of ['default', 'parchment', 'cyberpunk']) {
  const b = frameBlock(t); PP.forEach(n => tok(b, n));
  for (const [fg, bg] of PAIRS) { const r = ratio(tok(b, fg), tok(b, bg)); assert.ok(r >= 4.5, `${t} ${fg} on ${bg} = ${r.toFixed(2)}:1`); pairCount++; }
}
assert.doesNotMatch(html, /console\.(log|debug)/, 'no console.log in the mockup');
console.log(`Tokens OK: ${PP.length} --pp-* tokens × 3 themes, ${pairCount} AA pairs`);

console.log(`Pip's Path core OK: ${X.GARDEN_PATH_LEVELS.length} levels, engine, sequencer, rewards`);
