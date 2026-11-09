// Generador del sitio: convierte /contenido (Markdown) en HTML estático en /dist.
// Uso: node scripts/build.js            -> /dist, sin borradores
//      node scripts/build.js --borradores -> /dist-borradores, con borradores (solo para revisar)
import { readFile, writeFile, readdir, mkdir, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Marked } from 'marked';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Se importa con marca de tiempo para que "npm run dev" vea siempre la configuración actual.
const { default: sitio } = await import(`${pathToFileURL(path.join(RAIZ, 'sitio.config.js'))}?t=${Date.now()}`);
const CON_BORRADORES = process.argv.includes('--borradores');
const SALIDA = path.join(RAIZ, CON_BORRADORES ? 'dist-borradores' : 'dist');
const DIR_PUBLICACIONES = path.join(RAIZ, 'contenido', 'publicaciones');
const DIR_PAGINAS = path.join(RAIZ, 'contenido', 'paginas');
const DIR_PROYECTOS = path.join(RAIZ, 'contenido', 'proyectos');
const DIR_PLANTILLAS = path.join(RAIZ, 'plantillas');
const DIR_CLIENTE = path.join(RAIZ, 'cliente');
const MANIFIESTO = '.archivos-generados.json';

// ---------- utilidades ----------

const escaparHtml = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const escaparXml = escaparHtml;

// Sustituye {{variable}} (escapada) y {{{variable}}} (HTML sin escapar).
function renderizar(plantilla, datos, nombre) {
  return plantilla.replace(/\{\{\{\s*(\w+)\s*\}\}\}|\{\{\s*(\w+)\s*\}\}/g, (_, crudo, escapado) => {
    const clave = crudo ?? escapado;
    if (!(clave in datos)) throw new Error(`La plantilla "${nombre}" usa {{${clave}}} pero no se le pasó ese dato.`);
    return crudo ? String(datos[clave]) : escaparHtml(datos[clave]);
  });
}

// Front matter sencillo: claves "clave: valor", listas [a, b] o con guiones, booleanos y texto.
function leerFrontMatter(texto, archivo) {
  const limpio = texto.replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const m = limpio.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error(`${archivo}: falta el bloque de front matter entre líneas "---".`);
  const datos = {};
  let listaActual = null;
  for (const [i, linea] of m[1].split('\n').entries()) {
    if (!linea.trim() || linea.trim().startsWith('#')) continue;
    const item = linea.match(/^\s+-\s+(.*)$/);
    if (item && listaActual) { datos[listaActual].push(valorSimple(item[1])); continue; }
    const par = linea.match(/^([\p{L}_][\p{L}\p{N}_-]*)\s*:\s*(.*)$/u);
    if (!par) throw new Error(`${archivo}: no entiendo la línea ${i + 2} del front matter: "${linea}"`);
    const clave = sinTildes(par[1].toLowerCase());
    const valor = par[2].trim();
    listaActual = null;
    if (valor === '') { datos[clave] = []; listaActual = clave; }
    else if (valor.startsWith('[') && valor.endsWith(']')) {
      datos[clave] = valor.slice(1, -1).split(',').map((v) => valorSimple(v)).filter((v) => v !== '');
    } else datos[clave] = valorSimple(valor);
  }
  return { datos, cuerpo: m[2] };
}

function valorSimple(v) {
  v = v.trim();
  if (/^(".*"|'.*')$/.test(v)) return v.slice(1, -1);
  if (v === 'true') return true;
  if (v === 'false') return false;
  return v;
}

const sinTildes = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

// "Flujo de trabajo" -> "flujo-de-trabajo"; "economía" -> "economia"
const aSlug = (s) => sinTildes(String(s).toLowerCase()).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const formatoFecha = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

function leerFecha(valor, archivo) {
  const texto = String(valor ?? '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) throw new Error(`${archivo}: la fecha debe tener el formato AAAA-MM-DD (se recibió "${texto}").`);
  const fecha = new Date(`${texto}T00:00:00Z`);
  if (Number.isNaN(fecha.getTime())) throw new Error(`${archivo}: fecha no válida "${texto}".`);
  return fecha;
}

function tiempoLectura(markdown) {
  const palabras = markdown.replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length;
  const minutos = Math.max(1, Math.round(palabras / sitio.palabrasPorMinuto));
  return `${minutos} min`;
}

const rutaEtiqueta = (etiqueta) => `/etiquetas/${aSlug(etiqueta)}/`;

const htmlEtiquetas = (etiquetas) => etiquetas.length
  ? `<ul class="etiquetas" aria-label="Etiquetas">${etiquetas.map((e) =>
      `<li><a href="${rutaEtiqueta(e)}">${escaparHtml(e)}</a></li>`).join('')}</ul>`
  : '';

const marcaBorrador = (p) => p.borrador ? ' <span class="borrador">Borrador</span>' : '';

const urlAbsoluta = (ruta) => sitio.url.replace(/\/$/, '') + ruta;

const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

// Convierte Markdown en HTML. Los subtítulos reciben un id y un enlace "#" para poder
// compartir una sección; devuelve también la lista de subtítulos para el índice.
function convertirMarkdown(markdown) {
  const usados = new Map();
  const subtitulos = [];
  const conversor = new Marked({
    renderer: {
      heading({ tokens, depth }) {
        const html = this.parser.parseInline(tokens);
        const texto = html.replace(/<[^>]+>/g, '').replace(/&[^;]+;/g, '');
        let id = aSlug(texto) || 'seccion';
        const veces = usados.get(id) ?? 0;
        usados.set(id, veces + 1);
        if (veces) id += `-${veces + 1}`;
        if (depth === 2 || depth === 3) subtitulos.push({ id, html, nivel: depth });
        return `<h${depth} id="${id}">${html} <a class="ancla" href="#${id}" aria-label="Enlace a esta sección">#</a></h${depth}>\n`;
      }
    }
  });
  return { html: conversor.parse(markdown), subtitulos };
}

// Índice "En esta página": solo si hay al menos 3 subtítulos de nivel 2.
function htmlTablaContenido(subtitulos) {
  if (subtitulos.filter((s) => s.nivel === 2).length < 3) return '';
  return `<nav class="tabla-contenido" aria-labelledby="titulo-tabla-contenido">
    <div class="tabla-contenido-interior">
      <p id="titulo-tabla-contenido" class="tabla-contenido-titulo">En esta página</p>
      <ol>${subtitulos.map((s) => `<li class="nivel-${s.nivel}"><a href="#${s.id}">${s.html}</a></li>`).join('')}</ol>
    </div>
  </nav>`;
}

// ---------- lectura de contenido ----------

async function leerPublicaciones() {
  const archivos = (await readdir(DIR_PUBLICACIONES)).filter((f) => f.endsWith('.md'));
  const publicaciones = [];
  for (const archivo of archivos) {
    const ruta = path.join('contenido', 'publicaciones', archivo);
    const { datos, cuerpo } = leerFrontMatter(await readFile(path.join(DIR_PUBLICACIONES, archivo), 'utf8'), ruta);
    for (const campo of ['titulo', 'fecha', 'resumen']) {
      if (!datos[campo]) throw new Error(`${ruta}: falta el campo "${campo}" en el front matter.`);
    }
    if (typeof datos.borrador !== 'boolean') throw new Error(`${ruta}: "borrador" debe ser true o false.`);
    const etiquetas = Array.isArray(datos.etiquetas) ? datos.etiquetas.map(String)
      : datos.etiquetas ? [String(datos.etiquetas)] : [];
    const slug = archivo.replace(/\.md$/, '');
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      throw new Error(`${ruta}: el nombre del archivo debe usar solo minúsculas sin tildes, números y guiones (ej. mi-publicacion.md).`);
    }
    const fecha = leerFecha(datos.fecha, ruta);
    publicaciones.push({
      slug,
      titulo: String(datos.titulo),
      resumen: String(datos.resumen),
      fecha,
      fechaISO: fecha.toISOString().slice(0, 10),
      fechaLegible: formatoFecha.format(fecha),
      etiquetas,
      borrador: datos.borrador,
      tiempoLectura: tiempoLectura(cuerpo),
      ...(({ html, subtitulos }) => ({ contenidoHtml: html, subtitulos }))(convertirMarkdown(cuerpo)),
      ruta: `/publicaciones/${slug}/`
    });
  }
  return publicaciones
    .filter((p) => CON_BORRADORES || !p.borrador)
    .sort((a, b) => b.fecha - a.fecha || a.titulo.localeCompare(b.titulo, 'es'));
}

// Correo y CV de sitio.config.js, como texto Markdown para la página Sobre mí.
function contactoDirecto() {
  const partes = [];
  if (sitio.correo) partes.push(`[${sitio.correo}](mailto:${sitio.correo})`);
  if (sitio.cv) partes.push(`[Descargar mi CV (PDF)](${sitio.cv})`);
  return partes.join(' · ');
}

// Proyectos del portafolio: un archivo .md por proyecto en contenido/proyectos/.
async function leerProyectos() {
  if (!existsSync(DIR_PROYECTOS)) return [];
  const archivos = (await readdir(DIR_PROYECTOS)).filter((f) => f.endsWith('.md'));
  const proyectos = [];
  for (const archivo of archivos) {
    const ruta = path.join('contenido', 'proyectos', archivo);
    const { datos, cuerpo } = leerFrontMatter(await readFile(path.join(DIR_PROYECTOS, archivo), 'utf8'), ruta);
    for (const campo of ['titulo', 'area', 'problema', 'enfoque', 'resultado']) {
      if (!datos[campo]) throw new Error(`${ruta}: falta el campo "${campo}" en el front matter.`);
    }
    if (datos.borrador === true && !CON_BORRADORES) continue;
    proyectos.push({
      slug: archivo.replace(/\.md$/, ''),
      titulo: String(datos.titulo),
      area: String(datos.area),
      anio: datos.anio ? String(datos.anio) : '',
      problema: String(datos.problema),
      enfoque: String(datos.enfoque),
      resultado: String(datos.resultado),
      herramientas: Array.isArray(datos.herramientas) ? datos.herramientas.map(String) : [],
      destacado: datos.destacado === true,
      orden: Number(datos.orden ?? 99),
      // Evidencia del proyecto: cada elemento de "enlaces" es "Texto|https://..." o "Texto|/ruta/".
      enlaces: (Array.isArray(datos.enlaces) ? datos.enlaces : []).map((e) => {
        const [texto, url] = String(e).split('|').map((v) => v.trim());
        if (!texto || !/^(https:\/\/|\/)/.test(url ?? '')) throw new Error(`${ruta}: enlace no válido "${e}". Usa "Texto|https://..." o "Texto|/ruta/".`);
        return { texto, url };
      }),
      notaHtml: cuerpo.trim() ? `<div class="proyecto-nota">${convertirMarkdown(cuerpo).html}</div>` : ''
    });
  }
  return proyectos.sort((a, b) => a.orden - b.orden || a.titulo.localeCompare(b.titulo, 'es'));
}

// Cada archivo de contenido/paginas/ se publica en /<nombre>/ (sobre-mi.md -> /sobre-mi/).
async function leerPaginas() {
  const archivos = (await readdir(DIR_PAGINAS)).filter((f) => f.endsWith('.md'));
  const paginas = [];
  for (const archivo of archivos) {
    const ruta = path.join('contenido', 'paginas', archivo);
    const { datos, cuerpo } = leerFrontMatter(await readFile(path.join(DIR_PAGINAS, archivo), 'utf8'), ruta);
    const slug = archivo.replace(/\.md$/, '');
    if (!datos.titulo) throw new Error(`${ruta}: falta el campo "titulo" en el front matter.`);
    if (datos.borrador === true && !CON_BORRADORES) continue;
    paginas.push({
      slug,
      titulo: String(datos.titulo),
      resumen: datos.resumen ? String(datos.resumen) : '',
      // {{feed}} dentro del Markdown se sustituye por la dirección del RSS.
      contenidoHtml: convertirMarkdown(cuerpo
        .replaceAll('{{feed}}', urlAbsoluta('/feed.xml'))
        // {{contactoDirecto}} desaparece mientras no haya correo ni CV en sitio.config.js.
        .replaceAll('{{contactoDirecto}}', contactoDirecto())).html,
      ruta: `/${slug}/`
    });
  }
  return paginas;
}

// ---------- escritura ----------

const generados = [];

async function escribir(rutaRelativa, contenido) {
  const destino = path.join(SALIDA, rutaRelativa);
  await mkdir(path.dirname(destino), { recursive: true });
  await writeFile(destino, contenido, 'utf8');
  generados.push(rutaRelativa.split(path.sep).join('/'));
}

async function main() {
  const plantilla = async (nombre) => readFile(path.join(DIR_PLANTILLAS, nombre), 'utf8');
  const [base, inicio, indice, item, publicacion, pagina, itemProyecto] = await Promise.all(
    ['base.html', 'inicio.html', 'indice.html', 'item-publicacion.html', 'publicacion.html', 'pagina.html',
      'item-proyecto.html'].map(plantilla)
  );

  const enlacesRedes = sitio.redes.length
    ? `<ul class="redes">${sitio.redes.map((r) => `<li><a href="${escaparHtml(r.url)}" rel="me">${escaparHtml(r.nombre)}</a></li>`).join('')}</ul>`
    : '';

  // Menú: marca como actual el enlace cuya ruta coincide con la página (o es su sección).
  const navegacion = (rutaActual) => `<ul class="nav-lista">${sitio.navegacion.map(({ texto, ruta }) => {
    const actual = ruta === '/' ? rutaActual === '/' : rutaActual.startsWith(ruta);
    // El indicador del enlace actual lleva view-transition-name: al cambiar de página se
    // desliza de un enlace a otro.
    const indicador = actual ? '<span class="nav-indicador" aria-hidden="true"></span>' : '';
    return `<li><a href="${escaparHtml(ruta)}"${actual ? ' aria-current="page"' : ''}>${escaparHtml(texto)}${indicador}</a></li>`;
  }).join('')}</ul>`;

  // Marca (logo AC) en línea: hereda el color del texto, así se adapta al tema claro y oscuro.
  const logoSvg = '<svg class="marca-logo" aria-hidden="true" focusable="false" viewBox="64 64 384 384" width="28" height="28"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M365.3 150.4 A152 152 0 1 0 365.3 361.6" stroke-width="22"/><path d="M182 346 L256 166 L330 346" stroke-width="34"/></g></svg>';

  const pagCompleta = ({ titulo, descripcion, ruta, ogTipo = 'website', contenido, metaExtra = '' }) =>
    renderizar(base, {
      idioma: sitio.idioma,
      tituloPagina: titulo ? `${titulo} · ${sitio.titulo}` : sitio.titulo,
      ogTitulo: titulo || sitio.titulo,
      tituloSitio: sitio.titulo,
      descripcion: descripcion || sitio.descripcion,
      autor: sitio.autor,
      marca: sitio.marca,
      urlCanonica: urlAbsoluta(ruta),
      ogTipo,
      localeOpenGraph: sitio.localeOpenGraph,
      metaExtra: [metaExtra, CON_BORRADORES ? '<meta name="robots" content="noindex">' : ''].filter(Boolean).join('\n  '),
      navegacion: navegacion(ruta),
      contenido,
      anio: new Date().getFullYear(),
      enlacesRedes,
      logoSvg,
      urlImagenOg: urlAbsoluta('/og-imagen.png'),
      urlIcono: urlAbsoluta('/icono-192.png')
    }, 'base.html');

  const listaHtml = (lista, vacio) => lista.length
    ? `<ul class="lista-publicaciones">\n${lista.map((p) => renderizar(item, {
        enlace: p.ruta, titulo: p.titulo, fechaISO: p.fechaISO, fechaLegible: p.fechaLegible,
        resumen: p.resumen, etiquetas: htmlEtiquetas(p.etiquetas), marcaBorrador: marcaBorrador(p),
        tiempoLectura: p.tiempoLectura, slugsEtiquetas: p.etiquetas.map(aSlug).join(' ')
      }, 'item-publicacion.html')).join('\n')}</ul>`
    : `<p class="vacio">${vacio}</p>`;

  const publicaciones = await leerPublicaciones();
  const paginas = await leerPaginas();
  const proyectos = await leerProyectos();

  const htmlProyecto = (p, nivel) => renderizar(itemProyecto, {
    slug: p.slug, nivel, titulo: p.titulo, area: p.area, anio: p.anio,
    areaSlug: aSlug(p.area), herramientasSlug: p.herramientas.map(aSlug).join(' '),
    problema: p.problema, enfoque: p.enfoque, resultado: p.resultado, notaHtml: p.notaHtml,
    enlacesHtml: p.enlaces.length
      ? `<ul class="proyecto-enlaces">${p.enlaces.map((e) => `<li><a href="${escaparHtml(e.url)}">${escaparHtml(e.texto)}</a></li>`).join('')}</ul>`
      : '',
    herramientas: p.herramientas.length
      ? `<p class="herramientas"><span>Herramientas y datos:</span> ${p.herramientas.map(escaparHtml).join(', ')}</p>`
      : ''
  }, 'item-proyecto.html');
  const destacados = proyectos.filter((p) => p.destacado);
  const proyectosDestacados = destacados.length ? `<section class="proyectos-destacados" aria-labelledby="titulo-proyectos">
  <div class="indice-cabecera">
    <h2 id="titulo-proyectos">${escaparHtml(sitio.tituloProyectos)}</h2>
    <a class="ver-mas" href="/academico/#proyectos">Ver los ${proyectos.length} proyectos</a>
  </div>
  <div class="libro">
${destacados.map((p) => htmlProyecto(p, 3)).join('\n')}
  </div>
</section>` : '';
  const enSitemap = ['/'];

  // Interruptor "En los datos / En la barra" de la portada. Sin JavaScript se ve la
  // versión de datos; sitio.js muestra el interruptor y alterna los textos.
  const metodo = (sitio.metodo ?? []).length ? `<div class="metodo" data-metodo>
    <div class="metodo-cabecera">
      <p class="metodo-titulo" id="titulo-metodo">El mismo método</p>
      <div class="interruptor" role="group" aria-labelledby="titulo-metodo" hidden>
        <button type="button" data-modo="datos" aria-pressed="true">En los datos</button>
        <button type="button" data-modo="barra" aria-pressed="false">En la barra</button>
      </div>
    </div>
    <dl class="metodo-filas" aria-live="polite">
${sitio.metodo.map((m) => `      <div><dt>${escaparHtml(m.verbo)}</dt><dd data-datos="${escaparHtml(m.datos)}" data-barra="${escaparHtml(m.barra)}">${escaparHtml(m.datos)}</dd></div>`).join('\n')}
    </dl>
  </div>` : '';

  // Matriz de evidencia (Sobre mí): cada herramienta enlaza con los proyectos donde se usó.
  const usos = new Map();
  for (const p of proyectos) for (const h of p.herramientas) {
    const s = aSlug(h);
    if (!usos.has(s)) usos.set(s, { nombre: h, proyectos: [] });
    usos.get(s).proyectos.push(p);
  }
  const evidencia = proyectos.length ? `<div class="evidencia" data-evidencia hidden>
  <p class="evidencia-ayuda" id="ayuda-evidencia">Elige una herramienta para ver en qué proyectos la usé.</p>
  <div class="evidencia-cuerpo">
    <div class="evidencia-herramientas" role="group" aria-describedby="ayuda-evidencia">
${[...usos.entries()].sort((a, b) => b[1].proyectos.length - a[1].proyectos.length || a[1].nombre.localeCompare(b[1].nombre, 'es'))
    .map(([s, u]) => `      <button type="button" data-herramienta="${s}" aria-pressed="false">${escaparHtml(u.nombre)}<span class="cuenta">${u.proyectos.length}</span></button>`).join('\n')}
    </div>
    <ol class="evidencia-proyectos" aria-live="polite">
${proyectos.map((p) => `      <li data-herramientas="${p.herramientas.map(aSlug).join(' ')}"><a href="/academico/#${p.slug}">${escaparHtml(p.titulo)}</a><span>${escaparHtml(p.area)}</span></li>`).join('\n')}
    </ol>
  </div>
</div>` : '';

  // Laboratorio de docencia (Sobre mí): elección del consumidor Cobb-Douglas.
  // El SVG se dibuja en el navegador; sin JavaScript queda oculto.
  const laboratorio = `<figure class="laboratorio" data-laboratorio hidden>
  <figcaption>Un problema de mis prácticas: mueve el precio, el ingreso o las preferencias y mira cómo cambia la canasta óptima.</figcaption>
  <div class="laboratorio-cuerpo">
    <svg viewBox="0 0 320 260" role="img" aria-labelledby="laboratorio-texto" data-grafico></svg>
    <div class="laboratorio-controles">
      <label>Precio del bien X <output data-salida="px"></output><input type="range" min="2" max="10" step="0.5" value="4" data-control="px"></label>
      <label>Ingreso <output data-salida="m"></output><input type="range" min="20" max="100" step="5" value="60" data-control="m"></label>
      <label>Peso de X en la utilidad (α) <output data-salida="a"></output><input type="range" min="0.2" max="0.8" step="0.05" value="0.5" data-control="a"></label>
      <p class="laboratorio-resultado" id="laboratorio-texto" aria-live="polite" data-resultado-lab></p>
    </div>
  </div>
</figure>`;

  // Inicio
  const vacioInicio = 'Todavía no hay publicaciones. Vuelve pronto.' + (CON_BORRADORES ? '' :
    '<br><small>Si eres el autor: las publicaciones con <code>borrador: true</code> no aparecen aquí. Usa <code>npm run dev</code> para verlas.</small>');
  // Filtros de la portada (buscador y etiquetas). Van ocultos y sitio.js los muestra:
  // sin JavaScript la portada sigue funcionando como lista simple.
  const conteoEtiquetas = new Map();
  for (const p of publicaciones) for (const e of p.etiquetas) {
    const s = aSlug(e);
    conteoEtiquetas.set(s, { nombre: conteoEtiquetas.get(s)?.nombre ?? e, n: (conteoEtiquetas.get(s)?.n ?? 0) + 1 });
  }
  const filtros = publicaciones.length > 1 ? `<div class="filtros" hidden>
    <label class="buscador">
      <span class="visualmente-oculto">Buscar publicaciones</span>
      <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="m20 20-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      <input type="search" placeholder="Buscar…" autocomplete="off" data-buscador>
      <kbd aria-hidden="true">/</kbd>
    </label>
    <div class="chips" role="group" aria-label="Filtrar por etiqueta">
      <button type="button" class="chip" data-etiqueta="" aria-pressed="true">Todas</button>
      ${[...conteoEtiquetas.entries()].sort((a, b) => b[1].n - a[1].n || a[1].nombre.localeCompare(b[1].nombre, 'es'))
        .map(([s, { nombre }]) => `<button type="button" class="chip" data-etiqueta="${s}" aria-pressed="false">${escaparHtml(nombre)}</button>`).join('\n      ')}
    </div>
    <p class="resultado" aria-live="polite" data-resultado></p>
  </div>` : '';
  const enlacesHero = [
    proyectos.length ? '<li><a class="enlace-principal" href="/academico/#proyectos">Ver mis proyectos</a></li>' : '',
    sitio.cv ? `<li><a href="${escaparHtml(sitio.cv)}">Descargar CV</a></li>` : '',
    sitio.correo ? `<li><a href="mailto:${escaparHtml(sitio.correo)}">Escríbeme</a></li>` : '',
    '<li><a href="/extracurricular/">Fuera del aula</a></li>',
    ...sitio.redes.map((r) => `<li><a href="${escaparHtml(r.url)}" rel="me">${escaparHtml(r.nombre)}</a></li>`)
  ].join('');
  // Ficha de identidad (schema.org/Person): le dice a buscadores que la web y las redes de
  // sitio.config.js (LinkedIn, Instagram...) pertenecen a la misma persona.
  const persona = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: sitio.autor,
    alternateName: sitio.marca,
    url: urlAbsoluta('/'),
    image: urlAbsoluta('/og-imagen.png'),
    jobTitle: 'Estudiante de Economía',
    affiliation: { '@type': 'CollegeOrUniversity', name: 'Pontificia Universidad Católica del Perú' },
    sameAs: sitio.redes.map((r) => r.url)
  };
  const fichaIdentidad = `<script type="application/ld+json">${JSON.stringify(persona).replace(/</g, '\\u003c')}</script>`;
  await escribir('index.html', pagCompleta({
    ruta: '/',
    metaExtra: fichaIdentidad,
    contenido: renderizar(inicio, {
      saludo: sitio.saludo, presentacion: sitio.presentacion, metodo,
      puenteProyectos: sitio.puenteProyectos ?? '',
      ahora: (sitio.ahora ?? []).map((a) => `<li>${escaparHtml(a)}</li>`).join(''),
      enlacesHero, tituloIndice: sitio.tituloIndice, introduccion: sitio.introduccion,
      totalPublicaciones: plural(publicaciones.length, 'publicación', 'publicaciones'),
      filtros, listaPublicaciones: listaHtml(publicaciones, vacioInicio), proyectosDestacados,
      // Franja "Fuera del aula": adelanto de la página Extracurricular.
      fueraDelAula: (sitio.fueraDelAula ?? []).length ? `<section class="fuera-del-aula" aria-labelledby="titulo-fuera">
  <div class="indice-cabecera">
    <h2 id="titulo-fuera">Fuera del aula</h2>
    <a class="ver-mas" href="/extracurricular/">Ver todo lo extracurricular</a>
  </div>
  <p class="puente">${escaparHtml(sitio.puenteFuera ?? '')}</p>
  <ul class="fuera-lista">
${sitio.fueraDelAula.map((f) => `    <li><a href="/extracurricular/#${escaparHtml(f.ancla)}"><span class="fuera-titulo">${escaparHtml(f.titulo)}</span><span class="fuera-texto">${escaparHtml(f.texto)}</span></a></li>`).join('\n')}
  </ul>
</section>` : '',
      // Sin publicaciones, la sección no se muestra en la web pública (sí en modo borradores).
      ocultarPublicaciones: publicaciones.length || CON_BORRADORES ? '' : ' hidden'
    }, 'inicio.html')
  }));

  // Publicaciones, con enlaces a la anterior y la siguiente
  for (const [i, p] of publicaciones.entries()) {
    const masNueva = publicaciones[i - 1];
    const masAntigua = publicaciones[i + 1];
    const vecinas = (masNueva || masAntigua) ? `<nav class="vecinas" aria-label="Otras publicaciones">${
      masAntigua ? `<a class="vecina-anterior" href="${masAntigua.ruta}"><span>Publicación anterior</span>${escaparHtml(masAntigua.titulo)}</a>` : '<span></span>'}${
      masNueva ? `<a class="vecina-siguiente" href="${masNueva.ruta}"><span>Publicación siguiente</span>${escaparHtml(masNueva.titulo)}</a>` : ''}</nav>` : '';
    const metaExtra = [
      `<meta property="article:published_time" content="${p.fechaISO}">`,
      ...p.etiquetas.map((e) => `<meta property="article:tag" content="${escaparHtml(e)}">`)
    ].join('\n  ');
    await escribir(path.join('publicaciones', p.slug, 'index.html'), pagCompleta({
      titulo: p.titulo, descripcion: p.resumen, ruta: p.ruta, ogTipo: 'article', metaExtra,
      contenido: renderizar(publicacion, {
        titulo: p.titulo, fechaISO: p.fechaISO, fechaLegible: p.fechaLegible, tiempoLectura: p.tiempoLectura,
        marcaBorrador: marcaBorrador(p), etiquetas: htmlEtiquetas(p.etiquetas), contenidoHtml: p.contenidoHtml,
        tablaContenido: htmlTablaContenido(p.subtitulos), claseIndice: htmlTablaContenido(p.subtitulos) ? ' con-tabla-contenido' : '',
        vecinas
      }, 'publicacion.html')
    }));
    enSitemap.push(p.ruta);
  }

  // Etiquetas: una página por etiqueta y un índice de todas
  const porEtiqueta = new Map();
  for (const p of publicaciones) {
    for (const e of p.etiquetas) {
      const slug = aSlug(e);
      if (!porEtiqueta.has(slug)) porEtiqueta.set(slug, { nombre: e, publicaciones: [] });
      porEtiqueta.get(slug).publicaciones.push(p);
    }
  }
  const etiquetasOrdenadas = [...porEtiqueta.entries()].sort((a, b) => a[1].nombre.localeCompare(b[1].nombre, 'es'));
  for (const [slug, { nombre, publicaciones: lista }] of etiquetasOrdenadas) {
    const ruta = `/etiquetas/${slug}/`;
    await escribir(path.join('etiquetas', slug, 'index.html'), pagCompleta({
      titulo: `Etiqueta: ${nombre}`, descripcion: `Publicaciones sobre ${nombre}.`, ruta,
      contenido: renderizar(indice, {
        tituloIndice: `Etiqueta: ${nombre}`,
        introduccion: plural(lista.length, 'publicación', 'publicaciones') + '.',
        listaPublicaciones: listaHtml(lista, '') + '\n<p class="ver-todas"><a href="/etiquetas/">Ver todas las etiquetas</a></p>'
      }, 'indice.html')
    }));
    enSitemap.push(ruta);
  }
  const nubeEtiquetas = etiquetasOrdenadas.length
    ? `<ul class="etiquetas etiquetas-grandes">${etiquetasOrdenadas.map(([slug, { nombre, publicaciones: lista }]) =>
        `<li><a href="/etiquetas/${slug}/">${escaparHtml(nombre)} <span class="cuenta">${lista.length}</span></a></li>`).join('')}</ul>`
    : '<p class="vacio">Todavía no hay etiquetas.</p>';
  await escribir(path.join('etiquetas', 'index.html'), pagCompleta({
    titulo: 'Etiquetas', descripcion: 'Todas las etiquetas del sitio.', ruta: '/etiquetas/',
    contenido: renderizar(indice, {
      tituloIndice: 'Etiquetas', introduccion: 'Explora las publicaciones por tema.', listaPublicaciones: nubeEtiquetas
    }, 'indice.html')
  }));
  enSitemap.push('/etiquetas/');

  // Bloque de proyectos (filtro por área + filas del libro). Se inserta en una página con el
  // marcador {{proyectos}}; hoy vive en Académico.
  const bloqueProyectos = proyectos.length ? `<div class="bloque-proyectos">
  <div class="chips filtro-areas" role="group" aria-label="Filtrar por área" hidden>
    <button type="button" class="chip" data-area="" aria-pressed="true">Todas</button>
${[...new Map(proyectos.map((p) => [aSlug(p.area), p.area])).entries()]
    .map(([s, a]) => `    <button type="button" class="chip" data-area="${s}" aria-pressed="false">${escaparHtml(a)}</button>`).join('\n')}
  </div>
  <p class="indice-total" aria-live="polite" data-total-proyectos>${plural(proyectos.length, 'proyecto', 'proyectos')}</p>
  <div class="libro">
${proyectos.map((p) => htmlProyecto(p, 3)).join('\n')}
  </div>
</div>` : '';

  // La antigua página /proyectos/ ahora redirige a Académico (los enlaces ya compartidos
  // siguen funcionando).
  await escribir(path.join('proyectos', 'index.html'), `<!doctype html>
<html lang="${sitio.idioma}"><head><meta charset="utf-8">
<title>Proyectos · ${escaparHtml(sitio.titulo)}</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${urlAbsoluta('/academico/')}">
<meta http-equiv="refresh" content="0; url=/academico/#proyectos">
</head><body><p>Los proyectos ahora están en <a href="/academico/#proyectos">Académico</a>.</p></body></html>
`);

  // Páginas sueltas (Académico, Extracurricular, Sobre mí, Suscribirse...)
  for (const pag of paginas) {
    const html = pag.contenidoHtml
      // Marcadores que se pueden poner en el Markdown de una página, en su propio párrafo.
      .replace('<p>{{evidencia}}</p>', evidencia)
      .replace('<p>{{laboratorio}}</p>', laboratorio)
      .replace('<p>{{proyectos}}</p>', bloqueProyectos);
    await escribir(path.join(pag.slug, 'index.html'), pagCompleta({
      titulo: pag.titulo, descripcion: pag.resumen, ruta: pag.ruta,
      contenido: renderizar(pagina, {
        titulo: pag.titulo,
        // Las páginas con la lista de proyectos usan el ancho completo para las filas.
        claseExtra: html.includes('class="bloque-proyectos"') ? ' ancha' : '',
        contenidoHtml: html
      }, 'pagina.html')
    }));
    enSitemap.push(pag.ruta);
  }

  // 404
  await escribir('404.html', pagCompleta({
    titulo: 'Página no encontrada', descripcion: 'La página que buscas no existe.', ruta: '/404.html',
    metaExtra: CON_BORRADORES ? '' : '<meta name="robots" content="noindex">',
    contenido: '<section class="error">\n<h1>Página no encontrada</h1>\n<p>Esta dirección no existe o la página cambió de lugar. Revisa el enlace o empieza desde la portada.</p>\n<p><a href="/">Ir a la portada</a></p>\n</section>'
  }));

  // RSS (nunca incluye borradores, aunque se genere con --borradores)
  const publicas = publicaciones.filter((p) => !p.borrador);
  const ultima = publicas[0]?.fecha ?? new Date();
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${escaparXml(sitio.titulo)}</title>
  <link>${escaparXml(urlAbsoluta('/'))}</link>
  <description>${escaparXml(sitio.descripcion)}</description>
  <language>${escaparXml(sitio.idioma)}</language>
  <lastBuildDate>${ultima.toUTCString()}</lastBuildDate>
  <atom:link href="${escaparXml(urlAbsoluta('/feed.xml'))}" rel="self" type="application/rss+xml"/>
${publicas.map((p) => `  <item>
    <title>${escaparXml(p.titulo)}</title>
    <link>${escaparXml(urlAbsoluta(p.ruta))}</link>
    <guid isPermaLink="true">${escaparXml(urlAbsoluta(p.ruta))}</guid>
    <pubDate>${p.fecha.toUTCString()}</pubDate>
    <description>${escaparXml(p.resumen)}</description>
${p.etiquetas.map((e) => `    <category>${escaparXml(e)}</category>`).join('\n')}
  </item>`).join('\n')}
</channel>
</rss>
`;
  await escribir('feed.xml', rss.replace(/\n\n+/g, '\n'));

  // Sitemap y robots.txt (la versión con borradores pide no indexar nada)
  await escribir('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${enSitemap.map((r) => `  <url><loc>${escaparXml(urlAbsoluta(r))}</loc></url>`).join('\n')}
</urlset>
`);
  await escribir('robots.txt', CON_BORRADORES
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${urlAbsoluta('/sitemap.xml')}\n`);

  // CSS
  await mkdir(SALIDA, { recursive: true });
  await copyFile(path.join(RAIZ, 'estilos', 'estilos.css'), path.join(SALIDA, 'estilos.css'));
  generados.push('estilos.css');
  await copyFile(path.join(DIR_CLIENTE, 'sitio.js'), path.join(SALIDA, 'sitio.js'));
  generados.push('sitio.js');

  // Logo, favicon e imagen para compartir (carpeta activos/ → raíz del sitio)
  for (const archivo of await readdir(path.join(RAIZ, 'activos'))) {
    await copyFile(path.join(RAIZ, 'activos', archivo), path.join(SALIDA, archivo));
    generados.push(archivo);
  }

  // Fuentes autoalojadas (paquetes de npm @fontsource): no se pide nada a servidores externos.
  const FUENTES = {
    'archivo.woff2': '@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2',
    'spectral-400.woff2': '@fontsource/spectral/files/spectral-latin-400-normal.woff2',
    'spectral-400-italica.woff2': '@fontsource/spectral/files/spectral-latin-400-italic.woff2',
    'spectral-600.woff2': '@fontsource/spectral/files/spectral-latin-600-normal.woff2'
  };
  await mkdir(path.join(SALIDA, 'fuentes'), { recursive: true });
  for (const [destino, origen] of Object.entries(FUENTES)) {
    await copyFile(path.join(RAIZ, 'node_modules', origen), path.join(SALIDA, 'fuentes', destino));
    generados.push(`fuentes/${destino}`);
  }

  // Aviso de archivos que quedaron de builds anteriores (el generador no borra nada).
  const rutaManifiesto = path.join(SALIDA, MANIFIESTO);
  if (existsSync(rutaManifiesto)) {
    const anteriores = JSON.parse(await readFile(rutaManifiesto, 'utf8'));
    const obsoletos = anteriores.filter((f) => !generados.includes(f));
    if (obsoletos.length) {
      console.warn(`\nAviso: estos archivos de ${path.basename(SALIDA)}/ ya no se generan (p. ej. publicaciones pasadas a borrador o eliminadas).`);
      console.warn('Siguen en la carpeta y se publicarían si subes /dist tal cual. Bórralos a mano:');
      for (const f of obsoletos) console.warn(`  - ${f}`);
    }
  }
  await writeFile(rutaManifiesto, JSON.stringify(generados.sort(), null, 2), 'utf8');

  console.log(`Sitio generado en ${path.relative(RAIZ, SALIDA)}/: ${plural(publicaciones.length, 'publicación', 'publicaciones')}` +
    `${CON_BORRADORES ? ' (incluye borradores)' : ''}, ${porEtiqueta.size} etiquetas, ${generados.length} archivos.`);
}

main().catch((error) => {
  console.error(`\nError al generar el sitio: ${error.message}`);
  process.exit(1);
});
