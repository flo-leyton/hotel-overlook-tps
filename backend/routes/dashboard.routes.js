const express = require("express");
const controller = require("../controllers/dashboard.controller");
const { verificarAutenticacion } = require("../middleware/auth");

const router = express.Router();

router.get("/resumen", verificarAutenticacion, controller.obtenerResumen);

module.exports = router;
