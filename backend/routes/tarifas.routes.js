const express = require("express");
const controller = require("../controllers/tarifas.controller");
const { verificarAutenticacion, verificarRol } = require("../middleware/auth");

const router = express.Router();

router.get("/", verificarAutenticacion, controller.listar);
router.post("/", ...verificarRol(["Administrador"]), controller.crear);
router.patch("/:id/estado", ...verificarRol(["Administrador"]), controller.actualizarEstado);

module.exports = router;
