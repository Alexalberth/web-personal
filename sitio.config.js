// Datos generales del sitio. Cambia estos valores para personalizarlo.
export default {
  titulo: 'Alex Cuya',
  descripcion: 'Alex Cuya, estudiante de Economía en la PUCP. Proyectos y escritos sobre finanzas, políticas públicas y análisis de datos.',
  autor: 'Alex Cuya',
  // Usuario en redes (Instagram). Alej_84 es el alias de gaming y solo aparece en "Sobre mí".
  marca: '@_alee_cu',
  // URL pública definitiva, sin barra final. Se usa en el feed RSS, el sitemap y Open Graph.
  // Corresponde a un proyecto de Cloudflare Pages llamado "alex-cuya" (gratis).
  // Si al crear el proyecto Cloudflare te da otra dirección, cámbiala aquí y vuelve a
  // ejecutar "npm run publicar". Ver PUBLICAR.md.
  url: 'https://alex-cuya.pages.dev',
  // Nombre del proyecto en Cloudflare Pages (lo usa "npm run subir").
  proyectoCloudflare: 'alex-cuya',
  idioma: 'es',
  localeOpenGraph: 'es_PE',
  // Presentación de la portada.
  iniciales: 'AC',
  saludo: 'Economía, datos y disciplina.',
  presentacion: 'Soy Alex Cuya, estudiante de Economía en la PUCP. Convierto bases de datos desordenadas en evidencia para finanzas y políticas públicas, con el mismo método que aplico bajo la barra: medir, ajustar y repetir.',
  // Columna "Ahora" de la portada: en qué estás actualmente (una línea por elemento).
  ahora: [
    'Jefe de Práctica de Matemáticas para Economistas en la PUCP.',
    'Analista comercial voluntario en la Asociación Revista Económica.',
    'Entrenando powerlifting con cargas y RPE registrados.'
  ],
  // Interruptor de la portada: el mismo método en dos terrenos.
  metodo: [
    { verbo: 'Medir', datos: 'Revisar unidades, monedas y celdas vacías de 20 trimestres antes de calcular nada.', barra: 'Registrar la carga, las repeticiones y el RPE de cada serie.' },
    { verbo: 'Ajustar', datos: 'Homogeneizar la base con los tipos de cambio del BCRP y corregir lo que la fuente no permite.', barra: 'Cambiar el plan de la semana según el esfuerzo real, no según el ánimo.' },
    { verbo: 'Repetir', datos: 'Documentar cada criterio para que el análisis se pueda rehacer sin empezar de cero.', barra: 'Sostener el programa semana a semana hasta el día de la competencia.' }
  ],
  // Puente de texto entre la presentación y los proyectos.
  puenteProyectos: 'Esa forma de trabajar se entiende mejor con ejemplos. En cada proyecto empecé por lo mismo: saber de dónde vienen los datos y cuánto confiar en ellos antes de estimar nada.',
  // Proyectos destacados de la portada (los que tengan "destacado: true").
  tituloProyectos: 'Proyectos destacados',
  // Franja "Fuera del aula" de la portada (enlaza a secciones de Extracurricular por su ancla).
  puenteFuera: 'Lo que hago fuera de la universidad sigue el mismo método: registrar, ajustar y sostenerlo en el tiempo.',
  fueraDelAula: [
    { titulo: 'Powerlifting', texto: 'Tercer puesto en los Juegos Interfacultades PUCP y medallas regionales.', ancla: 'powerlifting-y-powerbuilding' },
    { titulo: 'Música', texto: 'Guitarra y canciones propias en español.', ancla: 'musica' },
    { titulo: 'Comunidades', texto: 'Servidores de Minecraft y banners para YouTube como Alej_84.', ancla: 'gaming-y-comunidades' },
    { titulo: 'Voluntariado', texto: 'Revista Económica y mentoría de becarios en Talentos en Acción.', ancla: 'voluntariado' }
  ],
  // Lista de publicaciones de la portada.
  tituloIndice: 'Publicaciones',
  introduccion: 'Notas cortas y ensayos largos sobre economía, investigación, datos y cosas personales.',
  // Menú principal. Cada página de contenido/paginas/ se publica en /<nombre-del-archivo>/.
  navegacion: [
    { texto: 'Inicio', ruta: '/' },
    { texto: 'Académico', ruta: '/academico/' },
    { texto: 'Extracurricular', ruta: '/extracurricular/' },
    { texto: 'Sobre mí', ruta: '/sobre-mi/' }
  ],
  // "Suscribirse" vive en el pie de página para no saturar el menú.
  // Enlaces del pie de página. Deja la lista vacía si no quieres ninguno.
  redes: [
    { nombre: 'LinkedIn', url: 'https://www.linkedin.com/in/alecu03' },
    { nombre: 'Instagram', url: 'https://www.instagram.com/_alee_cu/' }
  ],
  // Palabras por minuto para calcular el tiempo estimado de lectura.
  palabrasPorMinuto: 200
};
