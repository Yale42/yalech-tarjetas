// Funciones que comparten las tarjetas digitales. Cada tarjeta define antes (en su tarjeta.js):
//   TARJETA = { prefijo, nombre, apellido, puesto, empresa, tel, whatsapp, email, web?,
//               direccion: { calle, ciudad, estado, cp }, mapa, foto?, nota?, saludo,
//               horario?: [dom, lun, mar, mié, jue, vie, sáb] con [abre, cierra] en horas (9.5 = 9:30) o null,
//               iniciar?: util => {…} (lo propio de cada tarjeta: cotizador, citas… usa util.abrirWA) }
// La página usa: [data-call] [data-wa] [data-mail] [data-map] (se llenan solos),
//   [data-vcard] guardar contacto · [data-share] compartir · [data-qr] mostrar QR (#qr con [data-qr-box])
//   [data-wa-text="…"] otros botones de WhatsApp con su propio mensaje · [data-toast] avisos
//   [data-abierto] «Abierto ahora · cierra 7 pm» según T.horario (clase is-open cuando está abierto)
(() => {
  const T = window.TARJETA;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const completo = [T.prefijo, T.nombre, T.apellido].filter(Boolean).join(' ');
  const wa = texto => `https://wa.me/${T.whatsapp}?text=${encodeURIComponent(texto)}`;
  const aqui = () => location.href.split('#')[0];
  const toast = texto => {
    const t = $('[data-toast]');
    if (!t) return;
    t.textContent = texto;
    t.classList.add('show');
    clearTimeout(t._t);
    t._t = setTimeout(() => t.classList.remove('show'), 2400);
  };

  // ---------- Botones de contacto ----------
  $$('[data-call]').forEach(a => { a.href = `tel:${T.tel}`; });
  $$('[data-wa]').forEach(a => { a.href = wa(T.saludo); a.target = '_blank'; a.rel = 'noopener'; });
  $$('[data-wa-text]').forEach(a => { a.href = wa(a.dataset.waText); a.target = '_blank'; a.rel = 'noopener'; });
  $$('[data-mail]').forEach(a => { a.href = `mailto:${T.email}`; });
  $$('[data-map]').forEach(a => { a.href = `https://maps.google.com/?q=${encodeURIComponent(T.mapa)}`; a.target = '_blank'; a.rel = 'noopener'; });

  // ---------- Guardar contacto (vCard: la agenda del celular la reconoce) ----------
  const esc = t => String(t || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');
  const fotoBase64 = async () => {
    if (!T.foto) return ''; // tarjeta ilustrada, sin foto
    try {
      const r = await fetch(T.foto);
      if (!r.ok) return '';
      const b = await r.blob();
      return await new Promise(ok => {
        const f = new FileReader();
        f.onload = () => ok(String(f.result).split(',')[1] || '');
        f.onerror = () => ok('');
        f.readAsDataURL(b);
      });
    } catch { return ''; } // abierto como archivo, el navegador no deja leer la foto: se guarda sin ella
  };
  const vcard = async () => {
    const d = T.direccion || {};
    const lineas = [
      'BEGIN:VCARD', 'VERSION:3.0',
      `N:${esc(T.apellido)};${esc(T.nombre)};;${esc(T.prefijo)};`,
      `FN:${esc(completo)}`,
      T.empresa && `ORG:${esc(T.empresa)}`,
      T.puesto && `TITLE:${esc(T.puesto)}`,
      `TEL;TYPE=CELL,VOICE:${T.tel}`,
      T.email && `EMAIL;TYPE=WORK:${T.email}`,
      `URL:${aqui()}`,
      (d.calle || d.ciudad) && `ADR;TYPE=WORK:;;${esc(d.calle)};${esc(d.ciudad)};${esc(d.estado)};${esc(d.cp)};México`,
      T.nota && `NOTE:${esc(T.nota)}`,
    ];
    const foto = await fotoBase64();
    if (foto) lineas.push(`PHOTO;ENCODING=b;TYPE=JPEG:${foto}`);
    lineas.push('END:VCARD');
    return lineas.filter(Boolean).join('\r\n');
  };
  $$('[data-vcard]').forEach(btn => btn.addEventListener('click', async () => {
    const texto = await vcard();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([texto], { type: 'text/vcard' }));
    a.download = `${[T.nombre, T.apellido].join('-').normalize('NFD').replace(/[\u0300-\u036f]/g, '')}.vcf`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    toast('Abre el archivo para guardarlo en tus contactos');
  }));
  window.__vcard = vcard; // para las pruebas

  // ---------- Compartir ----------
  $$('[data-share]').forEach(btn => btn.addEventListener('click', async () => {
    const datos = { title: completo, text: `${completo} · ${T.puesto}`, url: aqui() };
    if (navigator.share) {
      try { await navigator.share(datos); return; } catch (e) { if (e.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(aqui()); toast('Enlace copiado'); }
    catch { toast(aqui()); }
  }));

  // ---------- Mostrar QR (para que te escaneen en persona) ----------
  const dlg = $('#qr');
  $$('[data-qr]').forEach(btn => btn.addEventListener('click', () => {
    const caja = $('[data-qr-box]', dlg);
    if (!caja.firstChild && window.qrcode) {
      const qr = qrcode(0, 'M');
      qr.addData(aqui());
      qr.make();
      caja.innerHTML = qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
    }
    dlg.showModal();
  }));
  dlg?.addEventListener('click', e => { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });

  // ---------- Abierto / cerrado según el horario ----------
  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const hora = h => {
    const H = Math.floor(h) % 24, m = Math.round((h - Math.floor(h)) * 60);
    return `${((H + 11) % 12) + 1}${m ? ':' + String(m).padStart(2, '0') : ''} ${H < 12 ? 'am' : 'pm'}`;
  };
  const estado = (d = new Date()) => {
    const H = T.horario;
    if (!H) return null;
    const hoy = d.getDay(), h = d.getHours() + d.getMinutes() / 60, r = H[hoy];
    if (r && h >= r[0] && h < r[1]) return { abierto: true, texto: `Abierto ahora · cierra ${hora(r[1])}` };
    if (r && h < r[0]) return { abierto: false, texto: `Cerrado · abre hoy ${hora(r[0])}` };
    for (let i = 1; i <= 7; i++) {
      const dd = (hoy + i) % 7;
      if (H[dd]) return { abierto: false, texto: `Cerrado · abre ${i === 1 ? 'mañana' : 'el ' + DIAS[dd]} ${hora(H[dd][0])}` };
    }
    return null;
  };
  const pintarEstado = () => {
    const e = estado();
    $$('[data-abierto]').forEach(el => {
      el.hidden = !e;
      if (!e) return;
      el.textContent = e.texto;
      el.classList.toggle('is-open', e.abierto);
    });
  };
  pintarEstado();
  setInterval(pintarEstado, 60000);

  // Próximos días en que se atiende (para elegir fecha de cita)
  const proximosDias = (n, desde = new Date()) => {
    const lista = [];
    for (let i = 0; lista.length < n && i < 30; i++) {
      const d = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate() + i);
      const r = T.horario?.[d.getDay()];
      if (!r) continue;
      if (i === 0 && desde.getHours() + desde.getMinutes() / 60 >= r[1] - 1) continue; // hoy ya casi cierra
      lista.push(d);
    }
    return lista;
  };
  const fechaCorta = (d, hoy = new Date()) => {
    const sinHora = x => new Date(x.getFullYear(), x.getMonth(), x.getDate());
    const dif = Math.round((sinHora(d) - sinHora(hoy)) / 864e5);
    if (dif === 0) return 'hoy';
    if (dif === 1) return 'mañana';
    return `${DIAS[d.getDay()]} ${d.getDate()}`;
  };
  const dinero = n => '$' + Math.round(n).toLocaleString('es-MX');
  const abrirWA = texto => window.open(wa(texto), '_blank', 'noopener');
  window.__estado = estado; // para las pruebas

  // ---------- Lo propio de cada tarjeta ----------
  T.iniciar?.({ $, $$, abrirWA, toast, estado, hora, proximosDias, fechaCorta, dinero, DIAS });

  // ---------- Efectos al bajar ----------
  if (window.motion && T.efectos) {
    if (T.efectos.reveal) motion.reveal(T.efectos.reveal);
    if (T.efectos.stagger) motion.stagger(T.efectos.stagger);
  }
})();
