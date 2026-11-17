// Pip's Path local test (2026-11-17-pips-path-backend).
// Paste into the browser devtools console on http://localhost:3000 AFTER signing in, then run:
//   await pipsPathTest()      - one map: issue, bad path, clear, retry, locked replay, state
//   await pipsPathCapTest()   - eleven clears in a row: payouts stop at the 50-a-day cap
const BASE = '/api/pet/games/pips-path';

async function call(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

// Same rules as the server: start on S, orthogonal steps, open tiles only, visit every open tile once.
function solve(rows) {
  const W = rows[0].length, H = rows.length, cells = rows.join('');
  const open = [...cells].map(c => c !== '#');
  const start = cells.indexOf('S');
  const total = open.filter(Boolean).length;
  const seen = open.map(() => false);
  const path = [start];
  seen[start] = true;
  const nb = i => {
    const x = i % W, y = Math.floor(i / W), out = [];
    if (y > 0) out.push(i - W);
    if (y < H - 1) out.push(i + W);
    if (x > 0) out.push(i - 1);
    if (x < W - 1) out.push(i + 1);
    return out.filter(j => open[j]);
  };
  const reachable = head => {           // every unvisited tile still reachable from the head?
    const hit = seen.map(() => false), queue = [head];
    hit[head] = true;
    let found = 0;
    while (queue.length) for (const j of nb(queue.pop())) if (!seen[j] && !hit[j]) { hit[j] = true; found++; queue.push(j); }
    return found === total - path.length;
  };
  const dfs = head => {
    if (path.length === total) return true;
    if (!reachable(head)) return false;
    for (const j of nb(head)) {
      if (seen[j]) continue;
      seen[j] = true; path.push(j);
      if (dfs(j)) return true;
      path.pop(); seen[j] = false;
    }
    return false;
  };
  return dfs(start) ? path : null;
}

async function pipsPathTest() {
  const show = (label, r) => console.log(label, '→', r.status, r.body);
  show('state', await call('GET', ''));
  const map = await call('POST', '/maps', {});
  show('new map (expect 200)', map);
  console.log(map.body.rows.join('\n'));
  const path = solve(map.body.rows);
  console.log('solution', path);
  show('bad path (expect 422)', await call('POST', `/maps/${map.body.mapId}/clear`, { path: path.slice(0, 2) }));
  show('clear (expect paid 5 unless at the cap)', await call('POST', `/maps/${map.body.mapId}/clear`, { path }));
  show('retry (expect alreadyCleared true, paid 0)', await call('POST', `/maps/${map.body.mapId}/clear`, { path }));
  show('replay difficulty 10 (expect 403 until difficulty 9 is cleared)', await call('POST', '/maps', { family: 'garden-path', difficulty: 10 }));
  show('somebody else\'s / missing map (expect 404)', await call('POST', '/maps/999999999/clear', { path }));
  show('state after', await call('GET', ''));
}

async function pipsPathCapTest() {
  for (let n = 1; n <= 11; n++) {
    const m = await call('POST', '/maps', {});
    const r = await call('POST', `/maps/${m.body.mapId}/clear`, { path: solve(m.body.rows) });
    console.log(`#${n}`, m.body.mode, `d${m.body.difficulty}`, `${m.body.width}x${m.body.height}`,
                'paid', r.body.paid, 'capped', r.body.capped, 'today', r.body.earnedToday, 'balance', r.body.balance);
  }
}
