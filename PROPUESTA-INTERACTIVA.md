# Propuesta: narrativa continua y elementos interactivos

Estructura de la portada como un solo recorrido de arriba abajo, con puentes de texto entre
secciones y, en cada una, el elemento interactivo que corresponde. Las páginas
`/proyectos/` y `/sobre-mi/` se mantienen como versión detallada.

**Idea central del recorrido:** medir, ajustar y repetir. Es el mismo método en un modelo
econométrico, en un grupo de práctica y bajo la barra. Cada sección muestra ese método en
un terreno distinto, y los puentes lo hacen explícito.

**Leyenda**
- `[Interacción Visual: ...]` describe qué ve y qué siente quien visita la página.
- `[Necesito de ti: ...]` marca lo que solo tú puedes darme: datos, fotos, audio.
- Los textos entre comillas son los párrafos de transición propuestos, listos para usar.

**Reglas que sigo en todas las secciones**, para no contradecir el diseño actual del
"papel pijama":
- **Un solo movimiento automático en toda la página:** el titular que se estira al cargar.
  Todo lo demás se mueve **solo cuando tú haces algo** (pasar el cursor, tocar, arrastrar).
- **Ningún gráfico usa números inventados.** Cada visualización se alimenta de un CSV tuyo,
  exportado de Stata o de Excel.
- **Todo funciona con teclado y en celular.** Nada depende solo del *hover*, porque en el
  celular no hay cursor.

---

## 1. Hero

> **Economía, datos y disciplina.**
> Soy Alex Cuya, estudiante de Economía en la PUCP. Convierto bases de datos desordenadas en
> evidencia para finanzas y políticas públicas, con el mismo método que aplico bajo la
> barra: medir, ajustar y repetir.

`[Interacción Visual: Ya existe: al cargar, el titular se ensancha una sola vez con el eje de ancho de la fuente, como una barra que sube.]`

`[Interacción Visual: Interruptor "En los datos / En la barra". Debajo del subtítulo, los tres verbos (medir, ajustar, repetir) aparecen como una tabla de tres filas en papel pijama. Un interruptor de dos posiciones cambia el ejemplo de cada fila, con un fundido corto de 200 ms solo en el texto que cambia. Ejemplos de "En los datos": Medir = revisar unidades y monedas de 20 trimestres; Ajustar = homogeneizar con el tipo de cambio del BCRP; Repetir = documentar el criterio para que el análisis se pueda rehacer. Ejemplos de "En la barra": Medir = registrar carga y RPE de cada serie; Ajustar = cambiar el plan según el esfuerzo real; Repetir = sostener el programa semana a semana. Es la tesis de toda la web, y la persona la descubre al tocarla.]`

**Puente hacia Proyectos:**
"Esa forma de trabajar se entiende mejor con ejemplos. En cada proyecto empecé por lo mismo:
saber de dónde vienen los datos y cuánto confiar en ellos antes de estimar nada."

---

## 2. Proyectos destacados

Las filas del libro contable se mantienen. Cada proyecto gana un gráfico pequeño hecho con
**sus propios datos**, que se abre al pedirlo.

`[Interacción Visual: Botón "Ver el gráfico" en cada fila. Al pulsarlo, la fila se expande hacia abajo (300 ms, solo la altura) y aparece el gráfico. Pulsarlo de nuevo la cierra. Es un movimiento que responde a una acción, así que encaja con el diseño.]`

`[Interacción Visual: Filtro por área sobre la lista (Finanzas corporativas, Políticas públicas, Evaluación de impacto...). Al elegir un área, las filas que no coinciden se reducen a una línea gris en vez de desaparecer, para que se siga viendo el tamaño del portafolio.]`

### 2.1 Valorización de AUNA

`[Interacción Visual: "Football field" de valorización, el gráfico estándar de banca de inversión. Son barras horizontales con el rango de valor por acción según cada método (múltiplos EV/EBITDA, P/VL, flujo descontado...) y una línea vertical con el precio de mercado. Al pasar el cursor o tocar una barra se muestran los supuestos de ese método: el múltiplo usado, el WACC y la fecha.]`

`[Interacción Visual: Debajo, una línea de los 20 trimestres de EV/EBITDA con un selector de país (Perú, México, Colombia). Es la prueba visual de que la base se homogeneizó bien.]`

`[Necesito de ti: los rangos de valor por método, el precio de referencia y la serie trimestral, en CSV.]`

### 2.2 Programas de empleo juvenil (SIAF + ENAHO, 2016-2025)

`[Interacción Visual: Dos gráficos pequeños, uno sobre otro, con el mismo eje de años. Arriba, el presupuesto ejecutado (SIAF). Abajo, el indicador laboral juvenil (ENAHO). Al mover el cursor o el dedo, una línea vertical recorre ambos gráficos a la vez y muestra los valores de ese año. Uso dos gráficos y no uno con doble eje vertical, porque el doble eje sugiere relaciones que pueden no existir.]`

`[Necesito de ti: la serie anual de gasto y el indicador laboral que usaste (desempleo juvenil, formalidad...).]`

### 2.3 Violencia laboral y salud mental (PSM)

Aquí va lo que el prompt llama "slider de imágenes comparativas", con contenido real:

`[Interacción Visual: Comparador "antes / después del matching". Muestra un gráfico de balance de covariables (love plot): un punto por variable con su diferencia de medias estandarizada. Un control deslizante pasa de "Antes del matching", con los puntos dispersos, a "Después", con los puntos alineados cerca de cero. Los puntos se desplazan a su nueva posición con un movimiento corto. Muestra en segundos qué hace el PSM.]`

`[Interacción Visual: Debajo, el forest plot del efecto estimado. Al pasar el cursor o tocar un punto se ven el estimador, el intervalo de confianza y el N.]`

`[Necesito de ti: las diferencias estandarizadas antes y después, y las estimaciones con sus intervalos.]`

### 2.4 Inclusión financiera (ENAHO 2024)

`[Interacción Visual: Gráfico de puntos ordenado por departamento, con pestañas para elegir el indicador: tiene cuenta, usa tarjeta, accedió a crédito. Al cambiar de pestaña, los departamentos se reordenan con una animación corta, para que se vea quién sube y quién baja. Prefiero esto a un mapa coroplético, porque en un mapa del Perú Loreto domina visualmente aunque tenga poca población. Si quieres un mapa, que sea un mapa de mosaicos: un cuadrado por departamento.]`

`[Necesito de ti: los indicadores por departamento, con la ENAHO 2024 ponderada.]`

### 2.5 FONCOMUN (tesis)

`[Interacción Visual: Reservado. Cuando presentes la tesis, la propuesta es un diagrama de dispersión de transferencia per cápita frente a ejecución del gasto, un punto por municipio, con un buscador para encontrar tu distrito y verlo resaltado. Hasta entonces, no aparece en la web.]`

**Puente hacia Docencia:**
"Explicar un modelo obliga a entenderlo dos veces. Como Jefe de Práctica de Matemáticas para
Economistas paso cada semana de la derivada a la intuición: por qué el óptimo está donde está
y qué cambia cuando se mueve un precio."

---

## 3. Docencia

`[Interacción Visual: Un problema de clase que se puede tocar. Es un gráfico de restricción presupuestaria con una curva de indiferencia, con dos controles deslizantes: precio del bien X e ingreso. Al moverlos, la recta gira o se desplaza, la canasta óptima se mueve a su nuevo punto de tangencia y una línea de texto debajo se actualiza (por ejemplo, "Si el precio de X sube a 4, la cantidad óptima de X baja a 7,5"). Usa una función Cobb-Douglas y se calcula en el navegador, sin datos externos. Demuestra que sabes enseñar sin tener que decirlo.]`

**Puente hacia Powerlifting:**
"La paciencia que pide un grupo de práctica es la misma que pide la barra. En el powerlifting
el progreso no se adivina: se programa, se registra serie por serie y se ajusta con el
esfuerzo percibido (RPE). Mi bitácora de entrenamiento es, en el fondo, otra base de datos."

---

## 4. Powerlifting

En lugar del carrusel que propone el prompt, porque los carruseles esconden contenido, se
mueven solos y son difíciles de usar con teclado:

`[Interacción Visual: Bitácora de progreso. Es un gráfico de líneas del 1RM estimado (calculado con carga, repeticiones y RPE) a lo largo del tiempo, con tres pestañas: sentadilla, press de banca y peso muerto. Los días de competencia aparecen como marcas sobre la línea. Al tocar la marca de los Juegos Interfacultades PUCP se abre una nota: "Tercer puesto, levantamiento de potencia", con la foto de ese día. Es el mismo tipo de gráfico que una serie económica, y ahí está el puente visual.]`

`[Interacción Visual: Para los logros, una tira horizontal de fotos que se desliza con el dedo o con las flechas del teclado. Siempre se ve el borde de la siguiente foto, para que se note que hay más, y no avanza sola. Cada foto lleva un pie con el campeonato, la categoría y el resultado.]`

`[Necesito de ti: tu registro de entrenamiento (fecha, ejercicio, carga, repeticiones, RPE) y 3 a 5 fotos de competencia. Si en las fotos salen otras personas, revisa que no les moleste aparecer.]`

**Puente hacia Habilidades:**
"Registrar cargas me enseñó a desconfiar de un buen día aislado y a mirar la tendencia. Con
los datos hago lo mismo. Estas son las herramientas que uso, cada una conectada con un
proyecto donde la apliqué."

---

## 5. Habilidades

En lugar de barras de progreso animadas: una barra de "Python 60 %" no significa nada
medible, invita a comparaciones que no te favorecen y es uno de los recursos más genéricos
de los portafolios. Lo que convence a un reclutador es la evidencia.

`[Interacción Visual: Matriz de evidencia. Las habilidades (Stata, Python, SQL, Excel, Capital IQ, PSM, datos de panel, WACC...) aparecen como una lista de botones sobrios. Al tocar una, se resaltan en verde, en la lista de proyectos de al lado, los proyectos donde la usaste, y el resto se atenúa. Al tocar "PSM" se ilumina "Violencia laboral"; al tocar "S&P Capital IQ", AUNA. La animación responde a una acción y prueba cada habilidad con un caso concreto. Se construye con los datos que ya están en contenido/proyectos/, así que no hace falta nada nuevo.]`

**Puente hacia Música y gaming:**
"No todo se mide. Fuera de la hoja de cálculo toco guitarra y compongo canciones. Y como
Alej_84 administro servidores de Minecraft, donde armar un modpack se parece bastante a
depurar una base: todo funciona solo si cada pieza está en la versión correcta."

---

## 6. Música

`[Interacción Visual: Reproductor mínimo para una canción tuya: botón de reproducir, una forma de onda dibujada en verde que se llena mientras suena y el título. Nada suena solo al entrar. Al lado, una estrofa de la letra.]`

`[Necesito de ti: una grabación (MP3) de una canción propia y la estrofa que quieras mostrar.]`

## 7. Gaming y comunidades

`[Interacción Visual: Una cuadrícula con 3 o 4 banners que hiciste para canales de YouTube. Al tocar uno se abre en grande, sobre un fondo oscuro, y se cierra con Esc o tocando fuera. Debajo, una línea por proyecto: servidor, modpack (versión de NeoForge, número de mods), para qué serie.]`

`[Necesito de ti: los banners en PNG o JPG y los nombres de las series o canales, si quieres mencionarlos.]`

## 8. Lecturas

`[Interacción Visual: Sin interacción. Una lista breve con autor, libro y una línea sobre qué te dejó. Es la parte más quieta de la página, a propósito, y le da descanso a la vista antes del cierre.]`

**Puente hacia Contacto:**
"Si buscas a alguien que ordene los datos, explique lo que encontró y sostenga el método en el
tiempo, escríbeme."

## 9. Contacto

`[Interacción Visual: Un único botón verde: "Escribirme por LinkedIn". No hace falta formulario: no habría dónde guardar los mensajes sin pagar un servicio.]`

---

## Orden de implementación sugerido

| Fase | Qué | ¿Necesita algo tuyo? |
|---|---|---|
| 1 | Puentes de texto, interruptor "En los datos / En la barra", matriz de evidencia de habilidades, gráfico interactivo de docencia, filtro y filas expandibles de proyectos | No: se puede hacer ya |
| 2 | Gráficos de AUNA, empleo juvenil, PSM e inclusión financiera | Tus CSV |
| 3 | Bitácora de powerlifting y fotos, reproductor de música, banners | Registro de entrenamiento, fotos, audio, banners |

**Técnica:** los gráficos serían SVG generados por el propio generador del sitio a partir de
tus CSV en `contenido/datos/`, más JavaScript propio para las interacciones, sin librerías
pesadas. Así la web sigue cargando rápido, se lee sin JavaScript y funciona en celular.
