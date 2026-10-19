// Prepara /dist para subirlo a un hosting gratuito (ver PUBLICAR.md). No sube nada:
// genera el sitio, revisa lo típico que se olvida y abre la carpeta para arrastrarla.
import { spawnSync, spawn } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(RAIZ, 'dist');
const { default: sitio } = await import(`${pathToFileURL(path.join(RAIZ, 'sitio.config.js'))}?t=${Date.now()}`);

const build = spawnSync(process.execPath, [path.join(RAIZ, 'scripts', 'build.js')], { encoding: 'utf8' });
process.stdout.write(build.stdout);
process.stderr.write(build.stderr);
if (build.status !== 0) process.exit(build.status ?? 1);

const avisos = [];
if (/ejemplo\.com/.test(sitio.url)) avisos.push('La "url" de sitio.config.js sigue siendo de ejemplo.');
const publicadas = (await readdir(path.join(DIST, 'publicaciones')).catch(() => [])).length;
if (publicadas === 0) avisos.push('No hay ninguna publicación con "borrador: false": la sección "Publicaciones" no se mostrará en la portada.');
const sobreMi = await readFile(path.join(RAIZ, 'contenido', 'paginas', 'sobre-mi.md'), 'utf8');
if (sobreMi.includes('Este texto es de ejemplo')) avisos.push('"Sobre mí" todavía tiene el texto de ejemplo.');
if (sobreMi.includes('tu-correo@ejemplo.com')) avisos.push('"Sobre mí" todavía tiene el correo de ejemplo.');
if (/obsoletos|ya no se generan/.test(build.stderr)) avisos.push('Hay archivos viejos en dist/ (ver el aviso de arriba). Bórralos antes de subir.');

console.log(`\nDirección pública configurada: ${sitio.url}`);
console.log(`Publicaciones que se van a publicar: ${publicadas}`);
if (avisos.length) {
  console.log('\nRevisa antes de subir:');
  for (const a of avisos) console.log(`  - ${a}`);
} else {
  console.log('\nTodo listo.');
}
if (!process.argv.includes('--desde-subir')) {
  console.log(`\nSiguiente paso: ejecuta \"npm run subir\" o sube a mano la carpeta\n  ${DIST}\na Cloudflare Pages (instrucciones en PUBLICAR.md).`);
}

if (process.platform === 'win32' && !process.argv.includes('--sin-abrir') && !process.argv.includes('--desde-subir')) {
  spawn('explorer', [DIST], { detached: true, stdio: 'ignore' }).unref();
}
