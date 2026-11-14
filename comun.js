// Funciones que comparten las tarjetas digitales. Cada tarjeta define antes (en su tarjeta.js):
//   TARJETA = { prefijo, nombre, apellido, puesto, empresa, tel, whatsapp, email, web?,
//               direccion: { calle, ciudad, estado, cp }, mapa, foto, nota?, saludo }
// La página usa: [data-call] [data-wa] [data-mail] [data-map] (se llenan solos),
//   [data-vcard] guardar contacto · [data-share] compartir · [data-qr] mostrar QR (#qr con [data-qr-box])
//   [data-wa-text="…"] otros botones de WhatsApp con su propio mensaje · [data-toast] avisos
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

  // ---------- Efectos al bajar ----------
  if (window.motion && T.efectos) {
    if (T.efectos.reveal) motion.reveal(T.efectos.reveal);
    if (T.efectos.stagger) motion.stagger(T.efectos.stagger);
  }
})();
