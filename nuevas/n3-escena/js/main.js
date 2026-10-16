/* DIGIFEST 2026 · Escena dividida
   Movimiento distintivo único: el fundido de la escena (opacity, 500 ms, ease-in-out). */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll suave (Lenis) salvo con movimiento reducido
  if (!reduce && window.Lenis) {
    new window.Lenis({ autoRaf: true, anchors: true });
  }

  // Fotos de speakers: ocultas hasta load; si fallan quedan ocultas y se ve el texto
  document.querySelectorAll('.sp-photo').forEach(function (img) {
    var ok = function () { img.classList.add('is-loaded'); };
    var ko = function () { img.classList.add('is-error'); };
    if (img.complete && img.naturalWidth) ok();
    else if (img.complete && img.currentSrc) ko();
    img.addEventListener('load', ok, { once: true });
    img.addEventListener('error', ko, { once: true });
  });

  // Escena: cada sección con data-scene trae su foto a la mitad fija
  var scenes = {};
  document.querySelectorAll('.scene').forEach(function (img) { scenes[img.dataset.scene] = img; });
  var current = 'sala';

  function show(id) {
    if (id === current || !scenes[id]) return;
    Object.keys(scenes).forEach(function (k) { scenes[k].classList.remove('is-prev'); });
    var prev = scenes[current];
    prev.classList.remove('is-on');
    prev.classList.add('is-prev'); // la anterior queda opaca debajo
    scenes[id].classList.add('is-on'); // la nueva entra con el fundido encima
    current = id;
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) show(e.target.dataset.scene); });
    }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
    document.querySelectorAll('section[data-scene]').forEach(function (s) { io.observe(s); });
  }
})();
