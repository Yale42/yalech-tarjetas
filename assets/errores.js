// Errores de formularios: el mismo comportamiento en todos los ejemplos (mismo archivo en los 7 repos).
//  · El mensaje se anuncia a lectores de pantalla (role="alert").
//  · Si el código del ejemplo lleva el cursor a un campo, ese campo se marca en rojo y queda
//    ligado al mensaje (aria-invalid + aria-describedby). Si es una opción (radio/casilla),
//    se marca el grupo completo.
//  · Si el error no es de un campo, la página se desplaza hasta el mensaje.
//  · En cuanto la persona corrige ese campo (o toca otra opción), el mensaje y la marca se quitan.
//  · Los formularios que dependían de los globitos del navegador (required, type=email…) pasan a
//    usar este mismo mensaje. Texto propio por campo con data-error="…".
// Uso: <script src="../assets/errores.js?v=1"></script> al final del <body>.
(() => {
  const ROJO = '#d93025';
  const estilo = document.createElement('style');
  estilo.textContent = `
    [aria-invalid="true"]:not([type=radio]):not([type=checkbox]) { border-color: ${ROJO} !important; box-shadow: 0 0 0 3px rgba(217, 48, 37, .2) !important; }
    .campo-error { outline: 2px solid ${ROJO} !important; outline-offset: 4px; border-radius: 10px; }
    .campo-aviso { display: block; width: fit-content; max-width: 100%; margin: 8px 0 4px; padding: 5px 10px; border-radius: 8px;
      background: #fdecea; color: #a50e0e; font: 600 .85rem/1.35 system-ui, sans-serif; letter-spacing: 0; text-transform: none; }`;
  document.head.appendChild(estilo);

  const esCaja = el => el.nodeType === 1 && !el.closest('.mu') && !el.matches('input, select, textarea, button') && (el.matches('.form-error, #form-error') || [...el.attributes].some(a => /^data-[\w-]*error$/.test(a.name)));
  const esCampo = el => el && el.matches?.('input:not([type=hidden]):not([type=submit]):not([type=button]), select, textarea');
  const visible = el => el.isConnected && !el.closest('[hidden]') && el.textContent.trim() !== '' && el.getClientRects().length > 0;
  const grupoDe = c => (c.type === 'radio' || c.type === 'checkbox') ? (c.closest('fieldset, [role=radiogroup], .chips, .options, .opciones, .field') || c.parentElement) : null;
  let n = 0;

  const preparar = caja => {
    if (caja.dataset.err) return;
    caja.dataset.err = '1';
    if (!caja.id) caja.id = `error-${++n}`;
    caja.setAttribute('role', 'alert');
    caja.dataset.ocultable = caja.hasAttribute('hidden') ? '1' : '';
  };
  const cajas = () => [...document.querySelectorAll('body *')].filter(esCaja);
  cajas().forEach(preparar);

  // ¿El código del ejemplo movió el cursor (y no la persona con el teclado o el dedo)?
  let accion = 0, foco = { el: null, t: -1 };
  addEventListener('pointerdown', () => { accion = performance.now(); }, true);
  addEventListener('keydown', () => { accion = performance.now(); }, true);
  addEventListener('focusin', e => { foco = { el: e.target, t: performance.now() }; }, true);
  // .focus() sobre el campo que ya tenía el cursor no dispara focusin: lo anotamos aquí
  const enfocar = HTMLElement.prototype.focus;
  HTMLElement.prototype.focus = function (...a) { foco = { el: this, t: performance.now() }; return enfocar.apply(this, a); };

  const limpiar = caja => {
    (caja._marcas || []).forEach(([c, g]) => {
      c.removeAttribute('aria-invalid');
      const d = (c.getAttribute('aria-describedby') || '').split(' ').filter(x => x && x !== caja.id).join(' ');
      d ? c.setAttribute('aria-describedby', d) : c.removeAttribute('aria-describedby');
      g?.classList.remove('campo-error');
    });
    caja._marcas = [];
    caja._aviso?.remove();
    caja._aviso = null;
    caja._quitar?.();
  };
  const quitarMensaje = caja => {
    limpiar(caja);
    caja.textContent = '';
    if (caja.dataset.ocultable) caja.hidden = true;
  };

  const mostrar = caja => {
    limpiar(caja);
    const cont = caja.closest('form') || caja.closest('dialog, section, .card, main') || document.body;
    const campo = foco.t >= accion && esCampo(foco.el) && cont.contains(foco.el) && document.activeElement === foco.el ? foco.el : null;
    let cuidar = cont, sigue;
    if (campo) {
      const g = grupoDe(campo);
      const todos = g ? [...g.querySelectorAll(`[name="${CSS.escape(campo.name)}"]`)] : [campo];
      todos.forEach(c => {
        c.setAttribute('aria-invalid', 'true');
        c.setAttribute('aria-describedby', [c.getAttribute('aria-describedby'), caja.id].filter(Boolean).join(' '));
      });
      g?.classList.add('campo-error');
      caja._marcas = todos.map(c => [c, g]);
      // Si el mensaje quedó lejos del campo (abajo, junto al botón), se repite junto al campo para que se vea.
      // Se mide la distancia entre los dos (no contra la pantalla, que puede ir a media animación).
      const junto = g || campo.closest('label, .field') || campo;
      const rc = caja.getBoundingClientRect(), rj = junto.getBoundingClientRect();
      if (rc.top - rj.bottom > 140 || rj.top - rc.bottom > 40) {
        const aviso = document.createElement('small');
        aviso.className = 'campo-aviso';
        aviso.setAttribute('aria-hidden', 'true'); // el lector ya lo oye del mensaje principal
        aviso.textContent = caja.textContent.trim();
        junto.after(aviso);
        caja._aviso = aviso;
      }
      cuidar = g || campo;
      sigue = () => true;
    } else {
      const r = caja.getBoundingClientRect();
      if (r.top < 60 || r.bottom > innerHeight - 20) caja.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      // Sin campo: se quita cuando la persona cambia algo del formulario (no al volver a enviar)
      sigue = e => !e.target.closest?.('[type=submit], button:not([type=button])');
    }
    const fuera = e => { if (sigue(e)) quitarMensaje(caja); };
    ['input', 'change', 'click'].forEach(t => cuidar.addEventListener(t, fuera));
    caja._quitar = () => ['input', 'change', 'click'].forEach(t => cuidar.removeEventListener(t, fuera));
  };

  // Mira cuándo aparece o cambia un mensaje de error
  new MutationObserver(ms => {
    const tocadas = new Set();
    for (const m of ms) {
      m.addedNodes.forEach(x => { if (x.nodeType === 1) [x, ...x.querySelectorAll('*')].filter(esCaja).forEach(preparar); });
      let el = m.target.nodeType === 1 ? m.target : m.target.parentElement;
      while (el && !el.dataset?.err) el = el.parentElement;
      if (el) tocadas.add(el);
      if (m.type === 'attributes' && m.target.nodeType === 1) m.target.querySelectorAll?.('[data-err]').forEach(c => tocadas.add(c));
    }
    tocadas.forEach(c => (visible(c) ? mostrar(c) : limpiar(c)));
  }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['hidden'] });

  // Formularios que usaban los globitos del navegador → mismo mensaje que los demás
  const etiqueta = c => (c.labels?.[0]?.querySelector('span, .label')?.textContent || c.labels?.[0]?.textContent || c.placeholder || c.name || '')
    .replace(/[*:]|\(opcional\)/gi, '').trim();
  const mensaje = c => {
    if (c.dataset.error) return c.dataset.error;
    const v = c.validity, nom = etiqueta(c);
    if (v.valueMissing) return c.type === 'radio' || c.tagName === 'SELECT' ? `Elige: ${nom.toLowerCase()}.` : c.type === 'checkbox' ? 'Marca la casilla para continuar.' : `Falta llenar «${nom}».`;
    if (v.typeMismatch && c.type === 'email') return 'Revisa tu correo: parece que le falta algo.';
    if (v.rangeUnderflow || v.rangeOverflow) return c.type === 'date' ? 'Elige una fecha dentro de las disponibles.' : `Revisa «${nom}».`;
    return `Revisa «${nom}».`;
  };
  const conGlobitos = [...document.forms].filter(f => !f.noValidate && !f.closest('.mu') && f.querySelector('[required], [pattern], [type=email], [min], [max]'));
  conGlobitos.forEach(f => { f.noValidate = true; f.dataset.validaErrores = '1'; });
  document.addEventListener('submit', e => {
    const f = e.target;
    if (!f.dataset?.validaErrores || f.checkValidity()) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const c = [...f.elements].find(x => !x.validity.valid);
    let caja = f.querySelector('[data-err]');
    if (!caja) {
      caja = document.createElement('p');
      caja.className = 'form-error form-error--auto';
      const boton = f.querySelector('[type=submit], button:not([type=button])');
      boton ? boton.before(caja) : f.append(caja);
      preparar(caja);
    }
    c.focus();
    caja.hidden = false;
    caja.textContent = mensaje(c);
  }, true);
  if (conGlobitos.length) {
    const s = document.createElement('style');
    s.textContent = `.form-error--auto { margin: 4px 0 12px; color: ${ROJO}; font-size: .92rem; font-weight: 600; }`;
    document.head.appendChild(s);
  }
})();
