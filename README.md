# Web personal de Alex Cuya

Sitio estático para publicar escritos y proyectos. Escribes en Markdown dentro de
`contenido/` y un generador en Node.js produce HTML listo para publicar en `dist/`.

## Ver el sitio ahora (lo más rápido)

- **Doble clic en `ver-sitio.cmd`.** La primera vez instala lo necesario. Luego genera el
  sitio, lo abre en tu navegador en <http://localhost:4000> y lo mantiene actualizado.
- **O en una terminal, dentro de esta carpeta:**

  ```bash
  npm run dev
  ```

En este modo se ven también los **borradores** (con una etiqueta "Borrador"). Cada vez
que guardas un cambio en `contenido/`, `plantillas/`, `estilos/` o `sitio.config.js`, el
sitio se regenera y la página del navegador se recarga sola. Ctrl+C para detenerlo.

## Por qué este stack

- **Un solo paquete de npm:** [`marked`](https://www.npmjs.com/package/marked), versión fija 18.1.0, para
  convertir Markdown en HTML (más de 80 millones de descargas semanales). El resto (front
  matter, plantillas, RSS, servidor local) son scripts propios de pocas líneas en `scripts/`.
- **No usé Eleventy ni Astro.** Para un blog con publicaciones, una página "Sobre mí" y
  un RSS, cualquiera de los dos añade cientos de dependencias y una curva de aprendizaje
  que aquí no hace falta. Valdría la pena reconsiderarlo si más adelante quieres páginas
  por etiqueta con paginación, imágenes optimizadas automáticamente o componentes
  interactivos. Antes de instalar cualquiera de los dos, se te consultará.

## Requisitos

- Node.js 20 o superior (probado con Node 24.14.1).

## Instalar

```bash
npm install
```

## Estructura

```
contenido/
  publicaciones/      una publicación = un archivo .md
  paginas/            cada .md se publica en /<nombre>/ (sobre-mi.md, suscribirse.md)
plantillas/
  base.html           estructura común: <head>, metaetiquetas, cabecera y pie
  indice.html         portada
  item-publicacion.html  cada publicación en la lista de la portada
  publicacion.html    página de una publicación
  pagina.html         páginas sueltas (Sobre mí)
estilos/estilos.css   único CSS; colores y medidas en variables (:root)
cliente/sitio.js      interactividad del navegador (sin dependencias; se copia a dist/)
scripts/              generador (build), servidores (preview, dev) y capturas
sitio.config.js       nombre, descripción, URL, menú, enlaces a redes
ver-sitio.cmd         doble clic para abrir el sitio en modo dev
dist/                 SALIDA GENERADA. No se edita a mano.
```

El sitio generado incluye:
- Inicio.
- Una página por publicación, con enlaces a la anterior y la siguiente.
- Una página por etiqueta (`/etiquetas/economia/`) y el índice de etiquetas (`/etiquetas/`).
- Las páginas Sobre mí y Suscribirse.
- La página 404.
- `feed.xml`, `sitemap.xml` y `robots.txt`.

Para añadir otra página (p. ej. `proyectos.md`), créala en `contenido/paginas/` y, si
quieres que salga en el menú, añádela a `navegacion` en `sitio.config.js`. En el texto de
cualquier página, `{{feed}}` se sustituye por la dirección del RSS.

## Crear una publicación nueva

1. Crea un archivo en `contenido/publicaciones/`. El nombre del archivo es la dirección
   de la página: `mi-primera-nota.md` se publica en `/publicaciones/mi-primera-nota/`.
   Usa solo minúsculas sin tildes, números y guiones.
2. Empieza el archivo con este bloque (front matter) y escribe debajo en Markdown:

   ```markdown
   ---
   titulo: "Título de la publicación"
   fecha: 2026-10-15
   resumen: "Una o dos frases que aparecen en la portada, en buscadores y en el RSS."
   etiquetas: [economía, datos]
   borrador: true
   ---

   Aquí empieza el texto. Puedes usar **negritas**, listas, tablas, citas y código.
   ```

   - `fecha` va en formato AAAA-MM-DD. La portada ordena de más reciente a más antigua.
   - `borrador: true` impide que se publique. Cámbialo a `false` cuando esté lista.
   - También se aceptan las claves con tilde (`título`).
3. Genera y previsualiza el sitio (ver abajo).

Las dos publicaciones de ejemplo (`ejemplo-nota-corta.md` y `ejemplo-ensayo-largo.md`)
son borradores. Bórralas cuando ya no las necesites.

## Generar el sitio

```bash
npm run build
```

Escribe el sitio en `dist/`, **sin borradores**. Si falta un campo o una fecha está mal,
el comando se detiene y dice qué archivo y qué campo revisar.

El generador **no borra nada**. Si una publicación deja de generarse (porque la pasaste a
borrador o la eliminaste), el build muestra un aviso con los archivos viejos que siguen
en `dist/`. Bórralos a mano antes de publicar.

Para revisar los borradores:

```bash
npm run build:borradores
```

Ese comando escribe en `dist-borradores/` (nunca en `dist/`), marca los borradores con una
etiqueta y les pone `noindex`. El RSS de esa carpeta tampoco incluye borradores.

## Previsualizar

Para escribir y revisar, usa `npm run dev` (ver arriba). Para comprobar exactamente lo que
se publicará (sin borradores):

```bash
npm run build
```

```bash
npm run preview
```

Abre <http://localhost:4000>. Si el puerto está ocupado, el servidor usa el siguiente libre y te dice cuál. Para ver los borradores, ejecuta `npm run build:borradores` y luego:

```bash
npm run preview:borradores
```

Por defecto usa el puerto 4000; en PowerShell puedes cambiarlo con `$env:PORT=4001; npm run preview:borradores`.
El servidor solo escucha en tu computadora (127.0.0.1) y devuelve la página 404 propia
para rutas inexistentes.

## Capturas de pantalla

Con `npm run preview:borradores` en marcha en el puerto 4001, ejecuta `npm run capturas`.
Si usas `npm run dev` (puerto 4000), en PowerShell ejecuta antes `$env:BASE='http://127.0.0.1:4000'`.
Usa Microsoft Edge o Chrome ya instalados (no descarga nada) para guardar en `capturas/`
el inicio y una publicación, en escritorio y en celular, con tema oscuro y claro. El
comando también avisa si alguna página tiene desplazamiento horizontal.

## Interactividad

Todo está en `cliente/sitio.js` (JavaScript sin dependencias). El sitio funciona igual
sin JavaScript; esto solo lo mejora:

- **Tema:** el botón redondo de la cabecera alterna entre automático, claro y oscuro, y
  recuerda la elección.
- **Portada:**
  - Buscador (atajo `/`; no distingue tildes).
  - Filtro por etiquetas, que queda en la URL (`/?etiqueta=datos`) para poder compartirlo.
  - Toda la tarjeta de cada publicación es clicable.
- **Publicación:**
  - Barra de progreso de lectura.
  - Índice "En esta página" cuando hay 3 o más subtítulos. Va en una columna lateral en
    pantallas anchas y resalta la sección que estás leyendo.
  - Enlace `#` en cada subtítulo para compartir una sección.
  - Botón "Copiar" en los bloques de código.
- **General:**
  - Botón para volver arriba.
  - Aparición suave de la lista.
  - Transición entre páginas en navegadores compatibles.
  - Todas las animaciones se desactivan si el sistema pide reducir el movimiento.

## Personalizar

- Nombre, descripción, URL, menú, redes y la presentación de la portada (`iniciales`,
  `saludo`, `presentacion`): `sitio.config.js`.
- Colores, tipografías y ancho del texto: variables al inicio de `estilos/estilos.css`
  (el bloque `@media (prefers-color-scheme: dark)` define el tema oscuro).
- Estructura HTML: `plantillas/`. En las plantillas, `{{dato}}` inserta texto escapado y
  `{{{dato}}}` inserta HTML tal cual.

## Publicar gratis

Guía paso a paso en **[PUBLICAR.md](PUBLICAR.md)** (Cloudflare Pages, sin costo ni tarjeta).
Resumen:
- **`npm run subir`** genera el sitio y lo publica directamente en Cloudflare Pages. La
  primera vez hay que ejecutar `npm run conectar` para iniciar sesión.
- **Alternativa sin comandos de subida:** `npm run publicar` genera `dist/` y lo arrastras
  a mano en el panel de Cloudflare.

## Publicar más adelante (pasos no ejecutados)

Nada de esto se ha hecho. Son los pasos para cuando quieras publicar:

1. **Ajustar la URL** en `sitio.config.js` (`url`) a tu dominio real. El RSS, el enlace
   canónico y Open Graph dependen de ella.
2. **Revisar el contenido:** quita los ejemplos, cambia los textos de "Sobre mí" y los
   enlaces a redes, ejecuta `npm run build` y revisa que no aparezcan avisos de archivos
   obsoletos.
3. **Elegir un hosting de sitios estáticos**, por ejemplo GitHub Pages, Netlify, Cloudflare
   Pages o Vercel. Todos tienen plan gratuito y sirven `dist/` sin configuración especial.
   - Con integración Git: sube el proyecto a un repositorio (el `.gitignore` ya excluye
     `node_modules/` y `dist/`) y configura el comando de build `npm run build` y la carpeta
     de salida `dist`.
   - Sin Git: sube manualmente el contenido de `dist/` desde el panel del servicio.
4. **Página 404:** la mayoría de estos servicios usan `404.html` de la raíz automáticamente.
5. **Dominio propio (opcional):** compra el dominio y apunta sus DNS al servicio elegido.
   Activa HTTPS, que suele ser automático.
6. **Opcional:** imagen para redes (`og:image`). `sitemap.xml` y `robots.txt` ya se generan
   con la `url` de `sitio.config.js`.
