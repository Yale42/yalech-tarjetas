// Pasteles Lulú · datos de la tarjeta y el cotizador de pasteles. Lo que comparten todas está en ../comun.js.
window.TARJETA = {
  nombre: 'Lourdes',
  apellido: 'Herrera',
  puesto: 'Repostera',
  empresa: 'Pasteles Lulú',
  tel: '+522220000000',
  whatsapp: '522220000000',
  email: 'pasteleslulu@ejemplo.com',
  direccion: { calle: 'Calle 25 Sur 1104, col. Volcanes', ciudad: 'Puebla', estado: 'Puebla', cp: '72410' },
  mapa: 'Calle 25 Sur 1104, Volcanes, Puebla',
  nota: 'Pasteles, cupcakes y galletas por encargo. Pedidos con 3 días de anticipación.',
  saludo: 'Hola Lulú, vi tu tarjeta y quiero encargar un pastel.',
  // Domingo a sábado: [abre, cierra] en horas, null = cerrado
  horario: [[10, 14], null, [10, 19], [10, 19], [10, 19], [10, 19], [10, 19]],
  efectos: { reveal: '.block, .address', stagger: '.dozen' },

  // Precios del cotizador (cámbialos aquí)
  pastel: {
    personas: { 10: [450, 1], 20: [750, 2], 30: [1050, 2], 50: [1600, 3] }, // precio, pisos del dibujo
    sabores: [
      ['Chocolate', 0, '#6b3e2e'],
      ['Vainilla', 0, '#f3d9a4'],
      ['Red velvet', 80, '#b8323f'],
      ['Tres leches', 60, '#fbeed0'],
      ['Zanahoria', 60, '#d98b4a'],
    ],
    rellenos: { Nutella: 80 },
    decoraciones: [
      ['Sencilla', 0, '#fff7ef'],
      ['Flores naturales', 200, '#fde3ea'],
      ['Foto comestible', 150, '#e3f0ff'],
      ['Temática', 250, '#e7f7e1'],
    ],
    anticipacion: 3, // días
  },

  iniciar({ $, abrirWA, dinero }) {
    const P = window.TARJETA.pastel;
    const form = $('[data-pastel]');
    const cake = $('[data-cake]');
    const error = $('[data-pastel-error]');
    const pills = (cont, name, lista) => $(cont).replaceChildren(...lista.map(([n, extra, color], i) => {
      const l = document.createElement('label');
      l.innerHTML = '<input type="radio" /><span><i></i></span>';
      const input = l.querySelector('input');
      Object.assign(input, { name, value: n, checked: i === 0 });
      l.querySelector('i').style.background = color;
      l.querySelector('span').append(n + (extra ? ` +${dinero(extra)}` : ''));
      return l;
    }));
    pills('[data-sabores]', 'sabor', P.sabores);
    pills('[data-decoraciones]', 'deco', P.decoraciones);

    // Fecha: mínimo con días de anticipación
    const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const hoy = new Date();
    const minima = iso(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + P.anticipacion));
    form.fecha.min = minima;

    const cotizar = () => {
      const [base, pisos] = P.personas[form.personas.value];
      const sabor = P.sabores.find(s => s[0] === form.sabor.value) || P.sabores[0];
      const deco = P.decoraciones.find(s => s[0] === form.deco.value) || P.decoraciones[0];
      const total = base + sabor[1] + deco[1] + (P.rellenos[form.relleno.value] || 0);
      return { total, pisos, sabor, deco };
    };
    const pintar = () => {
      const c = cotizar();
      $('[data-precio]').textContent = dinero(c.total);
      cake.dataset.pisos = c.pisos;
      cake.style.setProperty('--sponge', c.sabor[2]);
      cake.style.setProperty('--frost', c.deco[2]);
      const msg = form.mensaje.value.trim();
      $('[data-placa]').textContent = msg;
      $('[data-placa]').hidden = !msg;
    };
    form.addEventListener('input', pintar);
    form.addEventListener('change', pintar);
    window.__pastel = cotizar; // para las pruebas

    form.addEventListener('submit', e => {
      e.preventDefault();
      const f = form.fecha.value;
      const falta = !f ? '¿Para qué día lo necesitas?' : f < minima ? `Necesito al menos ${P.anticipacion} días para prepararlo. Escríbeme si es urgente.` : '';
      error.textContent = falta;
      error.hidden = !falta;
      if (falta) return form.fecha.focus();
      const c = cotizar();
      const fecha = new Date(f + 'T12:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
      const msg = form.mensaje.value.trim();
      abrirWA([
        'Hola Lulú, quiero encargar un pastel 🎂',
        `Para: ${form.personas.value} personas`,
        `Sabor: ${c.sabor[0]} · Relleno: ${form.relleno.value}`,
        `Decoración: ${c.deco[0]}`,
        msg && `Mensaje: «${msg}»`,
        `Fecha: ${fecha}`,
        `Precio estimado: ${dinero(c.total)}`,
      ].filter(Boolean).join('\n'));
    });
    pintar();
  },
};
