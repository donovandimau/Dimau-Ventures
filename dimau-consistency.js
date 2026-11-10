/* Dimau consistency standard — shared by every Dimau site.
   Loaded with: <script src="https://fijian-assistant-api.vercel.app/dimau-consistency.js" defer></script>
   What it does on every page:
   1. Legacy header: logo box 44px and music button 44px, both centred on the same line.
      Headers marked data-dimau-header keep their native shared-header geometry.
   2. Page titles (h1 and hero headings) capped at 44px desktop, 32px phone.
   3. Footer: Dimau logo + "Dimau Group" at the bottom of the page
      (replaces the old small "Part of Dimau" badge).
   Opt-outs on the script tag: data-no-footer, data-no-headings.
   Inline important styles are used on purpose: they outrank every site's own
   layered stylesheet, so one file gives the same result on every codebase. */
(function () {
  if (window.__dimauConsistency) return;
  window.__dimauConsistency = 1;
  var me = document.currentScript;
  var opt = function (k) { return !!(me && me.hasAttribute(k)); };
  var BOX = 44, MARK = 36, LOGO = '/dimau-logo.png',
      LINK = 'https://dimau-fintech.com/';

  function set(el, props) {
    for (var k in props) el.style.setProperty(k, props[k], 'important');
  }
  function square(el, px) {
    set(el, { 'box-sizing': 'border-box', width: px + 'px', height: px + 'px',
      'min-width': px + 'px', 'min-height': px + 'px', 'max-width': px + 'px',
      'max-height': px + 'px', 'flex': '0 0 ' + px + 'px', 'align-self': 'center' });
  }
  function inHeader(el) {
    var b = el.getBoundingClientRect();
    return b.width > 4 && b.height > 4 && b.top < 140 && b.top > -20;
  }
  function ownsHeaderLayout(el) {
    return !!el.closest('[data-dimau-header]');
  }

  function fixLogo() {
    var img = document.querySelector('header img[data-dimau-logo], [data-dimau-header] img, img.dimau-owner-logo, header img');
    // Native adapters own both the frame and image dimensions. Inline !important
    // styles here would otherwise override their responsive stylesheet forever.
    if (img && ownsHeaderLayout(img)) return;
    if (!img || !inHeader(img) || img.closest('.dimau-group-foot')) {
      var all = [].slice.call(document.querySelectorAll('img')).filter(function (candidate) {
        return !ownsHeaderLayout(candidate) && inHeader(candidate);
      })
        .sort(function (a, b) { return a.getBoundingClientRect().left - b.getBoundingClientRect().left; });
      img = all[0];
    }
    if (!img || img.getBoundingClientRect().left > window.innerWidth / 2) return;
    var ib = img.getBoundingClientRect();
    if (ib.width > 80 || ib.height > 80) return; // a large picture, not a logo
    var p = img.parentElement, pb = p && p.getBoundingClientRect();
    var framed = p && (p.hasAttribute('data-dimau-logo-frame') || /logo-frame|logo-tile|logoFrame/.test(p.className) ||
      (p.children.length === 1 && pb.width < 72 && pb.height < 72 && Math.abs(pb.width - pb.height) < 8));
    if (framed && p.tagName !== 'A' && p.tagName !== 'HEADER') {
      square(p, BOX);
      set(p, { display: 'inline-grid', 'place-items': 'center', padding: '0', overflow: 'hidden' });
      square(img, MARK);
    } else {
      square(img, BOX);
    }
    set(img, { 'object-fit': 'contain' });
  }

  function fixMusic() {
    var els = document.querySelectorAll('[data-music-toggle], [data-shared-music], .dsm-launcher-button, [data-dimau-music-slot]');
    for (var i = 0; i < els.length; i++) {
      var m = els[i];
      if (ownsHeaderLayout(m)) continue;
      if (!inHeader(m) && !m.hasAttribute('data-dimau-music-slot')) continue;
      square(m, BOX);
      set(m, { padding: '0' });
      var inner = m.querySelector('img');
      if (inner) square(inner, BOX - 4);
    }
    var slots = document.querySelectorAll('[data-shared-music-slot]');
    for (var j = 0; j < slots.length; j++) {
      if (!ownsHeaderLayout(slots[j])) set(slots[j], { 'min-width': BOX + 'px', 'min-height': BOX + 'px' });
    }
  }

  function fixHeadings() {
    if (opt('data-no-headings')) return;
    var max = window.innerWidth < 700 ? 32 : 44;
    var hs = document.querySelectorAll('main h1, h1, [class*=homeTitle], [class*=hero] h2, [class*=hero] h3');
    for (var i = 0; i < hs.length; i++) {
      var h = hs[i];
      if (h.closest('header') && !h.closest('main')) continue;
      var fs = parseFloat(getComputedStyle(h).fontSize);
      if (fs > max) set(h, { 'font-size': max + 'px', 'line-height': '1.15' });
    }
  }

  function canScroll() {
    var hs = getComputedStyle(document.documentElement).overflowY, bs = getComputedStyle(document.body).overflowY;
    if (hs === 'hidden' || bs === 'hidden') return false;
    // App-style pages (maps, full-screen tools) fill exactly one screen; a footer added under them
    // would sit out of sight below the fold, so they get the small floating badge instead.
    return document.documentElement.scrollHeight > window.innerHeight + 4;
  }

  /* A hidden endorsement often leaves "App · " behind; take the orphaned dot with it. */
  function dropSeparator(e) {
    if (e.hasAttribute('data-dimau-sep-done')) return;
    e.setAttribute('data-dimau-sep-done', '');
    var p = e.previousSibling, n = e.nextSibling, dot = /\s*[·•]\s*$/;
    if (p && p.nodeType === 3 && dot.test(p.nodeValue)) { p.nodeValue = p.nodeValue.replace(dot, ''); return; }
    if (n && n.nodeType === 3 && /^\s*[·•]/.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(/^\s*[·•]\s*/, ' ');
  }

  function addFooter() {
    if (opt('data-no-footer')) return;
    var old = document.querySelectorAll('[data-dimau-endorsement], a, span, p, div');
    for (var i = 0; i < old.length; i++) {
      var e = old[i];
      if (e.hasAttribute('data-dimau-endorsement') ||
          (e.children.length < 3 && /^\s*Part of Dimau\s*$/i.test(e.textContent || ''))) {
        e.style.setProperty('display', 'none', 'important');
        dropSeparator(e);
      }
    }
    if (document.querySelector('[data-dimau-group-footer], .dimau-group-foot')) return;
    var f = document.createElement('footer');
    f.className = 'dimau-group-foot';
    f.setAttribute('data-dimau-group-footer', '');
    var fixed = !canScroll();
    f.style.cssText = fixed
      ? 'position:fixed;left:12px;bottom:12px;z-index:9000;display:flex;align-items:center;padding:4px 12px 4px 4px;border-radius:12px;background:rgba(238,248,255,.9);border:1px solid #cfe3f2;box-shadow:0 2px 10px rgba(11,37,64,.12)'
      : 'display:flex;justify-content:center;align-items:center;width:100%;box-sizing:border-box;padding:20px 16px 24px;margin:0;background:rgba(238,248,255,.92);border-top:1px solid #cfe3f2;position:relative;z-index:5;clear:both;grid-column:1/-1;flex:0 0 100%;align-self:stretch;order:9999';
    var s = fixed ? 32 : BOX;
    // Built with DOM calls and .style (allowed by strict security policies), not style="" in HTML,
    // which sites without 'unsafe-inline' block and report as errors.
    var a = document.createElement('a');
    a.href = LINK; a.target = '_blank'; a.rel = 'noopener'; a.setAttribute('aria-label', 'Dimau Group');
    a.style.cssText = 'display:inline-flex;align-items:center;gap:' + (fixed ? 8 : 12) + 'px;color:#0b2540;text-decoration:none;font:700 ' + (fixed ? 13 : 16) + 'px/1.2 Arial,Helvetica,sans-serif';
    var im = document.createElement('img');
    im.src = LOGO; im.alt = ''; im.width = s; im.height = s;
    im.style.cssText = 'width:' + s + 'px;height:' + s + 'px;object-fit:contain;background:#fff;border:1px solid #cfe3f2;border-radius:10px;padding:2px;box-sizing:border-box';
    a.appendChild(im); a.appendChild(document.createTextNode('Dimau Group'));
    f.appendChild(a);
    document.body.appendChild(f);
  }

  /* Floating buttons (buy button, chat bubble, sticky bars) sit over the bottom of the
     screen on phones and used to cover the footer. Measure them and leave that much
     room under the footer, so the logo and "Dimau Group" always show clear above them. */
  var lastClear = 0;
  function clearFloaters(force) {
    var now = Date.now();
    if (!force && now - lastClear < 1500) return;
    lastClear = now;
    var f = document.querySelector('[data-dimau-group-footer]');
    if (!f || f.getAttribute('data-dimau-own') === '0') return;
    var vh = window.innerHeight, vw = window.innerWidth, cover = 0, seen = [];
    var prev = f.style.visibility; f.style.visibility = 'hidden';
    var lr = (f.firstChild && f.firstChild.getBoundingClientRect) ? f.firstChild.getBoundingClientRect() : { left: 0, right: vw }, lx = lr.left, rx = lr.right;
    var xs = [16, 48, vw / 2, vw - 48, vw - 16];
    for (var y = vh - 4; y > vh * 0.55; y -= 10) {
      for (var xi = 0; xi < xs.length; xi++) {
        var stack = document.elementsFromPoint ? document.elementsFromPoint(xs[xi], y) : [];
        for (var k = 0; k < stack.length && k < 6; k++) {
          var n = stack[k];
          while (n && n !== document.body && n !== document.documentElement) {
            if (seen.indexOf(n) < 0) {
              seen.push(n);
              var cs = getComputedStyle(n);
              if (cs.position === 'fixed' || cs.position === 'sticky') {
                var r = n.getBoundingClientRect();
                if (r.height >= 4 && r.height < vh * 0.45 && (f.style.position === 'fixed' ? (r.bottom > vh - 60 || (r.right > lx - 8 && r.left < rx + 8)) : (r.bottom > vh - 60 && r.right > lx - 8 && r.left < rx + 8))) cover = Math.max(cover, vh - r.top);
              }
            }
            n = n.parentElement;
          }
        }
      }
    }
    f.style.visibility = prev;
    if (f.style.position === 'fixed') {
      f.style.bottom = (cover ? Math.round(cover + 8) : 12) + 'px';
    } else {
      f.style.paddingBottom = Math.max(24, Math.round(cover + 16)) + 'px';
    }
  }

  function run() {
    try { fixLogo(); } catch (e) {}
    try { fixMusic(); } catch (e) {}
    try { fixHeadings(); } catch (e) {}
    try { addFooter(); } catch (e) {}
    try { clearFloaters(); } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  var n = 0, t = setInterval(function () { run(); if (++n >= 10) clearInterval(t); }, 800);
  // Apps that draw new screens later (after sign-in, tab changes) get the same fixes:
  // re-run shortly after the page content changes. Only style attributes are touched,
  // and the footer is added once, so this cannot loop.
  var pending = 0;
  try {
    new MutationObserver(function () {
      if (pending) return;
      pending = setTimeout(function () { pending = 0; run(); }, 400);
    }).observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
  window.addEventListener('resize', function () { try { fixHeadings(); clearFloaters(true); } catch (e) {} });
  setTimeout(function () { try { clearFloaters(true); } catch (e) {} }, 12000);
})();

/* Dimau owner pass (app side).
   Opened from the Ops Room (preview frame or a tab opened from it), this signs
   the owner in automatically. It accepts codes ONLY from the Ops Room itself,
   and only asks for a database this app actually signs in with, when nobody is
   signed in there yet. Each code works once and expires quickly. */
(function () {
  var OPS = 'https://dimau-ops.vercel.app';
  var DBS = {
    xnxmumbvgtmlpenutlii: 'sb_publishable_WFJ3jKwImNhGdTdrS9W6mg_3CUSUYIM',
    aqfzpaczyodhugsgqvxi: 'sb_publishable_DvpX2PSuPtxE3IqWUlRZfQ_YP2qLZtF'
  };
  if (location.origin === OPS || location.protocol !== 'https:') return;
  var framed = false, host = null;
  try { framed = window.parent !== window; host = framed ? window.parent : (window.opener || null); } catch (e) { host = null; }
  if (!host) return;
  function dbg(m) { try { host.postMessage({ type: 'dimau-owner-pass:debug', msg: m }, OPS); } catch (e) {} }
  var tries = 0;
  try { tries = parseInt(sessionStorage.getItem('dimau-owner-pass-tries') || '0', 10) || 0; } catch (e) { dbg('storage-blocked'); return; }
  if (tries >= 2) { dbg('gave-up'); return; }
  dbg('start');

  function storeKey(ref) { return 'sb-' + ref + '-auth-token'; }
  function hasSession(ref) {
    try {
      var cur = JSON.parse(localStorage.getItem(storeKey(ref)) || 'null');
      return !!(cur && (cur.refresh_token || ((cur.expires_at || 0) * 1000 > Date.now() + 60000)));
    } catch (e) { return true; }
  }
  function findRefs() {
    var refs = Object.keys(DBS), texts = [];
    try { texts.push(document.documentElement.innerHTML); } catch (e) {}
    try {
      var res = performance.getEntriesByType ? performance.getEntriesByType('resource') : [];
      for (var i = 0; i < res.length; i++) texts.push(String(res[i].name));
    } catch (e) {}
    var srcs = [].slice.call(document.scripts).map(function (s) { return s.src; })
      .filter(function (u) { return u && u.indexOf(location.origin) === 0; }).slice(0, 40);
    return Promise.all(srcs.map(function (u) {
      return fetch(u, { cache: 'force-cache' }).then(function (r) { return r.text(); }).catch(function () { return ''; });
    })).then(function (more) {
      var all = texts.concat(more).join('\n');
      return refs.filter(function (r) { return all.indexOf(r) !== -1; });
    });
  }
  function b64url(s) {
    return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function writeCookies(ref, sess) {
    var name = storeKey(ref), v = 'base64-' + b64url(JSON.stringify(sess));
    var attrs = '; path=/; max-age=34560000; ' + (framed ? 'SameSite=None; Secure; Partitioned' : 'SameSite=Lax; Secure');
    var size = 3180;
    if (v.length <= size) { document.cookie = name + '=' + v + attrs; return; }
    for (var i = 0; i * size < v.length; i++) document.cookie = name + '.' + i + '=' + v.slice(i * size, (i + 1) * size) + attrs;
  }

  var pending = {}, signedIn = false, finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    if (!signedIn) return;
    try { sessionStorage.setItem('dimau-owner-pass-tries', String(tries + 1)); } catch (e) {}
    location.reload();
  }
  function settle(ref) {
    delete pending[ref];
    if (!Object.keys(pending).length) finish();
  }

  window.addEventListener('message', function (ev) {
    if (ev.origin !== OPS) return;
    var d = ev.data;
    if (!d || d.type !== 'dimau-owner-pass:pass' || !d.token_hash || !pending[d.project]) return;
    var ref = d.project;
    fetch('https://' + ref + '.supabase.co/auth/v1/verify', {
      method: 'POST',
      headers: { apikey: DBS[ref], 'content-type': 'application/json' },
      body: JSON.stringify({ type: d.kind || 'magiclink', token_hash: d.token_hash })
    }).then(function (r) { return r.ok ? r.json() : null; }).then(function (s) {
      if (s && s.access_token) {
        if (!s.expires_at) s.expires_at = Math.floor(Date.now() / 1000) + (s.expires_in || 3600);
        try { localStorage.setItem(storeKey(ref), JSON.stringify(s)); signedIn = true; } catch (e) {}
        try { if (window.__NEXT_DATA__ || self.__next_f) writeCookies(ref, s); } catch (e) {}
      }
      settle(ref);
    }).catch(function () { settle(ref); });
  });

  setTimeout(function () {
    findRefs().then(function (refs) {
      dbg('found:' + refs.join(','));
      refs = refs.filter(function (r) { return !hasSession(r); });
      dbg('asking:' + refs.join(','));
      if (!refs.length) return;
      refs.forEach(function (r) {
        pending[r] = true;
        try { host.postMessage({ type: 'dimau-owner-pass:ready', project: r }, OPS); } catch (e) {}
      });
      setTimeout(finish, 10000);
    });
  }, 2500);
})();
