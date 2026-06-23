const path = require("node:path");
const express = require("express");
const cors = require("cors");
const db = require("./db");

const dashboardRoutes = require("./routes/dashboard.routes");
const habitacionesRoutes = require("./routes/habitaciones.routes");
const huespedesRoutes = require("./routes/huespedes.routes");
const reservacionesRoutes = require("./routes/reservaciones.routes");
const checkinRoutes = require("./routes/checkin.routes");
const checkoutRoutes = require("./routes/checkout.routes");
const solicitudesRoutes = require("./routes/solicitudes.routes");
const operacionesRoutes = require("./routes/operaciones.routes");
const usuariosRoutes = require("./routes/usuarios.routes");
const tarifasRoutes = require("./routes/tarifas.routes");
const authRoutes = require("./routes/auth.routes");
const rolesRoutes = require("./routes/roles.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

app.get("/api/health", (req, res) => {
  db.prepare("SELECT 1 AS ok").get();
  res.json({
    ok: true,
    message: "Backend TPS Hotel Overlook funcionando",
    database: "SQLite",
  });
});

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/habitaciones", habitacionesRoutes);
app.use("/api/huespedes", huespedesRoutes);
app.use("/api/reservaciones", reservacionesRoutes);
app.use("/api/checkin", checkinRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/solicitudes", solicitudesRoutes);
app.use("/api/operaciones", operacionesRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/tarifas", tarifasRoutes);

const frontendPath = path.resolve(__dirname, "..", "html");
app.use(express.static(frontendPath));
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "landing-pages", "hotel-overlook.html"));
});

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: "Ruta no encontrada.",
  });
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      ok: false,
      error: "El cuerpo JSON no es válido.",
    });
  }

  console.error(error);
  return res.status(500).json({
    ok: false,
    error: "Error interno del servidor.",
  });
});

if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
  });
}

module.exports = app;
