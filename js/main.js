/* ==========================================================================
   Prinseyy portfolio — interactions
   Libraries (optional, loaded from CDN): GSAP + ScrollTrigger, Lenis.
   Everything degrades gracefully if they fail to load.
   APIs: Open-Meteo (sun + weather), GitHub REST (repos), Web3Forms (contact),
         Google Drive thumbnails (reel previews).
   ========================================================================== */
(() => {
  'use strict';

  const D = window.PORTFOLIO || {};
  const SITE = D.site || {};
  const root = document.documentElement;
  root.classList.add('js-ok');

  /* ---------- helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const pad = (n) => String(n).padStart(2, '0');
  const mq = (q) => window.matchMedia(q).matches;
  const reduceMotion = mq('(prefers-reduced-motion: reduce)');
  const finePointer = mq('(hover: hover) and (pointer: fine)');
  const hasGSAP = Boolean(window.gsap && window.ScrollTrigger) && !reduceMotion;
  const TZ = (SITE.location && SITE.location.timeZone) || 'Asia/Dubai';
  const published = (list) => (Array.isArray(list) ? list.filter((x) => x && x.published !== false) : []);

  const store = {
    get(key, maxAge) {
      try {
        const raw = sessionStorage.getItem(key);
        if (!raw) return null;
        const { t, v } = JSON.parse(raw);
        return Date.now() - t < maxAge ? v : null;
      } catch { return null; }
    },
    set(key, v) { try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), v })); } catch { /* storage blocked */ } }
  };

  function h(tag, props, ...children) {
    const node = document.createElement(tag);
    Object.entries(props || {}).forEach(([k, v]) => {
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else node.setAttribute(k, v === true ? '' : String(v));
    });
    children.flat().forEach((c) => {
      if (c === null || c === undefined || c === false) return;
      node.append(c instanceof Node ? c : document.createTextNode(String(c)));
    });
    return node;
  }

  function safeUrl(value) {
    if (!value) return '';
    try {
      const url = new URL(value, window.location.href);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch { return ''; }
  }
  const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };
  const driveId = (u) => { const m = String(u || '').match(/\/d\/([\w-]{10,})/) || String(u || '').match(/[?&]id=([\w-]{10,})/); return m ? m[1] : ''; };

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-on'), 2400);
  }

  /* ======================================================================
     1. Render data-driven sections
     ====================================================================== */
  function renderWebsites() {
    const list = $('#sitesList');
    if (!list) return;
    const items = published(D.websites);
    list.replaceChildren(...items.map((s, i) => {
      const url = safeUrl(s.url);
      const domain = s.domain || hostOf(url);
      const dev = /dev/i.test(s.status || '');
      const ext = { target: '_blank', rel: 'noopener' };

      const shot = h('a', { class: 'site__shot', href: url || null, ...ext, 'data-cursor': 'Visit ↗', 'aria-label': `Open ${s.title} in a new tab` },
        h('div', { class: 'browser' },
          h('div', { class: 'browser__bar', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'), h('span', { text: domain })),
          h('div', { class: 'site__screen' },
            s.screenshot ? h('img', { src: s.screenshot, alt: `Screenshot of the ${s.title} homepage`, width: 1200, height: 1200, loading: 'lazy', decoding: 'async' }) : null)));

      const meta = h('dl', { class: 'site__meta' },
        ...(s.meta || []).filter(([, v]) => v).map(([k, v]) => h('div', null, h('dt', { text: k }), h('dd', { text: v }))));

      const body = h('div', { class: 'site__body' },
        h('div', { class: 'site__top' }, h('span', { class: 'site__num', text: pad(i + 1) }), h('span', { class: 'site__cat', text: s.category || '' })),
        h('p', { class: 'site__type' }, h('span', { text: s.type || '' }), s.status ? h('span', { class: `status${dev ? ' status--dev' : ''}`, text: s.status }) : null),
        h('h3', null, url ? h('a', { href: url, ...ext, text: s.title }) : s.title),
        s.description ? h('p', { text: s.description }) : null,
        meta,
        url ? h('a', { class: 'link site__link', href: url, ...ext, text: `${domain} ↗` }) : null);

      return h('article', { class: 'site', 'data-reveal': '' }, shot, body);
    }));
  }

  function renderFrames() {
    const grid = $('#proofGrid');
    if (!grid) return;
    const items = published(D.frames);
    galleries.frames = items.map((f, i) => ({ src: f.src, caption: `F.${pad(i + 1)} — ${f.title}`, alt: f.alt || f.title }));
    const layouts = ['feature', 'wide', 'tall', 'standard'];
    grid.replaceChildren(...items.map((f, i) => h('figure', {
      class: 'frame',
      'data-layout': layouts.includes(f.layout) ? f.layout : 'standard',
      'data-reveal': 'clip',
      style: `--d:${(i % 4) * 0.07}s`
    },
    h('button', { class: 'frame__btn', type: 'button', 'data-lightbox': `frames:${i}`, 'data-cursor': 'View', 'aria-label': `View ${f.title} full size` },
      h('img', { src: f.thumb || f.src, alt: f.alt || f.title, width: f.w || null, height: f.h || null, loading: 'lazy', decoding: 'async' })),
    h('figcaption', null, h('span', { class: 'num', text: `F.${pad(i + 1)}` }), h('span', { text: f.title })))));
  }

  function renderReel() {
    const list = $('#reelList');
    if (!list) return;
    const items = published(D.reel);
    list.replaceChildren(...items.map((c, i) => h('li', { 'data-reveal': '', style: `--d:${i * 0.06}s` },
      h('button', { class: 'cut', type: 'button', 'data-cut': i, 'aria-label': `Play ${c.title}` },
        h('span', { class: 'cut__n', text: `R.${pad(i + 1)}` }),
        h('span', { class: 'cut__t', text: c.title }),
        h('span', { class: 'cut__d', text: c.description || '' }),
        h('span', { class: 'cut__w' }, h('i', { 'aria-hidden': 'true', text: '▶' }), h('span', { text: 'Watch' }))))));
  }

  function renderStats() {
    const values = {
      posters: $$('.concept').length,
      web: published(D.websites).length + $$('[data-case-study]').length,
      frames: published(D.frames).length,
      cuts: published(D.reel).length
    };
    $$('[data-stat]').forEach((el) => {
      const v = values[el.dataset.stat];
      if (typeof v === 'number') { el.dataset.to = v; el.textContent = reduceMotion ? pad(v) : '00'; }
    });
  }

  /* ======================================================================
     2. Split headings into words for the rise-in animation
     ====================================================================== */
  function splitWords(el) {
    let i = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(' '); return; }
            const inner = h('span', { text: part });
            inner.style.setProperty('--i', i++);
            frag.append(h('span', { class: 'w' }, inner));
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') walk(child);
      });
    };
    walk(el);
  }

  /* ======================================================================
     3. Smooth scroll (Lenis) + anchor links
     ====================================================================== */
  let lenis = null;
  function initSmoothScroll() {
    if (reduceMotion || typeof window.Lenis !== 'function') return;
    try {
      lenis = new window.Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 1 });
    } catch { lenis = null; return; }
    if (hasGSAP) {
      lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add((t) => lenis.raf(t * 1000));
      window.gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  function scrollToTarget(target) {
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 });
    else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    if (target.hasAttribute('tabindex')) target.focus({ preventScroll: true });
  }

  function initAnchors() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || e.defaultPrevented) return;
      const hash = a.getAttribute('href');
      if (hash.length < 2) return;
      const target = document.getElementById(hash.slice(1));
      if (!target) return;
      e.preventDefault();
      if (root.classList.contains('menu-open')) setMenu(false);
      scrollToTarget(target);
      if (history.pushState) history.pushState(null, '', hash);
    });
  }

  /* ======================================================================
     4. Navigation: hide on scroll, progress, active chapter, dark mode, menu
     ====================================================================== */
  const toggle = $('#menuToggle');
  const menu = $('#menu');
  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(open));
      const label = $('.nav__toggle-label', toggle);
      if (label) label.textContent = open ? 'Close' : 'Menu';
    }
    if (menu) { menu.inert = !open; menu.setAttribute('aria-hidden', String(!open)); }
    if (lenis) (open ? lenis.stop() : lenis.start());
    else document.body.style.overflow = open ? 'hidden' : '';
  }

  function initNav() {
    const nav = $('#nav');
    const progress = $('#progress');
    const darkZones = $$('.is-dark').filter((el) => !el.closest('.nav, .menu, dialog'));
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const max = Math.max(1, root.scrollHeight - window.innerHeight);
      if (progress) progress.style.transform = `scaleX(${Math.min(1, y / max)})`;
      if (nav) {
        const delta = y - lastY;
        if (Math.abs(delta) > 4) {
          nav.classList.toggle('is-hidden', delta > 0 && y > 160 && !root.classList.contains('menu-open'));
          lastY = y;
        }
        const probe = 34;
        const dark = darkZones.some((el) => { const r = el.getBoundingClientRect(); return r.top <= probe && r.bottom >= probe; });
        nav.classList.toggle('is-dark', dark);
      }
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();

    // active chapter link
    const links = $$('.nav__links a');
    const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          links.forEach((a) => a.classList.remove('is-active'));
          const link = byId.get(en.target.id);
          if (link) link.classList.add('is-active');
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      $$('[data-chapter]').forEach((s) => io.observe(s));
    }

    // mobile menu
    if (toggle) toggle.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && root.classList.contains('menu-open')) setMenu(false); });
    window.addEventListener('resize', () => { if (window.innerWidth > 960 && root.classList.contains('menu-open')) setMenu(false); });
  }

  /* ======================================================================
     5. Dubai clock
     ====================================================================== */
  const fmtTime = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: TZ });
  function initClock() {
    const nodes = $$('[data-clock]');
    const tick = () => { const t = fmtTime.format(new Date()); nodes.forEach((n) => { n.textContent = t; }); };
    tick();
    setInterval(tick, 5000);
    const year = $('#year');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  /* ======================================================================
     6. Open-Meteo light report — sunrise, sunset, golden hour, weather
     ====================================================================== */
  const WMO = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog', 48: 'Rime fog',
    51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle', 56: 'Freezing drizzle', 57: 'Freezing drizzle',
    61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 66: 'Freezing rain', 67: 'Freezing rain',
    71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains', 80: 'Light showers', 81: 'Showers',
    82: 'Heavy showers', 85: 'Snow showers', 86: 'Snow showers', 95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm'
  };
  const MIN = 60000;
  const duration = (ms) => {
    const m = Math.max(0, Math.round(ms / MIN));
    const hh = Math.floor(m / 60);
    return hh ? `${hh}h ${pad(m % 60)}m` : `${m}m`;
  };

  async function initLight() {
    const loc = SITE.location;
    const report = $('#lightReport');
    const set = (key, val) => $$(`[data-lr="${key}"]`).forEach((n) => { n.textContent = val; });
    if (!loc) return;

    let data = store.get('pz-light-v1', 20 * MIN);
    if (!data) {
      try {
        const url = 'https://api.open-meteo.com/v1/forecast'
          + `?latitude=${loc.lat}&longitude=${loc.lon}`
          + '&current=temperature_2m,weather_code,is_day&daily=sunrise,sunset'
          + `&timezone=${encodeURIComponent(loc.timeZone || TZ)}&forecast_days=2`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
        const j = await res.json();
        const off = (j.utc_offset_seconds || 0) * 1000;
        const toMs = (s) => Date.parse((s.length === 16 ? `${s}:00` : s) + 'Z') - off;
        data = {
          temp: j.current.temperature_2m,
          code: j.current.weather_code,
          sunrise: j.daily.sunrise.map(toMs),
          sunset: j.daily.sunset.map(toMs)
        };
        store.set('pz-light-v1', data);
      } catch (err) {
        console.warn('Light report unavailable:', err);
        set('chip', 'Dubai, UAE · 25.20° N, 55.27° E');
        set('sky', 'Live light data is unavailable right now.');
        if (report) report.classList.add('is-off');
        return;
      }
    }

    const sun = $('#lrSun');
    const done = $('#lrDone');
    const update = () => {
      const now = Date.now();
      const windows = [];
      data.sunrise.forEach((sr, i) => {
        const ss = data.sunset[i];
        windows.push({ s: sr - 10 * MIN, e: sr + 35 * MIN }, { s: ss - 40 * MIN, e: ss + 10 * MIN });
      });
      const current = windows.find((w) => now >= w.s && now <= w.e);
      const next = windows.find((w) => w.s > now);
      const temp = `${Math.round(data.temp)}°C`;
      const sky = WMO[data.code] || 'Clear';

      set('temp', temp);
      set('sky', sky);
      set('sunrise', fmtTime.format(data.sunrise[0]));
      set('sunset', fmtTime.format(data.sunset[0]));
      set('golden', fmtTime.format(data.sunset[0] - 40 * MIN));

      if (current) {
        set('label', 'Golden hour · now');
        set('countdown', `ends in ${duration(current.e - now)}`);
        set('chip', `Golden hour in Dubai — right now · ${temp}`);
      } else if (next) {
        set('label', `Next golden hour · ${fmtTime.format(next.s)}`);
        set('countdown', `in ${duration(next.s - now)}`);
        set('chip', `${temp} · ${sky} · Golden hour in ${duration(next.s - now)}`);
      }
      if (report) report.classList.toggle('is-golden', Boolean(current));

      // sun position along the arc
      const sr = data.sunrise[0];
      const ss = data.sunset[0];
      const f = (now - sr) / (ss - sr);
      const isDay = f >= 0 && f <= 1;
      if (report) report.classList.toggle('is-night', !isDay);
      const p = isDay ? f : (now < sr ? 0 : 1);
      const theta = Math.PI * (1 - p);
      if (sun) { sun.setAttribute('cx', (150 + 140 * Math.cos(theta)).toFixed(1)); sun.setAttribute('cy', (116 - 100 * Math.sin(theta)).toFixed(1)); }
      if (done) done.style.strokeDasharray = `${p} 1`;
    };
    update();
    setInterval(update, 30000);
  }

  /* ======================================================================
     7. GitHub — recently pushed public repositories
     ====================================================================== */
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  function ago(iso) {
    const s = (Date.parse(iso) - Date.now()) / 1000;
    const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
    for (const [u, sec] of units) if (Math.abs(s) >= sec) return rtf.format(Math.round(s / sec), u);
    return 'just now';
  }

  async function initGitHub() {
    const cfg = SITE.github || {};
    const box = $('#ghFeed');
    const list = $('#ghList');
    if (!cfg.enabled || !cfg.user || !box || !list) return;
    const profile = $('#ghProfile');
    if (profile) profile.href = `https://github.com/${encodeURIComponent(cfg.user)}`;

    let repos = store.get('pz-gh-v1', 30 * MIN);
    if (!repos) {
      try {
        const res = await fetch(`https://api.github.com/users/${encodeURIComponent(cfg.user)}/repos?sort=pushed&per_page=30`, { headers: { Accept: 'application/vnd.github+json' } });
        if (!res.ok) throw new Error(`GitHub ${res.status}`);
        const all = await res.json();
        const exclude = (cfg.exclude || []).map((n) => String(n).toLowerCase());
        repos = all
          .filter((r) => !r.fork && !r.archived && !exclude.includes(r.name.toLowerCase()))
          .slice(0, cfg.limit || 4)
          .map((r) => ({ name: r.name, url: r.html_url, desc: r.description, lang: r.language, stars: r.stargazers_count, pushed: r.pushed_at }));
        store.set('pz-gh-v1', repos);
      } catch (err) {
        console.warn('GitHub feed unavailable:', err);
        return;
      }
    }
    if (!repos.length) return;

    list.replaceChildren(...repos.map((r, i) => h('li', { 'data-reveal': '', style: `--d:${i * 0.06}s` },
      h('a', { class: 'gh__repo', href: safeUrl(r.url), target: '_blank', rel: 'noopener' },
        h('span', { class: 'gh__name', text: r.name }),
        h('p', { class: 'gh__desc', text: r.desc || 'No description yet.' }),
        h('span', { class: 'gh__foot' },
          r.lang ? h('span', { class: 'gh__lang', text: r.lang }) : null,
          r.stars ? h('span', { text: `★ ${r.stars}` }) : null,
          h('span', { text: `Updated ${ago(r.pushed)}` }))))));
    box.hidden = false;
    observeReveals($$('[data-reveal], .eyebrow', box));
    if (hasGSAP) window.ScrollTrigger.refresh();
  }

  /* ======================================================================
     8. Lightbox
     ====================================================================== */
  const galleries = Object.assign({}, D.galleries);

  function openDialog(dlg) {
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    root.classList.add('modal-open');
    if (lenis) lenis.stop();
  }
  function initDialogs() {
    $$('dialog').forEach((dlg) => {
      dlg.addEventListener('close', () => {
        root.classList.remove('modal-open');
        if (lenis) lenis.start();
      });
      dlg.addEventListener('click', (e) => {
        if (e.target === dlg || e.target.classList.contains('lb__stage')) dlg.close();
      });
      $$('[data-close]', dlg).forEach((b) => b.addEventListener('click', () => dlg.close()));
    });
  }

  function initLightbox() {
    const dlg = $('#lightbox');
    if (!dlg) return;
    const img = $('#lbImg');
    const cap = $('#lbCap');
    const count = $('#lbCount');
    let list = [];
    let idx = 0;
    let opener = null;
    let token = 0;

    function show(i) {
      if (!list.length) return;
      idx = (i + list.length) % list.length;
      const item = list[idx];
      const my = ++token;
      img.classList.add('is-loading');
      const pre = new Image();
      pre.src = item.src;
      const swap = () => {
        if (my !== token) return;
        img.src = item.src;
        img.alt = item.alt || item.caption || '';
        requestAnimationFrame(() => img.classList.remove('is-loading'));
      };
      (pre.decode ? pre.decode() : Promise.resolve()).then(swap, swap);
      cap.textContent = item.caption || '';
      count.textContent = `${pad(idx + 1)} / ${pad(list.length)}`;
      dlg.classList.toggle('is-single', list.length < 2);
      const nxt = list[(idx + 1) % list.length];
      if (nxt) new Image().src = nxt.src;
    }

    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-lightbox]');
      if (!t) return;
      const [name, i] = t.dataset.lightbox.split(':');
      list = galleries[name] || [];
      if (!list.length) return;
      e.preventDefault();
      opener = t;
      show(parseInt(i, 10) || 0);
      openDialog(dlg);
    });
    $('.lb__prev', dlg).addEventListener('click', () => show(idx - 1));
    $('.lb__next', dlg).addEventListener('click', () => show(idx + 1));
    dlg.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(idx - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(idx + 1); }
    });
    let x0 = null;
    dlg.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
    dlg.addEventListener('pointerup', (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 60 && list.length > 1) show(idx + (dx < 0 ? 1 : -1));
    });
    dlg.addEventListener('close', () => { if (opener && opener.focus) opener.focus({ preventScroll: true }); });
  }

  /* ======================================================================
     9. Reel: video player dialog + cursor-following preview
     ====================================================================== */
  const reelItems = published(D.reel);
  const driveThumb = (c) => { const id = driveId(c.src); return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w800` : ''; };

  function initPlayer() {
    const dlg = $('#player');
    const screen = $('#playerScreen');
    if (!dlg || !screen) return;
    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-cut]');
      if (!t) return;
      const i = parseInt(t.dataset.cut, 10);
      const c = reelItems[i];
      if (!c) return;
      screen.replaceChildren();
      const ext = $('#playerExt');
      if (c.type === 'video') {
        const v = h('video', { src: c.src, controls: true, playsinline: true, preload: 'auto' });
        screen.append(v);
        v.play().catch(() => {});
        if (ext) ext.hidden = true;
      } else {
        const id = driveId(c.src);
        const src = id ? `https://drive.google.com/file/d/${id}/preview` : safeUrl(c.src);
        screen.append(h('iframe', { src, title: c.title, allow: 'autoplay; fullscreen; picture-in-picture', allowfullscreen: true, referrerpolicy: 'strict-origin-when-cross-origin' }));
        if (ext) { ext.hidden = !id; ext.href = id ? `https://drive.google.com/file/d/${id}/view` : '#'; }
      }
      $('#playerTitle').textContent = c.title;
      $('#playerNum').textContent = `R.${pad(i + 1)}`;
      $('#playerDesc').textContent = c.description || '';
      openDialog(dlg);
    });
    dlg.addEventListener('close', () => screen.replaceChildren());
  }

  function initReelPreview() {
    const pv = $('#reelPreview');
    const list = $('#reelList');
    if (!pv || !list || !finePointer || reduceMotion) return;
    const img = $('img', pv);
    const vid = $('video', pv);
    const tag = $('.reel__preview-n', pv);
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0, active = false;
    img.addEventListener('error', () => { img.hidden = true; });

    const loop = () => {
      x += (tx - x) * 0.16;
      y += (ty - y) * 0.16;
      pv.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
      raf = (active || Math.abs(tx - x) + Math.abs(ty - y) > 0.5) ? requestAnimationFrame(loop) : 0;
    };
    list.addEventListener('pointerenter', (e) => { x = tx = e.clientX; y = ty = e.clientY; });
    list.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; if (!raf) raf = requestAnimationFrame(loop); });
    list.addEventListener('pointerover', (e) => {
      const b = e.target.closest('[data-cut]');
      if (!b) return;
      const i = parseInt(b.dataset.cut, 10);
      const c = reelItems[i];
      if (!c) return;
      if (pv.dataset.cur !== String(i)) {
        pv.dataset.cur = String(i);
        if (c.type === 'video') {
          img.hidden = true;
          vid.hidden = false;
          if (vid.getAttribute('src') !== c.src) vid.src = c.src;
          vid.currentTime = 0;
          vid.play().catch(() => {});
        } else {
          vid.pause();
          vid.hidden = true;
          const src = c.thumb || driveThumb(c);
          img.hidden = !src;
          if (src) img.src = src;
        }
        tag.textContent = `R.${pad(i + 1)}`;
      }
      active = true;
      pv.classList.add('is-on');
      if (!raf) raf = requestAnimationFrame(loop);
    });
    list.addEventListener('pointerleave', () => {
      active = false;
      pv.classList.remove('is-on');
      vid.pause();
    });
  }

  /* ======================================================================
     10. Pointer niceties: cursor label, magnetic buttons, tilt
     ====================================================================== */
  function initPointer() {
    if (!finePointer || reduceMotion) return;
    root.classList.add('has-cursor');

    const cursor = $('#cursor');
    const label = cursor && $('span', cursor);
    if (cursor && label) {
      let x = -100, y = -100, tx = -100, ty = -100, raf = 0;
      const loop = () => {
        x += (tx - x) * 0.22;
        y += (ty - y) * 0.22;
        cursor.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(loop) : 0;
      };
      window.addEventListener('pointermove', (e) => {
        tx = e.clientX; ty = e.clientY;
        if (!cursor.classList.contains('is-on')) { x = tx; y = ty; }
        if (!raf) raf = requestAnimationFrame(loop);
      }, { passive: true });
      document.addEventListener('pointerover', (e) => {
        const t = e.target.closest('[data-cursor]');
        if (!t) return;
        label.textContent = t.dataset.cursor;
        cursor.classList.add('is-on');
      });
      document.addEventListener('pointerout', (e) => {
        const t = e.target.closest('[data-cursor]');
        if (t && !t.contains(e.relatedTarget)) cursor.classList.remove('is-on');
      });
      window.addEventListener('scroll', () => {
        const under = document.elementFromPoint(tx, ty);
        if (!under || !under.closest('[data-cursor]')) cursor.classList.remove('is-on');
      }, { passive: true });
    }

    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * 0.22}px, ${dy * 0.32}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });

    $$('[data-tilt]').forEach((el) => {
      const max = parseFloat(el.dataset.tilt) || 6;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--ry', `${(px * max).toFixed(2)}deg`);
        el.style.setProperty('--rx', `${(-py * max).toFixed(2)}deg`);
      });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
  }

  /* ======================================================================
     11. Small widgets: colourway toggle, copy-to-clipboard
     ====================================================================== */
  function initColourway() {
    $$('.colourway').forEach((box) => {
      const buttons = $$('[data-way]', box);
      const shot = $('.longshot', box);
      const label = $('.colourway__label', box);
      buttons.forEach((btn) => btn.addEventListener('click', () => {
        const way = btn.dataset.way;
        buttons.forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
        $$('[data-way-img]', box).forEach((im) => im.classList.toggle('is-active', im.dataset.wayImg === way));
        if (label) label.textContent = way === 'gold' ? 'Gold (final)' : 'Mono (alternate)';
        if (shot) shot.dataset.lightbox = way === 'gold' ? 'reallux:4' : 'reallux:5';
      }));
    });
  }

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
  }
  function initCopy() {
    document.addEventListener('click', async (e) => {
      const t = e.target.closest('[data-copy]');
      if (!t) return;
      if (await copyText(t.dataset.copy)) toast(`Copied ${t.dataset.copy}`);
    });
    const btn = $('#copyEmail');
    if (btn && SITE.email) {
      btn.addEventListener('click', async () => {
        if (await copyText(SITE.email)) toast(`Email copied — ${SITE.email}`);
        else window.location.href = `mailto:${SITE.email}`;
      });
    }
  }

  /* ======================================================================
     12. Contact form — Web3Forms API, with a mailto fallback
     ====================================================================== */
  function initForm() {
    const form = $('#contactForm');
    if (!form) return;
    const status = $('#formStatus');
    const submit = $('button[type="submit"]', form);
    const btnLabel = $('.btn__label', form);
    const key = String((SITE.contactForm && SITE.contactForm.web3formsKey) || '').trim();
    if (!key) {
      if (btnLabel) btnLabel.textContent = 'Write the email';
      const hint = $('#formHint');
      if (hint) hint.textContent = 'Opens your email app with this filled in.';
    }
    const setStatus = (msg, kind) => {
      status.textContent = msg;
      status.classList.toggle('is-ok', kind === 'ok');
      status.classList.toggle('is-err', kind === 'err');
    };
    const rules = {
      name: (v) => v.trim().length > 1,
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
      message: (v) => v.trim().length > 4
    };
    form.addEventListener('input', (e) => {
      const f = e.target.closest('.field');
      if (f && f.classList.contains('is-invalid') && rules[e.target.name] && rules[e.target.name](e.target.value)) {
        f.classList.remove('is-invalid');
        e.target.removeAttribute('aria-invalid');
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      if (fd.get('botcheck')) return;
      let firstBad = null;
      Object.entries(rules).forEach(([name, test]) => {
        const input = form.elements[name];
        const ok = test(String(fd.get(name) || ''));
        input.closest('.field').classList.toggle('is-invalid', !ok);
        if (!ok) { input.setAttribute('aria-invalid', 'true'); firstBad = firstBad || input; } else input.removeAttribute('aria-invalid');
      });
      if (firstBad) { firstBad.focus(); setStatus('Please add your name, a valid email and a short message.', 'err'); return; }

      const name = String(fd.get('name')).trim();
      const email = String(fd.get('email')).trim();
      const message = String(fd.get('message')).trim();
      const interests = fd.getAll('interest').join(', ') || 'Not specified';

      if (!key) {
        const subject = `Project enquiry from ${name}`;
        const body = `${message}\n\nInterested in: ${interests}\n\n— ${name}\n${email}`;
        window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        setStatus(`Opening your email app… If nothing opens, write to ${SITE.email}.`, 'ok');
        return;
      }

      submit.disabled = true;
      setStatus('Sending…');
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ access_key: key, subject: `New portfolio enquiry — ${name}`, from_name: 'Prinseyy portfolio', name, email, replyto: email, interests, message })
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) throw new Error(json.message || `HTTP ${res.status}`);
        form.reset();
        setStatus('Thanks — your message is on its way. I’ll reply soon.', 'ok');
        toast('Message sent ✓');
      } catch (err) {
        console.warn('Contact form error:', err);
        setStatus(`Couldn’t send right now. Please email ${SITE.email} directly.`, 'err');
      } finally {
        submit.disabled = false;
      }
    });
  }

  /* ======================================================================
     13. Scroll reveals, counters, scramble
     ====================================================================== */
  const SCRAMBLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·/—';
  function scramble(el) {
    if (reduceMotion || el.children.length) return;
    const final = el.textContent;
    const total = 16;
    let frame = 0;
    const run = () => {
      frame += 1;
      const p = frame / total;
      el.textContent = final.split('').map((ch, i) => (ch === ' ' || i / final.length < p) ? ch : SCRAMBLE[(Math.random() * SCRAMBLE.length) | 0]).join('');
      if (frame < total) requestAnimationFrame(run); else el.textContent = final;
    };
    requestAnimationFrame(run);
  }

  function countUp(el) {
    const target = parseInt(el.dataset.to || el.textContent, 10);
    if (!Number.isFinite(target)) return;
    if (reduceMotion) { el.textContent = pad(target); return; }
    const t0 = performance.now();
    const dur = 1300;
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = pad(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function reveal(el) {
    el.classList.add('is-in');
    if (el.matches('.eyebrow')) scramble(el);
    if (el.matches('[data-count]')) countUp(el);
  }

  let revealIO = null;
  function observeReveals(targets) {
    if (!revealIO) { targets.forEach(reveal); return; }
    targets.forEach((el) => revealIO.observe(el));
  }
  function initReveals() {
    const targets = $$('[data-reveal], [data-split], .eyebrow, [data-count]').filter((el) => !el.closest('.hero'));
    if (reduceMotion || !('IntersectionObserver' in window)) { targets.forEach((el) => el.classList.add('is-in')); return; }
    revealIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        reveal(en.target);
        revealIO.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    observeReveals(targets);
  }

  function playHeroIntro() {
    root.classList.add('is-loaded');
    const items = $$('.hero [data-reveal], .hero [data-split], .hero .eyebrow');
    items.forEach((el) => el.classList.add('is-in'));
    setTimeout(() => $$('.hero [data-count]').forEach(countUp), 700);
  }

  /* ======================================================================
     14. Marquee — speed and direction follow scrolling
     ====================================================================== */
  function initMarquee() {
    const track = $('.marquee__track');
    const group = track && $('.marquee__group', track);
    if (!track || !group || reduceMotion) return;
    for (let i = 0; i < 2; i++) track.append(group.cloneNode(true));
    let w = group.offsetWidth;
    if ('ResizeObserver' in window) new ResizeObserver(() => { w = group.offsetWidth; }).observe(group);
    let x = 0, dir = -1, boost = 0, last = performance.now(), lastY = window.scrollY, visible = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(track);
    const tick = (now) => {
      const dt = Math.min(64, now - last);
      last = now;
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      if (dy !== 0) dir = dy > 0 ? -1 : 1;
      boost += (Math.min(Math.abs(dy), 80) * 0.3 - boost) * 0.08;
      if (visible && w) {
        x += dir * (0.04 * dt + boost);
        if (x <= -w) x += w;
        if (x > 0) x -= w;
        track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ======================================================================
     15. GSAP scroll effects: pinned poster gallery, parallax, scrubs
     ====================================================================== */
  function setSeriesProgress(p) {
    const bar = $('#seriesBar');
    const count = $('#seriesCount');
    const total = $$('.concept').length || 1;
    if (bar) bar.style.transform = `scaleX(${p})`;
    if (count) count.textContent = `${pad(Math.min(total, Math.floor(p * total) + 1))} / ${pad(total)}`;
  }

  function initSeriesFallback() {
    const track = $('#seriesTrack');
    if (!track) return;
    track.addEventListener('scroll', () => {
      if ($('.series.is-pinned')) return;
      const max = track.scrollWidth - track.clientWidth;
      setSeriesProgress(max > 0 ? track.scrollLeft / max : 0);
    }, { passive: true });
  }

  function initScrollFX() {
    if (!hasGSAP) return;
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);

    const series = $('.series');
    const pin = $('.series__pin');
    const track = $('#seriesTrack');
    if (series && pin && track) {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1024px) and (min-height: 620px)', () => {
        series.classList.add('is-pinned');
        const dist = () => Math.max(0, track.scrollWidth - document.documentElement.clientWidth);
        gsap.to(track, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: pin,
            start: 'center center',
            end: () => `+=${dist()}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => setSeriesProgress(self.progress)
          }
        });
        return () => { series.classList.remove('is-pinned'); gsap.set(track, { clearProps: 'x' }); };
      });
    }

    $$('[data-parallax]').forEach((el) => {
      const amt = parseFloat(el.dataset.parallax) || 10;
      gsap.fromTo(el, { yPercent: -amt }, {
        yPercent: amt,
        ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    const heroBg = $('.frames-hero__bg img');
    if (heroBg) {
      gsap.fromTo(heroBg, { scale: 1.28, yPercent: -6 }, {
        scale: 1, yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: '.frames-hero', start: 'top bottom', end: 'bottom top', scrub: true }
      });
    }

    const line = $('.process-line i');
    if (line) {
      gsap.fromTo(line, { scaleX: 0 }, {
        scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: '.process', start: 'top 85%', end: 'bottom 70%', scrub: true }
      });
    }

    const heroImg = $('.hero__img img');
    if (heroImg) {
      gsap.to('.hero__frame', {
        yPercent: 8, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    }

    const mark = $('.footer__mark');
    if (mark) {
      gsap.fromTo(mark, { yPercent: 45 }, {
        yPercent: 0, ease: 'none',
        scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true }
      });
    }

    window.addEventListener('load', () => ScrollTrigger.refresh());
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  /* ======================================================================
     16. Preloader
     ====================================================================== */
  function runPreloader() {
    return new Promise((resolve) => {
      const pre = $('#preloader');
      let seen = false;
      try { seen = sessionStorage.getItem('pz-seen') === '1'; sessionStorage.setItem('pz-seen', '1'); } catch { /* ignore */ }
      if (!pre || reduceMotion || seen) {
        if (pre) pre.remove();
        const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
        Promise.race([fontsReady, new Promise((r) => setTimeout(r, 500))]).then(resolve);
        return;
      }
      if (lenis) lenis.stop();
      const count = $('#preloaderCount');
      requestAnimationFrame(() => pre.classList.add('is-run'));
      const dur = 1400;
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        if (count) count.textContent = String(Math.round(eased * 100)).padStart(3, '0');
        if (p < 1) { requestAnimationFrame(step); return; }
        const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
        Promise.race([fontsReady, new Promise((r) => setTimeout(r, 800))]).then(() => {
          pre.classList.add('is-done');
          if (lenis) lenis.start();
          setTimeout(resolve, 380);
          setTimeout(() => pre.remove(), 1300);
        });
      };
      requestAnimationFrame(step);
    });
  }

  /* ======================================================================
     Boot
     ====================================================================== */
  renderWebsites();
  renderFrames();
  renderReel();
  renderStats();
  $$('[data-split]').forEach(splitWords);

  initSmoothScroll();
  initAnchors();
  initNav();
  initClock();
  initDialogs();
  initLightbox();
  initPlayer();
  initReelPreview();
  initPointer();
  initColourway();
  initCopy();
  initForm();
  initReveals();
  initMarquee();
  initSeriesFallback();
  initScrollFX();
  initLight();
  initGitHub();

  runPreloader().then(playHeroIntro);
})();
