# Piezas para redes (Instagram y LinkedIn)

Cada pieza semanal tiene tres partes que salen de la misma noticia:

1. **Publicación en la web:** `contenido/publicaciones/<nombre>.md`, con piezas interactivas
   (`adivina`, `quiz`, `simulador`, `comparador`). Empieza con `borrador: true`.
2. **Datos de redes:** `redes/<nombre>.json`, con las láminas y el texto de Instagram (tono cercano)
   y de LinkedIn (tono formal).
3. **Imágenes:** `npm run redes -- <nombre>` genera los PNG (1080 × 1350) y los textos
   en `redes/salida/<nombre>/`.

Reglas: toda cifra lleva su fuente, y las láminas y la web usan los mismos números.
Nada se publica hasta que lo ordenes: la web con `subir-web.cmd` (o `npm run subir`)
y las redes con el flujo de publicación acordado.
