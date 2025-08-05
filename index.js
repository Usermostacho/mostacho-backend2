// index.js
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a la base de datos SQLite
const dbPath = path.resolve(__dirname, "clientes.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error al abrir la base de datos:", err.message);
    process.exit(1);
  }
  console.log("Base de datos conectada.");
});

// Crear tabla de clientes si no existe
db.run(
  `CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    codigo TEXT UNIQUE NOT NULL,
    visitas INTEGER DEFAULT 0
  )`,
  (err) => {
    if (err) {
      console.error("Error al crear tabla clientes:", err.message);
      process.exit(1);
    }
  }
);

// Ruta de prueba (opcional)
app.get("/", (req, res) => {
  res.send("API Mostacho VIP activa ✅");
});

// Crear nuevo cliente
app.post("/api/clientes", (req, res) => {
  const { nombre, codigo } = req.body;
  if (!nombre || !codigo) {
    return res.status(400).json({ error: "Faltan datos: nombre y código son obligatorios." });
  }

  db.run(
    'INSERT INTO clientes (nombre, codigo, visitas) VALUES (?, ?, 0),'
    [nombre, codigo],
    function (err) {
      if (err) {
        console.error("Error al insertar cliente:", err.message);
        return res.status(500).json({ error: "Error al insertar cliente." });
      }
      res.status(201).json({ id: this.lastID, mensaje: "Cliente creado con éxito." });
    }
  );
});

// Obtener datos de un cliente por su código
app.get("/api/clientes/:codigo", (req, res) => {
  const { codigo } = req.params;
  db.get('SELECT * FROM clientes WHERE codigo = ?', [codigo], (err, row) => {
    if (err) {
      console.error("Error al obtener cliente:", err.message);
      return res.status(500).json({ error: "Error al obtener cliente." });
    }
    if (!row) {
      return res.status(404).json({ error: "Cliente no encontrado." });
    }
    res.json(row);
  });
});

// Sumar una visita a un cliente (requiere PIN opcional en frontend)
app.post("/api/clientes/:codigo/visita", (req, res) => {
  const { codigo } = req.params;
  // Aquí podrías verificar un PIN enviado en req.body.pin si lo deseas
  db.run(
    'UPDATE clientes SET visitas = visitas + 1 WHERE codigo = ?,'
    [codigo],
    function (err) {
      if (err) {
        console.error("Error al actualizar visitas:", err.message);
        return res.status(500).json({ error: "Error al actualizar visitas." });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Cliente no encontrado." });
      }
      // Opcional: devolver el nuevo conteo
      db.get('SELECT visitas FROM clientes WHERE codigo = ?,' [codigo], (err2, row2) => {
        if (err2) {
          return res.status(500).json({ error: "Error al obtener visitas." });
        }
        res.json({ mensaje: "Visita sumada.", visitas: row2.visitas });
      });
    }
  );
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log("Servidor iniciado en http://localhost:" + PORT);
});