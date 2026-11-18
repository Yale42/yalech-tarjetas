// Toño Barber Club · datos de la tarjeta y «Arma tu servicio». Lo que comparten todas está en ../comun.js.
window.TARJETA = {
  nombre: 'Antonio',
  apellido: 'Cruz',
  puesto: 'Barbero',
  empresa: 'Toño Barber Club',
  tel: '+524770000000',
  whatsapp: '524770000000',
  email: 'tonobarber@ejemplo.com',
  direccion: { calle: 'Blvd. Campestre 1520, local 4', ciudad: 'León', estado: 'Guanajuato', cp: '37160' },
  mapa: 'Blvd. Campestre 1520, Jardines del Moral, León, Guanajuato',
  nota: 'Cortes, fades y barba. Aparta tu lugar por WhatsApp.',
  saludo: 'Hola Toño, vi tu tarjeta y quiero apartar un lugar.',
  // Domingo a sábado: [abre, cierra] en horas, null = cerrado
  horario: [[10, 15], null, [10, 20], [10, 20], [10, 20], [10, 20], [10, 20]],
  efectos: { reveal: '.block', stagger: '.menu' },

  // Arma tu servicio: suma precio y tiempo, elige día y hora, y lo aparta por WhatsApp
  iniciar({ $, $$, abrirWA, proximosDias, fechaCorta, hora, dinero }) {
    const T = window.TARJETA;
    const form = $('[data-servicio]');
    const error = $('[data-servicio-error]');
    const horas = $('[data-horas]');
    const dias = proximosDias(5);
    const largo = d => d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
    const elegidos = () => $$('[name=serv]:checked', form);

    const pintarTotal = () => {
      const s = elegidos();
      const total = s.reduce((n, i) => n + +i.dataset.precio, 0);
      const min = s.reduce((n, i) => n + +i.dataset.min, 0);
      $('[data-total]').textContent = dinero(total);
      $('[data-dur]').textContent = s.length ? `${min} min aprox.` : 'Elige un servicio';
    };

    const pintarHoras = d => {
      const [abre, cierra] = T.horario[d.getDay()];
      const ahora = new Date();
      const esHoy = d.toDateString() === ahora.toDateString();
      const libres = [];
      for (let h = Math.ceil(abre); h <= cierra - 1; h++) {
        if (esHoy && h <= ahora.getHours() + ahora.getMinutes() / 60 + 0.5) continue;
        libres.push(h);
      }
      horas.replaceChildren(...libres.map(h => {
        const l = document.createElement('label');
        l.innerHTML = '<input type="radio" name="hora" /><span></span>';
        l.querySelector('input').value = hora(h);
        l.querySelector('span').textContent = hora(h);
        return l;
      }));
      if (!libres.length) horas.innerHTML = '<p class="empty">Ya no hay lugares hoy. Elige otro día.</p>';
    };

    $('[data-dias]').replaceChildren(...dias.map((d, i) => {
      const l = document.createElement('label');
      l.innerHTML = '<input type="radio" name="dia" /><span><small></small><b></b></span>';
      const input = l.querySelector('input');
      input.value = largo(d);
      input.addEventListener('change', () => pintarHoras(d));
      const corto = fechaCorta(d);
      l.querySelector('small').textContent = ['hoy', 'mañana'].includes(corto) ? corto : d.toLocaleDateString('es-MX', { weekday: 'short' }).replace('.', '');
      l.querySelector('b').textContent = d.getDate();
      return l;
    }));

    form.addEventListener('change', e => { if (e.target.name === 'serv') pintarTotal(); });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const s = elegidos();
      const dia = form.querySelector('[name=dia]:checked')?.value;
      const h = form.querySelector('[name=hora]:checked')?.value;
      const falta = !s.length ? 'Elige al menos un servicio.' : !dia ? 'Elige el día.' : !h ? 'Elige la hora.' : '';
      error.textContent = falta;
      error.hidden = !falta;
      if (falta) return;
      const nombre = form.nombre.value.trim();
      abrirWA([
        'Hola Toño, quiero apartar lugar 💈',
        `Servicio: ${s.map(i => i.value).join(' + ')}`,
        `Total: ${$('[data-total]').textContent} · ${$('[data-dur]').textContent}`,
        `Día: ${dia}`,
        `Hora: ${h}`,
        nombre && `Nombre: ${nombre}`,
      ].filter(Boolean).join('\n'));
    });
    pintarTotal();
  },
};
