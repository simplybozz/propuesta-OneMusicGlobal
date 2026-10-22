#!/usr/bin/env node
/* =========================================================
   ONE MUSIC GLOBAL — editor de contenido
   Agrega, quita o reordena lanzamientos, artistas y cifras
   sin tocar el HTML. Todo vive en content/content.json y este
   script genera js/data.js, que es lo que lee la página.

   Uso rápido (desde la carpeta del proyecto):
     node tools/omg.js ayuda
   ========================================================= */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONTENT = path.join(ROOT, 'content', 'content.json');
const OUTPUT = path.join(ROOT, 'js', 'data.js');
const IMG_DIR = path.join(ROOT, 'assets', 'img');
const COLORS = ['yellow', 'teal', 'sky', 'white', 'blue'];

/* ---------- utilidades ---------- */
function load() {
  return JSON.parse(fs.readFileSync(CONTENT, 'utf8'));
}

function save(data) {
  fs.writeFileSync(CONTENT, JSON.stringify(data, null, 2) + '\n', 'utf8');
  build(data);
}

function build(data) {
  data = data || load();
  const banner =
    '/* ARCHIVO GENERADO AUTOMÁTICAMENTE — no lo edites a mano.\n' +
    '   Edita content/content.json o usa: node tools/omg.js ayuda */\n';
  fs.writeFileSync(OUTPUT, banner + 'window.OMG = ' + JSON.stringify(data, null, 2) + ';\n', 'utf8');
  console.log('✔ js/data.js actualizado (' + data.releases.length + ' lanzamientos, ' + data.artists.length + ' artistas)');
}

function slugify(text) {
  return String(text)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function parseArgs(argv) {
  const opts = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) opts[key] = true;
      else { opts[key] = next; i++; }
    } else opts._.push(a);
  }
  return opts;
}

function fail(msg) {
  console.error('✖ ' + msg);
  process.exit(1);
}

function need(opts, keys) {
  keys.forEach(function (k) { if (!opts[k] || opts[k] === true) fail('Falta --' + k + '. Ejecuta "node tools/omg.js ayuda" para ver ejemplos.'); });
}

/* Busca un elemento por número (1, 2, 3…), slug o título/nombre */
function findIndex(list, query, field) {
  if (query === undefined) fail('Indica cuál: número, slug o nombre.');
  const n = Number(query);
  if (Number.isInteger(n) && n >= 1 && n <= list.length) return n - 1;
  const q = slugify(query);
  const i = list.findIndex(function (item) { return item.slug === q || slugify(item[field]) === q; });
  if (i === -1) fail('No encontré "' + query + '". Usa "node tools/omg.js lista" para ver los disponibles.');
  return i;
}

/* Si la imagen está fuera del proyecto, la copia a assets/img */
function resolveImage(src, slug) {
  if (!src) return 'assets/img/p4.jpg';
  if (/^https?:\/\//.test(src)) return src;
  const abs = path.resolve(process.cwd(), src);
  if (!fs.existsSync(abs)) {
    const inProject = path.resolve(ROOT, src);
    if (fs.existsSync(inProject)) return path.relative(ROOT, inProject).split(path.sep).join('/');
    fail('No encuentro la imagen: ' + src);
  }
  if (abs.startsWith(IMG_DIR)) return path.relative(ROOT, abs).split(path.sep).join('/');
  const dest = path.join(IMG_DIR, slug + path.extname(abs).toLowerCase());
  fs.copyFileSync(abs, dest);
  console.log('  imagen copiada a ' + path.relative(ROOT, dest).split(path.sep).join('/'));
  return path.relative(ROOT, dest).split(path.sep).join('/');
}

/* Lee los datos públicos de una canción desde su reproductor embebido de Spotify */
async function spotifyTrack(url) {
  const m = String(url).match(/track[/:]([A-Za-z0-9]{22})/);
  if (!m) fail('El enlace de Spotify debe ser de una canción: https://open.spotify.com/track/...');
  let html;
  try {
    const res = await fetch('https://open.spotify.com/embed/track/' + m[1], { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130 Safari/537.36' } });
    html = await res.text();
  } catch (e) { fail('No pude conectar con Spotify: ' + e.message); }
  const json = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
  if (!json) fail('Spotify no devolvió los datos de la canción. Agrégala con --titulo y --artista.');
  const e = JSON.parse(json[1]).props.pageProps.state.data.entity;
  const imgs = (e.visualIdentity && e.visualIdentity.image) || [];
  const big = imgs.slice().sort(function (a, b) { return (b.maxWidth || 0) - (a.maxWidth || 0); })[0];
  const info = {
    title: (e.title || e.name || '').replace(/\s+-\s+(En Vivo|Live|Acústico)$/i, ''),
    artist: (e.artists || []).map(function (a) { return a.name; }).join(', '),
    img: big ? 'https://i.scdn.co/image/' + big.url.split('/').pop() : '',
    audio: e.audioPreview && e.audioPreview.url ? e.audioPreview.url : '',
    link: 'https://open.spotify.com/track/' + m[1],
    year: e.releaseDate && e.releaseDate.isoString ? e.releaseDate.isoString.slice(0, 4) : ''
  };
  console.log('  Spotify: ' + info.title + ' — ' + info.artist + (info.audio ? ' (con audio de muestra)' : ' (sin audio de muestra)'));
  return info;
}

/* Audio: un enlace se usa tal cual; un archivo local se copia a assets/audio */
function resolveAudio(src, slug) {
  if (!src || src === true) return '';
  if (/^https?:\/\//.test(src)) return src;
  const abs = path.resolve(process.cwd(), src);
  if (!fs.existsSync(abs)) fail('No encuentro el audio: ' + src);
  const dir = path.join(ROOT, 'assets', 'audio');
  fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, slug + path.extname(abs).toLowerCase());
  if (abs !== dest) fs.copyFileSync(abs, dest);
  return path.relative(ROOT, dest).split(path.sep).join('/');
}

function insertAt(list, item, opts, defaultEnd) {
  if (opts.pos) list.splice(Math.max(0, Number(opts.pos) - 1), 0, item);
  else if (opts.final || (defaultEnd && !opts.inicio)) list.push(item);
  else list.unshift(item);
}

/* ---------- comandos ---------- */
const commands = {
  ayuda: help,
  help: help,

  lista: function () {
    const d = load();
    console.log('\nLANZAMIENTOS (en el orden que se ven en la página)');
    d.releases.forEach(function (r, i) {
      console.log('  ' + (i + 1) + '. ' + r.title + ' — ' + r.artist + ' [' + r.type + ']' + (r.soon ? ' (próximamente)' : '') + '  · slug: ' + r.slug);
    });
    console.log('\nARTISTAS');
    d.artists.forEach(function (a, i) { console.log('  ' + (i + 1) + '. ' + a.name + ' [' + a.tag + ']  · slug: ' + a.slug); });
    console.log('\nCIFRAS');
    d.stats.forEach(function (s, i) { console.log('  ' + (i + 1) + '. ' + s.value + s.suffix + ' ' + s.label); });
    console.log('');
  },

  build: function () { build(); },
  generar: function () { build(); },

  'lanzamiento:agregar': async function (o) {
    // Con --spotify se completan solos el título, artista, portada, año y audio de muestra
    if (o.spotify && o.spotify !== true) {
      const info = await spotifyTrack(o.spotify);
      if (!o.titulo) o.titulo = info.title;
      if (!o.artista) o.artista = info.artist;
      if (!o.imagen) o.imagen = info.img;
      if (!o.audio) o.audio = info.audio;
      if (!o.link) o.link = info.link;
      if (!o.tipo) o.tipo = 'Single' + (info.year ? ' · ' + info.year : '');
    }
    need(o, ['titulo', 'artista']);
    const d = load();
    const slug = slugify(o.titulo);
    if (d.releases.some(function (r) { return r.slug === slug; })) fail('Ya existe un lanzamiento con ese título.');
    const color = o.color && COLORS.indexOf(o.color) !== -1 ? o.color : COLORS[d.releases.length % 4];
    const rel = {
      slug: slug,
      title: o.titulo,
      artist: o.artista,
      type: o.tipo && o.tipo !== true ? o.tipo : 'Single',
      img: resolveImage(o.imagen, slug),
      color: color,
      audio: resolveAudio(o.audio, slug),
      link: o.link && o.link !== true ? o.link : ''
    };
    if (o.etiqueta && o.etiqueta !== true) rel.label = o.etiqueta;
    if (o.pronto) rel.soon = true;
    insertAt(d.releases, rel, o, false);
    save(d);
    console.log('✔ Lanzamiento agregado: ' + rel.title + ' — ' + rel.artist);
  },

  'lanzamiento:quitar': function (o) {
    const d = load();
    const i = findIndex(d.releases, o._[1], 'title');
    const [removed] = d.releases.splice(i, 1);
    save(d);
    console.log('✔ Lanzamiento quitado: ' + removed.title);
  },

  'lanzamiento:mover': function (o) {
    const d = load();
    const i = findIndex(d.releases, o._[1], 'title');
    const to = Number(o._[2]);
    if (!Number.isInteger(to) || to < 1) fail('Indica la nueva posición, por ejemplo: lanzamiento:mover tu-voluntad 1');
    const [item] = d.releases.splice(i, 1);
    d.releases.splice(Math.min(to - 1, d.releases.length), 0, item);
    save(d);
    console.log('✔ ' + item.title + ' ahora está en la posición ' + to);
  },

  'artista:agregar': function (o) {
    need(o, ['nombre']);
    const d = load();
    const slug = slugify(o.nombre);
    if (d.artists.some(function (a) { return a.slug === slug; })) fail('Ya existe un artista con ese nombre.');
    const art = {
      slug: slug,
      name: o.nombre,
      tag: o.genero && o.genero !== true ? o.genero : 'Artista',
      img: resolveImage(o.imagen, slug),
      release: o.lanzamiento && o.lanzamiento !== true ? o.lanzamiento : '—'
    };
    insertAt(d.artists, art, o, true);
    save(d);
    console.log('✔ Artista agregado: ' + art.name);
  },

  'artista:quitar': function (o) {
    const d = load();
    const i = findIndex(d.artists, o._[1], 'name');
    const [removed] = d.artists.splice(i, 1);
    save(d);
    console.log('✔ Artista quitado: ' + removed.name);
  },

  'artista:mover': function (o) {
    const d = load();
    const i = findIndex(d.artists, o._[1], 'name');
    const to = Number(o._[2]);
    if (!Number.isInteger(to) || to < 1) fail('Indica la nueva posición, por ejemplo: artista:mover obyone 1');
    const [item] = d.artists.splice(i, 1);
    d.artists.splice(Math.min(to - 1, d.artists.length), 0, item);
    save(d);
    console.log('✔ ' + item.name + ' ahora está en la posición ' + to);
  },

  'cifra:editar': function (o) {
    const d = load();
    const n = Number(o._[1]);
    if (!Number.isInteger(n) || n < 1 || n > d.stats.length) fail('Indica el número de la cifra (1 a ' + d.stats.length + ').');
    const s = d.stats[n - 1];
    if (o.valor !== undefined) s.value = Number(o.valor);
    if (o.sufijo !== undefined) s.suffix = o.sufijo === true ? '' : o.sufijo;
    if (o.texto !== undefined && o.texto !== true) s.label = o.texto;
    save(d);
    console.log('✔ Cifra ' + n + ': ' + s.value + s.suffix + ' ' + s.label);
  }
};

function help() {
  console.log([
    '',
    'ONE MUSIC GLOBAL — editor de contenido',
    '',
    'Ver lo que hay:',
    '  node tools/omg.js lista',
    '',
    'Lanzamientos (los nuevos aparecen primero):',
    '  La forma más fácil, con el enlace de la canción en Spotify (trae portada y audio):',
    '  node tools/omg.js lanzamiento:agregar --spotify https://open.spotify.com/track/2EoR2N5XhU7HRJUjvxkzW2',
    '  O a mano:',
    '  node tools/omg.js lanzamiento:agregar --titulo "Nombre" --artista "Artista" --imagen C:/ruta/portada.jpg',
    '      opcionales: --tipo "Single · 2026"   --color yellow|teal|sky|white|blue   --audio C:/ruta/cancion.mp3',
    '                  --link https://open.spotify.com/...   --pos 2   --final   --pronto',
    '  node tools/omg.js lanzamiento:quitar "Tu Voluntad"      (o el número / slug)',
    '  node tools/omg.js lanzamiento:mover vivo-agradecido 1',
    '',
    'Artistas (los nuevos van al final del roster):',
    '  node tools/omg.js artista:agregar --nombre "Nombre" --genero Worship --imagen C:/ruta/foto.jpg',
    '      opcionales: --lanzamiento "Último single"   --pos 1   --inicio',
    '  node tools/omg.js artista:quitar obyone',
    '  node tools/omg.js artista:mover "Grupo Grace" 1',
    '',
    'Cifras:',
    '  node tools/omg.js cifra:editar 2 --valor 30 --sufijo K --texto "personas en nuestra comunidad"',
    '',
    'Si editas content/content.json a mano, después ejecuta:',
    '  node tools/omg.js build',
    ''
  ].join('\n'));
}

const opts = parseArgs(process.argv.slice(2));
const cmd = opts._[0] || 'ayuda';
if (!commands[cmd]) fail('Comando desconocido: ' + cmd + '. Ejecuta "node tools/omg.js ayuda".');
Promise.resolve(commands[cmd](opts)).catch(function (e) { fail(e.message); });
