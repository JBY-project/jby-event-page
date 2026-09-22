(function () {
  'use strict';

  var root = document.getElementById('jbs');
  if (!root) return;

  var input = document.getElementById('jbs-input');
  var drop = document.getElementById('jbs-drop');
  var closeB = document.getElementById('jbs-close');
  var countE = document.getElementById('jbs-count');
  var openB = document.getElementById('searchToggle');
  if (!input || !drop || !openB) return;

  var autocompleteUrl = root.getAttribute('data-autocomplete') || '/search/autocomplete';
  var resultsUrl = root.getAttribute('data-results') || '/search';
  var RECENT_KEY = 'jby_recent_searches';
  var ICO = {
    chevron:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
  };

  var QUICK = [
    { t: 'Yachts for sale', u: '/yachts' },
    { t: 'Our locations', u: '/locations' },
    { t: 'Our team', u: '/our-team' },
    { t: 'Contact us', u: '/contact' },
  ];

  var picked = [];
  var rows = [];
  var sel = -1;
  var lastFocus = null;
  var debounce = null;
  var lastHits = [];
  var seq = 0;

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getRecent() {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]').slice(0, 6);
    } catch (e) {
      return [];
    }
  }

  function pushRecent(q) {
    q = (q || '').trim();
    if (q.length < 2) return;
    try {
      var r = getRecent().filter(function (x) {
        return x.toLowerCase() !== q.toLowerCase();
      });
      r.unshift(q);
      localStorage.setItem(RECENT_KEY, JSON.stringify(r.slice(0, 6)));
    } catch (e) {}
  }

  function dropRecent(q) {
    try {
      localStorage.setItem(
        RECENT_KEY,
        JSON.stringify(
          getRecent().filter(function (x) {
            return x !== q;
          })
        )
      );
    } catch (e) {}
  }

  function chips(list, removable) {
    return (
      '<div class="jbs-chips">' +
      list
        .map(function (q) {
          return (
            '<button type="button" class="jbs-chip" data-q="' +
            esc(q) +
            '">' +
            esc(q) +
            (removable
              ? '<span class="x" data-drop="' + esc(q) + '" role="button" aria-label="Remove">&times;</span>'
              : '') +
            '</button>'
          );
        })
        .join('') +
      '</div>'
    );
  }

  function quickLinks() {
    return (
      '<section class="jbs-sec"><h2 class="jbs-lbl">Quick links</h2><div class="jbs-quick">' +
      QUICK.map(function (q) {
        return (
          '<a href="' +
          esc(q.u) +
          '"><span class="t">' +
          esc(q.t) +
          '</span><span class="ar">' +
          ICO.chevron +
          '</span></a>'
        );
      }).join('') +
      '</div></section>'
    );
  }

  function renderIdle() {
    var recent = getRecent();
    var html = '';
    if (recent.length) {
      html +=
        '<section class="jbs-sec"><h2 class="jbs-lbl">Recent searches</h2>' +
        chips(recent, true) +
        '</section>';
    }
    html += quickLinks();
    drop.innerHTML = html;
    countE.textContent = '';
    rows = [];
    sel = -1;
  }

  function isPicked(n) {
    return picked.indexOf(n) > -1;
  }

  function resultRow(it) {
    var pic = it.logo || it.image;
    var thumb = pic
      ? '<span class="thumb' + (it.logo ? ' logo' : '') + '" style="background-image:url(\'' + esc(pic) + '\')"></span>'
      : '<span class="thumb"></span>';
    var sub = it.type_label || '';
    var isBrand = it.kind === 'brand';
    var on = isBrand && isPicked(it.title);
    var tail = on ? '<span class="tail" aria-hidden="true">&times;</span>' : '';

    return (
      '<a class="jbs-res' +
      (pic ? '' : ' bare') +
      (on ? ' pick has-tail' : '') +
      '" href="' +
      esc(it.url) +
      '"' +
      (isBrand ? ' data-pick="' + esc(it.title) + '"' : '') +
      (on ? ' aria-pressed="true"' : '') +
      '>' +
      thumb +
      '<span class="txt"><span class="t">' +
      esc(it.title) +
      '</span>' +
      (sub ? '<span class="d">' + esc(sub) + '</span>' : '') +
      '</span>' +
      tail +
      '</a>'
    );
  }

  function renderResults(hits, q) {
    if (!hits.length) {
      drop.innerHTML =
        '<div class="jbs-none"><h3>' +
        (q.trim() ? 'No matches for &ldquo;' + esc(q) + '&rdquo;' : 'Nothing to show yet') +
        '</h3>' +
        '<p>Try a builder, a model, a city or a service.</p></div>' +
        quickLinks();
      countE.textContent = 'No results';
      rows = [];
      sel = -1;
      return;
    }

    var html = hits.map(resultRow).join('');
    html +=
      '<button type="button" class="jbs-seeall" data-seeall>See all results' + ICO.chevron + '</button>';
    drop.innerHTML = html;
    countE.textContent = hits.length + (hits.length === 1 ? ' result' : ' results');
    drop.scrollTop = 0;
    rows = Array.prototype.slice.call(drop.querySelectorAll('.jbs-res'));
    sel = -1;
  }

  function run() {
    var q = input.value.trim();
    if (!q && !picked.length) {
      renderIdle();
      return;
    }
    var n = ++seq;
    var url = autocompleteUrl + '?q=' + encodeURIComponent(q);
    if (picked.length) url += '&brand=' + encodeURIComponent(picked[0]);
    fetch(url, { headers: { Accept: 'application/json' } })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (n !== seq) return;
        lastHits = data.results || [];
        renderResults(lastHits, q);
      })
      .catch(function () {
        if (n !== seq) return;
        renderResults([], q);
      });
  }

  function isOpen() {
    return root.classList.contains('open');
  }

  function closeOthers() {
    var mega = document.getElementById('headerV2MenuToggle');
    if (mega && mega.getAttribute('aria-expanded') === 'true') mega.click();
    var mobile = document.getElementById('mobileMenu');
    if (mobile) mobile.classList.add('hidden');
  }

  function headerNodes() {
    return document.querySelectorAll('.header-nav-root, #headerV2Mega');
  }

  function open(seed) {
    if (isOpen()) {
      input.focus();
      return;
    }
    closeOthers();
    lastFocus = document.activeElement;
    root.hidden = false;
    root.style.setProperty('--jbs-top', openB.getBoundingClientRect().top + 'px');
    void root.offsetHeight;
    root.classList.add('open');
    document.body.classList.add('jbs-lock');
    headerNodes().forEach(function (n) {
      n.classList.add('jbs-away');
    });
    picked = [];
    input.value = seed || '';
    renderIdle();
    if (input.value.trim()) run();
    syncCloseLabel();
    setTimeout(function () {
      input.focus();
      input.select();
    }, 60);
  }

  function close() {
    if (!isOpen()) return;
    pushRecent(input.value);
    root.classList.remove('open');
    document.body.classList.remove('jbs-lock');
    headerNodes().forEach(function (n) {
      n.classList.remove('jbs-away');
    });
    setTimeout(function () {
      if (!isOpen()) root.hidden = true;
    }, 420);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function goResultsPage() {
    pushRecent(input.value);
    var qs = [];
    if (input.value.trim()) qs.push('q=' + encodeURIComponent(input.value.trim()));
    if (picked.length) qs.push('brand=' + encodeURIComponent(picked[0]));
    window.location.href = resultsUrl + (qs.length ? '?' + qs.join('&') : '');
  }

  function go(a) {
    if (a.hasAttribute('data-pick')) {
      var name = a.getAttribute('data-pick');
      picked = isPicked(name) ? [] : [name];
      run();
      return;
    }
    var href = a.getAttribute('href');
    pushRecent(input.value);
    if (!href) return;
    window.location.href = href;
  }

  function syncCloseLabel() {
    var clearing = !!(input.value || picked.length);
    closeB.setAttribute('aria-label', clearing ? 'Clear search' : 'Close search');
  }

  function setSel(i, noScroll) {
    if (!rows.length) return;
    if (sel > -1 && rows[sel]) rows[sel].classList.remove('sel');
    sel = (i + rows.length) % rows.length;
    var r = rows[sel];
    r.classList.add('sel');
    if (noScroll) return;
    var rb = r.getBoundingClientRect();
    var db = drop.getBoundingClientRect();
    if (rb.top < db.top + 8) drop.scrollTop += rb.top - db.top - 8;
    else if (rb.bottom > db.bottom) drop.scrollTop += rb.bottom - db.bottom + 8;
  }

  openB.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (isOpen()) close();
    else open('');
  });

  closeB.addEventListener('click', function () {
    if (input.value || picked.length) {
      input.value = '';
      picked = [];
      renderIdle();
      input.focus();
      syncCloseLabel();
    } else {
      close();
    }
  });

  var scrim = root.querySelector('[data-jbs-close]');
  if (scrim) scrim.addEventListener('click', close);

  input.addEventListener('input', function () {
    syncCloseLabel();
    clearTimeout(debounce);
    debounce = setTimeout(run, 90);
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSel(sel + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSel(sel - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (sel > -1 && rows[sel]) go(rows[sel]);
      else if (input.value.trim() || picked.length) goResultsPage();
    }
  });

  drop.addEventListener('click', function (e) {
    var d = e.target.closest('[data-drop]');
    if (d) {
      e.preventDefault();
      e.stopPropagation();
      dropRecent(d.getAttribute('data-drop'));
      renderIdle();
      return;
    }
    if (e.target.closest('[data-seeall]')) {
      e.preventDefault();
      goResultsPage();
      return;
    }
    var c = e.target.closest('[data-q]');
    if (c) {
      e.preventDefault();
      input.value = c.getAttribute('data-q');
      syncCloseLabel();
      run();
      input.focus();
      return;
    }
    var r = e.target.closest('.jbs-res, .jbs-quick a');
    if (r) {
      e.preventDefault();
      go(r);
    }
  });

  drop.addEventListener('mousemove', function (e) {
    var r = e.target.closest('.jbs-res');
    if (r) {
      var i = rows.indexOf(r);
      if (i > -1 && i !== sel) setSel(i, true);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) {
      e.preventDefault();
      close();
      return;
    }
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      if (isOpen()) close();
      else open('');
    }
  });

  root.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var f = root.querySelectorAll('input, button, a[href]');
    if (!f.length) return;
    var first = f[0];
    var last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
})();
