# One Music Global — propuesta web

Sitio estático (HTML + CSS + JS) con GSAP, ScrollTrigger y Lenis desde CDN, bilingüe (ES / EN) y con panel de contenido (Pages CMS).


## Estructura

```
index.html                 página principal
artista.html               plantilla de perfil (artista.html?a=slug)
.pages.yml                 configuración del panel de contenido (Pages CMS)

content/                   TODO el contenido editable, en JSON (ES y EN)
  site/                    enlaces, redes, menú, pie de página, Google
  home/                    un archivo por sección de la página de inicio
  artists/                 artistas y textos de su página

css/
  main.css                 importa todos los archivos de abajo
  base/                    variables, reset, tipografía y layout general
  components/              logo, botones, barra, menú, loader, cursor, reproductor, botón subir, idioma
  sections/                un archivo por sección (hero, roster, servicios, lanzamientos…)
  pages/artist.css         página de artista

js/
  core/app.js              utilidades compartidas y registro de secciones
  core/i18n.js             idioma activo, selector ES / EN y textos de interfaz
  core/content.js          carga el contenido de content/ y lo pinta en la página
  sections/                un archivo por sección: pinta sus listas y sus animaciones
  main.js                  lo general: scroll suave, colores, menú, cursor, loader, transiciones

assets/
  img/                     imágenes (img/releases: portadas de lanzamientos)
  audio/                   adelantos de los lanzamientos
  video/                   video de Music Business
  fonts/                   fuente Krick

docs/CMS.md                guía del panel de contenido
```

Las duraciones de todos los hovers están en `css/base/variables.css` (`--t-fast`, `--t`, `--t-slow`).


## Ver la página en local

La página lee su contenido de `content/*.json`, así que necesita un servidor. Abierta con doble clic, las secciones salen vacías. Usa **Live Server** en VS Code, o cualquier servidor estático en la carpeta del proyecto.


## Editar contenido

Todo el contenido (textos, imágenes, enlaces, lanzamientos, artistas, servicios, cifras, playlist, video…) se edita desde **Pages CMS** sin tocar código. También se puede editar a mano en `content/`.

Activación, uso, reglas de escritura y tamaños de imagen: **[docs/CMS.md](docs/CMS.md)**.


## Idioma (ES / EN)

La página sale en español por defecto. El selector ES / EN de la barra cambia el idioma y lo recuerda en el navegador. Para compartir la versión en inglés directamente: `index.html?lang=en`.

Cada texto del contenido tiene su versión `_es` y `_en`. Si falta el inglés, se muestra el español.


## Licencia

© 2026 simplybozz. Todos los derechos reservados. Que el repositorio sea público no da permiso para copiar ni usar el código. Ver [LICENSE](LICENSE).
