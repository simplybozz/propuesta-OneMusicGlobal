# One Music Global — propuesta web

Sitio estático (HTML + CSS + JS) con GSAP, ScrollTrigger y Lenis desde CDN.
Abre `index.html` en el navegador o súbelo tal cual a Netlify / Vercel.

## Editar contenido sin tocar el código

Los **lanzamientos**, los **artistas** y las **cifras** viven en `content/content.json`.
El script `tools/omg.js` (solo necesita Node, sin instalar nada) los edita y
regenera `js/data.js`, que es lo que lee la página.

```bash
node tools/omg.js ayuda          # todos los comandos con ejemplos
node tools/omg.js lista          # ver lo que hay y en qué orden
```

### Lanzamientos
```bash
node tools/omg.js lanzamiento:agregar --titulo "Nuevo Single" --artista "Raisa Díaz" --imagen C:/ruta/portada.jpg --link https://open.spotify.com/...
node tools/omg.js lanzamiento:quitar "Tu Voluntad"
node tools/omg.js lanzamiento:mover vivo-agradecido 1
```
Opcionales: `--tipo Single|EP|Álbum`, `--color yellow|teal|sky|white|blue`, `--pos 2`, `--final`, `--pronto` (portada borrosa de "próximamente").
Si la imagen está fuera del proyecto, se copia sola a `assets/img/`.

### Artistas
```bash
node tools/omg.js artista:agregar --nombre "Nombre" --genero Worship --imagen C:/ruta/foto.jpg
node tools/omg.js artista:quitar obyone
node tools/omg.js artista:mover "Grupo Grace" 1
```

### Cifras
```bash
node tools/omg.js cifra:editar 2 --valor 30 --sufijo K --texto "personas en nuestra comunidad"
```

¿Prefieres editar `content/content.json` a mano? Hazlo y luego ejecuta `node tools/omg.js build`.

## Estructura
- `index.html` — página principal
- `artista.html` — plantilla de perfil (`artista.html?a=slug`)
- `css/styles.css` — estilos; las duraciones de hover están en `--t-fast`, `--t`, `--t-slow`
- `js/main.js` — animaciones e interacciones
- `js/data.js` — **generado**, no editar a mano
- `content/content.json` — contenido editable
- `tools/omg.js` — editor de contenido
