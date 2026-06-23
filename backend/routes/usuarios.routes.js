const express = require("express");
const controller = require("../controllers/usuarios.controller");
const { verificarAutenticacion, verificarRol } = require("../middleware/auth");

const router = express.Router();

router.get("/", verificarAutenticacion, controller.listar);
router.get("/:id", verificarAutenticacion, controller.obtener);
router.post("/", ...verificarRol(["Administrador"]), controller.crear);
router.put("/:id", ...verificarRol(["Administrador"]), controller.actualizar);
router.patch("/:id/estado", ...verificarRol(["Administrador"]), controller.actualizarEstado);
router.patch("/:id/rol", ...verificarRol(["Administrador"]), controller.actualizarRol);
router.patch("/:id/password", ...verificarRol(["Administrador"]), controller.actualizarPassword);

module.exports = router;
