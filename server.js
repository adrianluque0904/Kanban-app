// server.js
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());           // permite que el frontend (otro origen) llame a esta API
app.use(express.json());   // permite leer JSON en el body de las peticiones POST/PUT
app.use(express.static('public'));

// Pool de conexiones a MySQL (mejor que una sola conexión: gestiona varias a la vez)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// ---------------------------------------------
// GET /tareas → trae todas las tareas con el nombre de su columna
// ---------------------------------------------
app.get('/tareas', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        t.id,
        t.titulo,
        t.descripcion,
        t.fecha_creacion,
        t.columna_id,
        c.nombre AS columna_nombre
      FROM tareas t
      JOIN columnas c ON t.columna_id = c.id
      ORDER BY t.columna_id, t.id
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({ error: 'Error al obtener las tareas' });
  }
});

// ---------------------------------------------
// POST /tareas → crea una tarea nueva
// ---------------------------------------------
app.post('/tareas', async (req, res) => {
  const { titulo, descripcion, columna_id } = req.body;

  // Validación básica
  if (!titulo || !columna_id) {
    return res.status(400).json({ error: 'titulo y columna_id son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO tareas (titulo, descripcion, columna_id) VALUES (?, ?, ?)',
      [titulo, descripcion || null, columna_id]
    );

    res.status(201).json({
      id: result.insertId,
      titulo,
      descripcion: descripcion || null,
      columna_id,
    });
  } catch (error) {
    console.error('Error al crear tarea:', error);
    res.status(500).json({ error: 'Error al crear la tarea' });
  }
});

// ---------------------------------------------
// PUT /tareas/:id → mueve una tarea a otra columna
// ---------------------------------------------
app.put('/tareas/:id', async (req, res) => {
  const { id } = req.params;
  const { columna_id } = req.body;

  if (!columna_id) {
    return res.status(400).json({ error: 'columna_id es obligatorio' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE tareas SET columna_id = ? WHERE id = ?',
      [columna_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    res.json({ id: Number(id), columna_id });
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    res.status(500).json({ error: 'Error al actualizar la tarea' });
  }
});

// ---------------------------------------------
// Arrancar el servidor
// ---------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});