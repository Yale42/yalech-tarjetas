# yalech · tarjetas digitales

Muestrario de tarjetas de presentación digitales de Yael González (@yalech). Cada ejemplo es una persona o negocio
ficticio, vive en su carpeta y se puede probar en vivo: guardar el contacto, escribir por WhatsApp, mostrar el QR y
lo propio de cada negocio.

| Carpeta | Para | Lo especial |
| --- | --- | --- |
| `abogada/` | Abogados y consultores | Áreas de práctica, cédula, primera consulta sin costo |
| `dentista/` | Dentistas y doctores | Agenda de citas (motivo, día y turno), «Abierto ahora», precios |
| `inmobiliaria/` | Asesores inmobiliarios | Propiedades en carrusel con «Me interesa», valuación |
| `barberia/` | Barberías y estéticas | «Arma tu servicio» con total y tiempo, horas libres del día, sellos de cliente frecuente |
| `electricista/` | Oficios y técnicos | Urgencias 24 h, «¿Llego a tu colonia?» por nombre o código postal, el problema por WhatsApp |
| `reposteria/` | Reposteras y negocios desde casa | Cotizador de pastel con dibujo que cambia (pisos, sabor, mensaje), fecha con anticipación |
| `fotografo/` | Fotógrafos y creativos | Portafolio y paquetes |

Las cuatro nuevas (dentista, barbería, electricista y repostería) están ilustradas con CSS: no usan fotos.

## Cómo funciona

- **`comun.js`** hace lo que comparten todas: guardar contacto (vCard con foto si la hay), botones de llamar,
  WhatsApp, correo y mapa, compartir, mostrar el QR y el aviso «Abierto ahora · cierra 7 pm» según el horario.
  Al inicio del archivo está la lista de lo que acepta.
- **`tarjeta.js`** de cada carpeta tiene los datos (nombre, teléfono, horario…) y, si la tarjeta trae algo propio
  (agenda, cotizador, zona), su función `iniciar`. Los precios del cotizador y las colonias se cambian ahí mismo.
- **WhatsApp:** los mensajes llegan al número de `whatsapp` de cada tarjeta (en los ejemplos son números de prueba).
- **`imprimir.html`** arma la tarjeta de papel de 9 × 5 cm con el QR de la tarjeta digital y la imprime 10 por hoja
  carta. Usa `assets/qrcode.min.js` (copia local de qrcode-generator, licencia MIT).

## Otros archivos

- `index.html` y `estilos.css` — portada con los ejemplos (mismo estilo que el catálogo principal).
- `assets/cotizar.js` / `cotizar.css` — cotizador en 1 minuto. `assets/carrusel.js` / `carrusel.css` — señales del carrusel.
- `assets/plantillas/` — capturas que usa la portada (si cambias una tarjeta, vuelve a tomar la suya).
- `<carpeta>/assets/og.jpg` — imagen al compartir el enlace. Al publicar, pon su URL completa en `og:image`.
- `404.html` — página de error. `_headers` — encabezados de seguridad (Netlify o Cloudflare Pages).

El catálogo completo y el link en bio están en el repositorio `yalech-web-link-in-bio`. Los enlaces hacia allá usan
`https://yale42.github.io/yalech-web-link-in-bio/`: cámbialos por tu dominio cuando lo tengas.

Hecho a mano: HTML, CSS y JavaScript, sin herramientas de compilación. Para verlo, sirve la carpeta con
`python3 -m http.server` y abre `http://localhost:8000`.
