const express = require("express");
const controller = require("../controllers/habitaciones.controller");
const { verificarAutenticacion, aplicarUsuarioActual } = require("../middleware/auth");

const router = express.Router();

router.get("/", verificarAutenticacion, controller.listar);
router.get("/:id", verificarAutenticacion, controller.obtener);
router.post("/", verificarAutenticacion, aplicarUsuarioActual, controller.crear);
router.patch("/:id/estado", verificarAutenticacion, aplicarUsuarioActual, controller.actualizarEstado);

module.exports = router;
