// Previsualiza el sitio ya generado: /dist (o /dist-borradores con --borradores).
// Solo escucha en 127.0.0.1. Uso: npm run preview  (puerto con la variable PORT)
import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { crearServidor } from './servidor.js';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CARPETA = path.join(RAIZ, process.argv.includes('--borradores') ? 'dist-borradores' : 'dist');

if (!existsSync(path.join(CARPETA, 'index.html'))) {
  const comando = process.argv.includes('--borradores') ? 'npm run build:borradores' : 'npm run build';
  console.error(`No hay sitio generado en ${path.basename(CARPETA)}/. Ejecuta primero: ${comando}`);
  process.exit(1);
}

const puerto = await crearServidor({ carpeta: CARPETA }).iniciar(Number(process.env.PORT) || 4000);
console.log(`Previsualización de ${path.basename(CARPETA)}/ en http://localhost:${puerto}  (Ctrl+C para detener)`);
