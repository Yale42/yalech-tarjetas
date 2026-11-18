// Carruseles que se deslizan de lado: les agrega señales para que se note que hay más.
//   · flechas sobre los bordes (anterior / siguiente)
//   · puntitos y contador debajo («2 de 7»)
//   · una «probadita»: la primera vez que aparece en pantalla, los ejemplos se asoman y regresan
// Uso: carrusel(elemento) o carrusel(elemento, { flechas: false }). Solo se muestra cuando de verdad
// hay más contenido del que cabe (en computadora, si todo cabe, no aparece nada).
// Estilos en assets/carrusel.css. Necesita Font Awesome para los íconos de las flechas.
(() => {
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.carrusel = (rail, { flechas = true } = {}) => {
    if (!rail || rail.dataset.carrusel) return;
    const items = [...rail.children].filter(el => el.offsetParent !== null || el.getClientRects().length);
    if (items.length < 2) return;
    rail.dataset.carrusel = '1';

    // Envoltura para poner las flechas encima del carrusel
    const caja = document.createElement('div');
    caja.className = 'rail';
    rail.parentNode.insertBefore(caja, rail);
    caja.appendChild(rail);

    const prev = Object.assign(document.createElement('button'), { type: 'button', className: 'rail-btn rail-btn--prev', innerHTML: '<i class="fa-solid fa-chevron-left"></i>' });
    const next = Object.assign(document.createElement('button'), { type: 'button', className: 'rail-btn rail-btn--next', innerHTML: '<i class="fa-solid fa-chevron-right"></i>' });
    prev.setAttribute('aria-label', 'Ver anteriores');
    next.setAttribute('aria-label', 'Ver más');
    if (flechas) caja.append(prev, next);

    const ui = document.createElement('div');
    ui.className = 'rail-ui';
    ui.innerHTML = `<div class="rail-dots">${items.map((_, i) => `<button type="button" aria-label="Ir al ${i + 1} de ${items.length}"></button>`).join('')}</div><span class="rail-count" aria-live="polite"></span>`;
    caja.after(ui);
    const puntos = [...ui.querySelectorAll('.rail-dots button')];
    const cuenta = ui.querySelector('.rail-count');

    const base = () => items[0].offsetLeft;
    const actual = () => {
      const x = rail.scrollLeft;
      let mejor = 0;
      items.forEach((el, i) => { if (Math.abs(el.offsetLeft - base() - x) < Math.abs(items[mejor].offsetLeft - base() - x)) mejor = i; });
      // Al llegar al final, marcar el último aunque no quede pegado a la izquierda
      if (x + rail.clientWidth >= rail.scrollWidth - 4) mejor = items.length - 1;
      return mejor;
    };
    const ir = i => {
      i = Math.max(0, Math.min(items.length - 1, i));
      rail.scrollTo({ left: items[i].offsetLeft - base(), behavior: calm ? 'auto' : 'smooth' });
    };
    prev.addEventListener('click', () => ir(actual() - 1));
    next.addEventListener('click', () => ir(actual() + 1));
    puntos.forEach((p, i) => p.addEventListener('click', () => ir(i)));

    let pendiente = false;
    const pintar = () => {
      pendiente = false;
      const desliza = rail.scrollWidth > rail.clientWidth + 4;
      caja.classList.toggle('is-scrollable', desliza);
      ui.hidden = !desliza;
      if (!desliza) return;
      const i = actual();
      puntos.forEach((p, k) => p.classList.toggle('is-on', k === i));
      cuenta.textContent = `${i + 1} de ${items.length}`;
      prev.classList.toggle('is-hidden', rail.scrollLeft < 8);
      next.classList.toggle('is-hidden', rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 8);
    };
    const pedir = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); } };
    rail.addEventListener('scroll', pedir, { passive: true });
    addEventListener('resize', pedir);
    pintar();

    // La «probadita»: una sola vez, cuando el carrusel ya está a la vista
    if (!calm && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting || !caja.classList.contains('is-scrollable') || rail.scrollLeft > 8) return;
        io.disconnect();
        setTimeout(() => {
          rail.classList.add('is-nudging');
          setTimeout(() => rail.classList.remove('is-nudging'), 1600);
        }, 500);
      }, { threshold: 0.6 });
      io.observe(rail);
    }
  };
})();
