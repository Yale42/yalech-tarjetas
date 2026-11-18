// Dra. Sofía Ríos · datos de la tarjeta y la agenda de citas. Lo que comparten todas está en ../comun.js.
window.TARJETA = {
  prefijo: 'Dra.',
  nombre: 'Sofía',
  apellido: 'Ríos',
  puesto: 'Cirujana dentista',
  empresa: 'Clínica Sonríe',
  tel: '+523300000000',
  whatsapp: '523300000000',
  email: 'citas@ejemplo.com',
  direccion: { calle: 'Av. Pablo Neruda 2850, consultorio 304', ciudad: 'Guadalajara', estado: 'Jalisco', cp: '44630' },
  mapa: 'Av. Pablo Neruda 2850, Providencia, Guadalajara',
  nota: 'Limpiezas, resinas, ortodoncia y blanqueamiento. Revisión sin costo.',
  saludo: 'Hola Dra. Sofía, vi su tarjeta y quisiera hacer una consulta.',
  // Domingo a sábado: [abre, cierra] en horas, null = cerrado
  horario: [null, [9, 19], [9, 19], [9, 19], [9, 19], [9, 19], [9, 14]],
  efectos: { reveal: '.block, .address', stagger: '.prices' },

  // Agenda: elige motivo, día y turno, y llega por WhatsApp
  iniciar({ $, abrirWA, proximosDias, fechaCorta }) {
    const form = $('[data-cita]');
    const error = $('[data-cita-error]');
    const largo = d => d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
    $('[data-dias]').replaceChildren(...proximosDias(6).map(d => {
      const l = document.createElement('label');
      l.innerHTML = '<input type="radio" name="dia" /><span><small></small><b></b></span>';
      const input = l.querySelector('input');
      input.value = largo(d);
      l.querySelector('small').textContent = ['hoy', 'mañana'].includes(fechaCorta(d)) ? fechaCorta(d) : d.toLocaleDateString('es-MX', { weekday: 'short' }).replace('.', '');
      l.querySelector('b').textContent = d.getDate();
      return l;
    }));

    form.addEventListener('submit', e => {
      e.preventDefault();
      const motivo = form.motivo.value, dia = form.dia.value, nombre = form.nombre.value.trim();
      const falta = !motivo ? 'Elige para qué es la cita.' : !dia ? 'Elige un día.' : '';
      error.textContent = falta;
      error.hidden = !falta;
      if (falta) return;
      abrirWA([
        'Hola Dra. Sofía, quiero agendar una cita 🦷',
        `Motivo: ${motivo}`,
        `Día: ${dia}`,
        `Horario: ${form.turno.value}`,
        nombre && `Nombre: ${nombre}`,
      ].filter(Boolean).join('\n'));
    });
  },
};
