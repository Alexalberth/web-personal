// Genera las láminas de Instagram (tono cercano) y LinkedIn (tono formal) de una pieza.
// Uso: npm run redes -- impuesto-renta-2026-calculadora
// Lee redes/<nombre>.json y escribe en redes/salida/<nombre>/:
//   ig-01.png, ig-02.png...   (1080 × 1350, carrusel de Instagram)
//   li-01.png, li-02.png...   (1080 × 1350, carrusel de LinkedIn)
//   instagram.txt, linkedin.txt (textos listos para pegar o publicar)
// Usa Edge o Chrome ya instalados (o Chromium); no descarga nada.
// Regla: los números de las láminas salen del JSON, que debe citar su fuente.
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const nombre = process.argv[2];
if (!nombre || !/^[a-z0-9-]+$/.test(nombre)) {
  console.error('Indica la pieza: npm run redes -- nombre-de-la-pieza (archivo redes/<nombre>.json)');
  process.exit(1);
}
const pieza = JSON.parse(await readFile(path.join(RAIZ, 'redes', `${nombre}.json`), 'utf8'));
const { default: sitio } = await import(pathToFileURL(path.join(RAIZ, 'sitio.config.js')));

const navegador = [
  process.env.NAVEGADOR,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium'
].filter(Boolean).find((c) => existsSync(c));
if (!navegador) { console.error('No encontré Edge, Chrome ni Chromium. Indica la ruta con NAVEGADOR=...'); process.exit(1); }

const fuente = (rel) => pathToFileURL(path.join(RAIZ, 'node_modules', rel)).href;
// Espacio duro entre número y % y tras "S/", para que no se partan en dos líneas.
const esc = (t = '') => String(t).replace(/(\d) %/g, '$1\u00a0%').replace(/S\/ (?=\d)/g, 'S/\u00a0').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// **texto** → resaltado
const rico = (t = '') => esc(t).replace(/\*\*(.+?)\*\*/g, '<mark>$1</mark>');
const dominio = sitio.url.replace(/^https?:\/\//, '');

const CSS_BASE = `
@font-face { font-family: Archivo; src: url(${fuente('@fontsource-variable/archivo/files/archivo-latin-standard-normal.woff2')}) format('woff2'); font-weight: 100 900; font-stretch: 62% 125%; }
@font-face { font-family: Spectral; src: url(${fuente('@fontsource/spectral/files/spectral-latin-400-normal.woff2')}) format('woff2'); font-weight: 400; }
@font-face { font-family: Spectral; src: url(${fuente('@fontsource/spectral/files/spectral-latin-600-normal.woff2')}) format('woff2'); font-weight: 600; }
* { box-sizing: border-box; margin: 0; }
html, body { width: 1080px; height: 1350px; overflow: hidden; }
body { position: relative; font-family: Archivo, sans-serif; -webkit-font-smoothing: antialiased; }
.lamina { position: absolute; inset: 0; display: flex; flex-direction: column; }
`;

// ---------- Instagram: cercano, grande, una idea por lámina ----------
const CSS_IG = `
body { background: #0b6b4b; color: #f4f6f2; }
.lamina { padding: 110px 90px 120px; background:
  repeating-linear-gradient(180deg, rgb(255 255 255 / 0.05) 0 90px, transparent 90px 180px); }
.chip { align-self: flex-start; padding: 14px 26px; border-radius: 999px; background: #f4f6f2; color: #0b6b4b; font-size: 30px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; }
h1 { margin-top: 60px; font-size: 104px; line-height: 0.98; font-weight: 850; font-stretch: 88%; letter-spacing: -0.01em; }
h2 { font-size: 76px; line-height: 1.04; font-weight: 820; font-stretch: 90%; }
p.sub { margin-top: 44px; font-size: 48px; line-height: 1.3; font-weight: 500; color: rgb(244 246 242 / 0.88); }
mark { background: #f4f6f2; color: #0b6b4b; padding: 0 12px; border-radius: 10px; box-decoration-break: clone; -webkit-box-decoration-break: clone; }
.cifra { margin-top: 70px; font-size: 230px; line-height: 0.9; font-weight: 900; font-stretch: 78%; letter-spacing: -0.02em; }
.texto { margin-top: 50px; font-size: 54px; line-height: 1.28; font-weight: 600; }
.opciones { display: grid; gap: 26px; margin-top: 64px; }
.opciones div { padding: 40px 44px; border-radius: 26px; background: rgb(244 246 242 / 0.12); border: 3px solid rgb(244 246 242 / 0.35); font-size: 50px; font-weight: 650; }
.opciones b { display: inline-block; width: 66px; color: #9fe3c2; }
.barras { display: grid; gap: 34px; margin-top: 70px; }
.barra .fila { display: flex; justify-content: space-between; font-size: 44px; font-weight: 650; margin-bottom: 12px; }
.barra .riel { height: 46px; border-radius: 12px; background: rgb(244 246 242 / 0.14); overflow: hidden; }
.barra .riel span { display: block; height: 100%; border-radius: 12px; background: rgb(244 246 242 / 0.55); }
.barra.destacada .riel span { background: #f4f6f2; }
.barra.destacada .fila { color: #fff; }
ol { margin-top: 60px; padding: 0; list-style: none; counter-reset: p; display: grid; gap: 40px; }
li { counter-increment: p; display: grid; grid-template-columns: 96px 1fr; align-items: start; font-size: 50px; line-height: 1.25; font-weight: 600; }
li::before { content: counter(p); display: grid; place-items: center; width: 74px; height: 74px; border-radius: 50%; background: #f4f6f2; color: #0b6b4b; font-weight: 900; font-size: 40px; }
.centro { flex: 1; display: flex; flex-direction: column; justify-content: center; padding-bottom: 40px; }
.abajo { margin-top: auto; }
.fuente { font-size: 28px; line-height: 1.35; color: rgb(244 246 242 / 0.7); font-weight: 500; }
.desliza { position: absolute; right: 90px; bottom: 56px; font-size: 30px; font-weight: 750; letter-spacing: 0.05em; color: rgb(244 246 242 / 0.85); }
.marca { position: absolute; left: 90px; bottom: 56px; font-size: 30px; font-weight: 750; color: rgb(244 246 242 / 0.85); }
.cta { margin-top: 60px; align-self: flex-start; padding: 30px 46px; border-radius: 22px; background: #f4f6f2; color: #0b6b4b; font-size: 44px; font-weight: 850; }
body.clara { background: #f4f6f2; color: #18211d; }
body.clara .lamina { background: repeating-linear-gradient(180deg, #e3eee6 0 90px, transparent 90px 180px); }
body.clara .chip { background: #0b6b4b; color: #f4f6f2; }
body.clara mark { background: #0b6b4b; color: #f4f6f2; }
body.clara p.sub, body.clara .fuente, body.clara .desliza, body.clara .marca { color: #4d5a53; }
body.clara .cifra { color: #0b6b4b; }
`;

// ---------- LinkedIn: formal, tipo informe, numerado ----------
const CSS_LI = `
body { background: #f4f6f2; color: #18211d; }
.lamina { padding: 96px 96px 0; background: repeating-linear-gradient(180deg, transparent 0 64px, #e3eee6 64px 128px); }
.lamina::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 18px; background: #0b6b4b; }
.etiqueta { font-size: 26px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0b6b4b; }
h1 { margin-top: 48px; font-size: 96px; line-height: 1.02; font-weight: 760; font-stretch: 86%; letter-spacing: -0.01em; }
h2 { margin-top: 28px; font-size: 64px; line-height: 1.08; font-weight: 720; font-stretch: 88%; }
p.sub { margin-top: 44px; font-family: Spectral, serif; font-size: 46px; line-height: 1.4; color: #4d5a53; }
mark { background: none; color: #0b6b4b; font-weight: 800; }
.cifra { margin-top: 64px; font-size: 200px; line-height: 0.9; font-weight: 800; font-stretch: 78%; color: #0b6b4b; }
.texto { margin-top: 44px; font-family: Spectral, serif; font-size: 48px; line-height: 1.42; }
.opciones { display: grid; gap: 20px; margin-top: 56px; }
.opciones div { padding: 28px 34px; background: #f4f6f2; border: 2px solid #9fb0a5; font-size: 44px; font-weight: 600; }
.opciones b { display: inline-block; width: 60px; color: #0b6b4b; }
.barras { display: grid; gap: 30px; margin-top: 60px; }
.barra .fila { display: flex; justify-content: space-between; font-size: 40px; font-weight: 600; margin-bottom: 10px; font-variant-numeric: tabular-nums; }
.barra .riel { height: 34px; background: #e9eee9; border: 1px solid #cbd6ce; }
.barra .riel span { display: block; height: 100%; background: #9fb0a5; }
.barra.destacada .riel span { background: #0b6b4b; }
.barra.destacada .fila { color: #0b6b4b; font-weight: 800; }
ol { margin-top: 56px; padding: 0; list-style: none; counter-reset: p; display: grid; gap: 34px; }
li { counter-increment: p; display: grid; grid-template-columns: 96px 1fr; font-family: Spectral, serif; font-size: 46px; line-height: 1.38; }
li::before { content: counter(p, decimal-leading-zero); font-family: Archivo, sans-serif; font-weight: 800; color: #0b6b4b; font-size: 40px; }
.centro { flex: 1; display: flex; flex-direction: column; justify-content: center; padding-bottom: 20px; }
.abajo { margin-top: auto; }
.fuente { font-size: 26px; line-height: 1.4; color: #4d5a53; padding-bottom: 28px; }
.pie { display: flex; justify-content: space-between; align-items: center; margin: 0 -96px; padding: 30px 96px; border-top: 2px solid #18211d; background: #f4f6f2; font-size: 26px; font-weight: 650; color: #4d5a53; }
.pie strong { color: #18211d; }
.cta { margin-top: 56px; align-self: flex-start; padding: 26px 40px; border: 3px solid #0b6b4b; color: #0b6b4b; font-size: 42px; font-weight: 750; }
`;

const barras = (filas) => {
  const max = Math.max(...filas.map((f) => Math.abs(f.valor)), 1);
  return `<div class="barras">${filas.map((f) => `<div class="barra${f.destacar ? ' destacada' : ''}"><div class="fila"><span>${esc(f.etiqueta)}</span><span>${esc(f.texto ?? f.valor)}</span></div><div class="riel"><span style="width:${(Math.abs(f.valor) / max) * 100}%"></span></div></div>`).join('')}</div>`;
};
const letras = 'ABCD';
const cuerpo = (s, red) => {
  const html = cuerpoBase(s, red);
  const k = html.lastIndexOf('<div class="abajo">');
  return `<div class="centro">${html.slice(0, k)}</div>${html.slice(k)}`;
};
const cuerpoBase = (s, red) => {
  const chip = (t) => t ? (red === 'ig' ? `<span class="chip">${esc(t)}</span>` : `<p class="etiqueta">${esc(t)}</p>`) : '';
  const fuenteHtml = s.fuente ? `<p class="fuente">${esc(s.fuente)}</p>` : '';
  switch (s.tipo) {
    case 'portada': return `${chip(s.etiqueta)}<h1>${rico(s.titulo)}</h1>${s.subtitulo ? `<p class="sub">${rico(s.subtitulo)}</p>` : ''}<div class="abajo">${fuenteHtml}</div>`;
    case 'dato': return `${chip(s.etiqueta)}${s.titulo ? `<h2>${rico(s.titulo)}</h2>` : ''}<p class="cifra">${esc(s.cifra)}</p><p class="texto">${rico(s.texto)}</p><div class="abajo">${fuenteHtml}</div>`;
    case 'pregunta': return `${chip(s.etiqueta)}<h2>${rico(s.pregunta)}</h2><div class="opciones">${s.opciones.map((o, i) => `<div><b>${letras[i]}</b>${esc(o)}</div>`).join('')}</div><div class="abajo">${s.pista ? `<p class="fuente">${esc(s.pista)}</p>` : ''}</div>`;
    case 'texto': return `${chip(s.etiqueta)}<h2>${rico(s.titulo)}</h2><p class="texto">${rico(s.texto)}</p><div class="abajo">${fuenteHtml}</div>`;
    case 'pasos': return `${chip(s.etiqueta)}<h2>${rico(s.titulo)}</h2><ol>${s.items.map((i) => `<li><span>${rico(i)}</span></li>`).join('')}</ol><div class="abajo">${fuenteHtml}</div>`;
    case 'barras': return `${chip(s.etiqueta)}<h2>${rico(s.titulo)}</h2>${barras(s.filas)}${s.texto ? `<p class="texto">${rico(s.texto)}</p>` : ''}<div class="abajo">${fuenteHtml}</div>`;
    case 'cierre': return `${chip(s.etiqueta)}<h2>${rico(s.titulo)}</h2>${s.texto ? `<p class="texto">${rico(s.texto)}</p>` : ''}<p class="cta">${esc(s.cta ?? `${dominio}`)}</p><div class="abajo">${fuenteHtml}</div>`;
    default: throw new Error(`Tipo de lámina desconocido: "${s.tipo}"`);
  }
};

const pagina = (s, red, i, total) => {
  const extra = red === 'ig'
    ? `<span class="marca">${esc(sitio.marca)}</span>${i < total ? '<span class="desliza">Desliza →</span>' : ''}`
    : '';
  const pie = red === 'li' ? `<div class="pie"><span><strong>${esc(sitio.autor)}</strong> · ${esc(dominio)}</span><span>${String(i).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span></div>` : '';
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${CSS_BASE}${red === 'ig' ? CSS_IG : CSS_LI}</style></head>
<body class="${s.fondo === 'claro' ? 'clara' : ''}"><div class="lamina">${cuerpo(s, red)}${pie}</div>${extra}</body></html>`;
};

const salida = path.join(RAIZ, 'redes', 'salida', nombre);
await rm(salida, { recursive: true, force: true });
await mkdir(salida, { recursive: true });
const temporal = path.join(os.tmpdir(), `redes-${nombre}-${process.pid}`);
await mkdir(temporal, { recursive: true });
const PUERTO = 9341;
await writeFile(path.join(temporal, 'calentar.html'), '<!doctype html><meta charset="utf-8"><body style="margin:0">.</body>');
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

const proceso = spawn(navegador, ['--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run', '--hide-scrollbars',
  '--allow-file-access-from-files', `--remote-debugging-port=${PUERTO}`, `--user-data-dir=${path.join(temporal, 'perfil')}`, 'about:blank'], { stdio: 'ignore' });
try {
  let destino;
  for (let k = 0; k < 60 && !destino; k++) {
    await esperar(250);
    destino = await fetch(`http://127.0.0.1:${PUERTO}/json/list`).then((r) => r.json()).then((l) => l.find((t) => t.type === 'page')).catch(() => undefined);
  }
  if (!destino) throw new Error('El navegador no abrió el puerto de depuración.');
  const ws = new WebSocket(destino.webSocketDebuggerUrl);
  await new Promise((ok, mal) => { ws.onopen = ok; ws.onerror = mal; });
  let id = 0;
  const pendientes = new Map();
  const eventos = [];
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pendientes.has(d.id)) { const { ok, mal } = pendientes.get(d.id); pendientes.delete(d.id); d.error ? mal(new Error(d.error.message)) : ok(d.result); }
    else if (d.method) eventos.push(d.method);
  };
  const cdp = (method, params = {}) => new Promise((ok, mal) => { pendientes.set(++id, { ok, mal }); ws.send(JSON.stringify({ id, method, params })); });
  await cdp('Page.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1080, height: 1350, deviceScaleFactor: 1, mobile: false });

  // Página de calentamiento: la primera captura del navegador a veces sale a medio pintar.
  await cdp('Page.navigate', { url: pathToFileURL(path.join(temporal, 'calentar.html')).href });
  await esperar(600);
  for (const [red, datos] of [['ig', pieza.instagram], ['li', pieza.linkedin]]) {
    const total = datos.laminas.length;
    for (const [n, s] of datos.laminas.entries()) {
      const html = path.join(temporal, `${red}-${n + 1}.html`);
      const png = path.join(salida, `${red}-${String(n + 1).padStart(2, '0')}.png`);
      await writeFile(html, pagina(s, red, n + 1, total));
      eventos.length = 0;
      await cdp('Page.navigate', { url: pathToFileURL(html).href });
      for (let k = 0; k < 60 && !eventos.includes('Page.loadEventFired'); k++) await esperar(100);
      await cdp('Runtime.evaluate', { expression: 'document.fonts.ready.then(() => true)', awaitPromise: true });
      await esperar(250);
      const { data } = await cdp('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 1080, height: 1350, scale: 1 } });
      await writeFile(png, Buffer.from(data, 'base64'));
    }
  }
  ws.close();
} finally {
  proceso.kill();
}
const enlace = `${sitio.url}${pieza.ruta}`;
await writeFile(path.join(salida, 'instagram.txt'), `${pieza.instagram.texto.replaceAll('{enlace}', enlace)}\n`);
await writeFile(path.join(salida, 'linkedin.txt'), `${pieza.linkedin.texto.replaceAll('{enlace}', enlace)}\n`);
await rm(temporal, { recursive: true, force: true }).catch(() => {});
console.log(`Listo: ${pieza.instagram.laminas.length} láminas de Instagram y ${pieza.linkedin.laminas.length} de LinkedIn en redes/salida/${nombre}/`);
