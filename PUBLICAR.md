# Publicar la web gratis (Cloudflare Pages)

Con esto cualquier persona podrá entrar a tu página desde su computadora o celular, en
una dirección como **https://alex-cuya.pages.dev**. Es gratis, no pide tarjeta, incluye
HTTPS y no necesita que tu computadora esté encendida.

Lo único que tienes que hacer tú es crear la cuenta y arrastrar una carpeta. Todo lo
demás ya está preparado.

## 1. Deja el contenido listo (en tu PC)

1. Escribe tus publicaciones en `contenido/publicaciones/` y pon `borrador: false` en las
   que quieras mostrar. Borra los dos ejemplos cuando ya no los necesites.
2. Cambia el texto y el correo de `contenido/paginas/sobre-mi.md`.
3. Revisa los enlaces de `redes` en `sitio.config.js` (ahora apuntan a `x.com/Alej_84`
   y `github.com/Alej_84`; corrígelos o borra los que no uses).
4. En una terminal dentro de la carpeta `web-personal`:

   ```bash
   npm run publicar
   ```

   Genera el sitio en `dist/` y te avisa si falta algo, como un texto de ejemplo o la
   portada vacía. Al terminar abre la carpeta `dist/` en el Explorador.

## 2. Crea la cuenta (una sola vez)

1. Entra en <https://dash.cloudflare.com/sign-up> y crea una cuenta gratuita con tu
   correo. No hace falta tarjeta ni dominio propio.
2. Confirma tu correo.

## 3. Sube la página

Los nombres de los menús pueden cambiar un poco con el tiempo; busca "Pages" y "upload".

1. En el panel de Cloudflare, abre **Workers & Pages** (a veces aparece dentro de
   "Compute") y pulsa **Create** (Crear).
2. Elige la pestaña **Pages** y la opción **Upload assets** / **Direct upload**
   (subir archivos). No elijas "Connect to Git".
3. Nombre del proyecto: **`alex-cuya`**. Ese nombre define la dirección
   `alex-cuya.pages.dev`.
4. Arrastra la carpeta **`D:\CLAUDE\web-personal\dist`** completa (no la carpeta
   `web-personal`, solo `dist`) y pulsa **Deploy** (Desplegar).
5. En unos segundos te muestra la dirección pública. Ábrela desde tu celular para
   comprobar que funciona.

> **Si el nombre `alex-cuya` ya está ocupado**, Cloudflare te dará otra dirección (por
> ejemplo `alex-cuya-abc.pages.dev`). En ese caso cambia `url` en `sitio.config.js` por
> la dirección que te dio, vuelve a ejecutar `npm run publicar` y sube de nuevo `dist/`
> (paso 4). Así el RSS y las vistas previas en redes apuntarán a la dirección correcta.

## 4. Actualizar la web

**Lo más fácil: doble clic en `subir-web.cmd`** (en la carpeta `web-personal`). Genera la
web y la sube. No hace falta abrir la terminal ni usar `cd`.

### Con un comando

En cualquier terminal, sin importar en qué carpeta esté (una sola línea):

```bash
npm run subir --prefix D:\CLAUDE\web-personal
```

Ojo: en la app de Claude, cada botón **Run** abre una pestaña nueva de la terminal que empieza en `D:\CLAUDE`. Por eso un `cd` en un bloque y `npm run subir` en otro fallan (error ENOENT `D:\package.json`). El `--prefix` evita ese problema.

Genera el sitio, revisa que no falte nada y lo sube a Cloudflare con **Wrangler**, la
herramienta oficial de Cloudflare (versión fija 4.147.0, se descarga sola la primera vez).
En unos segundos los cambios están en https://alex-cuya.pages.dev.

**Solo la primera vez** tienes que conectar tu PC con tu cuenta de Cloudflare:

```bash
npm run conectar
```

Se abre el navegador, inicias sesión en Cloudflare y pulsas **Allow** (Permitir). Wrangler
guarda ese permiso en tu usuario de Windows, no en el proyecto. Para desconectar la PC
más adelante: `npx wrangler@4.147.0 logout`.

## 5. Actualizar a mano (alternativa sin comandos)

1. Escribe o edita en `contenido/`.
2. Ejecuta `npm run publicar`.
3. En Cloudflare: **Workers & Pages** → tu proyecto `alex-cuya` → **Create deployment**
   (nueva implementación) → arrastra otra vez la carpeta `dist/` → **Deploy**.

Cada subida reemplaza la versión anterior. Si algo sale mal, en la lista de
implementaciones puedes volver a una versión previa.

## Preguntas frecuentes

- **¿Cuesta algo?** No. El plan gratuito de Cloudflare Pages no cobra por visitas y admite
  hasta 20 000 archivos por sitio; tu web tiene una decena. Sin tarjeta registrada, no te
  pueden cobrar nada.
- **¿Se publican los borradores?** No. `npm run publicar` usa solo las publicaciones con
  `borrador: false`. La carpeta `dist-borradores/` nunca se sube.
- **¿Puedo tener un dominio propio (alexcuya.com)?** Sí, pero el dominio sí se paga
  (unos 10–15 USD al año). Se conecta después en el proyecto, en "Custom domains". La
  dirección `.pages.dev` siempre es gratis.
- **¿Y si prefiero otro servicio?** También son gratuitos y aceptan la misma carpeta
  `dist/`:
  - **Netlify:** permite arrastrar la carpeta en <https://app.netlify.com/drop>.
  - **GitHub Pages:** requiere subir el proyecto a un repositorio público de GitHub.

  Si usas otro, cambia `url` en `sitio.config.js` por la dirección que te den y vuelve a
  ejecutar `npm run publicar`.
