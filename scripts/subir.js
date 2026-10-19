// Genera el sitio y lo publica directamente en Cloudflare Pages con Wrangler, la
// herramienta oficial de Cloudflare. Uso: npm run subir
// La primera vez Wrangler abre el navegador para que inicies sesión en Cloudflare
// (o ejecuta antes "npm run conectar"). No se guarda ninguna clave en este proyecto.
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WRANGLER = 'wrangler@4.147.0';
const { default: sitio } = await import(`${pathToFileURL(path.join(RAIZ, 'sitio.config.js'))}?t=${Date.now()}`);

// 1. Generar y revisar (mismo proceso que "npm run publicar", sin abrir el Explorador)
const preparar = spawnSync(process.execPath, [path.join(RAIZ, 'scripts', 'publicar.js'), '--desde-subir'], { stdio: 'inherit' });
if (preparar.status !== 0) {
  console.error('\nNo se subió nada: corrige el error de arriba y vuelve a intentarlo.');
  process.exit(preparar.status ?? 1);
}

// 2. Subir dist/ a Cloudflare Pages (rama de producción "main")
console.log(`\nSubiendo dist/ al proyecto "${sitio.proyectoCloudflare}" de Cloudflare Pages...\n`);
// En Windows npx es un .cmd y necesita la shell; se pasa como una sola línea de comando.
if (!/^[a-z0-9-]+$/.test(sitio.proyectoCloudflare)) {
  console.error('"proyectoCloudflare" en sitio.config.js solo puede tener minúsculas, números y guiones.');
  process.exit(1);
}
const comando = `npx --yes ${WRANGLER} pages deploy dist --project-name=${sitio.proyectoCloudflare} --branch=main --commit-dirty=true`;
const subir = spawnSync(comando, { cwd: RAIZ, stdio: 'inherit', shell: true });

if (subir.status !== 0) {
  console.error('\nLa subida falló. Si es la primera vez, ejecuta "npm run conectar" para iniciar sesión en Cloudflare y vuelve a intentarlo.');
  process.exit(subir.status ?? 1);
}
console.log(`\nListo. Tu web actualizada: ${sitio.url}`);
console.log('(Si no ves los cambios, recarga la página con Ctrl+F5.)');
