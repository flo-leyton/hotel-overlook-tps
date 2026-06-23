const express = require("express");
const controller = require("../controllers/huespedes.controller");
const { verificarAutenticacion, aplicarUsuarioActual } = require("../middleware/auth");

const router = express.Router();

router.get("/", verificarAutenticacion, controller.listar);
router.get("/:id", verificarAutenticacion, controller.obtener);
router.post("/", verificarAutenticacion, aplicarUsuarioActual, controller.crear);
router.put("/:id", verificarAutenticacion, aplicarUsuarioActual, controller.actualizar);

module.exports = router;
