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

  // Crear tabla si no existe
  db.run(`
    CREATE TABLE IF NOT EXISTS clientes (
      codigo TEXT PRIMARY KEY,
      visitas INTEGER DEFAULT 0
    )
  `);
});

// Ruta POST para sumar visita
app.post("/", (req, res) => {
  const { codigo, pin } = req.body;

  if (pin !== "4209") {
    return res.status(401).json({ error: "PIN incorrecto" });
  }

  db.run(
    `INSERT INTO clientes (codigo, visitas)
     VALUES (?, 1)
     ON CONFLICT(codigo)
     DO UPDATE SET visitas = visitas + 1`,
    [codigo],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Error al actualizar visitas" });
      }

      // Obtener el nuevo conteo
      db.get(
        SELECT visitas FROM clientes WHERE codigo = ?,
        [codigo],
        (err, row) => {
          if (err) {
            return res.status(500).json({ error: "Error al obtener visitas" });
          }
          res.json({ mensaje: "Visita sumada con éxito", visitas: row.visitas });
        }
      );
    }
  );
});

// Ruta GET para consultar visitas por código
app.get("/visitas", (req, res) => {
  const codigo = req.query.codigo;
  if (!codigo) {
    return res.status(400).json({ error: "Código requerido" });
  }

  db.get(
    'SELECT visitas FROM clientes WHERE codigo = ?,'
    [codigo],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: "Error al consultar visitas" });
      }
      res.json({ visitas: row ? row.visitas : 0 });
    }
  );
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(Servidor Mostacho VIP corriendo en puerto ${PORT});
});