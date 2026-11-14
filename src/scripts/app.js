// All site interactions. Runs again after every page change (astro:page-load).
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
};
const keepState = (url) => { try { history.replaceState(history.state, '', url); } catch {} };

/* theme */
function applyTheme() {
  const t = store.get('theme');
  if (t) document.documentElement.dataset.theme = t;
}
document.addEventListener('astro:after-swap', applyTheme);
function initTheme() {
  const b = $('[data-theme-toggle]');
  if (!b) return;
  b.addEventListener('click', () => {
    const cur = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    store.set('theme', next);
  });
}

/* header: mobile menu + destinations panel */
function initHeader() {
  const head = $('[data-head]'), btn = $('[data-menu]'), mega = $('[data-mega]');
  if (!head) return;
  btn?.addEventListener('click', () => {
    const open = head.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (e) => {
    if (mega?.open && !mega.contains(e.target)) mega.open = false;
  }, { signal: pageSignal() });
}

/* search dialog */
let searchIndex = null;
async function loadIndex() {
  if (!searchIndex) {
    try { searchIndex = await (await fetch('/search.json')).json(); } catch { searchIndex = []; }
  }
  return searchIndex;
}
function findGuides(items, q) {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return items.map((it) => {
    const title = it.t.toLowerCase(), all = `${it.t} ${it.p} ${it.r} ${it.k} ${it.d}`.toLowerCase();
    if (!terms.every((x) => all.includes(x))) return null;
    let s = 0;
    terms.forEach((x) => { if (title.includes(x)) s += 2; if (it.p.toLowerCase() === x) s += 3; });
    return { it, s };
  }).filter(Boolean).sort((a, b) => b.s - a.s).slice(0, 8).map((x) => x.it);
}
function openSearch() {
  const d = $('[data-search]');
  if (!d || d.open) return;
  d.showModal();
  $('[data-search-input]', d)?.focus();
  loadIndex();
}
function initSearch() {
  const d = $('[data-search]');
  if (!d) return;
  const input = $('[data-search-input]', d), list = $('[data-search-results]', d);
  $$('[data-open-search]').forEach((b) => b.addEventListener('click', openSearch));
  d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
  const render = async () => {
    const q = input.value.trim();
    const hits = findGuides(await loadIndex(), q);
    list.textContent = '';
    if (!q || !hits.length) {
      const li = document.createElement('li');
      li.className = 'none';
      li.textContent = q ? `No guides match "${q}". Try a country name.` : 'Type to search all guides.';
      list.append(li);
      return;
    }
    hits.forEach((h) => {
      const li = document.createElement('li'), a = document.createElement('a'), s = document.createElement('small');
      a.href = h.u; a.textContent = h.t;
      s.textContent = [h.p || 'Worldwide', h.k].join(', ');
      a.append(s); li.append(a); list.append(li);
    });
  };
  input.addEventListener('input', render);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { const first = $('a', list); if (first) first.click(); }
  });
}
document.addEventListener('keydown', (e) => {
  const el = document.activeElement;
  const typing = el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable);
  if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey) { e.preventDefault(); openSearch(); }
});

/* homepage trip finder */
function initFinder() {
  const root = $('[data-finder]');
  if (!root) return;
  const cards = $$('[data-card]', root), q = $('[data-q]', root), count = $('[data-count]', root);
  const empty = $('[data-empty]', root), more = $('[data-more]', root), moreRow = $('[data-more-row]', root);
  const LIMIT = Number(root.dataset.limit || 9);
  const p = new URLSearchParams(location.search);
  const state = { q: p.get('q') || '', region: p.get('region') || '', type: p.get('type') || '', all: false };
  q.value = state.q;
  const apply = () => {
    const terms = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    const filtering = !!(terms.length || state.region || state.type);
    let n = 0;
    cards.forEach((c) => {
      const ok = (!state.region || c.dataset.region === state.region) && (!state.type || c.dataset.type === state.type) && terms.every((t) => c.dataset.text.includes(t));
      if (ok) n++;
      c.hidden = !ok || (!filtering && !state.all && Number(c.dataset.i) >= LIMIT);
    });
    count.textContent = filtering ? `${n} of ${cards.length} guides match` : `${cards.length} guides`;
    empty.hidden = n > 0;
    moreRow.hidden = filtering || state.all || cards.length <= LIMIT;
    $$('[data-filter]', root).forEach((b) => b.setAttribute('aria-pressed', String(state[b.dataset.filter] === b.dataset.value)));
    $$('[data-reset]', root).forEach((b) => { b.hidden = !filtering; });
    const u = new URLSearchParams();
    if (state.q) u.set('q', state.q);
    if (state.region) u.set('region', state.region);
    if (state.type) u.set('type', state.type);
    keepState(location.pathname + (u.toString() ? '?' + u : ''));
  };
  q.addEventListener('input', () => { state.q = q.value.trim(); apply(); });
  $$('[data-filter]', root).forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.filter;
    state[k] = state[k] === b.dataset.value ? '' : b.dataset.value;
    apply();
  }));
  $$('[data-reset]', root).forEach((b) => b.addEventListener('click', () => {
    state.q = state.region = state.type = ''; q.value = ''; apply(); q.focus();
  }));
  more?.addEventListener('click', () => { state.all = true; apply(); });
  apply();
}

/* post: reading progress, table of contents, copy link */
function initPost() {
  const bar = $('[data-progress]'), prose = $('[data-prose]');
  if (bar && prose) {
    let ticking = false;
    const update = () => {
      const r = prose.getBoundingClientRect();
      const done = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
      bar.style.transform = `scaleX(${done})`;
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true, signal: pageSignal() });
    update();
  }
  const links = $$('[data-toc] a');
  if (links.length && 'IntersectionObserver' in window) {
    const byId = new Map();
    links.forEach((a) => { const id = decodeURIComponent(a.hash.slice(1)); if (!byId.has(id)) byId.set(id, []); byId.get(id).push(a); });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => a.classList.remove('on'));
        (byId.get(en.target.id) || []).forEach((a) => a.classList.add('on'));
      });
    }, { rootMargin: '-84px 0px -70% 0px' });
    byId.forEach((_, id) => { const h = document.getElementById(id); if (h) io.observe(h); });
    pageSignal().addEventListener('abort', () => io.disconnect());
  }
  $$('[data-share]').forEach((b) => {
    if (!navigator.share) return;
    b.hidden = false;
    b.addEventListener('click', () => { navigator.share({ title: b.dataset.title, url: location.href }).catch(() => {}); });
  });
  $$('[data-copy-link]').forEach((b) => b.addEventListener('click', async () => {
    const label = b.textContent;
    try { await navigator.clipboard.writeText(location.href); b.textContent = 'Link copied'; }
    catch { b.textContent = 'Copy failed, use the address bar'; }
    setTimeout(() => { b.textContent = label; }, 2000);
  }));
}

/* trip budget calculator */
function initCalc() {
  const root = $('[data-calc]');
  if (!root) return;
  const ids = ['dest', 'days', 'ppl', 'cur', 'flight', 'insurance', 'esim', 'other1', 'stay', 'food', 'move', 'fun', 'buf'];
  const defaults = { days: 7, ppl: 2, cur: 'USD', buf: 10, dest: '' };
  const el = (i) => root.querySelector('#' + i);
  const colors = ['#5ccdc0', '#ffc83d', '#ff8a6a', '#9fb4ff', '#c7a6ff', '#b9c4cc', '#7f8d99'];
  const num = (i) => { const v = parseFloat(el(i).value); return isFinite(v) && v >= 0 ? v : 0; };
  const fmt = (n) => {
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: el('cur').value, maximumFractionDigits: 0 }).format(n); }
    catch { return Math.round(n) + ' ' + el('cur').value; }
  };
  const calc = () => {
    const nights = Math.max(1, Math.round(num('days'))), ppl = Math.max(1, Math.round(num('ppl')));
    const parts = [
      ['Flights', num('flight') * ppl],
      ['Lodging', num('stay') * nights],
      ['Food', num('food') * ppl * (nights + 1)],
      ['Local transport', num('move') * ppl * (nights + 1)],
      ['Activities', num('fun') * ppl * (nights + 1)],
      ['Insurance, eSIM, fees', num('insurance') * ppl + num('esim') + num('other1')],
    ];
    const sub = parts.reduce((a, p) => a + p[1], 0);
    const bufAmt = sub * Math.min(100, num('buf')) / 100, total = sub + bufAmt;
    $('[data-warn]', root).textContent = sub === 0 ? 'Enter your expected costs to see a total.' : '';
    $('[data-title]', root).textContent = `${el('dest').value.trim() || 'Your trip'}: ${nights} nights, ${ppl} traveler${ppl > 1 ? 's' : ''}`;
    $('[data-total]', root).textContent = fmt(total);
    $('[data-persub]', root).textContent = `${fmt(total / ppl)} per person, ${fmt(total / (nights + 1))} per day for the group`;
    const rows = parts.concat([['Safety buffer', bufAmt]]);
    const bar = $('[data-bar]', root), tbl = $('[data-table]', root);
    bar.textContent = ''; tbl.textContent = '';
    rows.forEach((r, i) => {
      const seg = document.createElement('span');
      seg.style.width = (total > 0 ? r[1] / total * 100 : 0) + '%';
      seg.style.background = colors[i % colors.length];
      seg.title = r[0];
      bar.append(seg);
      const tr = tbl.insertRow(), a = tr.insertCell(), b = tr.insertCell(), dot = document.createElement('span');
      dot.className = 'dot'; dot.style.background = colors[i % colors.length];
      a.append(dot, r[0]); b.textContent = fmt(r[1]);
    });
    const d = encodeURIComponent(el('dest').value.trim());
    $$('[data-aff]', root).forEach((a) => { a.href = a.dataset.aff.replace('{dest}', d); });
    const s = {}; ids.forEach((i) => { s[i] = el(i).value; });
    keepState(location.pathname + '?' + new URLSearchParams(s));
  };
  const p = new URLSearchParams(location.search);
  ids.forEach((i) => {
    if (p.has(i)) el(i).value = p.get(i);
    el(i).addEventListener('input', calc);
    el(i).addEventListener('change', calc);
  });
  $('[data-copy]', root).addEventListener('click', async (e) => {
    const b = e.currentTarget;
    try { await navigator.clipboard.writeText(location.href); b.textContent = 'Link copied'; }
    catch { b.textContent = 'Copy the address bar link'; }
    setTimeout(() => { b.textContent = 'Copy share link'; }, 2000);
  });
  $('[data-calc-reset]', root).addEventListener('click', () => {
    ids.forEach((i) => { el(i).value = Object.hasOwn(defaults, i) ? defaults[i] : 0; });
    calc();
  });
  calc();
}

/* packing checklist */
function initPack() {
  const root = $('[data-pack]');
  if (!root) return;
  const KEY = 'vg-pack', CUSTOM = 'vg-pack-custom';
  const read = (k) => { try { return JSON.parse(store.get(k) || '[]'); } catch { return []; } };
  let checked = new Set(read(KEY)), custom = read(CUSTOM);
  const customList = $('[data-custom-list]', root), prog = $('progress', root), label = $('[data-pack-count]', root);
  const update = () => {
    const boxes = $$('input[type=checkbox]', root);
    const done = boxes.filter((b) => b.checked).length;
    prog.max = boxes.length || 1; prog.value = done;
    label.textContent = `${done} of ${boxes.length} packed`;
    store.set(KEY, JSON.stringify(boxes.filter((b) => b.checked).map((b) => b.value)));
  };
  const addCustom = (text) => {
    const li = document.createElement('li'), l = document.createElement('label'), c = document.createElement('input'), s = document.createElement('span');
    c.type = 'checkbox'; c.value = 'c:' + text; c.checked = checked.has(c.value); s.textContent = text;
    l.append(c, s); li.append(l); customList.append(li);
  };
  $$('input[type=checkbox]', root).forEach((b) => { b.checked = checked.has(b.value); });
  custom.forEach(addCustom);
  root.addEventListener('change', (e) => { if (e.target.type === 'checkbox') update(); });
  $('[data-add]', root).addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('input', e.currentTarget), text = input.value.trim().slice(0, 60);
    if (!text || custom.includes(text)) return;
    custom.push(text); store.set(CUSTOM, JSON.stringify(custom)); addCustom(text); input.value = ''; update();
  });
  $('[data-pack-reset]', root).addEventListener('click', () => {
    checked = new Set(); custom = []; store.set(CUSTOM, '[]');
    customList.textContent = '';
    $$('input[type=checkbox]', root).forEach((b) => { b.checked = false; });
    update();
  });
  $('[data-print]', root).addEventListener('click', () => print());
  update();
}

/* one abort signal per page view, so listeners from the previous page are removed */
let ac = null;
function pageSignal() { if (!ac) ac = new AbortController(); return ac.signal; }
document.addEventListener('astro:before-swap', () => { ac?.abort(); ac = null; });
document.addEventListener('astro:page-load', () => {
  applyTheme(); initTheme(); initHeader(); initSearch(); initFinder(); initPost(); initCalc(); initPack();
});
