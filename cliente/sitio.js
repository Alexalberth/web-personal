// Interactividad del sitio. Sin dependencias. Todo es mejora progresiva:
// si este archivo no carga, el sitio sigue siendo completamente legible y navegable.
(() => {
  const $ = (sel, raiz = document) => raiz.querySelector(sel);
  const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];
  const movimientoReducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const raiz = document.documentElement;
  const numero = (n, decimales = 1) => n.toLocaleString('es-PE', { maximumFractionDigits: decimales });

  // Ejecuta un cambio del DOM dentro de una View Transition si el navegador la soporta.
  const conTransicion = (cambio) => {
    if (!document.startViewTransition || movimientoReducido) { cambio(); return null; }
    return document.startViewTransition(cambio);
  };

  // ---------- Tema: automático → claro → oscuro, con revelado circular ----------
  const botonTema = $('[data-boton-tema]');
  if (botonTema) {
    const orden = ['sistema', 'claro', 'oscuro'];
    const nombres = { sistema: 'automático', claro: 'claro', oscuro: 'oscuro' };
    const actual = () => raiz.dataset.tema || 'sistema';
    const pintar = () => {
      const tema = actual();
      const siguiente = orden[(orden.indexOf(tema) + 1) % orden.length];
      botonTema.dataset.estado = tema;
      $('[data-texto-tema]', botonTema).textContent = `Tema: ${nombres[tema]}. Cambiar a ${nombres[siguiente]}`;
      botonTema.title = `Tema: ${nombres[tema]}`;
    };
    botonTema.hidden = false;
    pintar();
    botonTema.addEventListener('click', () => {
      const siguiente = orden[(orden.indexOf(actual()) + 1) % orden.length];
      const cambiar = () => {
        if (siguiente === 'sistema') delete raiz.dataset.tema; else raiz.dataset.tema = siguiente;
        try {
          if (siguiente === 'sistema') localStorage.removeItem('tema'); else localStorage.setItem('tema', siguiente);
        } catch {}
        pintar();
      };
      // El nuevo tema se expande en círculo desde el botón.
      const r = botonTema.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      raiz.style.setProperty('--tema-x', `${x}px`);
      raiz.style.setProperty('--tema-y', `${y}px`);
      raiz.style.setProperty('--tema-r', `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`);
      raiz.classList.add('cambiando-tema');
      const transicion = conTransicion(cambiar);
      if (transicion) transicion.finished.finally(() => raiz.classList.remove('cambiando-tema'));
      else raiz.classList.remove('cambiando-tema');
    });
  }

  // ---------- Cabecera: línea más marcada al desplazarse ----------
  const cabecera = $('.sitio-cabecera');
  const marcarCabecera = () => cabecera?.classList.toggle('desplazado', scrollY > 8);
  addEventListener('scroll', marcarCabecera, { passive: true });
  marcarCabecera();

  // ---------- Titular vivo: separar letras para la ola de ancho ----------
  // El texto original queda para lectores de pantalla; las letras son solo visuales.
  const titular = $('.hero-titulo');
  if (titular && !movimientoReducido) {
    const escapar = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const texto = escapar(titular.textContent.trim());
    let i = 0;
    const palabras = texto.split(' ').map((palabra) => {
      const letras = (palabra.match(/&[a-z]+;|./g) ?? []).map((letra) => `<span class="letra" style="--i:${i++}">${letra}</span>`).join('');
      return `<span class="palabra-titulo">${letras}</span>`;
    });
    const original = titular.innerHTML;
    titular.innerHTML = `<span class="visualmente-oculto">${texto}</span><span class="letras" aria-hidden="true">${palabras.join(' ')}</span>`;
    // Al terminar la ola se restaura el texto normal: las letras sueltas pierden el
    // interletrado (kerning) de la fuente y el titular se vería irregular.
    setTimeout(() => { titular.innerHTML = original; }, i * 28 + 950);
  }
  // Al comprimirse con el scroll, el titular no debe empujar el contenido de abajo:
  // se fija su alto inicial.
  if (titular) {
    const fijarAlto = () => { titular.style.minHeight = ''; titular.style.minHeight = `${titular.offsetHeight}px`; };
    addEventListener('load', fijarAlto);
    addEventListener('resize', fijarAlto);
  }

  // ---------- Texto que se entinta al leer ----------
  // Las palabras de los puentes narrativos pasan de gris claro a tinta según avanza el scroll.
  const parrafosEntintados = $$('.puente, .pagina .prosa h2 + p');
  if (parrafosEntintados.length && !movimientoReducido) {
    const grupos = parrafosEntintados.map((p) => {
      const caminante = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
      const nodos = [];
      while (caminante.nextNode()) nodos.push(caminante.currentNode);
      for (const nodo of nodos) {
        const fragmento = document.createDocumentFragment();
        for (const parte of nodo.textContent.split(/(\s+)/)) {
          if (!parte) continue;
          if (/^\s+$/.test(parte)) { fragmento.append(parte); continue; }
          const span = document.createElement('span');
          span.className = 'palabra';
          span.textContent = parte;
          fragmento.append(span);
        }
        nodo.replaceWith(fragmento);
      }
      p.classList.add('entintado');
      return { p, palabras: $$('.palabra', p) };
    });
    let pendienteTinta = false;
    const entintar = () => {
      pendienteTinta = false;
      const alFinal = scrollY + innerHeight >= document.documentElement.scrollHeight - 4;
      for (const { p, palabras } of grupos) {
        const r = p.getBoundingClientRect();
        // Empieza cuando el párrafo asoma por abajo y termina cuando su inicio llega a la
        // mitad de la pantalla: el texto ya está entintado cuando se lee. Al llegar al
        // final de la página se completa siempre.
        const avance = alFinal ? 1 : Math.min(1, Math.max(0, (innerHeight * 0.98 - r.top) / (innerHeight * 0.4)));
        const hechas = avance * palabras.length;
        palabras.forEach((w, k) => {
          const o = Math.min(1, Math.max(0.18, hechas - k + 0.18));
          w.style.opacity = o.toFixed(2);
        });
      }
    };
    addEventListener('scroll', () => { if (!pendienteTinta) { pendienteTinta = true; requestAnimationFrame(entintar); } }, { passive: true });
    addEventListener('resize', entintar);
    entintar();
  }

  // ---------- Luz que sigue al cursor y botón magnético ----------
  if (matchMedia('(hover: hover) and (pointer: fine)').matches && !movimientoReducido) {
    for (const fila of $$('.libro .proyecto')) {
      fila.addEventListener('pointermove', (e) => {
        const r = fila.getBoundingClientRect();
        fila.style.setProperty('--mx', `${e.clientX - r.left}px`);
        fila.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    }
    for (const boton of $$('.enlace-principal')) {
      boton.addEventListener('pointermove', (e) => {
        const r = boton.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        boton.style.transform = `translate(${dx * 0.22}px, ${dy * 0.3}px)`;
      });
      boton.addEventListener('pointerleave', () => { boton.style.transform = ''; });
    }
  }

  // ---------- Portada: interruptor "En los datos / En la barra" ----------
  const metodo = $('[data-metodo]');
  if (metodo) {
    const grupo = $('.interruptor', metodo);
    const botones = $$('button', grupo);
    const filas = $$('dd', metodo);
    grupo.hidden = false;
    metodo.dataset.modo = 'datos';
    for (const boton of botones) {
      boton.addEventListener('click', () => {
        const modo = boton.dataset.modo;
        if (metodo.dataset.modo === modo) return;
        metodo.dataset.modo = modo;
        for (const b of botones) b.setAttribute('aria-pressed', String(b === boton));
        filas.forEach((dd, i) => {
          const texto = dd.dataset[modo];
          if (movimientoReducido) { dd.textContent = texto; return; }
          // Cada fila cambia con un pequeño desfase, como una impresora que avanza línea a línea.
          setTimeout(() => {
            dd.classList.add('saliendo');
            setTimeout(() => { dd.textContent = texto; dd.classList.remove('saliendo'); }, 160);
          }, i * 70);
        });
      });
    }
  }

  // ---------- Portada: desplegar "Cómo lo abordé" en los proyectos destacados ----------
  for (const proyecto of $$('.proyectos-destacados .proyecto')) {
    const enfoque = $('.proyecto-enfoque', proyecto);
    if (!enfoque) continue;
    enfoque.id = `${proyecto.id}-enfoque`;
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'desplegar';
    boton.setAttribute('aria-expanded', 'false');
    boton.setAttribute('aria-controls', enfoque.id);
    boton.textContent = 'Ver cómo lo abordé';
    $('.proyecto-detalle', proyecto).after(boton);
    boton.addEventListener('click', () => {
      const abrir = boton.getAttribute('aria-expanded') === 'false';
      boton.setAttribute('aria-expanded', String(abrir));
      boton.textContent = abrir ? 'Ocultar cómo lo abordé' : 'Ver cómo lo abordé';
      if (abrir) {
        enfoque.classList.add('abierto');
        if (!movimientoReducido) {
          enfoque.animate([{ height: '0px', opacity: 0 }, { height: `${enfoque.scrollHeight}px`, opacity: 1 }],
            { duration: 280, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' });
        }
      } else if (movimientoReducido) {
        enfoque.classList.remove('abierto');
      } else {
        enfoque.animate([{ height: `${enfoque.scrollHeight}px`, opacity: 1 }, { height: '0px', opacity: 0 }],
          { duration: 220, easing: 'ease-in' }).finished.then(() => enfoque.classList.remove('abierto'));
      }
    });
  }

  // ---------- Proyectos: filtro por área ----------
  const filtroAreas = $('.filtro-areas');
  if (filtroAreas) {
    const filas = $$('.libro .proyecto');
    const chips = $$('.chip', filtroAreas);
    const total = $('[data-total-proyectos]');
    let area = new URLSearchParams(location.search).get('area') || '';
    if (!chips.some((c) => c.dataset.area === area)) area = '';
    const aplicar = (animar) => {
      const cambio = () => {
        let visibles = 0;
        for (const fila of filas) {
          // Las filas que no coinciden se pliegan a una línea en vez de desaparecer,
          // para que se siga viendo el tamaño del portafolio.
          const coincide = !area || fila.dataset.area === area;
          fila.classList.toggle('plegado', !coincide);
          if (coincide) visibles++;
        }
        for (const c of chips) c.setAttribute('aria-pressed', String(c.dataset.area === area));
        total.textContent = area ? `${visibles} de ${filas.length} proyectos` : `${filas.length} proyectos`;
        const url = new URL(location.href);
        if (area) url.searchParams.set('area', area); else url.searchParams.delete('area');
        history.replaceState(null, '', url);
      };
      if (animar) conTransicion(cambio); else cambio();
    };
    filtroAreas.hidden = false;
    for (const chip of chips) chip.addEventListener('click', () => { area = chip.dataset.area; aplicar(true); });
    aplicar(false);
  }

  // ---------- Sobre mí: matriz de evidencia de habilidades ----------
  const evidencia = $('[data-evidencia]');
  if (evidencia) {
    const botones = $$('[data-herramienta]', evidencia);
    const items = $$('.evidencia-proyectos li', evidencia);
    let activa = '';
    evidencia.hidden = false;
    for (const boton of botones) {
      boton.addEventListener('click', () => {
        activa = activa === boton.dataset.herramienta ? '' : boton.dataset.herramienta;
        for (const b of botones) b.setAttribute('aria-pressed', String(b.dataset.herramienta === activa));
        for (const li of items) {
          const usa = li.dataset.herramientas.split(' ').includes(activa);
          li.classList.toggle('coincide', Boolean(activa) && usa);
          li.classList.toggle('atenuado', Boolean(activa) && !usa);
        }
      });
    }
  }

  // ---------- Sobre mí: laboratorio de docencia (Cobb-Douglas) ----------
  const lab = $('[data-laboratorio]');
  if (lab) {
    const svg = $('[data-grafico]', lab);
    const controles = Object.fromEntries($$('[data-control]', lab).map((i) => [i.dataset.control, i]));
    const salidas = Object.fromEntries($$('[data-salida]', lab).map((o) => [o.dataset.salida, o]));
    const texto = $('[data-resultado-lab]', lab);
    const PY = 2;                       // precio del bien Y, fijo
    const MAX = 50;                     // rango de los ejes
    const X0 = 40, X1 = 305, Y0 = 225, Y1 = 15;
    const sx = (x) => X0 + (x / MAX) * (X1 - X0);
    const sy = (y) => Y0 - (y / MAX) * (Y0 - Y1);
    const inicial = { px: Number(controles.px.value), m: Number(controles.m.value) };
    const ns = 'http://www.w3.org/2000/svg';
    const crear = (tipo, atributos) => {
      const el = document.createElementNS(ns, tipo);
      for (const [k, v] of Object.entries(atributos)) el.setAttribute(k, v);
      svg.append(el);
      return el;
    };
    // Ejes y elementos fijos
    crear('line', { x1: X0, y1: Y0, x2: X1, y2: Y0, class: 'eje' });
    crear('line', { x1: X0, y1: Y0, x2: X0, y2: Y1, class: 'eje' });
    crear('text', { x: X1, y: Y0 + 22, class: 'etiqueta-eje', 'text-anchor': 'end' }).textContent = 'Bien X';
    crear('text', { x: X0 - 8, y: Y1 + 4, class: 'etiqueta-eje', 'text-anchor': 'end' }).textContent = 'Y';
    const referencia = crear('line', { class: 'recta-inicial' });
    const curva = crear('path', { class: 'curva' });
    const recta = crear('line', { class: 'recta' });
    const guiaX = crear('line', { class: 'guia' });
    const guiaY = crear('line', { class: 'guia' });
    const punto = crear('circle', { r: 5.5, class: 'optimo' });
    const valorX = crear('text', { class: 'valor', 'text-anchor': 'middle' });
    const valorY = crear('text', { class: 'valor', 'text-anchor': 'end' });
    const leyenda = crear('text', { x: X1, y: Y1 + 4, class: 'leyenda', 'text-anchor': 'end' });

    // Recta presupuestaria recortada al área visible
    const segmento = (m, px) => {
      const yMax = m / PY;
      const xMax = m / px;
      const xa = yMax > MAX ? (m - PY * MAX) / px : 0;
      const ya = Math.min(yMax, MAX);
      const xb = Math.min(xMax, MAX);
      const yb = xMax > MAX ? (m - px * MAX) / PY : 0;
      return { x1: sx(xa), y1: sy(ya), x2: sx(xb), y2: sy(yb) };
    };
    const fija = (el, a) => { for (const [k, v] of Object.entries(a)) el.setAttribute(k, v); };
    fija(referencia, segmento(inicial.m, inicial.px));

    const dibujar = () => {
      const px = Number(controles.px.value);
      const m = Number(controles.m.value);
      const a = Number(controles.a.value);
      salidas.px.textContent = `S/ ${numero(px)}`;
      salidas.m.textContent = `S/ ${numero(m, 0)}`;
      salidas.a.textContent = numero(a, 2);
      const x = (a * m) / px;
      const y = ((1 - a) * m) / PY;
      const u = x ** a * y ** (1 - a);
      fija(recta, segmento(m, px));
      // Curva de indiferencia que pasa por el óptimo: y = (u / x^a)^(1/(1-a))
      const puntos = [];
      for (let i = 1; i <= 120; i++) {
        const xi = (i / 120) * MAX;
        const yi = (u / xi ** a) ** (1 / (1 - a));
        if (yi <= MAX * 1.02) puntos.push(`${sx(xi).toFixed(1)},${sy(Math.min(yi, MAX)).toFixed(1)}`);
      }
      curva.setAttribute('d', puntos.length ? `M${puntos.join('L')}` : '');
      fija(punto, { cx: sx(x), cy: sy(y) });
      fija(guiaX, { x1: sx(x), y1: sy(y), x2: sx(x), y2: Y0 });
      fija(guiaY, { x1: sx(x), y1: sy(y), x2: X0, y2: sy(y) });
      fija(valorX, { x: sx(x), y: Y0 + 22 });
      valorX.textContent = numero(x);
      fija(valorY, { x: X0 - 8, y: sy(y) + 4 });
      valorY.textContent = numero(y);
      const cambio = px !== inicial.px || m !== inicial.m;
      leyenda.textContent = cambio ? 'Línea punteada: situación inicial' : '';
      referencia.style.opacity = cambio ? '1' : '0';
      texto.textContent = `Con un ingreso de S/ ${numero(m, 0)} y el bien X a S/ ${numero(px)}, la mejor canasta es ${numero(x)} unidades de X y ${numero(y)} de Y. El gasto en X siempre es el ${numero(a * 100, 0)} % del ingreso: esa es la firma de una Cobb-Douglas.`;
    };
    for (const control of Object.values(controles)) control.addEventListener('input', dibujar);
    lab.hidden = false;
    dibujar();
  }

  // ---------- Piezas interactivas de las publicaciones ----------
  // En el Markdown: <div class="pieza" data-pieza="TIPO"><script type="application/json">{...}</script>
  // <p class="pieza-sin-js">texto para quien no tiene JavaScript</p></div>
  // Tipos: quiz, adivina, comparador, simulador (modelos "tramos" y "lineal").
  // Regla: toda pieza lleva "fuente" ({texto, url}); ningún número se inventa.
  const el = (etiqueta, clase, texto) => {
    const n = document.createElement(etiqueta);
    if (clase) n.className = clase;
    if (texto !== undefined) n.textContent = texto;
    return n;
  };
  const soles = (n, d = 0) => `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
  const pieFuente = (f) => {
    const p = el('p', 'pieza-fuente');
    if (!f) return p;
    p.append('Fuente: ');
    if (f.url) { const a = el('a', '', f.texto || f.url); a.href = f.url; a.rel = 'noopener'; a.target = '_blank'; p.append(a); }
    else p.append(f.texto);
    return p;
  };
  const formato = (v, c) => {
    const d = c.decimales ?? 0;
    const t = v.toLocaleString('es-PE', { minimumFractionDigits: d, maximumFractionDigits: d });
    return `${c.prefijo ?? ''}${t}${c.sufijo ?? ''}`;
  };

  const piezas = {
    // Pregunta con opciones; al responder se revela la correcta y la explicación.
    quiz(caja, c) {
      caja.append(el('p', 'pieza-pregunta', c.pregunta));
      const lista = el('div', 'pieza-opciones');
      const explicacion = el('p', 'pieza-explicacion');
      explicacion.hidden = true;
      explicacion.setAttribute('aria-live', 'polite');
      c.opciones.forEach((texto, i) => {
        const b = el('button', 'pieza-opcion', texto);
        b.type = 'button';
        b.addEventListener('click', () => {
          for (const [j, o] of [...lista.children].entries()) {
            o.disabled = true;
            if (j === c.correcta) o.classList.add('correcta');
          }
          if (i !== c.correcta) b.classList.add('incorrecta');
          explicacion.textContent = (i === c.correcta ? '¡Correcto! ' : 'No exactamente. ') + c.explicacion;
          explicacion.hidden = false;
        });
        lista.append(b);
      });
      caja.append(lista, explicacion);
    },

    // El lector adivina un valor con un deslizador y luego ve el dato real.
    adivina(caja, c) {
      caja.append(el('p', 'pieza-pregunta', c.pregunta));
      const etiqueta = el('label', 'pieza-control');
      const nombre = el('span', '', 'Tu respuesta');
      const salida = el('output');
      const rango = el('input');
      Object.assign(rango, { type: 'range', min: c.min, max: c.max, step: c.paso ?? 1, value: c.inicial ?? (c.min + c.max) / 2 });
      etiqueta.append(nombre, salida, rango);
      const boton = el('button', 'pieza-boton', 'Revelar el dato');
      boton.type = 'button';
      const regla = el('div', 'pieza-regla');
      const marcaTuya = el('span', 'marca tuya');
      const marcaReal = el('span', 'marca real');
      regla.append(marcaTuya, marcaReal);
      regla.hidden = true;
      const resultado = el('p', 'pieza-explicacion');
      resultado.setAttribute('aria-live', 'polite');
      const pos = (v) => `${((v - c.min) / (c.max - c.min)) * 100}%`;
      const actualizar = () => { salida.textContent = formato(Number(rango.value), c); };
      rango.addEventListener('input', actualizar);
      boton.addEventListener('click', () => {
        const tuya = Number(rango.value);
        rango.disabled = true; boton.disabled = true;
        marcaTuya.style.left = pos(tuya);
        marcaReal.style.left = pos(c.real);
        marcaTuya.dataset.texto = `Tú: ${formato(tuya, c)}`;
        marcaReal.dataset.texto = `Real: ${formato(c.real, c)}`;
        regla.hidden = false;
        const error = Math.abs(tuya - c.real) / (c.max - c.min);
        const veredicto = error < 0.05 ? '¡Casi exacto!' : error < 0.15 ? 'Cerca.' : 'Lejos, pero ahora ya lo sabes.';
        resultado.textContent = `${veredicto} El dato real es ${formato(c.real, c)}. ${c.explicacion ?? ''}`;
      });
      actualizar();
      caja.append(etiqueta, boton, regla, resultado);
    },

    // Barras horizontales con pestañas para cambiar de serie.
    comparador(caja, c) {
      if (c.pregunta) caja.append(el('p', 'pieza-pregunta', c.pregunta));
      const pestanas = el('div', 'pieza-pestanas');
      pestanas.setAttribute('role', 'group');
      const barras = el('div', 'pieza-barras');
      const nota = el('p', 'pieza-explicacion');
      const dibujar = (s) => {
        const max = Math.max(...s.valores.map((v) => Math.abs(v.valor)));
        barras.replaceChildren(...s.valores.map((v) => {
          const fila = el('div', 'pieza-barra' + (v.destacar ? ' destacada' : ''));
          const relleno = el('span', 'relleno');
          relleno.style.setProperty('--ancho', `${(Math.abs(v.valor) / max) * 100}%`);
          fila.append(el('span', 'nombre', v.etiqueta), relleno, el('span', 'valor', formato(v.valor, s)));
          return fila;
        }));
        nota.textContent = s.nota ?? '';
        nota.hidden = !s.nota;
      };
      c.series.forEach((s, i) => {
        const b = el('button', '', s.nombre);
        b.type = 'button';
        b.setAttribute('aria-pressed', String(i === 0));
        b.addEventListener('click', () => {
          for (const o of pestanas.children) o.setAttribute('aria-pressed', String(o === b));
          conTransicion(() => dibujar(s));
        });
        pestanas.append(b);
      });
      if (c.series.length < 2) pestanas.hidden = true;
      dibujar(c.series[0]);
      caja.append(pestanas, barras, nota);
    },

    // Calculadora. Modelo "tramos": escala progresiva (impuestos, tarifas por tramos).
    // Modelo "lineal": resultado = base + factor × valor.
    simulador(caja, c) {
      if (c.pregunta) caja.append(el('p', 'pieza-pregunta', c.pregunta));
      const controles = el('div', 'pieza-controles');
      let opcion = 0;
      if (c.opciones?.length > 1) {
        const grupo = el('div', 'pieza-pestanas');
        c.opciones.forEach((o, i) => {
          const b = el('button', '', o.etiqueta);
          b.type = 'button';
          b.setAttribute('aria-pressed', String(i === 0));
          b.addEventListener('click', () => {
            opcion = i;
            for (const x of grupo.children) x.setAttribute('aria-pressed', String(x === b));
            calcular();
          });
          grupo.append(b);
        });
        controles.append(grupo);
      }
      const e = c.entrada;
      const etiqueta = el('label', 'pieza-control');
      const salida = el('output');
      const rango = el('input');
      Object.assign(rango, { type: 'range', min: e.min, max: e.max, step: e.paso ?? 1, value: e.inicial ?? e.min });
      etiqueta.append(el('span', '', e.etiqueta), salida, rango);
      controles.append(etiqueta);
      const cifras = el('div', 'pieza-cifras');
      const visual = el('div', 'pieza-tramos');
      const texto = el('p', 'pieza-explicacion');
      texto.setAttribute('aria-live', 'polite');

      const calcular = () => {
        const valor = Number(rango.value);
        salida.textContent = formato(valor, e);
        if (c.modelo === 'lineal') {
          const r = (c.base ?? 0) + c.factor * valor;
          cifras.replaceChildren(cifra(c.resultado.etiqueta, formato(r, c.resultado)));
          texto.textContent = (c.plantilla ?? '').replace('{valor}', formato(valor, e)).replace('{resultado}', formato(r, c.resultado));
          return;
        }
        // Modelo "tramos"
        const o = c.opciones?.[opcion] ?? {};
        const uit = c.uit;
        const anual = valor * (o.meses ?? c.meses ?? 1);
        let neta = anual;
        for (const d of o.deducciones ?? []) {
          if (d.tipo === 'porcentaje') neta -= Math.min(neta * d.tasa, (d.topeUIT ?? Infinity) * uit);
          if (d.tipo === 'fija') neta -= d.uit * uit;
        }
        neta = Math.max(0, neta);
        let restante = neta, desde = 0, impuesto = 0;
        const partes = [];
        for (const t of c.tramos) {
          const hasta = (t.hastaUIT ?? Infinity) * uit;
          const enTramo = Math.max(0, Math.min(restante, hasta - desde));
          impuesto += enTramo * t.tasa;
          partes.push({ tasa: t.tasa, monto: enTramo });
          restante -= enTramo; desde = hasta;
        }
        const efectiva = anual > 0 ? impuesto / anual : 0;
        cifras.replaceChildren(
          cifra('Ingreso al año', soles(anual)),
          cifra('Impuesto al año', soles(impuesto)),
          cifra('Equivale a', `${soles(impuesto / 12)} al mes`),
          cifra('Tasa efectiva', `${(efectiva * 100).toLocaleString('es-PE', { maximumFractionDigits: 1 })} %`)
        );
        // Barra: parte libre de impuesto + parte de la renta en cada tramo
        const libre = anual - neta;
        const seg = (monto, clase, rotulo) => {
          const s = el('span', clase);
          s.style.flexGrow = String(monto);
          s.title = `${rotulo}: ${soles(monto)}`;
          if (monto / anual > 0.12) s.textContent = rotulo;
          return s;
        };
        visual.replaceChildren(
          ...(libre > 0 ? [seg(libre, 'libre', 'Sin impuesto')] : []),
          ...partes.filter((p) => p.monto > 0).map((p, i) => seg(p.monto, `tramo t${i}`, `${Math.round(p.tasa * 100)} %`))
        );
        visual.hidden = anual <= 0;
        texto.textContent = impuesto === 0
          ? `Con ${formato(valor, e)} al mes no pagas Impuesto a la Renta: todo tu ingreso queda dentro de lo deducible.`
          : `De cada S/ 100 que ganas al año, pagas S/ ${(efectiva * 100).toLocaleString('es-PE', { maximumFractionDigits: 1 })} de impuesto. Tu tramo más alto es del ${Math.round(partes.filter((p) => p.monto > 0).at(-1).tasa * 100)} %, pero solo se aplica a la parte de tu ingreso que cae en él.`;
      };
      const cifra = (nombre, valor) => {
        const d = el('div', 'pieza-cifra');
        d.append(el('span', 'nombre', nombre), el('strong', '', valor));
        return d;
      };
      rango.addEventListener('input', calcular);
      calcular();
      caja.append(controles, cifras, visual, texto);
    }
  };

  for (const caja of $$('[data-pieza]')) {
    const tipo = caja.dataset.pieza;
    const datos = $('script[type="application/json"]', caja);
    if (!piezas[tipo] || !datos) continue;
    try {
      const c = JSON.parse(datos.textContent);
      $('.pieza-sin-js', caja)?.remove();
      if (c.titulo) caja.append(el('p', 'pieza-titulo', c.titulo));
      piezas[tipo](caja, c);
      if (c.supuestos) caja.append(el('p', 'pieza-supuestos', c.supuestos));
      caja.append(pieFuente(c.fuente));
      caja.classList.add('lista');
    } catch (error) {
      console.error(`Pieza "${tipo}": revisa el JSON.`, error);
    }
  }

  // ---------- Botón "Copiar" en los bloques de código ----------
  for (const pre of $$('.prosa pre')) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'boton-copiar';
    boton.textContent = 'Copiar';
    boton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pre.querySelector('code')?.innerText ?? pre.innerText);
        boton.textContent = 'Copiado';
        boton.classList.add('hecho');
      } catch {
        boton.textContent = 'No se pudo copiar';
      }
      setTimeout(() => { boton.textContent = 'Copiar'; boton.classList.remove('hecho'); }, 1800);
    });
    const envoltorio = document.createElement('div');
    envoltorio.className = 'bloque-codigo';
    pre.replaceWith(envoltorio);
    envoltorio.append(pre, boton);
  }

  // ---------- Portada: buscador y filtro de publicaciones ----------
  const filtros = $('.filtros');
  if (filtros) {
    const items = $$('.lista-publicaciones .item');
    const buscador = $('[data-buscador]', filtros);
    const chips = $$('.chip', filtros);
    const resultado = $('[data-resultado]', filtros);
    const sinResultados = $('[data-sin-resultados]');
    const normalizar = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const textos = new Map(items.map((li) => [li, normalizar(li.textContent)]));
    let etiqueta = new URLSearchParams(location.search).get('etiqueta') || '';

    const aplicar = () => {
      const terminos = normalizar(buscador.value.trim()).split(/\s+/).filter(Boolean);
      let visibles = 0;
      for (const li of items) {
        const pasaEtiqueta = !etiqueta || li.dataset.etiquetas.split(' ').includes(etiqueta);
        const pasaTexto = terminos.every((t) => textos.get(li).includes(t));
        li.hidden = !(pasaEtiqueta && pasaTexto);
        if (!li.hidden) visibles++;
      }
      for (const chip of chips) chip.setAttribute('aria-pressed', String(chip.dataset.etiqueta === etiqueta));
      const filtrando = etiqueta || terminos.length;
      resultado.textContent = filtrando ? `${visibles} de ${items.length} publicaciones` : '';
      sinResultados.hidden = visibles > 0;
      const url = new URL(location.href);
      if (etiqueta) url.searchParams.set('etiqueta', etiqueta); else url.searchParams.delete('etiqueta');
      history.replaceState(null, '', url);
    };

    if (!chips.some((c) => c.dataset.etiqueta === etiqueta)) etiqueta = '';
    filtros.hidden = false;
    buscador.addEventListener('input', aplicar);
    buscador.addEventListener('keydown', (e) => { if (e.key === 'Escape') { buscador.value = ''; aplicar(); } });
    for (const chip of chips) chip.addEventListener('click', () => { etiqueta = chip.dataset.etiqueta; aplicar(); });
    $('[data-limpiar]')?.addEventListener('click', () => { buscador.value = ''; etiqueta = ''; aplicar(); buscador.focus(); });
    document.addEventListener('keydown', (e) => {
      const escribiendo = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
      if (e.key === '/' && !escribiendo && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); buscador.focus(); }
    });
    aplicar();
  }

  // ---------- Publicación: barra de progreso e índice activo ----------
  const publicacion = $('.publicacion');
  if (publicacion) {
    const barra = document.createElement('div');
    barra.className = 'progreso';
    barra.setAttribute('aria-hidden', 'true');
    document.body.prepend(barra);
    const enlacesIndice = $$('.tabla-contenido a');
    const porId = new Map(enlacesIndice.map((a) => [decodeURIComponent(a.hash.slice(1)), a]));
    const secciones = [...porId.keys()].map((id) => document.getElementById(id)).filter(Boolean);
    let seccionActual = null;
    let pendiente = false;
    const actualizar = () => {
      pendiente = false;
      const inicio = publicacion.offsetTop;
      const recorrido = publicacion.offsetHeight - innerHeight;
      const avance = recorrido > 0 ? (scrollY - inicio) / recorrido : 1;
      barra.style.transform = `scaleX(${Math.min(1, Math.max(0, avance))})`;
      if (secciones.length) {
        const limite = innerHeight * 0.33;
        let actual = secciones[0];
        for (const s of secciones) if (s.getBoundingClientRect().top <= limite) actual = s;
        if (actual !== seccionActual) {
          seccionActual = actual;
          for (const a of enlacesIndice) a.toggleAttribute('aria-current', a === porId.get(actual.id));
        }
      }
    };
    addEventListener('scroll', () => { if (!pendiente) { pendiente = true; requestAnimationFrame(actualizar); } }, { passive: true });
    addEventListener('resize', actualizar);
    actualizar();
  }

  // ---------- Botón "volver arriba" ----------
  const arriba = document.createElement('button');
  arriba.type = 'button';
  arriba.className = 'boton-arriba';
  arriba.setAttribute('aria-label', 'Volver arriba');
  arriba.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path d="M12 19V5m-6 6 6-6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  arriba.addEventListener('click', () => {
    scrollTo({ top: 0, behavior: movimientoReducido ? 'auto' : 'smooth' });
    $('#contenido')?.focus({ preventScroll: true });
  });
  document.body.append(arriba);
  const mostrarArriba = () => arriba.classList.toggle('visible', scrollY > innerHeight * 0.8);
  addEventListener('scroll', mostrarArriba, { passive: true });
  mostrarArriba();
})();
