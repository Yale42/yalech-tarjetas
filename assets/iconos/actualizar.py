"""Arma assets/iconos/ solo con los íconos de Font Awesome que usan las páginas.

En lugar de descargar los más de 2,000 íconos de Font Awesome en cada visita, las páginas cargan
una fuente recortada con los que de verdad aparecen en el HTML y JS del repo.

Cuándo correrlo: si agregas un ícono nuevo (<i class="fa-solid fa-algo">) y sale un cuadrito vacío.

Cómo (una sola vez, en una carpeta aparte):
    npm pack @fortawesome/fontawesome-free@6.5.1 && tar xzf fortawesome-fontawesome-free-6.5.1.tgz
    python3 -m venv venv && venv/bin/pip install fonttools brotli
Luego, desde la raíz del repo:
    ruta/a/venv/bin/python assets/iconos/actualizar.py ruta/a/package
"""
import hashlib
import pathlib
import re
import sys

from fontTools import subset

RAIZ = pathlib.Path(__file__).resolve().parents[2]
SALIDA = RAIZ / 'assets' / 'iconos'
ESTILOS = {'fa-solid', 'fa-regular', 'fa-brands'}
FUENTES = {  # archivo de Font Awesome → (familia, peso, nombre recortado)
    'fa-solid-900.woff2': ('Font Awesome 6 Free', 900, 'solid.woff2'),
    'fa-regular-400.woff2': ('Font Awesome 6 Free', 400, 'regular.woff2'),
    'fa-brands-400.woff2': ('Font Awesome 6 Brands', 400, 'brands.woff2'),
}


def main(paquete: pathlib.Path) -> None:
    css_fa = (paquete / 'css' / 'all.css').read_text()

    # Nombre de ícono → código (incluye los alias, p. ej. fa-close = fa-xmark)
    codigos = {}
    for nombres, cp in re.findall(r'((?:\.fa-[a-z0-9-]+::?before,?\s*)+)\{\s*content:\s*"\\([0-9a-f]+)"', css_fa):
        for n in re.findall(r'\.(fa-[a-z0-9-]+)::?before', nombres):
            codigos.setdefault(n, cp)

    # Íconos que aparecen en el repo
    usados = set()
    for f in RAIZ.rglob('*'):
        if f.suffix in {'.html', '.js'} and SALIDA not in f.parents and '.git' not in f.parts:
            usados |= set(re.findall(r'fa-[a-z0-9-]+', f.read_text(errors='ignore')))
    usados -= ESTILOS
    faltan = sorted(n for n in usados if n not in codigos)
    usados = sorted(n for n in usados if n in codigos)
    if faltan:
        print('Ojo, estos no son íconos de Font Awesome 6.5.1:', ', '.join(faltan))

    # Íconos que pone el CSS con content: "\f0c4" (p. ej. ::before/::after); no tienen clase
    en_css = set()
    for f in RAIZ.rglob('*.css'):
        if SALIDA not in f.parents and '.git' not in f.parts:
            en_css |= set(re.findall(r'content:\s*["\']\\(f[0-9a-f]{3})["\']', f.read_text(errors='ignore')))

    unicodes = sorted({int(codigos[n], 16) for n in usados} | {int(c, 16) for c in en_css})
    caras = []
    for origen, (familia, peso, destino) in FUENTES.items():
        op = subset.Options()
        op.flavor = 'woff2'
        op.layout_features = []
        op.name_IDs = ['*']
        op.notdef_outline = True
        fuente = subset.load_font(str(paquete / 'webfonts' / origen), op)
        sub = subset.Subsetter(op)
        sub.populate(unicodes=unicodes)
        sub.subset(fuente)
        subset.save_font(fuente, str(SALIDA / destino), op)
        # La versión cambia sola cuando cambia la fuente, para que el navegador no use una vieja
        version = hashlib.sha1((SALIDA / destino).read_bytes()).hexdigest()[:8]
        caras.append(f"@font-face {{ font-family: '{familia}'; font-style: normal; font-weight: {peso}; "
                     f"font-display: block; src: url(\"{destino}?v={version}\") format(\"woff2\"); }}")

    reglas = '\n'.join(f'.{n}::before {{ content: "\\{codigos[n]}"; }}' for n in usados)
    (SALIDA / 'iconos.css').write_text(f"""/* Íconos: Font Awesome Free 6.5.1 (https://fontawesome.com), recortado a los que usa este sitio.
 * Licencia: íconos CC BY 4.0, fuentes SIL OFL 1.1, código MIT. Copyright 2023 Fonticons, Inc.
 * Generado con assets/iconos/actualizar.py; no lo edites a mano. */
{chr(10).join(caras)}

.fa-solid, .fa-regular, .fa-brands {{
  -moz-osx-font-smoothing: grayscale; -webkit-font-smoothing: antialiased;
  display: var(--fa-display, inline-block); font-style: normal; font-variant: normal;
  line-height: 1; text-rendering: auto;
}}
.fa-solid {{ font-family: 'Font Awesome 6 Free'; font-weight: 900; }}
.fa-regular {{ font-family: 'Font Awesome 6 Free'; font-weight: 400; }}
.fa-brands {{ font-family: 'Font Awesome 6 Brands'; font-weight: 400; }}

{reglas}
""")
    print(f'{len(usados)} íconos (+{len(en_css)} desde CSS) →', ', '.join(f'{d}: {(SALIDA / d).stat().st_size // 1024} KB' for *_, d in FUENTES.values()))


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(pathlib.Path(sys.argv[1]).resolve())
