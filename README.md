# One Music Global — propuesta web

Sitio estático (HTML + CSS + JS) con GSAP, ScrollTrigger y Lenis desde CDN.


## Estructura

```
index.html                 página principal
artista.html               plantilla de perfil (artista.html?a=slug)

css/
  main.css                 importa todos los archivos de abajo
  base/                    variables, reset, tipografía y layout general
  components/              logo, botones, barra, menú, loader, cursor, reproductor, botón subir
  sections/                un archivo por sección (hero, roster, servicios, lanzamientos…)
  pages/artist.css         página de artista

js/
  data/                    el contenido de cada sección, un archivo por sección
  core/app.js              utilidades compartidas y registro de secciones
  sections/                un archivo por sección: pinta su contenido y sus animaciones
  main.js                  lo general: scroll suave, colores, menú, cursor, loader, transiciones

tools/omg.js               editor de contenido por consola
assets/                    imágenes, video, fuente Krick y favicon
```

Las duraciones de todos los hovers están en `css/base/variables.css` (`--t-fast`, `--t`, `--t-slow`).


## Editar contenido

Cada sección lee su contenido de su propio archivo en `js/data/`:

| Archivo | Sección |
|---|---|
| `releases.js` | Lanzamientos (portada, audio, enlace de Spotify) |
| `artists.js` | Roster y páginas de artista |
| `stats.js` | Cifras |
| `services.js` | Servicios (tarjetas apiladas) |
| `bands.js` | Cintas amarilla y turquesa |
| `music-business.js` | Texto que corre abajo en Music Business |
| `gallery.js` | Fotos de la galería de cada artista |
| `i18n.js` | Textos en inglés |


## Idioma (ES / EN)

La página sale en español por defecto. El selector ES / EN de la barra cambia el idioma y lo recuerda en el navegador. Para compartir la versión en inglés directamente: `index.html?lang=en`.

Todas las traducciones están en `js/data/i18n.js`:

- `ui`: textos fijos de la página. En el HTML, cada texto lleva `data-i18n="clave"` (o `data-i18n-attr` para atributos), y aquí va su versión en inglés.
- `content`: textos de los archivos de datos, escritos como `"texto en español": "text in English"`. Si agregas un servicio, una cifra o una etiqueta nueva, añade aquí su traducción; si falta, en inglés se muestra el texto en español.

Los nombres de artistas y de canciones no se traducen.
