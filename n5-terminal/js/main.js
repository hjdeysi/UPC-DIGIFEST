/* DIGIFEST 2026 · n5 "Terminal". Comportamiento de V1 Pulido; el gesto del logo (LEDs) es solo CSS. */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* Scroll suave. Lenis respeta el scroll-margin-top de las secciones. */
if (window.Lenis) {
  new window.Lenis({ autoRaf: true, anchors: true, lerp: 0.1 });
}

/* Menú móvil: cierra con Escape, clic fuera o al elegir un link */
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#site-menu');
function setMenu(open, { focusButton = false } = {}) {
  if (!menu || !menuButton) return;
  menu.classList.toggle('is-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  if (!open && focusButton) menuButton.focus();
}
menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('click', (event) => {
  if (menu?.classList.contains('is-open') && !menu.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
});

/* Scrollspy: el link de la sección visible queda activo (bloque rojo) */
const spyLinks = [...document.querySelectorAll('[data-spy]')];
const spyObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    spyLinks.forEach((link) => {
      const active = link.dataset.spy === entry.target.id;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-45% 0px -50% 0px' });
spyLinks.forEach((link) => {
  const section = document.getElementById(link.dataset.spy);
  if (section) spyObserver.observe(section);
});

/* CTA fijo móvil: aparece cuando los botones del hero salen por arriba y se oculta sobre el registro */
const mobileCta = document.querySelector('.mobile-register');
const heroActions = document.querySelector('.hero-actions');
const register = document.querySelector('#registro');
let heroActionsPassed = false;
let registerInView = false;
function updateMobileCta() {
  const show = heroActionsPassed && !registerInView;
  mobileCta?.classList.toggle('is-visible', show);
  if (show) { mobileCta?.removeAttribute('aria-hidden'); mobileCta?.removeAttribute('tabindex'); }
  else { mobileCta?.setAttribute('aria-hidden', 'true'); mobileCta?.setAttribute('tabindex', '-1'); }
}
if (mobileCta && heroActions) {
  // El margen inferior enorme cuenta "debajo del viewport" como visible: así solo cambia al salir por arriba,
  // incluso si el usuario salta de golpe con un ancla.
  new IntersectionObserver(([entry]) => {
    heroActionsPassed = !entry.isIntersecting;
    updateMobileCta();
  }, { rootMargin: '0px 0px 100000px 0px' }).observe(heroActions);
}
if (mobileCta && register) {
  new IntersectionObserver(([entry]) => {
    registerInView = entry.isIntersecting;
    updateMobileCta();
  }, { rootMargin: '0px 0px -20% 0px' }).observe(register);
}

/* Ejes temáticos (acordeón con grid-template-rows) */
const topics = document.querySelectorAll('.topic-item');
topics.forEach((item) => item.addEventListener('click', () => {
  item.setAttribute('aria-expanded', String(item.getAttribute('aria-expanded') !== 'true'));
}));

/* Speakers: hover en escritorio (CSS), tap en táctil */
const speakerCards = document.querySelectorAll('.speaker-card');
function closeSpeaker(card) {
  card.classList.remove('is-open');
  card.querySelector('.speaker-more')?.setAttribute('aria-expanded', 'false');
}
speakerCards.forEach((card) => {
  const toggle = card.querySelector('.speaker-more');
  toggle?.addEventListener('click', () => {
    const open = !card.classList.contains('is-open');
    speakerCards.forEach((other) => { if (other !== card) closeSpeaker(other); });
    card.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
});
document.addEventListener('click', (event) => {
  speakerCards.forEach((card) => { if (card.classList.contains('is-open') && !card.contains(event.target)) closeSpeaker(card); });
});

/* Programa: cursor de bloque deslizante + fade de 150 ms en las filas */
const tabList = document.querySelector('.program-tabs');
const tabs = [...document.querySelectorAll('.program-tabs [role="tab"]')];
const rows = [...document.querySelectorAll('.program-list article')];
const indicator = document.querySelector('.tab-indicator');
function moveIndicator() {
  const active = tabs.find((tab) => tab.classList.contains('active'));
  if (!active || !indicator) return;
  indicator.style.transform = `translateX(${active.offsetLeft}px) scaleX(${active.offsetWidth / 100})`;
}
function selectTab(tab, { focus = false } = {}) {
  const day = tab.dataset.day;
  // Acción por teclado: sin animación (regla de Emil); con clic, cursor + fade.
  const animate = !focus && !reduceMotion.matches;
  tabList?.classList.toggle('is-keyboard', focus);
  tabs.forEach((item) => {
    const active = item === tab;
    item.classList.toggle('active', active);
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
  });
  if (focus) tab.focus();
  moveIndicator();
  rows.forEach((row) => {
    const show = day === 'all' || row.dataset.date === day;
    row.hidden = !show;
    row.classList.remove('is-entering');
    if (show && animate) {
      void row.offsetWidth;
      row.classList.add('is-entering');
    }
  });
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (event) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    selectTab(tabs[(index + step + tabs.length) % tabs.length], { focus: true });
  });
});
rows.forEach((row) => row.addEventListener('animationend', () => row.classList.remove('is-entering')));
// La pestaña activa vive en la URL (?dia=18), así se puede compartir.
const initialDay = new URLSearchParams(location.search).get('dia');
const initialTab = tabs.find((tab) => tab.dataset.day === initialDay);
if (initialTab) selectTab(initialTab, { focus: false });
tabs.forEach((tab) => tab.addEventListener('click', () => {
  const url = new URL(location);
  if (tab.dataset.day === 'all') url.searchParams.delete('dia'); else url.searchParams.set('dia', tab.dataset.day);
  history.replaceState(null, '', url);
}));
moveIndicator();
requestAnimationFrame(() => requestAnimationFrame(() => indicator?.classList.add('is-ready')));
window.addEventListener('resize', moveIndicator);
document.fonts?.ready.then(moveIndicator);

/* Estado "hoy" durante la semana del evento */
const eventStart = new Date(2026, 10, 16);
const eventEnd = new Date(2026, 10, 21);
function applyDigifestDateState(referenceDate = new Date()) {
  const today = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const inEvent = today >= eventStart && today <= eventEnd;
  const activeDate = inEvent ? String(today.getDate()) : null;
  document.querySelectorAll('.log li').forEach((line) => line.classList.toggle('is-today', line.dataset.date === activeDate));
  rows.forEach((row) => row.classList.toggle('is-today', row.dataset.date === activeDate));
  tabs.forEach((tab) => tab.classList.toggle('is-today', tab.dataset.day === activeDate));
}
window.applyDigifestDateState = applyDigifestDateState;
applyDigifestDateState();

/* Escape cierra menú, ejes y overlays de speakers */
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (menu?.classList.contains('is-open')) setMenu(false, { focusButton: true });
  topics.forEach((item) => item.setAttribute('aria-expanded', 'false'));
  speakerCards.forEach(closeSpeaker);
});
