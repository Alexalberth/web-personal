# Registro de trabajo: web personal

Fecha: 2026-10-09. Carpeta: `D:\CLAUDE\web-personal` (no existía; se creó).
Entorno: Windows 11, PowerShell, Node v24.14.1, npm 11.11.0.

## Qué se creó

| Ruta | Contenido |
|---|---|
| `package.json`, `package-lock.json` | Proyecto npm con scripts `build`, `preview`, `build:borradores`, `preview:borradores`, `capturas`. Una dependencia: `marked` 18.1.0 (versión fija). |
| `sitio.config.js` | Nombre, descripción, URL (marcador `https://ejemplo.com`), marca Alej_84, redes y palabras por minuto. |
| `scripts/build.js` | Generador: lee front matter, convierte Markdown, aplica plantillas y genera inicio, publicaciones, Sobre mí, 404, `feed.xml` y copia el CSS. Valida campos obligatorios, fechas y nombres de archivo. No borra nada: avisa si quedan archivos obsoletos en `dist/`. |
| `scripts/preview.js` | Servidor local sin dependencias, solo en 127.0.0.1, con 404 propio y protección contra rutas `../`. |
| `scripts/capturas.js` | Capturas con Edge/Chrome ya instalados vía protocolo DevTools (sin dependencias). Comprueba el desplazamiento horizontal. |
| `plantillas/` | `base.html`, `indice.html`, `publicacion.html`, más `item-publicacion.html` y `pagina.html`. |
| `estilos/estilos.css` | Un solo CSS con variables, tema claro/oscuro con `prefers-color-scheme`. |
| `contenido/publicaciones/` | `ejemplo-nota-corta.md` y `ejemplo-ensayo-largo.md`, ambos con `borrador: true`. |
| `contenido/paginas/sobre-mi.md` | Texto de ejemplo editable. |
| `README.md` | Instalación, nueva publicación, build, preview, capturas, personalización y pasos para publicar. |
| `.gitignore` | `node_modules/`, `dist/`, `dist-borradores/`, `.perfil-navegador/`. |
| `dist/`, `dist-borradores/` | Salidas generadas. |
| `capturas/` | 8 PNG: inicio y publicación × escritorio (1280 px) y celular (390 px, escala 2) × tema oscuro y claro. |
| `archivo-anterior/2026-10-09-capturas-edge-sin-emulacion/` | Primera tanda de capturas, reemplazada (ver incidencias). |

Decisión de stack: generador propio + `marked`. No se instaló Eleventy ni Astro (explicado en el README).

## Comandos ejecutados

```
npm view marked version                       -> 18.1.0
(API npm) descargas semanales de marked       -> 82.657.481 (supera el mínimo de 1000)
npm install marked@18.1.0 --save-exact        -> OK, 1 paquete, 0 vulnerabilidades
npm audit                                     -> 0 vulnerabilidades
npm run build                                 -> OK: 0 publicaciones (ambas son borrador), 5 archivos
npm run build:borradores                      -> OK: 2 publicaciones, 7 archivos
node scripts/preview.js (PORT=4000)           -> en segundo plano, detenido al final
node scripts/preview.js --borradores (4001)   -> en segundo plano, detenido al final
Invoke-WebRequest a cada página               -> ver verificación
msedge --headless --screenshot ...            -> capturas de celular recortadas (ver incidencias)
npm run capturas                              -> OK, 8 capturas
```

Todos los builds terminaron sin errores en el primer intento. Ningún paso falló dos veces.

## Qué se verificó

**Respuestas HTTP** (servidor de preview):

| URL | Estado |
|---|---|
| `:4000/` | 200 |
| `:4000/sobre-mi/` | 200 |
| `:4000/feed.xml` | 200 (XML válido) |
| `:4000/estilos.css` | 200 |
| `:4000/404.html` | 200 |
| `:4000/no-existe` | 404 (sirve la página 404) |
| `:4000/publicaciones/ejemplo-nota-corta/` | 404: correcto, es borrador y no se publica |
| `:4000/..%2Fsitio.config.js` | 404: el servidor no sale de `dist/` |
| `:4001/`, `:4001/sobre-mi/`, `:4001/feed.xml` | 200 |
| `:4001/publicaciones/ejemplo-nota-corta/` | 200 |
| `:4001/publicaciones/ejemplo-ensayo-largo/` | 200 |

**Diseño adaptable:** sin desplazamiento horizontal (`scrollWidth == clientWidth`) en 375 px (navegador integrado, 5 páginas) y en 390/1280 px (`npm run capturas`). Los bloques de código y las tablas anchas se desplazan dentro de su caja.

**Contraste (WCAG)** calculado con la fórmula de luminancia relativa:

| Tema | Texto | Texto secundario | Secundario sobre superficie | Enlaces |
|---|---|---|---|---|
| Claro | 16,3:1 | 6,8:1 | 6,2:1 | 8,2:1 |
| Oscuro | 14,5:1 | 7,4:1 | 6,7:1 | 8,7:1 |

Todo supera AA (4,5:1).

**Metaetiquetas:**
- En todas las páginas: `title`, `description`, `canonical`, `og:type/title/description/url/site_name/locale` y `twitter:card`.
- En las publicaciones, además: `article:published_time` y `article:tag`.
- `noindex` en borradores y en la 404.

**Accesibilidad:**
- `lang="es"`, un `h1` por página, `header/nav/main/article/footer`.
- Enlace "Saltar al contenido" y `aria-current` en la navegación.
- `<time datetime>`, foco visible y `prefers-reduced-motion`.

**Contenido:** el tiempo de lectura se calcula a 200 palabras por minuto, con un mínimo de 1 min. Las fechas se muestran en español ("8 de octubre de 2026").

## Incidencias

1. **Playwright MCP no está disponible en esta sesión.** Se registró a nivel de usuario después de que empezara la sesión, así que sus herramientas no estaban cargadas. Alternativa: Edge ya instalado, sin instalar nada.
2. **La primera tanda de capturas de celular salió recortada.** Edge en modo `--screenshot` impone un ancho mínimo de ventana. No era un problema del sitio: lo comprobé midiendo a 375 px en el navegador integrado. Se escribió `scripts/capturas.js`, que emula un celular real. Las capturas viejas se movieron a `archivo-anterior/2026-10-09-capturas-edge-sin-emulacion/` (no se borraron).
3. **Ligaduras de la fuente de código:** Cascadia mostraba `|>` como "▷". Se desactivaron en el CSS (`font-variant-ligatures: none`).

## Segunda sesión (2026-10-09): arreglos y mejoras para poder verlo

Pedido: "arregla si no se puede ver bien, mejóralo y optimiza para que ahora pueda verlo".

**Problemas encontrados y arreglados**

| Problema | Arreglo |
|---|---|
| `dist/` mostraba la portada vacía (los ejemplos son borradores) y verlos requería dos comandos. | Nuevo `npm run dev` (también `npm start`) y `ver-sitio.cmd`. La portada vacía de `dist/` explica cómo ver los borradores. |
| El enlace "RSS" del menú abría XML crudo, que en el navegador parece una página rota. | El menú lleva a una página **Suscribirse** que explica el RSS y muestra la dirección. El `<link rel="alternate">` del RSS se mantiene. |
| En tema oscuro el texto se veía pesado (fuente Sitka de Windows + blanco muy brillante). | Fuente Georgia, texto oscuro `#dedad2` (contraste 13:1) y suavizado de fuente. |
| En celular, cuatro enlaces del menú no cabían en una línea junto al nombre. | El menú pasa a una segunda línea limpia (`flex-wrap`). |

**Mejoras**

- **Modo dev:** vigila `contenido/`, `plantillas/`, `estilos/` y `sitio.config.js`, regenera y recarga el navegador solo (Server-Sent Events, sin dependencias). Si el puerto está ocupado, usa el siguiente libre. Con `--abrir`, abre el navegador.
- **Servidor común** (`scripts/servidor.js`) para `preview` y `dev`. `preview` avisa si falta generar el sitio.
- **Etiquetas:** las de cada publicación ahora son enlaces. Hay una página por etiqueta (`/etiquetas/<slug>/`) y un índice con conteos (`/etiquetas/`).
- **Navegación entre publicaciones** (anterior / siguiente).
- **Menú configurable** en `sitio.config.js` (`navegacion`). Cualquier `.md` de `contenido/paginas/` se publica en `/<nombre>/`.
- **`sitemap.xml` y `robots.txt`.** La versión con borradores lleva `Disallow: /` y `noindex` en todas sus páginas, por si alguna vez se sube por error.
- **Configuración siempre al día:** `build.js` importa `sitio.config.js` sin caché.

**Verificación**

- `npm run build` → OK: 0 publicaciones, 9 archivos.
- `npm run build:borradores` → OK: 2 publicaciones, 5 etiquetas, 16 archivos.
- `npm run dev`, peticiones HTTP: 200 en `/`, las 2 publicaciones, `/etiquetas/`, `/etiquetas/economia/`, `/etiquetas/flujo-de-trabajo/`, `/sobre-mi/`, `/suscribirse/`, `/feed.xml`, `/sitemap.xml` y `/robots.txt`. 404 en `/no-existe`.
- **Recarga automática:** cambié la fecha de modificación de `sobre-mi.md` sin tocar su contenido. Resultado: regeneró y el navegador se recargó solo.
- **Celular, 375 px:** sin desplazamiento horizontal en las 8 páginas, y un solo `h1` por página.
- **Capturas** regeneradas en `capturas/`. Las anteriores se movieron a `archivo-anterior/2026-10-09-capturas-version-1/`.

**Archivos nuevos**
- `scripts/servidor.js`, `scripts/dev.js`
- `contenido/paginas/suscribirse.md`
- `ver-sitio.cmd`

**Archivos modificados**
- `scripts/build.js`, `scripts/preview.js`
- `plantillas/base.html`, `plantillas/publicacion.html`
- `estilos/estilos.css`
- `sitio.config.js`, `package.json`, `README.md`

## Tercera sesión (2026-10-09): más interactiva y bonita

Pedido: "haz más interactiva y bonita la página". Se mantuvo el criterio sobrio (un solo color de acento) y la regla de no añadir dependencias.

**Diseño**
- **Portada:** presentación con avatar de iniciales, saludo, texto y enlaces. Debajo, la sección de publicaciones con su conteo.
- **Cabecera:** fija y translúcida; el menú marca la página actual con un fondo.
- **Tarjetas de publicación:** fecha y tiempo de lectura arriba, fondo al pasar el ratón, y toda la tarjeta es clicable.
- **Etiquetas:** en forma de píldora.
- **Publicación:** títulos más grandes, citas con borde de acento, código y tablas con bordes redondeados, separadores más finos y tarjetas anterior/siguiente.
- **Selección de texto** con el color de acento.

**Interactividad** (`cliente/sitio.js`, nuevo; mejora progresiva)
- **Tema** automático/claro/oscuro con botón en la cabecera. Se guarda en `localStorage` y un script en el `<head>` lo aplica sin parpadeo. El CSS se reorganizó para admitir `data-tema`.
- **Portada:**
  - Buscador sin distinguir tildes (atajo `/`, Esc limpia).
  - Chips de etiquetas con `aria-pressed`, y el filtro queda en la URL.
  - Conteo de resultados con `aria-live` y aviso "sin resultados" con botón para ver todas.
- **Publicación:**
  - Barra de progreso.
  - Índice "En esta página", lateral y fijo a partir de 1200 px, con la sección actual resaltada.
  - Anclas `#` en los subtítulos, generadas en el build con ids únicos.
  - Botón "Copiar" en el código.
- **General:**
  - Botón "volver arriba".
  - Aparición suave de la lista.
  - View Transitions entre páginas.
  - `prefers-reduced-motion` desactiva todo el movimiento.

**Cambios de archivos**
- **Nuevos:** `plantillas/inicio.html` y `cliente/sitio.js`.
- **Modificados:**
  - `scripts/build.js`: `Marked` con renderer de subtítulos, índice de contenidos, filtros, portada nueva y copia de `sitio.js`.
  - `scripts/dev.js`: también vigila `cliente/`.
  - `scripts/capturas.js`: emula movimiento reducido para que las animaciones no dejen elementos invisibles.
  - Plantillas `base`, `item-publicacion`, `publicacion` e `indice` (con un `h2` oculto para mantener el orden de títulos).
  - `sitio.config.js` (iniciales, saludo, presentación) y `README.md`.
- **Reemplazados:** `estilos/estilos.css` se reescribió; la versión anterior está en `archivo-anterior/2026-10-09-estilos-version-2/`. Las capturas anteriores están en `archivo-anterior/2026-10-09-capturas-version-2/`.

**Verificación**
- `npm run build` → OK (10 archivos) y `npm run build:borradores` → OK (17 archivos). `node --check cliente/sitio.js` → OK.
- **Navegador (modo dev):**
  - El buscador encuentra "inflación" escribiendo "inflacion" (1 de 2).
  - Una búsqueda sin coincidencias muestra el aviso; "Ver todas" restaura la lista.
  - El chip "datos" filtra y escribe `?etiqueta=datos`; "Todas" lo quita.
  - El atajo `/` enfoca el buscador.
  - El tema cicla automático → claro (fondo `#fbfaf7`, guardado) → oscuro (`#161615`, guardado) → automático (borra lo guardado).
  - Publicación: 5 anclas, 2 botones "Copiar", barra de progreso activa y botón "arriba" visible al bajar. Con la URL `#4-una-tabla`, el índice marca "4. Una tabla".
- **Error corregido durante las pruebas:** con desplazamiento suave, el índice se quedaba en la sección anterior. Ahora se calcula en el mismo manejador del scroll que la barra de progreso.
- **Celular (360 px):** sin desplazamiento horizontal en 8 páginas y un `h1` por página.
- **Consola:** el único error es el 404 esperado de `/no-existe`.
- **Producción (puerto temporal 4100):** 200 en `/`, `/sobre-mi/`, `/suscribirse/`, `/etiquetas/`, `/feed.xml`, `/sitemap.xml`, `/robots.txt`, `/sitio.js` y `/estilos.css`. El borrador devuelve 404, como debe.
- **Capturas:** 8 capturas nuevas en `capturas/`.

## Pendiente y por qué

1. **Skill frontend-design: no está disponible** en esta sesión, así que no se pudo usar. El diseño sigue los criterios pedidos: sobrio, legible, un solo color de acento, tipografías del sistema (sin fuentes externas), ancho de lectura ~40rem.
2. **Revisar las capturas:** están en `capturas/` (las que llevan el sufijo `-claro` son del tema claro).
3. **La portada de `dist/` está vacía** ("Todavía no hay publicaciones") porque las dos publicaciones de ejemplo son borradores, como pediste. Para ver el diseño completo usa `npm run build:borradores` + `npm run preview:borradores`.
4. **Personalizar:** `url` en `sitio.config.js` (ahora `https://ejemplo.com`), los enlaces de redes (supuestos: `x.com/Alej_84`, `github.com/Alej_84`), el correo de ejemplo en `sobre-mi.md` y el texto de presentación.
5. **Borrar a mano cuando quieras** (no lo hice porque las reglas prohíben borrar):
   - Las publicaciones de ejemplo.
   - `archivo-anterior/`.
   - `.perfil-navegador/`: perfil temporal de Edge que crean las capturas; está en `.gitignore`.
6. **Archivos escritos fuera de `D:\CLAUDE\web-personal` de forma inevitable:**
   - La caché de npm (`%LocalAppData%\npm-cache`) al instalar `marked`.
   - Los registros de salida de los servidores en segundo plano, que guarda la herramienta en la carpeta temporal de la sesión.
   - No se tocó ningún otro archivo.
7. **Mejoras opcionales no hechas:**
   - Imagen para redes (`og:image`).
   - Contenido completo en el RSS (ahora lleva solo el resumen).
   - (Las páginas por etiqueta, `sitemap.xml` y `robots.txt` ya se hicieron en la segunda sesión.)
8. **Publicación:** no se publicó nada, no se crearon cuentas ni se subió código. Los pasos están en el README.

## Cuarta sesión (2026-10-09): preparar publicación gratuita

Pedido: que otras personas puedan entrar a la página sin pagar.

- **Elección:** Cloudflare Pages con subida directa (arrastrar `dist/`). Plan gratuito sin tarjeta, hasta 20 000 archivos por sitio y dirección `*.pages.dev` con HTTPS. Alternativas gratuitas documentadas: Netlify Drop y GitHub Pages.
- `sitio.config.js`: `url` pasa de `https://ejemplo.com` a `https://alex-cuya.pages.dev` (nombre de proyecto sugerido; si Cloudflare asigna otro, se cambia aquí).
- **Nuevo `scripts/publicar.js`** (`npm run publicar`): genera `dist/` y avisa si:
  - la URL sigue siendo la de ejemplo;
  - no hay publicaciones;
  - "Sobre mí" conserva texto o correo de ejemplo;
  - quedan archivos obsoletos.

  Al final abre `dist/` en el Explorador. No sube nada.
- **Nuevo `PUBLICAR.md`:** guía paso a paso (contenido, cuenta, subida, actualizaciones y preguntas frecuentes). README enlazado.
- **Verificación:** `node scripts/publicar.js --sin-abrir` funciona. Avisa de 0 publicaciones y del texto y correo de ejemplo en "Sobre mí". `dist/index.html` lleva canonical `https://alex-cuya.pages.dev/`, y `robots.txt` apunta al sitemap con esa dirección.
- **No hecho, por las reglas:** crear la cuenta de Cloudflare y subir el sitio. Lo tiene que hacer el usuario.

## Publicación (2026-10-09)

El usuario creó la cuenta de Cloudflare y subió `dist/` por "Pages → Drag and drop" con el proyecto `alex-cuya`. Dirección pública: **https://alex-cuya.pages.dev** (coincide con `url` en `sitio.config.js`).

Verificado desde fuera:
- **200** en `/`, `/sobre-mi/`, `/suscribirse/`, `/etiquetas/`, `/feed.xml`, `/sitemap.xml`, `/robots.txt`, `/estilos.css` y `/sitio.js`.
- **404** con la página propia en `/no-existe`.
- **404** en el borrador `/publicaciones/ejemplo-nota-corta/`: correcto, no se publicó.
- La portada contiene "Hola, soy Alex".

## Subida automática (2026-10-09)

Pedido: actualizar la web con un comando desde la PC.

- **Wrangler** (CLI oficial de Cloudflare, npm, ~25,8 millones de descargas semanales). Se fijó la versión 4.147.0, de una semana, en lugar de la 4.149.0 publicada el día anterior. Se usa con `npx`, sin añadirlo a `package.json`, para no meter una dependencia pesada.
- **Nuevo `scripts/subir.js`** (`npm run subir`): ejecuta `publicar.js --sin-abrir` y luego `wrangler pages deploy dist --project-name=alex-cuya --branch=main`. El nombre del proyecto está en `sitio.config.js` (`proyectoCloudflare`).
- **`npm run conectar`** = `wrangler login`. El inicio de sesión lo hace el usuario en el navegador (OAuth). No se guarda ninguna clave en el proyecto.
- **Verificado:** `wrangler --version` → 4.147.0 y `wrangler whoami` → "You are not authenticated" (esperado: falta que el usuario inicie sesión). No se subió nada.
- **Pendiente:** el usuario debe ejecutar `npm run conectar` una vez y luego `npm run subir`. Hay que comprobar después de la primera subida que la rama `main` es la de producción del proyecto.
- **2026-10-09, primera subida con comando:** el usuario inició sesión con `npm run conectar` ("Successfully logged in"). `npm run subir` subió 6 archivos nuevos (5 ya existían) y desplegó en producción (`--branch=main`). Verificado en https://alex-cuya.pages.dev/sobre-mi/: aparece el texto nuevo (Beca 18) y LinkedIn, y no aparece el texto de ejemplo.
- **Ajustes posteriores:**
  - `publicar.js` acepta `--desde-subir`, que ni muestra "sube la carpeta" ni abre el Explorador.
  - `subir.js` pasa el comando de Wrangler como una sola línea, lo que elimina el aviso DEP0190 de Node, y valida el nombre del proyecto.
- **Error ENOENT del usuario:** hizo `cd` en una pestaña de la terminal y ejecutó `npm run subir` en otra que seguía en `D:\CLAUDE`. Solución: nuevo `subir-web.cmd` (doble clic) que entra solo a la carpeta del proyecto y ejecuta `npm run subir`. Probado: desplegó correctamente (1 archivo nuevo, 10 ya subidos).
- **Causa real del ENOENT repetido:** cada botón Run de la app abre una pestaña nueva en `D:\CLAUDE`, así que el `cd` y el `npm run` quedaban en pestañas distintas. Solución: un solo comando, `npm run subir --prefix D:\CLAUDE\web-personal`. Probado desde `D:\CLAUDE` en la pestaña c3: despliegue completo. PUBLICAR.md actualizado.

## Portafolio y textos de marca personal (2026-10-10)

Pedido: el usuario pegó un prompt con su perfil (hero, sobre mí, proyectos en formato problema/herramienta/resultado, habilidades, lado personal).

- **Portada nueva:**
  - Título "Economía, datos y disciplina." y subtítulo que une análisis y powerlifting.
  - Sección "Proyectos destacados" con 3 proyectos (`destacado: true`).
  - En la web pública, la sección "Publicaciones" se oculta mientras no haya publicaciones; antes mostraba una nota pensada para el autor.
- **Proyectos:**
  - Nueva carpeta `contenido/proyectos/` con 10 proyectos, uno por archivo. Cada uno tiene `titulo`, `area`, `anio`, `problema`, `enfoque`, `resultado`, `herramientas`, `destacado` y `orden`.
  - Nueva página `/proyectos/` (plantillas `proyectos.html` e `item-proyecto.html`), que también se incluye en el sitemap.
  - Menú: "Etiquetas" se reemplazó por "Proyectos".
- **Sobre mí:** reescrito con bio, Experiencia, Habilidades y Lado personal. Las fuentes son el CV y el prompt; no se inventaron resultados ni herramientas. Donde no constaba la herramienta, se puso la fuente de datos o el método.
- **Archivos anteriores** (sobre-mi, config, inicio, capturas) en `archivo-anterior/2026-10-10-*`.
- **Verificación:**
  - Ambos builds OK.
  - 200 en `/`, `/proyectos/`, `/sobre-mi/` y `/sitemap.xml`.
  - A 360 px no hay desplazamiento horizontal.
  - Capturas nuevas.
- **No se subió a internet:** queda pendiente que el usuario revise y confirme los datos que no cuadran entre el CV y el prompt.
- **Nota:** Playwright MCP creó la carpeta `D:\CLAUDE\.playwright-mcp` con sus capturas, fuera de `web-personal`. No se borró.

## Rediseño con la skill frontend-design (2026-10-10)

Pedido: el alias de gaming es Alej_84; "Talentos en Acción" se confirma; quitar la tesis de los proyectos; mejorar la interfaz, los colores y las transiciones usando una skill.

- **Skill:** `frontend-design` del repositorio oficial `anthropics/skills` (commit dbd4588). Solo contiene `SKILL.md` y `LICENSE.txt`, sin código. Se revisó y se instaló en `C:\Users\Darkl\.claude\skills\frontend-design` para futuras sesiones.
- **Contenido:**
  - La tesis queda con `borrador: true`: no se publica, pero sigue en el proyecto.
  - "Violencia laboral y salud mental" pasa a destacado.
  - "Darklex 84" se cambia por "Alej_84".
- **Diseño, según el método de la skill** (plan, revisión contra los defaults, construcción y crítica con capturas):
  - **Concepto:** "papel pijama" (green-bar paper contable). Los proyectos son filas con bandas verdes alternas y no tarjetas.
  - **Paleta:** papel `#f4f6f2`, tinta `#18211d`, verde contable `#0b6b4b`, banda `#e3eee6`, regla `#cbd6ce`, más su versión oscura. Contraste mínimo 5,48:1 (AA).
  - **Tipografía:** Archivo variable (Omnibus-Type, con eje de ancho 62–125 %) para titulares y Spectral para el texto. Se autoalojan desde npm (`@fontsource-variable/archivo` 5.3.0 y `@fontsource/spectral` 5.3.0), unos 150 KB, sin servidores externos.
  - **Movimiento:** un único momento automático, el titular del inicio que "se estira" con el eje de ancho al cargar. Se eliminaron las apariciones de la lista. Se respeta `prefers-reduced-motion`.
  - **Defaults de la skill eliminados:** etiquetas en MAYÚSCULAS, separadores "·", flechas "→", tarjetas redondeadas con sombra, píldoras de herramientas y avatar de iniciales.
  - **Portada:** titular grande, columna "Ahora" (en `sitio.config.js`) y un botón principal "Ver mis proyectos".
  - **Menú en celular:** cabe en una sola fila gracias al eje de ancho (88 %).
- **Verificación (Playwright MCP):**
  - Inicio en 1280 px (claro) y en 375 px; Proyectos en oscuro; Sobre mí en 375 px.
  - Sin desplazamiento horizontal en 5 páginas.
  - Archivo y Spectral cargan.
  - La animación termina en `font-stretch: 112%`.
  - El botón de tema funciona.
  - Único error de consola: el 404 esperado de la página de prueba inexistente.
- **Archivos anteriores** en `archivo-anterior/2026-10-10-diseno-antes-de-frontend-design/`.
- **No se subió a internet** todavía.

## Transiciones e interactividad, fase 1 (2026-10-11)

Pedido: más transiciones e interactividad sin cambiar la estructura. Todavía no hay CSV, registros de entrenamiento ni fotos; la propuesta completa está en `PROPUESTA-INTERACTIVA.md`.

**Portada**
- Interruptor "En los datos / En la barra" (`metodo` en `sitio.config.js`): un indicador se desliza y las tres filas cambian una tras otra.
- Puente de texto antes de Proyectos (`puenteProyectos`).
- Botón "Ver cómo lo abordé" en los proyectos destacados, que se despliega con animación de altura.

**Proyectos**
- Filtro por área: las filas que no coinciden se pliegan a una línea. Usa View Transition y deja `?area=` en la URL.
- Animación "papel que sale de la impresora", ligada al scroll con `animation-timeline: view()`. Solo en navegadores compatibles y sin `prefers-reduced-motion`.
- Cada proyecto tiene `view-transition-name`, así que al ir de la portada a /proyectos/ viaja a su nueva posición.

**Sobre mí**
- Puentes narrativos al inicio de Experiencia, Habilidades, Lado personal y Contacto.
- `{{laboratorio}}`: gráfico interactivo Cobb-Douglas. Controles de precio, ingreso y α, con la recta inicial punteada y una explicación en vivo. Se dibuja en SVG, sin librerías.
- `{{evidencia}}`: matriz de evidencia. Al elegir una herramienta se resaltan los proyectos donde se usó. Se genera desde `contenido/proyectos/`.

**Todo el sitio**
- Cambio de tema con un revelado circular desde el botón (View Transition).
- Subrayado animado en el menú y cabecera que marca su línea al desplazarse.
- Transición entre páginas: el contenido entra con un leve desplazamiento y la cabecera queda fija.
- Botón "Copiar" en todos los bloques de código, también en Suscribirse.

**Verificación (Playwright)**
- Interruptor: textos de "barra" y de vuelta a "datos".
- Desplegar: se abre con 134 px de alto y se cierra.
- Filtro: con "Finanzas corporativas" muestra "2 de 9 proyectos", 7 plegados y `?area=` en la URL; con "Todas" vuelve a 0 plegados.
- Evidencia: PSM resalta solo "Violencia laboral" y atenúa 8.
- Laboratorio: con ingreso 60 y X a 4 da 7,5 de X y 15 de Y (correcto: 0,5·60/4); con X a 8 da 3,8.
- Tema: ciclo completo sin errores de JavaScript.
- A 375 px no hay desplazamiento horizontal en 4 páginas.

**Copias previas** en `archivo-anterior/2026-10-11-antes-de-interactividad/`. No se subió a internet.

## Transiciones de nueva generación (2026-10-11)

Pedido: transiciones "más revolucionarias y a la época". Todo sin librerías, con APIs modernas del navegador, mejora progresiva y respeto de `prefers-reduced-motion`.

**Efectos nuevos**
- **Titular vivo**
  - Al cargar, `sitio.js` separa las letras (el texto completo sigue para lectores de pantalla) y cada una se ensancha en ola. Usa el eje `font-stretch` de 62 % a 112 %, con 28 ms de desfase entre letras.
  - Al bajar, el titular se comprime con el scroll (`animation-timeline: scroll(root)`): de 112 % a 72 % en 80vh.
- **Texto que se entinta:** en los puentes (portada y primer párrafo de cada sección de Sobre mí), las palabras pasan de opacidad 0,18 a 1 según el avance del scroll. Respeta los enlaces internos.
- **Hojas que se apilan:** los proyectos destacados de la portada se quedan fijos (`sticky`) con un desfase de 14 px y sombra superior, como papel que se acumula. Solo en pantallas de al menos 761×720 y sin movimiento reducido.
- **Cambio de página "hoja nueva":** la página anterior sube, se encoge y se desenfoca; la nueva entra barriendo de abajo arriba con `clip-path`. La cabecera queda fija y los proyectos viajan a su nueva posición.
- **Barra de avance de lectura** en todas las páginas, solo con CSS (`scroll()` timeline). En las publicaciones se mantiene la de JavaScript.
- **Luz que sigue al cursor** (gradiente radial en verde suave) sobre las filas del libro contable, y **botón principal "magnético"**. Ambos solo con ratón.

**Verificación (Playwright)**
- Ola de letras a los 250 ms: de 107 % a 62 % de ancho según la letra.
- Al bajar 400 px el titular está en 90 %.
- 31 palabras en el puente de la portada, que pasan de 0,18 a 1.
- Las tres hojas quedan `sticky` y se apilan a 84, 98 y 394 px.
- La barra de avance está en `scaleX(0.77)`.
- 4 párrafos entintados en Sobre mí.
- A 375 px no hay desplazamiento horizontal.
- Consola sin errores ni advertencias.

## Ajustes: texto desincronizado y transición entre páginas (2026-10-11)

Pedido: "algunas partes donde la letra no va acorde cuando bajas" y una transición más notoria al cambiar de página.

**Causas encontradas y arreglos**
1. **El texto se entintaba tarde.** Con el párrafo al 59 % de la pantalla, la mitad de sus palabras seguían grises, y al final de la página los últimos párrafos (Lado personal, Contacto) nunca se completaban.
   - Ahora el entintado termina cuando el párrafo llega a la mitad de la pantalla, y se completa siempre al llegar al final.
   - Verificado: al 36 % ya no queda ninguna palabra gris, y al final de la página las 4 están completas.
2. **El titular separado en letras perdía el interletrado (kerning)** y se veía irregular. Ahora, al terminar la ola, se restaura el texto normal (0 letras sueltas a los 2,2 s).
3. **La compresión del titular al bajar podía reacomodar las líneas.**
   - Se fija el alto del titular y la compresión se suaviza (112 % → 92 %, opacidad 0,55, sin desplazamiento).
   - Verificado: el contenido de abajo se mueve 0 px.

**Transición entre páginas nueva**
- **"Persiana de papel pijama":** la página nueva aparece por bandas horizontales de 56 px que se abren a la vez. Usa una máscara con `repeating-linear-gradient` y la propiedad animada `--persiana` (registrada con `@property`). La página anterior retrocede, se encoge, se desenfoca y pierde color.
- **Indicador del menú que viaja:** la línea verde de la página actual es un elemento con `view-transition-name: nav-indicador` (generado en `build.js`) y se desliza al enlace de la página nueva.
- Los proyectos siguen viajando a su nueva posición entre la portada y /proyectos/.
- **Verificado con Playwright:** el evento `pagereveal` confirma la View Transition entre documentos ("si"). La captura a mitad de transición muestra las bandas, el retroceso y el indicador entre "Inicio" y "Proyectos".

## Retoma del trabajo de otro chat (2026-10-12)

El usuario pidió continuar desde "su último chat". Ese chat no aparece en el historial local de Claude Code (probablemente fue en claude.ai u otro dispositivo); se reconstruyó a partir de los archivos que dejó (11/10, 22:15 y 23:28).

**Qué dejó ese chat**
- **Identidad visual:** logo "AC" (`activos/logo-ac-*.svg/png`), favicon, íconos de 180/192/512 px e imagen para redes `og-imagen.png` (1200×630), conectados en `plantillas/base.html`.
- **Flujo semanal de piezas** (`redes/LEEME.md`):
  - publicación interactiva en la web, con las piezas `adivina`, `quiz`, `simulador` y `comparador`;
  - `redes/<nombre>.json`;
  - `npm run redes -- <nombre>`, que genera los carruseles de Instagram y LinkedIn en 1080×1350 y sus textos.
- **Primera pieza:** `impuesto-renta-2026-calculadora` (`borrador: true`, fecha 2026-10-12), con 7 láminas de Instagram y 6 de LinkedIn ya generadas.

**Verificación**
- Siguen intactos mis cambios anteriores: la persiana, el indicador del menú y el entintado.
- `node --check` OK. `npm run build` → 26 archivos; con borradores → 3 publicaciones y 36 archivos.
- **UIT 2026 = S/ 5,500** (D. S. 301-2025-EF, firmado el 16/12/2025 y vigente desde el 01/01/2026), confirmado en El Peruano y en SUNAT.
- **Cálculos revisados a mano y en la calculadora:**
  - S/ 4,000 en planilla → S/ 1,400 al año;
  - S/ 10,000 en planilla → S/ 12,560;
  - S/ 10,000 con recibos → S/ 6,400;
  - S/ 2,700 → S/ 0 (umbral S/ 2,750).

  Las 4 piezas interactivas funcionan y la consola no muestra errores.
- **Pendiente de la orden del usuario:** publicar la web (`borrador: false` + `npm run subir`) y subir los carruseles a Instagram y LinkedIn. Esto último lo hace el usuario: no se inicia sesión en sus redes.

**Subida a producción (2026-10-12)**
- El usuario pidió actualizar la web **sin** la publicación del Impuesto a la Renta, que se queda con `borrador: true`.
- Antes de subir se comprobó que la publicación no estaba en `dist/` ni en el feed, el sitemap o la portada.
- `npm run subir`: 27 archivos (21 nuevos y 6 ya existentes), desplegado en https://alex-cuya.pages.dev.
- **Verificado en línea:**
  - 200 en `/`, `/proyectos/`, `/sobre-mi/`, `/suscribirse/`, `estilos.css`, `sitio.js`, `favicon.svg`, `og-imagen.png` y las fuentes.
  - La publicación devuelve 404, como corresponde.
  - La portada muestra el titular nuevo, el interruptor "En los datos / En la barra" y el logo.

## Reorganización: Académico y Extracurricular (2026-10-13)

Pedido: dividir la web en una sección con todo lo académico y otra con lo extracurricular. Las fotos llegarán después de los parciales.

**Estructura nueva**
- **Menú:** Inicio, Académico, Extracurricular y Sobre mí. "Suscribirse" pasa al pie. En celular el menú cabe en una fila (ancho de fuente al 76 %).
- **Académico** (`contenido/paginas/academico.md`):
  - Formación.
  - Docencia, con el laboratorio Cobb-Douglas.
  - Proyectos, con el filtro por área y las 9 filas; el marcador nuevo `{{proyectos}}` inserta el bloque.
  - Habilidades, con la matriz de evidencia.
  - Es una página "ancha": el texto a 40rem y las filas a todo el ancho.
- **Extracurricular** (`contenido/paginas/extracurricular.md`): Powerlifting y powerbuilding, Música, Gaming y comunidades (Alej_84), Voluntariado (Revista Económica y Talentos en Acción) y Lecturas.
- **Sobre mí:** se acorta a la bio, "Dónde seguir" y Contacto.
- **Portada:** franja nueva "Fuera del aula" (`fueraDelAula` y `puenteFuera` en `sitio.config.js`), con 4 accesos a las secciones de Extracurricular. El botón principal y "Ver los N proyectos" apuntan a la sección Proyectos de Académico.
- **La antigua página de proyectos** pasa a ser una redirección (meta refresh y canonical hacia Académico) para no romper enlaces ya compartidos. Sale del sitemap.

**Corrección**
- En Markdown, una línea que empezaba con "2025." se interpretaba como lista numerada y deformaba Voluntariado. Se corrigió y se revisó que no quedaran líneas así.

**Verificación (Playwright)**
- La página antigua de proyectos redirige a Académico.
- Académico muestra 9 filas y el filtro deja "2 de 9 proyectos".
- A 375 px, en las 4 páginas: sin desplazamiento horizontal y menú en una fila.
- No hay errores de JavaScript. Único aviso: el favicon.ico por defecto da 404, que es inofensivo porque el sitio declara favicon.svg.

**Copias previas:** `archivo-anterior/2026-10-13-antes-de-academico-extracurricular/`.

**Publicado (2026-10-13)**
- `npm run subir`: 29 archivos (12 nuevos y 17 ya existentes).
- Verificado en línea: 200 en Inicio, Académico, Extracurricular, Sobre mí y Suscribirse; la antigua página de proyectos redirige a Académico; la portada muestra el menú nuevo y la franja "Fuera del aula".

**Pendiente:** fotos, que el usuario enviará el jueves después de sus parciales.
