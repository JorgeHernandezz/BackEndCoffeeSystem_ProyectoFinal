import express from "express";
import { registroTemporada,
    modificarTemporada,
    verTemporada,
    eliminarTemporada,
    mostrarTemporadas } from "../controllers/temporadaController.js";
import checkAuthAdmin from "../middleware/checkAuthAdmin.js";
const router = express.Router();

/* CRUD temporadas */
// Registro de temporada
router.post("/", registroTemporada);
// Modificación de temporada
router.post("/modificarTemporada", checkAuthAdmin, modificarTemporada);
// Ver temporada
router.post("/verTemporada", checkAuthAdmin, verTemporada);
// Eliminar temporada
router.post("/eliminarTemporada", checkAuthAdmin, eliminarTemporada);
// Mostrar temporadas (CRUD)
router.get("/mostrarTemporada", mostrarTemporadas);

export default router;
