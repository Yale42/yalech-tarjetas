/* Efectos al bajar por la página (sin librerías).
   Uso, después de cargar este archivo:
     motion.reveal('.titulo, .foto')   → cada elemento aparece suave al entrar a la pantalla
     motion.stagger('.lista')          → los hijos de cada contenedor aparecen uno tras otro
     motion.count('.numero')           → el número cuenta desde 0 (respeta "$", "+", "%", comas y decimales)
   Si el teléfono tiene activado "reducir movimiento", no se anima nada y todo se ve normal.
   Lo que ya se ve al abrir la página no se oculta: así nunca parpadea. */
(() => {
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const can = !calm && 'IntersectionObserver' in window;

  const style = document.createElement('style');
  style.textContent = `
    .m-wait { opacity: 0 !important; translate: 0 28px !important; }
    .m-go {
      transition: opacity .8s cubic-bezier(.2,.8,.2,1), translate .8s cubic-bezier(.2,.8,.2,1) !important;
      transition-delay: calc(var(--m-i, 0) * 90ms) !important;
    }`;
  document.head.appendChild(style);

  const visible = el => { const r = el.getBoundingClientRect(); return r.top < innerHeight * 0.92 && r.bottom > 0; };

  // Al terminar quita las clases, para que el elemento recupere sus propias transiciones (hover, etc.)
  const show = (el, i = 0) => {
    el.style.setProperty('--m-i', Math.min(i, 8));
    el.classList.add('m-go');
    requestAnimationFrame(() => el.classList.remove('m-wait'));
    setTimeout(() => { el.classList.remove('m-go'); el.style.removeProperty('--m-i'); }, 900 + Math.min(i, 8) * 90);
  };

  const pending = new Set();
  const fire = el => {
    if (!pending.delete(el)) return;
    io.unobserve(el);
    el.__m.forEach(fn => fn());
  };
  const io = can && new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) fire(e.target); });
  }, { rootMargin: '0px 0px -8% 0px' });
  // Respaldo: si alguien baja muy rápido o salta con un enlace, también se muestra lo que ya quedó arriba
  let raf = 0;
  can && addEventListener('scroll', () => {
    if (raf || !pending.size) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      pending.forEach(el => { if (el.getBoundingClientRect().top < innerHeight * 0.92) fire(el); });
    });
  }, { passive: true });

  const watch = (el, fn) => { (el.__m ||= []).push(fn); pending.add(el); io.observe(el); };

  const reveal = sel => {
    if (!can) return;
    document.querySelectorAll(sel).forEach(el => {
      if (visible(el) || el.classList.contains('m-wait')) return;
      el.classList.add('m-wait');
      watch(el, () => show(el));
    });
  };

  const stagger = sel => {
    if (!can) return;
    document.querySelectorAll(sel).forEach(box => {
      const kids = [...box.children].filter(k => !visible(k));
      if (!kids.length) return;
      kids.forEach(k => k.classList.add('m-wait'));
      // En carruseles y cuadrículas, cada fila entra cuando llega; en listas largas no se espera de más
      watch(box, () => {
        const top = kids[0].getBoundingClientRect().top;
        let row = 0, last = top, i = 0;
        kids.forEach(k => {
          const t = k.getBoundingClientRect().top;
          if (t - last > 4) { row++; last = t; }
          show(k, i++ + row);
        });
      });
    });
  };

  const count = sel => {
    document.querySelectorAll(sel).forEach(el => {
      const raw = el.textContent.trim();
      const m = raw.match(/^([^\d]*)([\d,]+(?:\.\d+)?)(.*)$/);
      if (!m || calm) return;
      const [, pre, num, post] = m;
      const end = parseFloat(num.replace(/,/g, ''));
      const dec = (num.split('.')[1] || '').length;
      const fmt = n => pre + n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + post;
      const run = () => {
        const t0 = performance.now(), dur = 1400;
        const tick = now => {
          const p = Math.min((now - t0) / dur, 1);
          el.textContent = fmt(end * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      };
      // Reserva el ancho final para que el texto de al lado no brinque
      el.style.fontVariantNumeric = 'tabular-nums';
      el.textContent = fmt(0);
      if (!io) { el.textContent = raw; return; }
      watch(el, run);
    });
  };

  // Si alguien imprime o guarda la página, que se vea todo
  addEventListener('beforeprint', () => document.querySelectorAll('.m-wait').forEach(el => el.classList.remove('m-wait')));

  window.motion = { reveal, stagger, count, calm };
})();
