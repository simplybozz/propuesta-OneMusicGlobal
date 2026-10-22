#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'js', 'data');
const IMG_DIR = path.join(ROOT, 'assets', 'img');
const AUDIO_DIR = path.join(ROOT, 'assets', 'audio');
const COLORS = ['yellow', 'teal', 'sky', 'white', 'blue'];

const FILES = {
  releases: 'releases.js',
  artists: 'artists.js',
  stats: 'stats.js',
  services: 'services.js',
  bands: 'bands.js',
  musicBusinessTicker: 'music-business.js',
  gallery: 'gallery.js'
};

function load(key) {
  const file = path.join(DATA_DIR, FILES[key]);
  const src = fs.readFileSync(file, 'utf8');
  const m = src.match(/=\s*(\[[\s\S]*\])\s*;\s*$/);
  if (!m) fail('No pude leer ' + path.relative(ROOT, file));
  return JSON.parse(m[1]);
}

function save(key, value) {
  const file = path.join(DATA_DIR, FILES[key]);
  const src = 'window.OMG_DATA = window.OMG_DATA || {};\nOMG_DATA.' + key + ' = ' + JSON.stringify(value, null, 2) + ';\n';
  fs.writeFileSync(file, src, 'utf8');
  console.log('✔ ' + path.relative(ROOT, file).split(path.sep).join('/') + ' actualizado');
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

function val(v) {
  return v && v !== true ? v : '';
}

function need(opts, keys) {
  keys.forEach(function (k) {
    if (!val(opts[k])) fail('Falta --' + k + '. Ejecuta "node tools/omg.js ayuda" para ver ejemplos.');
  });
}

function findIndex(list, query, field) {
  if (query === undefined) fail('Indica cuál: número, slug o nombre.');
  const n = Number(query);
  if (Number.isInteger(n) && n >= 1 && n <= list.length) return n - 1;
  const q = slugify(query);
  const i = list.findIndex(function (item) { return item.slug === q || slugify(item[field]) === q; });
  if (i === -1) fail('No encontré "' + query + '". Usa "node tools/omg.js lista" para ver los disponibles.');
  return i;
}

function copyInto(src, dir, slug) {
  const abs = path.resolve(process.cwd(), src);
  if (!fs.existsSync(abs)) {
    const inProject = path.resolve(ROOT, src);
    if (fs.existsSync(inProject)) return path.relative(ROOT, inProject).split(path.sep).join('/');
    fail('No encuentro el archivo: ' + src);
  }
  if (abs.startsWith(dir)) return path.relative(ROOT, abs).split(path.sep).join('/');
  fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, slug + path.extname(abs).toLowerCase());
  fs.copyFileSync(abs, dest);
  const rel = path.relative(ROOT, dest).split(path.sep).join('/');
  console.log('  archivo copiado a ' + rel);
  return rel;
}

function resolveImage(src, slug) {
  if (!val(src)) return 'assets/img/p4.jpg';
  if (/^https?:\/\//.test(src)) return src;
  return copyInto(src, IMG_DIR, slug);
}

function resolveAudio(src, slug) {
  if (!val(src)) return '';
  if (/^https?:\/\//.test(src)) return src;
  return copyInto(src, AUDIO_DIR, slug);
}

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

function insertAt(list, item, opts, defaultEnd) {
  if (val(opts.pos)) list.splice(Math.max(0, Number(opts.pos) - 1), 0, item);
  else if (opts.final || (defaultEnd && !opts.inicio)) list.push(item);
  else list.unshift(item);
}

function move(key, field, o) {
  const list = load(key);
  const i = findIndex(list, o._[1], field);
  const to = Number(o._[2]);
  if (!Number.isInteger(to) || to < 1) fail('Indica la nueva posición, por ejemplo: ' + o._[0] + ' ' + (list[i].slug || 1) + ' 1');
  const [item] = list.splice(i, 1);
  list.splice(Math.min(to - 1, list.length), 0, item);
  save(key, list);
  console.log('✔ ' + item[field] + ' ahora está en la posición ' + to);
}

function remove(key, field, o) {
  const list = load(key);
  const [item] = list.splice(findIndex(list, o._[1], field), 1);
  save(key, list);
  console.log('✔ Quitado: ' + item[field]);
}

const commands = {
  ayuda: help,
  help: help,

  lista: function () {
    console.log('\nLANZAMIENTOS (js/data/releases.js)');
    load('releases').forEach(function (r, i) {
      console.log('  ' + (i + 1) + '. ' + r.title + ' — ' + r.artist + ' [' + r.type + ']' + (r.soon ? ' (próximamente)' : '') + (r.audio ? ' ♪' : '') + '  · slug: ' + r.slug);
    });
    console.log('\nARTISTAS (js/data/artists.js)');
    load('artists').forEach(function (a, i) { console.log('  ' + (i + 1) + '. ' + a.name + ' [' + a.tag + ']  · slug: ' + a.slug); });
    console.log('\nCIFRAS (js/data/stats.js)');
    load('stats').forEach(function (s, i) { console.log('  ' + (i + 1) + '. ' + s.value + s.suffix + ' ' + s.label); });
    console.log('\nSERVICIOS (js/data/services.js)');
    load('services').forEach(function (s, i) { console.log('  ' + (i + 1) + '. ' + s.title + (s.highlight ? ' ' + s.highlight : '')); });
    console.log('');
  },

  'lanzamiento:agregar': async function (o) {
    if (val(o.spotify)) {
      const info = await spotifyTrack(o.spotify);
      if (!val(o.titulo)) o.titulo = info.title;
      if (!val(o.artista)) o.artista = info.artist;
      if (!val(o.imagen)) o.imagen = info.img;
      if (!val(o.audio)) o.audio = info.audio;
      if (!val(o.link)) o.link = info.link;
      if (!val(o.tipo)) o.tipo = 'Single' + (info.year ? ' · ' + info.year : '');
    }
    need(o, ['titulo', 'artista']);
    const list = load('releases');
    const slug = slugify(o.titulo);
    if (list.some(function (r) { return r.slug === slug; })) fail('Ya existe un lanzamiento con ese título.');
    const rel = {
      slug: slug,
      title: o.titulo,
      artist: o.artista,
      type: val(o.tipo) || 'Single',
      img: resolveImage(o.imagen, slug),
      color: COLORS.indexOf(o.color) !== -1 ? o.color : COLORS[list.length % 4],
      audio: resolveAudio(o.audio, slug),
      link: val(o.link)
    };
    if (val(o.etiqueta)) rel.label = o.etiqueta;
    if (o.pronto) rel.soon = true;
    insertAt(list, rel, o, false);
    save('releases', list);
    console.log('✔ Lanzamiento agregado: ' + rel.title + ' — ' + rel.artist);
  },

  'lanzamiento:quitar': function (o) { remove('releases', 'title', o); },
  'lanzamiento:mover': function (o) { move('releases', 'title', o); },

  'artista:agregar': function (o) {
    need(o, ['nombre']);
    const list = load('artists');
    const slug = slugify(o.nombre);
    if (list.some(function (a) { return a.slug === slug; })) fail('Ya existe un artista con ese nombre.');
    const art = {
      slug: slug,
      name: o.nombre,
      tag: val(o.genero) || 'Artista',
      img: resolveImage(o.imagen, slug),
      release: val(o.lanzamiento) || '—'
    };
    insertAt(list, art, o, true);
    save('artists', list);
    console.log('✔ Artista agregado: ' + art.name);
  },

  'artista:quitar': function (o) { remove('artists', 'name', o); },
  'artista:mover': function (o) { move('artists', 'name', o); },

  'cifra:editar': function (o) {
    const list = load('stats');
    const n = Number(o._[1]);
    if (!Number.isInteger(n) || n < 1 || n > list.length) fail('Indica el número de la cifra (1 a ' + list.length + ').');
    const s = list[n - 1];
    if (o.valor !== undefined) s.value = Number(o.valor);
    if (o.sufijo !== undefined) s.suffix = val(o.sufijo);
    if (val(o.texto)) s.label = o.texto;
    save('stats', list);
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
    '  node tools/omg.js lanzamiento:agregar --spotify https://open.spotify.com/track/2EoR2N5XhU7HRJUjvxkzW2',
    '  node tools/omg.js lanzamiento:agregar --titulo "Nombre" --artista "Artista" --imagen C:/ruta/portada.jpg --audio C:/ruta/cancion.mp3',
    '      opcionales: --tipo "Single · 2026"   --color yellow|teal|sky|white|blue',
    '                  --link https://open.spotify.com/...   --pos 2   --final   --pronto',
    '  node tools/omg.js lanzamiento:quitar "Arquitecto"',
    '  node tools/omg.js lanzamiento:mover suena-el-arpa-en-vivo 1',
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
    'Servicios, cintas, ticker de Music Business y galería: edita directamente su archivo en js/data/.',
    ''
  ].join('\n'));
}

const opts = parseArgs(process.argv.slice(2));
const cmd = opts._[0] || 'ayuda';
if (!commands[cmd]) fail('Comando desconocido: ' + cmd + '. Ejecuta "node tools/omg.js ayuda".');
Promise.resolve(commands[cmd](opts)).catch(function (e) { fail(e.message); });
