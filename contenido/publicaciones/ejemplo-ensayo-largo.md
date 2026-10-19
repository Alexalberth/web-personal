---
titulo: "Ejemplo: cómo organizo un proyecto de investigación con datos"
fecha: 2026-10-08
resumen: "Publicación de ejemplo, larga, con subtítulos, listas, código y una tabla. Sirve para revisar el diseño. Bórrala cuando ya no la necesites."
etiquetas: [investigación, datos, flujo de trabajo]
borrador: true
---

Este es un **ensayo largo de ejemplo**. Muestra los elementos de formato más comunes
para que puedas comprobar cómo se ven antes de escribir tus propias publicaciones.

## 1. La pregunta primero

Antes de abrir cualquier base de datos conviene escribir la pregunta en una frase. Si
no cabe en una frase, probablemente son dos preguntas. Una buena pregunta de
investigación dice qué se compara, en qué población y en qué periodo.

Algunas preguntas de ejemplo:

- ¿Cómo cambió la informalidad laboral entre 2015 y 2023?
- ¿Qué efecto tuvo un programa social en la asistencia escolar?
- ¿Se movieron igual los precios de alimentos en todas las regiones?

## 2. Estructura de carpetas

Una estructura sencilla ayuda a que el proyecto sea reproducible:

1. `datos/brutos/`: archivos tal como se descargaron. No se editan.
2. `datos/procesados/`: resultados de la limpieza.
3. `codigo/`: scripts numerados en el orden en que se ejecutan.
4. `resultados/`: tablas y gráficos finales.

## 3. Un poco de código

Los bloques de código se ven así. Si una línea es muy larga, el bloque se desplaza
horizontalmente sin romper el diseño de la página en el celular:

```r
library(dplyr)
panel <- hogares |>
  filter(anio >= 2015, anio <= 2023) |>
  group_by(region, anio) |>
  summarise(informalidad = weighted.mean(informal, w = factor_expansion, na.rm = TRUE), .groups = "drop")
```

Y en Stata:

```stata
xtset hogar anio
xtreg ingreso_real tratamiento i.anio, fe vce(cluster distrito)
```

## 4. Una tabla

| Año  | Informalidad (%) | Variación (pp) |
|------|-----------------:|---------------:|
| 2019 | 72,7             | —              |
| 2020 | 75,3             | +2,6           |
| 2021 | 76,8             | +1,5           |

*Datos inventados solo para mostrar el formato de la tabla.*

## 5. Cierre

Un ensayo largo se beneficia de subtítulos claros, párrafos cortos y una conclusión
que diga qué se aprendió y qué falta por responder. El tiempo de lectura que aparece
arriba se calcula solo, a partir del número de palabras.

---

Las líneas horizontales sirven para separar una posdata o notas finales.
