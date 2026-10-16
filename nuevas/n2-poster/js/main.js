/* DIGIFEST 2026 · Póster fijo
   Un solo movimiento distintivo: mientras DIGI / FEST quedan fijos, cada día entra con su foto
   (clip-path 560 ms ease-out, una vez por panel) y el título fijo marca el día activo. */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Scroll suave (no se activa con movimiento reducido) */
  if (window.Lenis && !reduce.matches) {
    new window.Lenis({ autoRaf: true, anchors: true });
  }

  /* ---------- Días: foto que aparece una vez + día activo en el título fijo ---------- */
  const days = [...document.querySelectorAll('.day')];
  const intro = document.querySelector('.intro');
  const dayMain = document.querySelector('.pin-day-main');
  const daySub = document.querySelector('.pin-day-sub');
  const barDay = document.querySelector('.bar-day');
  const dayLinks = [...document.querySelectorAll('.pin-days a')];
  const DEFAULT = { main: '2026', sub: '16–21 NOV', bar: '16–21 NOV' };
  let current = null;

  function setActive(section) {
    const key = section ? section.dataset.day : 'intro';
    if (key === current) return;
    current = key;
    const main = section ? section.dataset.label : DEFAULT.main;
    const sub = section ? section.dataset.state : DEFAULT.sub;
    if (dayMain) dayMain.textContent = main;
    if (daySub) daySub.textContent = sub;
    if (barDay) barDay.textContent = section ? section.dataset.label : DEFAULT.bar;
    dayLinks.forEach((a) => {
      if (section && a.dataset.day === section.dataset.day) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    const pinDay = document.querySelector('.pin-day');
    if (pinDay && !reduce.matches && pinDay.animate) {
      pinDay.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
    }
  }

  const photos = days.map((d) => d.querySelector('.day-photo')).filter(Boolean);

  if ('IntersectionObserver' in window) {
    // La foto entra una sola vez, cuando un tercio del marco ya está a la vista.
    const photoObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    photos.forEach((p) => photoObserver.observe(p));

    // El día activo es el que cruza la franja central de la pantalla.
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        setActive(entry.target === intro ? null : entry.target);
      });
    }, { rootMargin: '-48% 0px -48% 0px' });
    if (intro) spy.observe(intro);
    days.forEach((d) => spy.observe(d));

    // Al salir del pinned run por abajo, el título vuelve al estado general.
    const after = document.querySelector('#speakers');
    if (after) {
      new IntersectionObserver((entries) => {
        entries.forEach((entry) => { if (entry.isIntersecting) setActive(null); });
      }, { rootMargin: '-48% 0px -48% 0px' }).observe(after);
    }
  } else {
    photos.forEach((p) => p.classList.add('is-in'));
  }

  /* ---------- Speakers: la foto solo se muestra si carga; si no, queda el póster tipográfico ---------- */
  document.querySelectorAll('.poster-media img').forEach((img) => {
    const media = img.parentElement;
    const ok = () => media.classList.add('has-photo');
    const fail = () => media.classList.remove('has-photo');
    if (img.complete && img.naturalWidth > 0) ok();
    img.addEventListener('load', ok);
    img.addEventListener('error', fail);
  });

  /* ---------- Programa: filtro por día (botones con aria-pressed) ---------- */
  const buttons = [...document.querySelectorAll('.filters button')];
  const groups = [...document.querySelectorAll('.prog-day')];
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      groups.forEach((g) => { g.hidden = f !== 'all' && g.dataset.day !== f; });
    });
  });
})();
