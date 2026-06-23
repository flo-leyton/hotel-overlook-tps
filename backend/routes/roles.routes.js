const express = require("express");
const controller = require("../controllers/roles.controller");
const { verificarAutenticacion } = require("../middleware/auth");

const router = express.Router();
router.use(verificarAutenticacion);
router.get("/", controller.listar);
router.get("/:id", controller.obtener);

module.exports = router;
