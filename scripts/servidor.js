// Servidor estático local compartido por "preview" y "dev". Sin dependencias.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

// Script que recarga la página cuando el sitio se vuelve a generar (solo en modo dev).
const SCRIPT_RECARGA = '<script>new EventSource("/__recarga").onmessage = () => location.reload();</script>';

// carpeta: ruta absoluta a servir. recarga: true para activar la recarga automática.
// Devuelve { iniciar(puerto) -> Promise<puerto real>, recargar() }.
export function crearServidor({ carpeta, recarga = false }) {
  const clientes = new Set();

  async function resolver(urlRuta) {
    let ruta;
    try { ruta = decodeURIComponent(urlRuta.split('?')[0]); } catch { return null; }
    const destino = path.normalize(path.join(carpeta, ruta));
    // evita salir de la carpeta (p. ej. /../sitio.config.js)
    if (destino !== carpeta && !destino.startsWith(carpeta + path.sep)) return null;
    try {
      const info = await stat(destino);
      if (info.isDirectory()) {
        if (!ruta.endsWith('/')) return { redirigir: ruta + '/' };
        return { archivo: path.join(destino, 'index.html') };
      }
      return { archivo: destino };
    } catch {
      return null;
    }
  }

  async function enviar(res, req, estado, archivo, contenido) {
    const tipo = TIPOS[path.extname(archivo)] ?? 'application/octet-stream';
    if (recarga && tipo.startsWith('text/html')) {
      contenido = String(contenido).replace('</body>', `${SCRIPT_RECARGA}\n</body>`);
    }
    res.writeHead(estado, { 'Content-Type': tipo, 'Cache-Control': 'no-cache' });
    res.end(req.method === 'HEAD' ? undefined : contenido);
  }

  const servidor = createServer(async (req, res) => {
    try {
      if (recarga && req.url === '/__recarga') {
        res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
        res.write(': conectado\n\n');
        clientes.add(res);
        req.on('close', () => clientes.delete(res));
        return;
      }
      const encontrado = await resolver(req.url);
      if (encontrado?.redirigir) {
        res.writeHead(301, { Location: encontrado.redirigir });
        return res.end();
      }
      if (encontrado) return enviar(res, req, 200, encontrado.archivo, await readFile(encontrado.archivo));
      const archivo404 = path.join(carpeta, '404.html');
      const pagina404 = await readFile(archivo404).catch(() => 'No encontrado');
      return enviar(res, req, 404, archivo404, pagina404);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Error del servidor: ' + error.message);
    }
  });

  // Si el puerto está ocupado, prueba los 10 siguientes.
  function iniciar(puerto) {
    return new Promise((resolverPromesa, rechazar) => {
      const intentar = (p, restantes) => {
        servidor.once('error', (error) => {
          if (error.code === 'EADDRINUSE' && restantes > 0) intentar(p + 1, restantes - 1);
          else rechazar(error);
        });
        servidor.listen(p, '127.0.0.1', () => resolverPromesa(p));
      };
      intentar(puerto, 10);
    });
  }

  function recargar() {
    for (const cliente of clientes) cliente.write('data: recargar\n\n');
  }

  return { iniciar, recargar };
}
