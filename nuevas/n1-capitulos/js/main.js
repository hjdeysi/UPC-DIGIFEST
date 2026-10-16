/* DIGIFEST 2026 · Capítulos de color */
(() => {
  /* Scroll suave (Lenis respeta prefers-reduced-motion y scroll-margin-top). */
  if (window.Lenis) new window.Lenis({ autoRaf: true, anchors: true });

  /* Movimiento distintivo, una sola regla: el header fijo toma el color del capítulo
     que pasa por debajo. Cada color es una capa; solo cambia su opacity (240 ms, ease-out).
     Con reduced-motion la transición es none en CSS: el cambio es instantáneo. */
  const header = document.querySelector('.hdr');
  const layers = header ? [...header.querySelectorAll('.hdr-layers [data-c]')] : [];
  const INK = { claro: 'dark', blanco: 'dark', rojo: 'light', negro: 'light', plomo: 'light' };
  const spy = [...document.querySelectorAll('[data-spy]')];
  const zones = [...document.querySelectorAll('main [data-c], footer[data-c]')];
  let current = 'claro';
  let currentId = '';

  function setChapter(el) {
    const c = el.dataset.c;
    if (c !== current) {
      current = c;
      layers.forEach((l) => l.classList.toggle('is-on', l.dataset.c === c));
      header.dataset.ink = INK[c] || 'dark';
    }
    if (el.id !== currentId) {
      currentId = el.id;
      spy.forEach((a) => {
        if (a.dataset.spy === currentId) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }
  }

  let io;
  function observe() {
    if (!header) return;
    io?.disconnect();
    const h = header.getBoundingClientRect().height;
    // Línea de 1 px justo bajo el borde inferior del header.
    const bottom = Math.max(0, window.innerHeight - h - 1);
    io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setChapter(e.target); });
    }, { rootMargin: `-${Math.round(h)}px 0px -${Math.round(bottom)}px 0px` });
    zones.forEach((z) => io.observe(z));
  }
  observe();
  let t;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(observe, 150); }, { passive: true });

  /* Fotos de speakers: ocultas hasta que cargan; si fallan, queda la lista tipográfica. */
  document.querySelectorAll('.sp-photo').forEach((img) => {
    const li = img.closest('.sp');
    const ok = () => li.classList.add('has-photo');
    const fail = () => li.classList.remove('has-photo');
    if (img.complete) { if (img.naturalWidth > 0) ok(); else if (img.currentSrc) fail(); }
    img.addEventListener('load', ok);
    img.addEventListener('error', fail);
  });
})();
