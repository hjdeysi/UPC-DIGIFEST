/* ===== Credencial de speaker (componente portable) =====
   Markup esperado:
   <figure class="speaker-media" data-track="conectandi|digitalks|virtual">
     <img src="assets/images/speakers/<apellido>.webp" alt="<Nombre completo>" width="800" height="1000" loading="lazy">
     ...
   </figure>
   Si la foto carga, se muestra (.has-photo). Si falla o no existe, se queda la credencial (.is-placeholder).
   El motivo (líneas onduladas + pines) sale de un hash determinista del nombre: único por speaker y estable. */
(() => {
  const TRACK_LABEL = { conectandi: 'CONECTANDI', digitalks: 'DIGITALKS', virtual: 'Virtual' };
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function hash(str) { // FNV-1a 32 bits
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return h >>> 0;
  }
  function rng(seed) { // mulberry32
    return () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function initials(name) {
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
  }

  function motif(name) {
    const r = rng(hash(name));
    const W = 400, H = 500;
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.setAttribute('class', 'credential-motif');
    svg.setAttribute('aria-hidden', 'true');
    let k = 0;
    const lineCount = 2 + Math.floor(r() * 3); // 2–4
    const baseY = 150 + r() * 60;
    const amp = 18 + r() * 34;
    const freq = 1 + r() * 1.2;
    const phase = r() * Math.PI * 2;
    const ys = [];
    for (let l = 0; l < lineCount; l++) {
      const offset = l * (14 + r() * 10);
      const a = amp * (1 - l * 0.12);
      const pts = [];
      for (let x = -20; x <= W + 20; x += 10) {
        const y = baseY + offset + Math.sin((x / W) * Math.PI * 2 * freq + phase + l * 0.35) * a;
        pts.push(`${x.toFixed(0)},${y.toFixed(1)}`);
      }
      ys.push((x) => baseY + offset + Math.sin((x / W) * Math.PI * 2 * freq + phase + l * 0.35) * a);
      const path = document.createElementNS(SVG_NS, 'polyline');
      path.setAttribute('points', pts.join(' '));
      path.setAttribute('pathLength', '1');
      path.setAttribute('class', l === 0 ? 'm-line m-line-main' : 'm-line');
      path.style.setProperty('--k', k++);
      svg.append(path);
    }
    const pinCount = 2 + Math.floor(r() * 2); // 2–3
    for (let p = 0; p < pinCount; p++) {
      const x = 50 + ((p + r() * 0.6) / pinCount) * (W - 100);
      const yOnLine = ys[0](x);
      const len = 40 + r() * 70;
      const up = r() > 0.35;
      // Los pines hacia arriba no invaden la franja de la etiqueta del track (y < 90).
      const yEnd = up ? Math.max(90, yOnLine - len) : Math.min(H - 170, yOnLine + len);
      const stem = document.createElementNS(SVG_NS, 'line');
      stem.setAttribute('x1', x.toFixed(1)); stem.setAttribute('x2', x.toFixed(1));
      stem.setAttribute('y1', yOnLine.toFixed(1)); stem.setAttribute('y2', yEnd.toFixed(1));
      stem.setAttribute('pathLength', '1');
      stem.setAttribute('class', 'm-line m-stem');
      stem.style.setProperty('--k', k++);
      const dot = document.createElementNS(SVG_NS, 'circle');
      dot.setAttribute('cx', x.toFixed(1)); dot.setAttribute('cy', yEnd.toFixed(1));
      dot.setAttribute('r', (6 + r() * 4).toFixed(1));
      dot.setAttribute('class', 'm-dot');
      dot.style.setProperty('--k', k - 1);
      svg.append(stem, dot);
    }
    return svg;
  }

  function build(figure) {
    if (figure.querySelector('.credential')) return;
    const img = figure.querySelector('img');
    const name = img?.alt || figure.dataset.name || '';
    const track = figure.dataset.track || 'virtual';
    const card = document.createElement('div');
    card.className = 'credential';
    card.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.className = 'credential-track';
    label.textContent = TRACK_LABEL[track] || track;
    const mono = document.createElement('span');
    mono.className = 'credential-initials';
    mono.textContent = initials(name);
    card.append(label, motif(name), mono);
    figure.prepend(card);

    if (img) {
      const ok = () => { figure.classList.add('has-photo'); figure.classList.remove('is-placeholder'); };
      const fail = () => { figure.classList.add('is-placeholder'); figure.classList.remove('has-photo'); };
      if (img.complete) { img.naturalWidth > 0 ? ok() : fail(); }
      img.addEventListener('load', ok);
      img.addEventListener('error', fail);
    } else {
      figure.classList.add('is-placeholder');
    }
  }

  const figures = document.querySelectorAll('.speaker-media');
  figures.forEach(build);

  // Las líneas se dibujan una sola vez al entrar en viewport.
  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-drawn');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  figures.forEach((figure) => io.observe(figure));
})();
