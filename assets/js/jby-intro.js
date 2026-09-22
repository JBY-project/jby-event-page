(function () {
  'use strict';

  var ROOT = document.documentElement;
  var params = new URLSearchParams(location.search);
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LOGO = 'assets/img/jby-home-v2/jby_logo.svg';
  var TEXT = 'JEFF BROWN YACHTS';

  if (params.has('nointro')) {
    ROOT.classList.remove('jby-intro-lock');
    return;
  }

  ROOT.classList.add('jby-intro-lock');

  var slow = params.get('intro') === 'slow';

  var TEMPLATE =
    '<div id="jby-intro-bg"></div>' +
    '<div id="jby-intro-stage">' +
      '<div id="jby-intro-mark"><img src="' + LOGO + '" alt=""></div>' +
      '<div id="jby-intro-word"></div>' +
    '</div>';

  function visibleRect(el) {
    if (!el) return null;
    var r = el.getBoundingClientRect();
    if (r.width >= 8 && r.height >= 8) return r;
    return null;
  }

  function logoTarget() {
    var v2 = document.querySelector('header.header-v2');
    if (v2) {
      return (
        v2.querySelector('[data-intro-logo]') ||
        v2.querySelector('.header-v2__logo-image') ||
        v2.querySelector('.header-v2__logo')
      );
    }

    var v1 = document.querySelector('header.header-home') || document.querySelector('header.header-nav-root');
    if (v1) {
      return (
        v1.querySelector('[data-intro-logo]') ||
        v1.querySelector('a.logo img') ||
        v1.querySelector('a.logo')
      );
    }

    return document.querySelector('[data-intro-logo]');
  }

  function logoRect() {
    var el = logoTarget();
    var r = visibleRect(el);
    if (r) return { el: el, rect: r };
    if (el && el.parentElement) {
      r = visibleRect(el.parentElement);
      if (r) return { el: el.parentElement, rect: r };
    }
    return null;
  }

  function whenReady(cb) {
    var run = function () {
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(cb);
      });
    };

    if (document.readyState === 'complete') {
      run();
      return;
    }

    var done = false;
    var finish = function () {
      if (done) return;
      done = true;
      run();
    };
    window.addEventListener('load', finish);
    window.setTimeout(finish, 8000);
  }

  function play(k) {
    k = Math.max(1, k || 1);

    var intro = document.getElementById('jby-intro');
    if (!intro) {
      intro = document.createElement('div');
      intro.id = 'jby-intro';
      intro.setAttribute('aria-hidden', 'true');
      document.body.insertBefore(intro, document.body.firstChild);
    }

    intro.className = k > 1 ? 'is-slow' : '';
    intro.innerHTML = TEMPLATE;
    intro.style.animationDelay = 12 * k + 's';
    intro.style.setProperty('--fly', (0.75 * k).toFixed(2) + 's');
    ROOT.classList.add('jby-intro-lock', 'jby-intro-ready');

    var mark = document.getElementById('jby-intro-mark');
    var word = document.getElementById('jby-intro-word');
    var step = window.innerWidth <= 780 ? 15 : 34;
    var mid = (TEXT.length - 1) / 2;

    Array.prototype.forEach.call(TEXT, function (ch, i) {
      var el = document.createElement('i');
      if (ch === ' ') {
        el.className = 'sp';
      } else {
        el.textContent = ch;
      }
      el.style.setProperty('--dx', ((i - mid) * step).toFixed(2) + 'px');
      word.appendChild(el);
    });

    window.scrollTo(0, 0);

    var T = reduce
      ? { go: 20, markIn: 40, lift: 620 }
      : { go: 30, markIn: 950 * k, lift: 1750 * k };

    window.setTimeout(function () {
      intro.classList.add('is-go');
    }, T.go);

    window.setTimeout(function () {
      intro.classList.add('is-mark-in');
    }, T.markIn);

    window.setTimeout(function () {
      whenReady(function () {
        intro.classList.add('is-lift');
        window.requestAnimationFrame(function () {
          var hit = logoRect();
          if (hit && mark) {
            var from = mark.getBoundingClientRect();
            var to = hit.rect;
            if (from.width && to.width) {
              var s = Math.min(to.width / from.width, to.height / from.height);
              var dx = to.left + to.width / 2 - (from.left + from.width / 2);
              var dy = to.top + to.height / 2 - (from.top + from.height / 2);
              mark.style.transform =
                'translate(' + dx.toFixed(2) + 'px,' + dy.toFixed(2) + 'px) scale(' + s.toFixed(4) + ')';
            }
          }
          window.setTimeout(finish, reduce ? 350 : 750 * k);
        });
      });
    }, T.lift);

    function finish() {
      ROOT.classList.remove('jby-intro-lock', 'jby-intro-ready');
      if (intro.parentNode) {
        intro.remove();
      }
    }
  }

  window.jbyReplayIntro = function (k) {
    play(Math.max(1, +k || 1));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      play(slow ? 3 : 1);
    });
  } else {
    play(slow ? 3 : 1);
  }

  window.setTimeout(function () {
    ROOT.classList.remove('jby-intro-lock', 'jby-intro-ready');
  }, 20000);
})();
