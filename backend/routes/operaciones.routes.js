const express = require("express");
const controller = require("../controllers/operaciones.controller");
const { verificarAutenticacion } = require("../middleware/auth");

const router = express.Router();

router.get("/", verificarAutenticacion, controller.listar);
router.get("/:id", verificarAutenticacion, controller.obtener);

module.exports = router;
