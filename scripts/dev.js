// Modo de trabajo: genera el sitio con borradores, lo sirve en localhost y lo vuelve a
// generar cada vez que guardas un cambio en contenido/, plantillas/, estilos/, cliente/ o
// sitio.config.js. El navegador se recarga solo.
// Uso: npm run dev   (añade --abrir para abrir el navegador automáticamente)
import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { crearServidor } from './servidor.js';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CARPETA = path.join(RAIZ, 'dist-borradores');

function generar() {
  return new Promise((ok) => {
    const hijo = spawn(process.execPath, [path.join(RAIZ, 'scripts', 'build.js'), '--borradores'], { stdio: 'inherit' });
    hijo.on('close', (codigo) => ok(codigo === 0));
  });
}

await generar();
const servidor = crearServidor({ carpeta: CARPETA, recarga: true });
const puerto = await servidor.iniciar(Number(process.env.PORT) || 4000);
const url = `http://localhost:${puerto}`;

console.log(`\nSitio en ${url}  (incluye borradores, marcados como tales)`);
console.log('Guarda cualquier cambio y la página se actualizará sola. Ctrl+C para detener.\n');

if (process.argv.includes('--abrir')) {
  const [cmd, args] = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]]
    : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
  spawn(cmd, args, { stdio: 'ignore', detached: true }).unref();
}

// Vigila cambios y regenera (agrupa varios guardados seguidos en uno).
let temporizador = null;
let generando = false;
let pendiente = false;

async function regenerar() {
  if (generando) { pendiente = true; return; }
  generando = true;
  const hora = new Date().toLocaleTimeString('es');
  console.log(`[${hora}] Cambio detectado, regenerando...`);
  if (await generar()) servidor.recargar();
  else console.log('Corrige el error y guarda de nuevo; el sitio anterior sigue disponible.');
  generando = false;
  if (pendiente) { pendiente = false; regenerar(); }
}

for (const objetivo of ['contenido', 'plantillas', 'estilos', 'cliente', 'sitio.config.js']) {
  watch(path.join(RAIZ, objetivo), { recursive: true }, () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(regenerar, 200);
  });
}
