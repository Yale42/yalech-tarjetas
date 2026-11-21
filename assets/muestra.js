// Modo muestra: estos ejemplos son de negocios y personas ficticias, así que sus botones de
// WhatsApp, de llamar y de correo no llevan a nadie. Este archivo los intercepta y, en su lugar,
// enseña una ventanita con lo que pasaría de verdad y una invitación a cotizar uno igual.
// Es el mismo archivo en los 7 repos (assets/muestra.js + assets/muestra.css).
//
// Uso (al final del <body>):
//   <script src="../assets/muestra.js?v=2" data-servicio="menu" data-ejemplo="Taquería" data-para="La Lumbre"></script>
//   data-servicio → id del cotizador: bio, landing, web, menu, invitacion, tarjeta, sistema.
//   data-ejemplo  → nombre de la tarjeta en la portada; se pasa al cotizador.
//   data-para     → a quién le llegarían los mensajes. «cliente» = cada cliente del sistema.
//   data-volver   → portada de ese servicio (por omisión ../).
// Atrapa enlaces <a href="https://wa.me/…">, tel: y mailto:, y también window.open hacia wa.me.
// Los formularios pueden llamar a window.muestra.whatsapp(mensaje).
//
// Para un cliente real: borra esa línea <script> y todo vuelve a abrir WhatsApp de verdad.
(() => {
  const yo = document.currentScript;
  const d = yo?.dataset || {};
  const limpio = (s, n) => String(s || '').replace(/[^\p{L}\p{N} /&.,'-]/gu, '').trim().slice(0, n);
  const servicio = /^(bio|landing|web|menu|invitacion|tarjeta|sistema)$/.test(d.servicio || '') ? d.servicio : 'landing';
  const ejemplo = limpio(d.ejemplo, 40);
  const paraCliente = d.para === 'cliente';
  const para = paraCliente ? 'el cliente' : (limpio(d.para, 50) || document.title.split('·')[0].trim().slice(0, 50) || 'el negocio');
  const volver = /^(\.\.\/)+(#[\w-]+)?$/.test(d.volver || '') ? d.volver : '../';

  // Cómo se dice cada servicio (para «Quiero uno así» y «En un menú real…»)
  const TXT = {
    bio: ['uno', 'un link en bio real'],
    landing: ['una', 'una landing page real'],
    web: ['uno', 'un sitio real'],
    menu: ['uno', 'un menú real'],
    invitacion: ['una', 'una invitación real'],
    tarjeta: ['una', 'una tarjeta real'],
    sistema: ['uno', 'el sistema real'],
  }[servicio];

  // Íconos propios: no todas las páginas cargan Font Awesome
  const svg = p => `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const IC = {
    x: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
    ojo: svg('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    chat: svg('<path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.5L3 21l2-5.5A8.4 8.4 0 1 1 21 11.5z"/>'),
    rayo: svg('<path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="currentColor" stroke="none"/>'),
  };

  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = new URL('muestra.css?v=2', yo.src).href;
  document.head.appendChild(css);

  const dlg = document.createElement('dialog');
  dlg.className = 'mu';
  dlg.setAttribute('aria-labelledby', 'mu-title');
  dlg.innerHTML = `
    <div class="mu-inner" tabindex="-1" autofocus>
      <button type="button" class="mu-x" data-mu-close aria-label="Cerrar">${IC.x}</button>
      <p class="mu-kicker">${IC.ojo} Ejemplo de muestra</p>
      <h2 class="mu-title" id="mu-title"></h2>
      <div class="mu-chat" hidden>
        <p class="mu-to">${IC.chat} Para: <span data-mu-para></span></p>
        <p class="mu-bubble"></p>
      </div>
      <p class="mu-note"></p>
      <div class="mu-actions">
        <a class="mu-btn" data-mu-cotizar>${IC.rayo} Quiero ${TXT[0]} así</a>
        <a class="mu-btn mu-btn--line" data-mu-volver>Ver más ejemplos</a>
      </div>
    </div>`;
  document.body.appendChild(dlg);

  const titulo = dlg.querySelector('.mu-title');
  const chat = dlg.querySelector('.mu-chat');
  const burbuja = dlg.querySelector('.mu-bubble');
  const destino = dlg.querySelector('[data-mu-para]');
  const nota = dlg.querySelector('.mu-note');
  // Relativo (../?…) para que funcione aunque el sitio viva dentro de una carpeta
  const q = new URLSearchParams({ cotizar: servicio });
  if (ejemplo) q.set('ejemplo', ejemplo);
  dlg.querySelector('[data-mu-cotizar]').setAttribute('href', `${volver.split('#')[0]}?${q}`);
  dlg.querySelector('[data-mu-volver]').setAttribute('href', volver);

  const de = x => x.startsWith('el ') ? `del ${x.slice(3)}` : `de ${x}`; // «del cliente», «de Huellitas»

  // «5500000401» → «55 0000 0401» (los 10 dígitos de un número de México)
  const numero = n => { const t = String(n || '').replace(/\D/g, '').slice(-10); return t.length === 10 ? `${t.slice(0, 2)} ${t.slice(2, 6)} ${t.slice(6)}` : ''; };

  const abrir = (modo, mensaje = '', tel = '') => {
    chat.hidden = modo !== 'wa';
    if (modo === 'tel') {
      titulo.textContent = 'Aquí se haría la llamada';
      nota.textContent = `En ${TXT[1]}, este botón marca directo al teléfono ${de(para)}. Este es un ejemplo, por eso no llama.`;
    } else if (modo === 'mail') {
      titulo.textContent = 'Aquí se escribiría un correo';
      nota.textContent = `En ${TXT[1]}, este botón abre el correo con la dirección ${de(para)} ya puesta. Este es un ejemplo, por eso no se abre.`;
    } else {
      const sinNumero = !String(tel).replace(/\D/g, '');
      titulo.textContent = sinNumero ? 'Así se compartiría por WhatsApp' : 'Así llegaría este mensaje por WhatsApp';
      destino.textContent = sinNumero ? 'el contacto que elijas' : paraCliente && numero(tel) ? `el cliente · ${numero(tel)}` : para;
      burbuja.textContent = String(mensaje || '').slice(0, 1200) || '(mensaje vacío)'; // siempre como texto
      nota.textContent = `En ${TXT[1]}, este botón abre WhatsApp con el mensaje ya escrito. Este es un ejemplo, por eso no se envía.`;
    }
    if (!dlg.open) dlg.showModal();
  };

  // https://wa.me/52…?text=… → enseña el mensaje; cualquier otra dirección no se toca
  const esWA = u => /^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(String(u || ''));
  const abrirWA = href => {
    let texto = '', tel = '';
    try {
      const u = new URL(href);
      texto = u.searchParams.get('text') || '';
      tel = u.pathname.replace(/\D/g, '') || u.searchParams.get('phone') || '';
    } catch { /* enlace raro: sin texto */ }
    abrir('wa', texto, tel);
  };

  dlg.querySelectorAll('[data-mu-close]').forEach(b => b.addEventListener('click', () => dlg.close()));
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });

  document.addEventListener('click', e => {
    const a = e.target.closest?.('a[href]');
    if (!a || dlg.contains(a)) return;
    const href = a.getAttribute('href');
    if (href.startsWith('tel:')) { e.preventDefault(); abrir('tel'); }
    else if (href.startsWith('mailto:')) { e.preventDefault(); abrir('mail'); }
    else if (esWA(href)) { e.preventDefault(); abrirWA(href); }
  }, true);

  // Los ejemplos que arman el mensaje con JS lo abren con window.open
  const abrirVentana = window.open.bind(window);
  window.open = (url, ...resto) => {
    if (esWA(url)) { abrirWA(String(url)); return null; }
    return abrirVentana(url, ...resto);
  };

  window.muestra = { whatsapp: msg => abrir('wa', msg, '1') };
})();
