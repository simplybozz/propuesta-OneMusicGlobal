# Guía del CMS (Pages CMS)

El contenido de la página se edita desde un panel con formularios, sin tocar código. El panel es **Pages CMS**: un servicio gratuito que edita los archivos de este repositorio en GitHub.

```
Panel (app.pagescms.org) ──guarda en──▶ Repositorio de GitHub ──publica──▶ GitHub Pages (la web)
```

Al guardar un cambio, Pages CMS lo sube al repositorio y GitHub Pages republica la web sola en 1–2 minutos.


## 1. Activarlo (una sola vez)

1. Entra a **https://app.pagescms.org** y elige **Sign in with GitHub**. Usa la cuenta dueña del repositorio.
2. Instala la **GitHub App** de Pages CMS cuando te lo pida. En "Repository access", elige solo este repositorio.
3. Abre el repositorio en Pages CMS. El archivo `.pages.yml` ya está creado, así que verás directamente el menú:
   - **Página de inicio**: las 11 secciones, en el mismo orden que en la web.
   - **Artistas**: el carrusel, las páginas de cada artista y sus textos.
   - **General**: enlaces y redes, menú, pie de página y textos para Google.
   - **Media**: las imágenes, audios y videos subidos.

Si la página cambia de dominio, el CMS sigue funcionando igual: edita el repositorio, no el dominio.


## 2. Dar acceso a la empresa

- **Recomendado: invitar por correo.** Pages CMS deja invitar personas por email, sin que necesiten cuenta de GitHub. Esas personas pueden editar contenido e imágenes, pero no la configuración del panel. La invitación se hace desde la configuración del repositorio dentro de Pages CMS (Collaborators).
- **Alternativa:** agregarlos como colaboradores del repositorio en GitHub (Settings → Collaborators). Necesitan cuenta de GitHub.

Si la página se vende, lo ideal es pasar el repositorio a una cuenta u organización de la empresa y que tú quedes como colaborador.


## 3. Uso diario

1. Entra al panel y elige la sección (por ejemplo, **Página de inicio → 6. Lanzamientos**).
2. Edita los campos. Las listas (discos, artistas, servicios, cifras…) se pueden **agregar, borrar y reordenar arrastrando**. El orden del panel es el orden en la web.
3. Pulsa **Save**. En 1–2 minutos el cambio está en la web. Si no lo ves, recarga con `Ctrl + F5`.

Todo cambio queda guardado en el historial de GitHub. Si algo se borra por error, se puede recuperar desde ahí.


## 4. Reglas para escribir

| Para… | Escribe |
|---|---|
| Resaltar en amarillo (o en negrita en las tarjetas de servicios) | `*palabra*` entre asteriscos |
| Hacer un salto de línea en títulos | Pulsa Enter en el campo |
| Separar etiquetas de un servicio | Comas: `Spotify, Apple Music, YouTube` |

- **Español e inglés:** casi todos los textos tienen dos campos, **(ES)** y **(EN)**. Si el inglés queda vacío, en inglés se muestra el español.
- **Dirección de la página de un artista:** el campo "Dirección de su página" (ej. `raisa-diaz`) se puede dejar vacío y se crea sola con el nombre. Si la cambias, los enlaces viejos a esa página dejan de funcionar.
- **Music Business, título:** se ajusta solo al ancho de la segunda línea, escribas lo que escribas.
- **Playlist:** pega el enlace normal de Spotify (`https://open.spotify.com/playlist/...`). El reproductor se actualiza solo.
- **Audio de lanzamientos:** sube un MP3 corto (30 s) en "Audio del adelanto (archivo)". El campo "enlace" solo se usa si no hay archivo.
- **Disco "Próximamente":** se ve en gris y no reproduce audio.


## 5. Tamaños recomendados

Las fotos pesadas ponen lenta la página. Antes de subirlas, comprímelas (por ejemplo con squoosh.app) y usa JPG o WEBP.

| Imagen | Forma | Tamaño sugerido | Peso máximo |
|---|---|---|---|
| Foto de artista (tarjeta) | Vertical 3:4 | 900 × 1200 px | 300 KB |
| Portada de su página | Horizontal | 1920 × 1080 px | 500 KB |
| Galería de artista | Cuadrada | 1000 × 1000 px | 250 KB |
| Portada de lanzamiento | Cuadrada | 640 × 640 px | 200 KB |
| Fotos del hero (polaroids) | Cuadrada | 800 × 800 px | 200 KB |
| Tarjetas de servicios y ecosistema | Horizontal | 1400 × 1000 px | 350 KB |
| Video de Music Business | MP4, sin sonido | 1280 px de ancho | 15 MB |


## 6. Qué NO se edita desde el panel

El diseño, los colores, las animaciones, la fuente y el orden de las secciones. Eso se cambia en el código (`css/`, `js/`).

Tampoco algunos textos de interfaz que no se ven como contenido: etiquetas del cursor ("VER", "PLAY"), textos para lectores de pantalla y "Menú / Cerrar". Están en `js/core/i18n.js`.


## 7. Para el programador: cómo funciona por dentro

```
.pages.yml               configuración del panel: secciones, campos y carpetas de imágenes
content/
  site/settings.json     menú, pie, newsletter, frases del loader, título y descripción para Google
  site/links.json        redes sociales, Publishing y "Familia One"
  home/*.json            una sección de la página de inicio por archivo
  artists/artists.json   artistas (carrusel + página de cada uno)
  artists/page.json      textos fijos de la página de artista
assets/img|audio|video   donde el panel sube los archivos
js/core/content.js       carga los JSON y los pinta en el HTML
js/core/i18n.js          idioma activo, selector ES/EN y textos de interfaz
```

- En el HTML, cada texto editable lleva `data-c="archivo.campo"` (por ejemplo `data-c="hero.lead"`). El sufijo `_es` / `_en` se elige solo según el idioma.
- Los atributos usan `data-c-attr="href:links.publishing_url"` (también `src`, `placeholder`, etc.).
- Las listas (servicios, discos, artistas, cifras…) las pinta su archivo en `js/sections/`.
- El texto del HTML es solo un respaldo: lo que manda es el JSON.
- La página necesita abrirse desde un servidor (GitHub Pages, o Live Server en VS Code) para poder leer los JSON. Abierta con doble clic como archivo, las secciones salen vacías.

**Agregar un campo nuevo editable:**
1. Añade la clave al JSON correspondiente en `content/` (con `_es` y `_en` si es texto).
2. Añade el campo en `.pages.yml`, en la misma sección. Pon entre comillas las etiquetas que tengan comas.
3. Úsalo en el HTML con `data-c="archivo.clave"`, o en el JS de la sección con `OMG.c('archivo.clave')`.
4. Si es un archivo nuevo en `content/`, regístralo en `FILES` y `PAGES` de `js/core/content.js`.
