# Sirve las tipografías de Google desde el propio repo y precarga las del texto latino.
# Es el mismo archivo en los 7 repos. Cuándo correrlo: si una página nueva trae un
# <link href="https://fonts.googleapis.com/css2?..." rel="stylesheet" /> (así se agregan las tipografías).
# Uso, desde la carpeta del repo: python3 assets/fuentes/actualizar.py . [filtro de páginas]
# (Las páginas 404 se quedan con Google: se abren desde cualquier ruta y no sirve una ruta relativa.)
# - Descarga el CSS de Google de cada página (con un navegador moderno → woff2) y se queda con
#   los juegos «latin» y «latin-ext» (español completo).
# - Guarda los .woff2 en <repo>/assets/fuentes/ y un .css por combinación de familias.
# - En la página: cambia el <link> de Google por el local, quita los preconnect a Google y
#   precarga los archivos «latin» (los que usa todo el texto en español).
import re, sys, os, glob, hashlib, urllib.request, html
REPO, FILTRO = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else '')
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
SAL = os.path.join(REPO, 'assets', 'fuentes')
os.makedirs(SAL, exist_ok=True)
CACHE = {}

def bajar(url, binario=False):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        d = r.read()
    return d if binario else d.decode('utf-8')

def preparar(url_google):
    """→ (nombre del css local, [archivos latin a precargar])"""
    if url_google in CACHE: return CACHE[url_google]
    css = bajar(url_google)
    caras, latin = [], []
    for sub, cuerpo in re.findall(r'/\* ([a-z-]+) \*/\s*(@font-face \{.*?\})', css, re.S):
        if sub not in ('latin', 'latin-ext'): continue
        fam = re.search(r"font-family: '([^']+)'", cuerpo).group(1)
        url = re.search(r'url\((https://fonts\.gstatic\.com/[^)]+\.woff2)\)', cuerpo).group(1)
        datos = bajar(url, True)
        nombre = re.sub(r'[^a-z0-9]+', '-', fam.lower()).strip('-') + f'-{sub}-{hashlib.sha1(datos).hexdigest()[:8]}.woff2'
        ruta = os.path.join(SAL, nombre)
        if not os.path.exists(ruta): open(ruta, 'wb').write(datos)
        caras.append(cuerpo.replace(f'url({url})', f'url({nombre})'))
        if sub == 'latin' and nombre not in latin: latin.append(nombre)
    familias = '-'.join(re.sub(r'[^a-z0-9]+', '', f.lower()) for f in re.findall(r'family=([^:&]+)', url_google))
    hoja = f'{familias}-{hashlib.sha1(url_google.encode()).hexdigest()[:6]}.css'
    open(os.path.join(SAL, hoja), 'w').write(
        f'/* Tipografías de Google Fonts (licencia SIL OFL), servidas desde este sitio.\n'
        f' * Origen: {url_google}\n * Solo los juegos latin y latin-ext. Se genera con fuentes.py; no editar a mano. */\n'
        + '\n'.join(caras) + '\n')
    CACHE[url_google] = (hoja, latin)
    return CACHE[url_google]

cambiadas = 0
for p in glob.glob(os.path.join(REPO, '**', '*.html'), recursive=True):
    if '/.git/' in p or FILTRO not in p or p.endswith('404.html'): continue
    s = open(p, encoding='utf-8').read()
    m = re.search(r'\n?(\s*)<link href="(https://fonts\.googleapis\.com/css2\?[^"]+)" rel="stylesheet" />', s)
    if not m: continue
    url = html.unescape(m.group(2))
    hoja, latin = preparar(url)
    rel = os.path.relpath(SAL, os.path.dirname(p))
    ind = m.group(1)
    nuevo = ''.join(f'\n{ind}<link rel="preload" href="{rel}/{f}" as="font" type="font/woff2" crossorigin />' for f in latin)
    nuevo += f'\n{ind}<link rel="stylesheet" href="{rel}/{hoja}" />'
    s = s[:m.start()] + nuevo + s[m.end():]
    s = re.sub(r'\n\s*<link rel="preconnect" href="https://fonts\.(googleapis|gstatic)\.com"[^>]*/>', '', s)
    open(p, 'w', encoding='utf-8').write(s)
    cambiadas += 1
print(f'{cambiadas} páginas; {len(CACHE)} combinaciones de tipografías')
for f in sorted(os.listdir(SAL)): print(f'  {f}: {os.path.getsize(os.path.join(SAL, f)) // 1024} KB')
