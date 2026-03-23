/* ─── Film Strip Wipe Transition ─────────────────────────────────────────────
   Page transitions that look like a film strip advancing through a projector.
   - EXIT : strip slides up from below, covers current page, then navigates.
   - ENTER: strip starts covering, slides up to reveal new page.
   Suppresses any existing #flash div automatically.
──────────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── Sprocket hole SVG tile (data URI) ─────────────────────────────────── */
  // 52 × 30px tile: dark film base with one transparent rounded hole cut out.
  // SVG mask technique: white = show, black = cut hole → true transparency.
  const TILE_W = 52, TILE_H = 30;
  const H_X = 10, H_Y = 6, H_W = 32, H_H = 18, H_RX = 3;
  const svgTile = [
    `<svg xmlns='http://www.w3.org/2000/svg' width='${TILE_W}' height='${TILE_H}'>`,
    `<defs><mask id='h'>`,
    `<rect width='${TILE_W}' height='${TILE_H}' fill='white'/>`,
    `<rect x='${H_X}' y='${H_Y}' width='${H_W}' height='${H_H}' rx='${H_RX}' fill='black'/>`,
    `</mask></defs>`,
    `<rect width='${TILE_W}' height='${TILE_H}' fill='%230a0a0a' mask='url(%23h)'/>`,
    `</svg>`
  ].join('');
  const stripBgUrl = `url("data:image/svg+xml,${svgTile}")`;

  /* ── Inject styles ─────────────────────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    /* Kill existing flash divs on all pages */
    #flash { display: none !important; }

    #film-wipe {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      z-index: 99999;
      pointer-events: none;
      display: flex;
      flex-direction: row;
      /* Starts covering the screen (translateY 0).
         JS will immediately kick off the reveal animation on load. */
      transform: translateY(0);
    }

    /* Left & right sprocket-hole strips */
    .fw-strip {
      flex-shrink: 0;
      width: ${TILE_W}px;
      height: 100%;
      background-color: transparent;        /* lets page content show through holes */
      background-image: ${stripBgUrl};
      background-repeat: repeat-y;
      background-size: ${TILE_W}px ${TILE_H}px;
    }

    /* Dark film base between the strips (covers main page content) */
    .fw-mid {
      flex: 1;
      height: 100%;
      background: #0d0d0d;
    }

    /* ── Animations ── */
    @keyframes fw-cover {
      from { transform: translateY(101%); }
      to   { transform: translateY(0);    }
    }
    @keyframes fw-reveal {
      from { transform: translateY(0);     }
      to   { transform: translateY(-101%); }
    }

    /* EXIT: film slides up from below to cover current page */
    #film-wipe.fw-covering {
      animation: fw-cover 0.30s cubic-bezier(0.55, 0, 1, 1) forwards;
    }
    /* ENTER: film slides up off screen to reveal new page */
    #film-wipe.fw-revealing {
      animation: fw-reveal 0.46s cubic-bezier(0, 0, 0.38, 1) forwards;
    }
  `;
  document.head.appendChild(style);

  /* ── Create overlay DOM ───────────────────────────────────────────────── */
  const overlay = document.createElement('div');
  overlay.id = 'film-wipe';
  overlay.innerHTML = `
    <div class="fw-strip"></div>
    <div class="fw-mid"></div>
    <div class="fw-strip"></div>
  `;

  function boot() {
    document.body.appendChild(overlay);

    /* Kick off ENTER animation: film slides up off screen to reveal this page */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.classList.add('fw-revealing');
      });
    });
  }

  if (document.body) {
    boot();
  } else {
    document.addEventListener('DOMContentLoaded', boot);
  }

  /* ── Intercept nav clicks → EXIT animation ───────────────────────────── */
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');

    // Only intercept same-origin page links
    if (!href
        || href.startsWith('#')
        || href.startsWith('mailto')
        || href.startsWith('tel')
        || href.startsWith('http')
        || href.startsWith('//')
        || link.target === '_blank') return;

    e.preventDefault();
    e.stopPropagation();

    /* Reset overlay: place below screen, no animation classes */
    overlay.classList.remove('fw-revealing', 'fw-covering');
    overlay.style.animation = 'none';
    overlay.style.transform = 'translateY(101%)';
    void overlay.offsetHeight; // force reflow

    /* Let CSS animations take over again */
    overlay.style.animation  = '';
    overlay.style.transform  = '';

    /* Trigger EXIT animation */
    overlay.classList.add('fw-covering');

    overlay.addEventListener('animationend', function handler() {
      overlay.removeEventListener('animationend', handler);
      window.location.href = href;
    }, { once: true });

  }, true /* capture phase so we beat any other click handlers */);

})();
