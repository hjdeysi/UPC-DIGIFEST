(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Scroll suave (Lenis respeta prefers-reduced-motion por defecto) */
  if (window.Lenis && !reduce) new window.Lenis({ autoRaf: true, anchors: true });

  /* Separadores: una fila de píxeles que se dispersa hacia la derecha (determinista, múltiplos de 8) */
  document.querySelectorAll('.sep').forEach((sep) => {
    for (let i = 0; i < 40; i++) {
      const px = document.createElement('i');
      const gap = i < 12 ? 0 : 8 * Math.floor(((i - 11) * (i - 11)) / 6);
      px.style.marginLeft = gap + 'px';
      if (i >= 16) px.className = 'g';
      if (i >= 26) px.className = 'l';
      sep.append(px);
    }
  });

  /* Del 16 al 21: un día abierto a la vez (acordeón con grid-template-rows) */
  const days = [...document.querySelectorAll('.day')];
  function openDay(btn) {
    days.forEach((d) => {
      const open = d === btn && d.getAttribute('aria-expanded') !== 'true';
      d.setAttribute('aria-expanded', String(open));
      document.getElementById(d.getAttribute('aria-controls'))?.classList.toggle('is-open', open);
    });
  }
  days.forEach((d) => d.addEventListener('click', () => openDay(d)));

  /* Monogramas de píxeles: iniciales en una retícula de 5 × 7 (mapa de bits fijo por letra) */
  const FONT = {
    A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
    B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
    C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
    D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
    E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
    F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
    G: ['01111', '10000', '10000', '10011', '10001', '10001', '01111'],
    H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
    I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
    J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
    K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
    L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
    M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
    N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
    O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
    P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
    Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
    R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
    S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
    T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
    U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
    V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
    W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
    X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
    Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
    Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  };
  const NS = 'http://www.w3.org/2000/svg';
  document.querySelectorAll('.mono[data-initials]').forEach((fig) => {
    const letters = [...fig.dataset.initials.toUpperCase()].filter((l) => FONT[l]);
    const cols = letters.length * 5 + (letters.length - 1); // 1 columna de aire entre letras
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${cols} 7`);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('shape-rendering', 'crispEdges');
    letters.forEach((l, k) => FONT[l].forEach((row, y) => [...row].forEach((bit, x) => {
      if (bit !== '1') return;
      const r = document.createElementNS(NS, 'rect');
      r.setAttribute('x', k * 6 + x); r.setAttribute('y', y); r.setAttribute('width', 1); r.setAttribute('height', 1);
      svg.append(r);
    })));
    fig.prepend(svg);

    /* Foto real si existe; si no, queda el monograma */
    const img = fig.querySelector('img');
    if (!img) return;
    const ok = () => fig.classList.add('has-photo');
    const ko = () => img.remove();
    if (img.complete) { img.naturalWidth > 0 ? ok() : ko(); }
    img.addEventListener('load', ok, { once: true });
    img.addEventListener('error', ko, { once: true });
  });

  /* Programa: filtro por formato; el indicador de la pestaña activa es un píxel */
  const tabs = [...document.querySelectorAll('.tabs [role="tab"]')];
  const rows = [...document.querySelectorAll('.program-list li')];
  function band() { rows.filter((r) => !r.hidden).forEach((r, i) => r.classList.toggle('band', i % 2 === 0)); }
  function select(tab, focus) {
    tabs.forEach((t) => { const on = t === tab; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
    rows.forEach((r) => { r.hidden = tab.dataset.f !== 'all' && r.dataset.f !== tab.dataset.f; });
    band();
    if (focus) tab.focus();
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      select(tabs[(i + step + tabs.length) % tabs.length], true);
    });
  });
  band();
})();
