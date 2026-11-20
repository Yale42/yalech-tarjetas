// Cotizador en 1 minuto: un formulario corto que arma el mensaje de WhatsApp con lo que necesito
// para cotizar (servicio, de qué es, para cuándo, si tiene logo y fotos, y su nombre).
//
// Uso: cualquier enlace o botón con data-cotizar lo abre.
//   data-cotizar=""         → empieza preguntando qué necesita
//   data-cotizar="menu"     → ya elige el servicio y pasa a la siguiente pregunta
//   data-ejemplo="Taquería" → agrega «Me gustó el ejemplo: Taquería» al mensaje
// Deja el href de WhatsApp en el enlace: si este archivo no carga, el botón sigue funcionando.
// Los colores se toman de las variables --cz-… de cada página (ver assets/cotizar.css).
(() => {
  const WHATSAPP = '520000000000'; // ← tu número (52 + 10 dígitos)

  const SERVICIOS = [
    { id: 'bio', nombre: 'Link en bio', necesidad: 'Un link para mis redes', icono: 'fa-link', ejemplo: 'Ej. creadora de contenido de moda' },
    { id: 'landing', nombre: 'Landing page', necesidad: 'Vender un curso, producto o evento', icono: 'fa-rocket', ejemplo: 'Ej. curso de repostería en línea' },
    { id: 'web', nombre: 'Sitio web', necesidad: 'Que mi negocio aparezca en Google', icono: 'fa-globe', ejemplo: 'Ej. consultorio dental en Guadalajara' },
    { id: 'menu', nombre: 'Menú digital QR', necesidad: 'Que pidan desde la mesa', icono: 'fa-utensils', ejemplo: 'Ej. taquería en Monterrey' },
    { id: 'invitacion', nombre: 'Invitación digital', necesidad: 'Invitar a mi boda, XV o fiesta', icono: 'fa-envelope-open-text', ejemplo: 'Ej. boda en abril, 150 invitados' },
    { id: 'tarjeta', nombre: 'Tarjeta digital', necesidad: 'Compartir mi contacto', icono: 'fa-id-card', ejemplo: 'Ej. asesora inmobiliaria en Querétaro' },
    { id: 'sistema', nombre: 'Sistema a la medida', necesidad: 'Controlar inventario, pedidos o citas', icono: 'fa-laptop-code', ejemplo: 'Ej. inventario y ventas para mi papelería' },
    { id: 'otro', nombre: 'Otra cosa', necesidad: 'Aún no sé o es algo distinto', icono: 'fa-lightbulb', ejemplo: 'Cuéntame tu idea en una línea' },
  ];
  const CUANDO = ['Lo antes posible', 'Este mes', 'Sin prisa, solo cotizo'];
  const MATERIAL = ['Sí, tengo todo', 'Algunas cosas', 'No tengo'];
  const porId = id => SERVICIOS.find(s => s.id === id);

  // ---------- Armar el formulario (una sola vez por página) ----------
  const dlg = document.createElement('dialog');
  dlg.className = 'cz';
  dlg.setAttribute('aria-labelledby', 'cz-title');
  const chips = (name, opciones) => opciones.map(o => `<label class="cz-chip"><input type="radio" name="${name}" value="${o}" /><span>${o}</span></label>`).join('');
  dlg.innerHTML = `
    <form class="cz-inner" method="dialog" novalidate tabindex="-1" autofocus>
      <div class="cz-top">
        <button type="button" class="cz-icon" data-cz-back aria-label="Atrás"><i class="fa-solid fa-arrow-left"></i></button>
        <div class="cz-progress" aria-hidden="true"><span></span></div>
        <button type="button" class="cz-icon" data-cz-close aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
      </div>

      <section class="cz-step" data-step="1">
        <p class="cz-kicker">Cotiza en 1 minuto · Paso 1 de 3</p>
        <h2 class="cz-title" id="cz-title">¿Qué necesitas?</h2>
        <div class="cz-options">${SERVICIOS.map(s => `
          <button type="button" class="cz-option" data-servicio="${s.id}">
            <i class="fa-solid ${s.icono}"></i>
            <span><strong>${s.necesidad}</strong><small>${s.nombre}</small></span>
          </button>`).join('')}
        </div>
      </section>

      <section class="cz-step" data-step="2" hidden>
        <p class="cz-kicker">Paso 2 de 3 · <span data-cz-servicio></span></p>
        <h2 class="cz-title">Cuéntame de qué es</h2>
        <label class="cz-field">
          <span>Tu negocio, marca o evento en una línea</span>
          <input name="sobre" maxlength="120" autocomplete="off" />
        </label>
        <fieldset class="cz-field">
          <legend>¿Ya tienes logo y fotos?</legend>
          <div class="cz-chips">${chips('material', MATERIAL)}</div>
        </fieldset>
        <button type="button" class="cz-btn" data-cz-next>Siguiente <i class="fa-solid fa-arrow-right"></i></button>
      </section>

      <section class="cz-step" data-step="3" hidden>
        <p class="cz-kicker">Paso 3 de 3 · Ya casi</p>
        <h2 class="cz-title">¿Para cuándo la necesitas?</h2>
        <div class="cz-chips">${chips('cuando', CUANDO)}</div>
        <label class="cz-field">
          <span>Tu nombre</span>
          <input name="nombre" maxlength="40" autocomplete="given-name" placeholder="Para saber con quién hablo" />
        </label>
        <p class="cz-error" hidden></p>
        <button type="submit" class="cz-btn"><i class="fa-brands fa-whatsapp"></i> Enviar por WhatsApp</button>
        <p class="cz-note">Te respondo con el precio y el tiempo de entrega. Sin compromiso.</p>
      </section>

      <section class="cz-step cz-done" data-step="4" hidden>
        <span class="cz-done-icon"><i class="fa-solid fa-check"></i></span>
        <h2 class="cz-title">¡Listo!</h2>
        <p>Se abrió WhatsApp con tu mensaje. Solo dale <strong>Enviar</strong> y te respondo en cuanto lo vea.</p>
        <button type="button" class="cz-btn cz-btn--line" data-cz-close>Seguir viendo</button>
      </section>
    </form>`;
  document.body.appendChild(dlg);

  const form = dlg.querySelector('form');
  const pasos = [...dlg.querySelectorAll('.cz-step')];
  const barra = dlg.querySelector('.cz-progress span');
  const atras = dlg.querySelector('[data-cz-back]');
  const error = dlg.querySelector('.cz-error');
  let paso = 1;
  let servicio = null;
  let ejemplo = '';

  const ir = n => {
    paso = n;
    pasos.forEach(p => { p.hidden = Number(p.dataset.step) !== n; });
    barra.style.width = `${Math.min(n, 3) / 3 * 100}%`;
    atras.style.visibility = n > 1 && n < 4 ? 'visible' : 'hidden';
    form.scrollTop = 0;
    if (n === 2) form.sobre.placeholder = porId(servicio).ejemplo;
  };
  const elegir = id => {
    servicio = id;
    dlg.querySelectorAll('[data-servicio]').forEach(b => b.classList.toggle('is-on', b.dataset.servicio === id));
    dlg.querySelector('[data-cz-servicio]').textContent = porId(id).nombre;
    ir(2);
  };

  const abrir = (id, ej) => {
    form.reset();
    error.hidden = true;
    ejemplo = (ej || '').slice(0, 60);
    servicio = null;
    dlg.querySelectorAll('[data-servicio]').forEach(b => b.classList.remove('is-on'));
    if (id && porId(id)) elegir(id);
    else ir(1);
    dlg.showModal();
  };

  dlg.querySelectorAll('[data-servicio]').forEach(b => b.addEventListener('click', () => elegir(b.dataset.servicio)));
  dlg.querySelector('[data-cz-next]').addEventListener('click', () => ir(3));
  atras.addEventListener('click', () => ir(paso - 1));
  dlg.querySelectorAll('[data-cz-close]').forEach(b => b.addEventListener('click', () => dlg.close()));
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (paso !== 3) return;
    const nombre = form.nombre.value.trim();
    if (!nombre) {
      error.textContent = 'Escribe tu nombre, por favor.';
      error.hidden = false;
      form.nombre.focus();
      return;
    }
    const s = porId(servicio);
    const lineas = [`Hola Yael, quiero cotizar: ${s.nombre}`, ''];
    const sobre = form.sobre.value.trim();
    if (sobre) lineas.push(`Es para: ${sobre}`);
    if (ejemplo) lineas.push(`Me gustó el ejemplo: ${ejemplo}`);
    if (form.material.value) lineas.push(`Logo y fotos: ${form.material.value}`);
    if (form.cuando.value) lineas.push(`Para cuándo: ${form.cuando.value}`);
    lineas.push(`Mi nombre: ${nombre}`);
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lineas.join('\n'))}`, '_blank', 'noopener');
    ir(4);
  });

  // ---------- Botones que lo abren ----------
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-cotizar]');
    if (!t) return;
    e.preventDefault();
    abrir(t.dataset.cotizar, t.dataset.ejemplo);
  });
  window.cotizar = abrir; // para las pruebas

  // ---------- Llegar ya con el cotizador abierto: ?cotizar=landing&ejemplo=Restaurante ----------
  // (lo usa el botón «Quiero una así» de las plantillas). Solo se aceptan valores conocidos.
  const q = new URLSearchParams(location.search);
  const pedido = q.get('cotizar');
  if (pedido !== null && (pedido === '' || porId(pedido))) {
    const conocidos = [...document.querySelectorAll('[data-ejemplo]')].map(el => el.dataset.ejemplo);
    const ej = conocidos.includes(q.get('ejemplo')) ? q.get('ejemplo') : '';
    history.replaceState(null, '', location.pathname + location.hash);
    abrir(pedido, ej);
  }
})();
