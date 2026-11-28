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

## Al usar un ejemplo con un cliente real

1. Copia la carpeta del ejemplo a un repositorio nuevo, junto con lo que use de `assets/`.
2. Borra lo que solo sirve para mostrar el ejemplo (la barra y el script traen un comentario que lo indica):
   - el bloque `<div class="mu-barra">` del inicio del `<body>` (barra «Ejemplo ficticio · ← Más ejemplos · Quiero uno así»);
   - la línea `<script src="…/assets/muestra.js…">` y el `<link>` a `muestra.css` del `<head>`. Sin ellas, los botones de
     WhatsApp, llamar y correo vuelven a abrir de verdad.
3. Deja `assets/errores.js`: hace que los errores de los formularios se vean igual en todos lados (el campo se marca en
   rojo, el cursor salta a él, los lectores de pantalla anuncian el aviso y se quita en cuanto la persona lo corrige).
4. Cambia los datos del negocio: WhatsApp, teléfonos, correo, dirección y horario. Las etiquetas `og:` de la vista previa
   necesitan la dirección completa del sitio (`https://…/assets/og.jpg`).
5. Si agregas íconos o tipografías, corre los programas de `assets/iconos/` y `assets/fuentes/` (abajo).

## Archivos compartidos (iguales en los 7 repos)

- `assets/muestra.js` y `muestra.css` — modo muestra: en vez de abrir WhatsApp, llamar o mandar correo al número de prueba,
  enseña lo que pasaría de verdad y ofrece «Quiero uno así». También acomoda los encabezados fijos debajo de la barra de
  ejemplo. Se configura en la etiqueta `<script>` de cada ejemplo (`data-servicio`, `data-ejemplo`, `data-para`).
- `assets/errores.js` — mismo comportamiento de errores en todos los formularios (ver el paso 3).
- `assets/iconos/actualizar.py` — recorta Font Awesome a los íconos que usa este repo (de unos 400 KB a menos de 15 KB).
  Córrelo si agregas un ícono y sale un cuadrito vacío; las instrucciones están al inicio del archivo.
- `assets/fuentes/actualizar.py` — sirve las tipografías de Google desde este mismo sitio y precarga las del texto, para que
  la página no brinque al cambiar de letra. Córrelo si una página nueva trae un `<link>` a `fonts.googleapis.com`.

## Otros archivos

- `index.html` y `estilos.css` — portada con los ejemplos (mismo estilo que el catálogo principal).
- `assets/cotizar.js` / `cotizar.css` — cotizador en 1 minuto. `assets/carrusel.js` / `carrusel.css` — señales del carrusel.
- `assets/plantillas/` — capturas que usa la portada (si cambias una tarjeta, vuelve a tomar la suya).
- `<carpeta>/assets/og.jpg` — imagen al compartir el enlace. Al publicar, pon su URL completa en `og:image`.
- `404.html` — página de error. `_headers` — encabezados de seguridad (Netlify o Cloudflare Pages).

El catálogo completo y el link en bio están en el repositorio `yalech-web-link-in-bio`. Los enlaces hacia allá son
relativos (`../yalech-web-link-in-bio/`): funcionan igual en tu compu y en GitHub Pages mientras todos los repos vivan bajo
la misma dirección. Solo `404.html` usa la dirección completa, porque se muestra desde cualquier ruta.

Hecho a mano: HTML, CSS y JavaScript, sin herramientas de compilación. Para verlo, sirve la carpeta con
`python3 -m http.server` y abre `http://localhost:8000`.
