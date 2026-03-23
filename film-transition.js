/* ─── Film Strip Wipe — Page Transition ──────────────────────────────────────
   Visual: the whole screen is a film frame. On exit, the frame slides UP and
   off the projector gate (new frame advances from below). On enter, the frame
   settles into place from below, then the strip retracts upward to reveal the
   new page. Sprocket holes glow gold on both edges.
──────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ── Sprocket-hole tile ────────────────────────────────────────────────── */
  // 56×34px repeating tile: dark film base + warm gold rounded rectangle
  // (simulates light from the projector lamp showing through the hole)
  const SW = 56, PH = 34;        // strip width, pitch height
  const HX = 11, HY = 7;        // hole offset x, y within tile
  const HW = 34, HH = 20, HR=3; // hole width, height, corner radius
  const tile =
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + SW + '" height="' + PH + '">' +
    '<rect width="'  + SW + '" height="' + PH + '" fill="#0b0b0b"/>' +
    '<rect x="' + HX + '" y="' + HY + '" width="' + HW + '" height="' + HH +
    '" rx="' + HR + '" fill="#c9a84c" opacity="0.22"/>' +
    '</svg>';
  const stripBg = 'url("data:image/svg+xml,' + encodeURIComponent(tile) + '")';

  /* ── Styles ────────────────────────────────────────────────────────────── */
  const styleEl = document.createElement('style');
  styleEl.textContent = [
    /* suppress old flash divs on every page */
    '#flash { display:none !important; }',

    '#film-wipe {',
    '  position: fixed; inset: 0;',
    '  z-index: 99999;',
    '  pointer-events: none;',
    '  display: flex; flex-direction: row;',
    '  will-change: transform;',
    '}',

    /* left + right film strips */
    '.fw-strip {',
    '  flex-shrink: 0;',
    '  width: ' + SW + 'px;',
    '  height: 100%;',
    '  background: ' + stripBg + ' repeat-y 0 0 / ' + SW + 'px ' + PH + 'px;',
    '}',

    /* dark film base between the strips */
    '.fw-mid {',
    '  flex: 1; height: 100%;',
    '  background: #0d0d0d;',
    '  border-left:  1px solid rgba(255,255,255,0.035);',
    '  border-right: 1px solid rgba(255,255,255,0.035);',
    '}',

    /* frame-edge lines — thin scratch marks at top + bottom of the overlay */
    '#film-wipe::before, #film-wipe::after {',
    '  content: "";',
    '  position: absolute; left: 0; right: 0; height: 2px;',
    '  background: rgba(201,168,76,0.18);',
    '  pointer-events: none; z-index: 1;',
    '}',
    '#film-wipe::before { top: 0; }',
    '#film-wipe::after  { bottom: 0; }',

    /* EXIT — strip rises from below to cover current page */
    '@keyframes fw-cover {',
    '  from { transform: translateY(101vh); }',
    '  to   { transform: translateY(0);     }',
    '}',

    /* ENTER — strip rises upward to reveal new page */
    '@keyframes fw-reveal {',
    '  from { transform: translateY(0);      }',
    '  to   { transform: translateY(-101vh); }',
    '}',

    '#film-wipe.fw-covering {',
    '  animation: fw-cover 0.38s cubic-bezier(0.72, 0, 0.92, 0.48) forwards;',
    '}',
    '#film-wipe.fw-revealing {',
    '  animation: fw-reveal 0.54s cubic-bezier(0.08, 0.82, 0.32, 1) forwards;',
    '}'
  ].join('\n');
  document.head.appendChild(styleEl);

  /* ── Overlay DOM ───────────────────────────────────────────────────────── */
  const overlay = document.createElement('div');
  overlay.id = 'film-wipe';
  overlay.innerHTML =
    '<div class="fw-strip"></div>' +
    '<div class="fw-mid"></div>'   +
    '<div class="fw-strip"></div>';

  /* ── Boot: append + kick off ENTER reveal ─────────────────────────────── */
  function boot() {
    /* Start covering (translateY 0) so new page is hidden until reveal */
    overlay.style.transform = 'translateY(0)';
    document.body.appendChild(overlay);

    /* Two rAFs ensure the covering state is painted before animation starts */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.style.transform = '';
        overlay.classList.add('fw-revealing');
      });
    });
  }

  if (document.body) { boot(); }
  else { document.addEventListener('DOMContentLoaded', boot); }

  /* ── Intercept nav clicks → EXIT then navigate ─────────────────────────── */
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href
      || href.startsWith('#')
      || href.startsWith('mailto')
      || href.startsWith('tel')
      || href.startsWith('http')
      || href.startsWith('//')
      || link.target === '_blank') return;

    e.preventDefault();
    e.stopPropagation();

    /* Reset: place strip below screen, kill any running animation */
    overlay.classList.remove('fw-revealing', 'fw-covering');
    overlay.style.animation  = 'none';
    overlay.style.transform  = 'translateY(101vh)';
    void overlay.offsetHeight; /* force reflow so reset is committed */
    overlay.style.animation  = '';

    /* Trigger EXIT — film rises to cover current page */
    overlay.classList.add('fw-covering');

    overlay.addEventListener('animationend', function () {
      window.location.href = href;
    }, { once: true });

  }, true /* capture: fires before any other click handlers */);

})();
