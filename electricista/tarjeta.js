// Ramón Ortiz · datos de la tarjeta, colonias donde trabaja y el formulario. Lo que comparten todas está en ../comun.js.
window.TARJETA = {
  nombre: 'Ramón',
  apellido: 'Ortiz',
  puesto: 'Electricista',
  empresa: 'Ortiz Electricidad',
  tel: '+529990000000',
  whatsapp: '529990000000',
  email: 'ramon@ejemplo.com',
  direccion: { ciudad: 'Mérida', estado: 'Yucatán' },
  mapa: 'Mérida, Yucatán',
  nota: 'Electricista. Urgencias 24 horas, instalaciones, cortos y contactos. Garantía de 90 días.',
  saludo: 'Hola Ramón, vi tu tarjeta y necesito un electricista.',
  efectos: { reveal: '.block', stagger: '.prices' },

  // Dónde trabaja: colonias por nombre y códigos postales (del primero al último)
  zona: {
    colonias: ['Centro', 'García Ginerés', 'Itzimná', 'México', 'Montejo', 'Altabrisa', 'Montebello', 'Pensiones',
      'Chuburná', 'Benito Juárez Norte', 'Los Pinos', 'San Ramón Norte', 'Temozón Norte', 'Francisco de Montejo', 'Buenavista'],
    cp: [97000, 97139],
  },

  iniciar({ $, abrirWA }) {
    const Z = window.TARJETA.zona;
    const limpio = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/^(col\.?|colonia)\s+/, '').trim();
    $('[data-zona-lista]').textContent = Z.colonias.join(' · ') + ` y códigos postales ${Z.cp[0]} a ${Z.cp[1]}.`;

    // ¿Llego a tu colonia?
    const zona = $('[data-zona]');
    const res = $('[data-zona-result]');
    const revisar = q => {
      q = q.trim();
      if (!q) return { tipo: 'vacio', texto: 'Escribe tu colonia o tu código postal.' };
      if (/^\d{5}$/.test(q)) {
        const n = +q;
        return n >= Z.cp[0] && n <= Z.cp[1]
          ? { tipo: 'si', texto: `Sí llego al ${q}. La visita cuesta $250 y se descuenta si hago el trabajo.` }
          : { tipo: 'no', texto: `El ${q} me queda lejos, pero mándame mensaje: a veces voy con un costo extra.` };
      }
      const c = Z.colonias.find(x => limpio(x) === limpio(q)) || Z.colonias.find(x => limpio(q).length >= 4 && limpio(x).includes(limpio(q)));
      return c
        ? { tipo: 'si', colonia: c, texto: `Sí llego a ${c}. La visita cuesta $250 y se descuenta si hago el trabajo.` }
        : { tipo: 'no', texto: 'No la tengo en mi lista, pero mándame mensaje: a veces voy con un costo extra.' };
    };
    window.__zona = revisar; // para las pruebas
    zona.addEventListener('submit', e => {
      e.preventDefault();
      const r = revisar(zona.q.value);
      res.textContent = r.texto;
      res.dataset.tipo = r.tipo;
      res.hidden = false;
      const colonia = $('[data-problema] [name=colonia]');
      if (r.tipo !== 'vacio' && !colonia.value) colonia.value = r.colonia || zona.q.value.trim();
    });

    // Cuéntame qué pasa
    const form = $('[data-problema]');
    const error = $('[data-problema-error]');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const tipo = form.querySelector('[name=tipo]:checked')?.value;
      const colonia = form.colonia.value.trim();
      const falta = !tipo ? 'Elige qué falla.' : !colonia ? 'Escribe tu colonia para saber si llego.' : '';
      error.textContent = falta;
      error.hidden = !falta;
      if (falta) return form.querySelector(!tipo ? '[name=tipo]' : '[name=colonia]')?.focus();
      const urgente = form.cuando.value.startsWith('Urgente');
      abrirWA([
        `${urgente ? '🚨 ' : ''}Hola Ramón, necesito un electricista ⚡`,
        `Problema: ${tipo}`,
        `Para cuándo: ${form.cuando.value}`,
        `Colonia: ${colonia}`,
        form.detalle.value.trim() && `Detalles: ${form.detalle.value.trim()}`,
        'Te mando foto en seguida 📷',
      ].filter(Boolean).join('\n'));
    });
  },
};
