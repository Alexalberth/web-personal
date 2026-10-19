// Toma capturas de página completa en escritorio y celular usando Microsoft Edge (o Chrome)
// ya instalado, mediante el protocolo DevTools. No instala nada. Requiere Node 22+.
// Uso: con "npm run preview:borradores" en marcha, ejecuta "npm run capturas".
// Variables opcionales: BASE (por defecto http://127.0.0.1:4001), NAVEGADOR (ruta al .exe).
import { spawn } from 'node:child_process';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.BASE || 'http://127.0.0.1:4001';
const PUERTO_DEPURACION = 9333;
const candidatos = [
  process.env.NAVEGADOR,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium'
].filter(Boolean);
const navegador = candidatos.find((c) => existsSync(c));
if (!navegador) { console.error('No encontré Edge ni Chrome. Indica la ruta con NAVEGADOR=...'); process.exit(1); }

const tomasBase = [
  { archivo: 'inicio-escritorio.png', ruta: '/', ancho: 1280, alto: 800, movil: false },
  { archivo: 'inicio-celular.png', ruta: '/', ancho: 390, alto: 844, movil: true },
  { archivo: 'publicacion-escritorio.png', ruta: '/publicaciones/ejemplo-ensayo-largo/', ancho: 1280, alto: 800, movil: false },
  { archivo: 'publicacion-celular.png', ruta: '/publicaciones/ejemplo-ensayo-largo/', ancho: 390, alto: 844, movil: true }
];
// Cada captura se toma en tema oscuro (nombre base) y claro (sufijo -claro).
const tomas = tomasBase.flatMap((t) => [
  { ...t, tema: 'dark' },
  { ...t, tema: 'light', archivo: t.archivo.replace('.png', '-claro.png') }
]);

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

const proceso = spawn(navegador, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars',
  `--remote-debugging-port=${PUERTO_DEPURACION}`,
  `--user-data-dir=${path.join(RAIZ, '.perfil-navegador')}`, 'about:blank'
], { stdio: 'ignore' });

try {
  let destino;
  for (let i = 0; i < 40 && !destino; i++) {
    await esperar(250);
    destino = await fetch(`http://127.0.0.1:${PUERTO_DEPURACION}/json/list`)
      .then((r) => r.json()).then((l) => l.find((t) => t.type === 'page')).catch(() => undefined);
  }
  if (!destino) throw new Error('El navegador no abrió el puerto de depuración.');

  const ws = new WebSocket(destino.webSocketDebuggerUrl);
  await new Promise((ok, mal) => { ws.onopen = ok; ws.onerror = mal; });
  let id = 0;
  const pendientes = new Map();
  const eventos = [];
  ws.onmessage = (m) => {
    const datos = JSON.parse(m.data);
    if (datos.id && pendientes.has(datos.id)) {
      const { ok, mal } = pendientes.get(datos.id);
      pendientes.delete(datos.id);
      datos.error ? mal(new Error(datos.error.message)) : ok(datos.result);
    } else if (datos.method) eventos.push(datos.method);
  };
  const cdp = (method, params = {}) => new Promise((ok, mal) => {
    pendientes.set(++id, { ok, mal });
    ws.send(JSON.stringify({ id, method, params }));
  });

  await cdp('Page.enable');
  await mkdir(path.join(RAIZ, 'capturas'), { recursive: true });
  for (const t of tomas) {
    await cdp('Emulation.setDeviceMetricsOverride', {
      width: t.ancho, height: t.alto, deviceScaleFactor: t.movil ? 2 : 1, mobile: t.movil
    });
    await cdp('Emulation.setTouchEmulationEnabled', { enabled: t.movil });
    // Movimiento reducido: así las animaciones de aparición no dejan elementos invisibles en la captura.
    await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: t.tema }, { name: 'prefers-reduced-motion', value: 'reduce' }] });
    eventos.length = 0;
    await cdp('Page.navigate', { url: BASE + t.ruta });
    for (let i = 0; i < 40 && !eventos.includes('Page.loadEventFired'); i++) await esperar(100);
    await esperar(300);
    const { result } = await cdp('Runtime.evaluate', {
      expression: 'JSON.stringify([document.documentElement.scrollWidth, document.documentElement.clientWidth, document.documentElement.scrollHeight])',
      returnByValue: true
    });
    const [anchoScroll, anchoVisible, altoTotal] = JSON.parse(result.value);
    const { data } = await cdp('Page.captureScreenshot', {
      format: 'png', captureBeyondViewport: true,
      clip: { x: 0, y: 0, width: t.ancho, height: altoTotal, scale: 1 }
    });
    await writeFile(path.join(RAIZ, 'capturas', t.archivo), Buffer.from(data, 'base64'));
    const desborde = anchoScroll > anchoVisible ? `  ¡DESBORDE HORIZONTAL! (${anchoScroll}px > ${anchoVisible}px)` : '  sin desplazamiento horizontal';
    console.log(`capturas/${t.archivo}  ${t.ancho}px, tema ${t.tema === 'dark' ? 'oscuro' : 'claro'}${desborde}`);
  }
  ws.close();
} finally {
  proceso.kill();
}
