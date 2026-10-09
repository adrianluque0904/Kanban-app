// script.js

const API_URL = '/tareas';

// Definimos las columnas fijas del tablero (coinciden con la tabla `columnas`)
const COLUMNAS = [
  { id: 1, nombre: 'Pendiente' },
  { id: 2, nombre: 'En Progreso' },
  { id: 3, nombre: 'Terminado' },
];

const board = document.getElementById('board');

// ---------------------------------------------
// Formatear fecha tipo "22 jun"
// ---------------------------------------------
function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

// ---------------------------------------------
// Pintar el tablero completo a partir de la lista de tareas
// ---------------------------------------------
function renderBoard(tareas) {
  board.innerHTML = '';

  COLUMNAS.forEach(columna => {
    const tareasDeEstaColumna = tareas.filter(t => t.columna_id === columna.id);

    const columnaEl = document.createElement('section');
    columnaEl.className = 'column';
    columnaEl.dataset.columna = columna.id;

    columnaEl.innerHTML = `
      <div class="column-header">
        <h2>${columna.nombre}</h2>
        <span class="column-count">${tareasDeEstaColumna.length}</span>
      </div>
      <div class="column-body"></div>
    `;

    const body = columnaEl.querySelector('.column-body');

    if (tareasDeEstaColumna.length === 0) {
      body.innerHTML = `<p class="column-empty">Sin tareas aquí</p>`;
    } else {
      tareasDeEstaColumna.forEach(tarea => {
        body.appendChild(crearTaskCard(tarea));
      });
    }

    board.appendChild(columnaEl);
  });
}

// ---------------------------------------------
// Crear el elemento DOM de una tarjeta de tarea
// ---------------------------------------------
function crearTaskCard(tarea) {
  const card = document.createElement('article');
  card.className = 'task-card';
  card.dataset.id = tarea.id;

  const esPrimera = tarea.columna_id === COLUMNAS[0].id;
  const esUltima = tarea.columna_id === COLUMNAS[COLUMNAS.length - 1].id;

  card.innerHTML = `
    <h3 class="task-title">${escaparHTML(tarea.titulo)}</h3>
    ${tarea.descripcion ? `<p class="task-desc">${escaparHTML(tarea.descripcion)}</p>` : ''}
    <div class="task-footer">
      <span class="task-stamp">${formatearFecha(tarea.fecha_creacion)}</span>
      <div class="task-actions">
        <button class="btn-mover" data-dir="-1" ${esPrimera ? 'disabled' : ''} title="Mover a la izquierda">‹</button>
        <button class="btn-mover" data-dir="1" ${esUltima ? 'disabled' : ''} title="Mover a la derecha">›</button>
      </div>
    </div>
  `;

  return card;
}

// Pequeña función de seguridad para no inyectar HTML desde el texto del usuario
function escaparHTML(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

// ---------------------------------------------
// Cargar tareas desde la API
// ---------------------------------------------
async function cargarTareas() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Error al cargar tareas');
    const tareas = await res.json();
    renderBoard(tareas);
  } catch (error) {
    console.error(error);
    board.innerHTML = `<p style="padding:2rem; color:#8A8578;">No se pudieron cargar las tareas. ¿Está el servidor corriendo?</p>`;
  }
}

// ---------------------------------------------
// Crear una tarea nueva (Fase 3: solo conectamos el formulario,
// el movimiento entre columnas con las flechas llega en la Fase 4)
// ---------------------------------------------
async function crearTarea() {
  const tituloInput = document.getElementById('nuevo-titulo');
  const descripcionInput = document.getElementById('nueva-descripcion');

  const titulo = tituloInput.value.trim();
  const descripcion = descripcionInput.value.trim();

  if (!titulo) {
    tituloInput.focus();
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, descripcion, columna_id: 1 }), // siempre entra en "Pendiente"
    });

    if (!res.ok) throw new Error('Error al crear la tarea');

    tituloInput.value = '';
    descripcionInput.value = '';
    await cargarTareas();
  } catch (error) {
    console.error(error);
    alert('No se pudo crear la tarea.');
  }
}

document.getElementById('btn-crear').addEventListener('click', crearTarea);

document.getElementById('nuevo-titulo').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') crearTarea();
});

// ---------------------------------------------
// Mover una tarea a la columna anterior o siguiente
// ---------------------------------------------
async function moverTarea(taskId, direccion) {
  // Buscamos en qué columna está actualmente la tarjeta, leyéndolo del DOM
  const card = document.querySelector(`.task-card[data-id="${taskId}"]`);
  const columnaActual = Number(card.closest('.column').dataset.columna);

  const nuevaColumnaId = columnaActual + direccion;

  // Seguridad: no movemos si ya estamos en el extremo (los botones disabled ya lo evitan,
  // pero comprobamos también aquí por si el HTML estuviera desincronizado)
  const existeColumna = COLUMNAS.some(c => c.id === nuevaColumnaId);
  if (!existeColumna) return;

  try {
    const res = await fetch(`${API_URL}/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columna_id: nuevaColumnaId }),
    });

    if (!res.ok) throw new Error('Error al mover la tarea');

    await cargarTareas(); // repintamos el tablero entero con el estado actualizado
  } catch (error) {
    console.error(error);
    alert('No se pudo mover la tarea.');
  }
}

// ---------------------------------------------
// Delegación de eventos: un solo listener en el tablero
// detecta los clics en cualquier botón ‹ o › de cualquier tarjeta
// ---------------------------------------------
board.addEventListener('click', (e) => {
  const boton = e.target.closest('.btn-mover');
  if (!boton) return;

  const card = boton.closest('.task-card');
  const taskId = card.dataset.id;
  const direccion = Number(boton.dataset.dir);

  moverTarea(taskId, direccion);
});

// ---------------------------------------------
// Arrancar
// ---------------------------------------------
cargarTareas();