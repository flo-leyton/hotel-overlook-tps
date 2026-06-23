const express = require("express");
const controller = require("../controllers/solicitudes.controller");
const { verificarAutenticacion, aplicarUsuarioActual } = require("../middleware/auth");

const router = express.Router();

router.get("/", verificarAutenticacion, controller.listar);
router.post("/", verificarAutenticacion, aplicarUsuarioActual, controller.crear);
router.patch("/:id/asignar", verificarAutenticacion, aplicarUsuarioActual, controller.asignar);
router.patch("/:id/estado", verificarAutenticacion, aplicarUsuarioActual, controller.actualizarEstado);

module.exports = router;
