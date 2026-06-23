const express = require("express");
const controller = require("../controllers/checkin.controller");
const { verificarAutenticacion, aplicarUsuarioActual } = require("../middleware/auth");

const router = express.Router();

router.post("/", verificarAutenticacion, aplicarUsuarioActual, controller.crear);

module.exports = router;
