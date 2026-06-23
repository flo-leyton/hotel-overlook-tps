const express = require("express");
const controller = require("../controllers/reservaciones.controller");
const { verificarAutenticacion, verificarRol, aplicarUsuarioActual } = require("../middleware/auth");

const router = express.Router();

router.post("/publica", controller.crearPublica);
router.get("/", verificarAutenticacion, controller.listar);
router.get("/:id", verificarAutenticacion, controller.obtener);
router.post("/", verificarAutenticacion, aplicarUsuarioActual, controller.crear);
router.patch("/:id/confirmar", verificarAutenticacion, aplicarUsuarioActual, controller.confirmar);
router.patch("/:id/cancelar", ...verificarRol(["Administrador", "Supervisor de recepción"]), aplicarUsuarioActual, controller.cancelar);

module.exports = router;
