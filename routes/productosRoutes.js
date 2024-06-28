import express from "express";
import { registroProducto,
        modificarProducto,
        eliminarProducto,
        verProducto,
        mostrarProductos,
        mostrarFlores,
        actualizarProductoPorNombre,
        eliminarProductoPorNombre,
        verProductoPorNombre,
        registroProductoPost,
        mostrarPeluches } from "../controllers/productosController.js";
import checkAuthAdmin from "../middleware/checkAuthAdmin.js"
import { generarPDFProductos } from '../controllers/pdfController.js';

const router = express.Router();

router.get('/generar-pdf-productos', generarPDFProductos);
router.post("/agregarProducto", registroProductoPost);

router.delete("/eliminarProducto/:nombreProducto", eliminarProductoPorNombre);

router.put("/actualizarProducto/:nombreProducto", actualizarProductoPorNombre);

router.get("/verProducto/:nombreProducto", verProductoPorNombre);


/* CRUD */
// Creacion producto
router.post("/", checkAuthAdmin, registroProducto);
// Modificar producto
router.post("/modificarProducto", checkAuthAdmin, modificarProducto);
// Eliminar producto
router.post("/eliminarProducto", eliminarProducto);
// Ver producto
router.post("/verProducto", checkAuthAdmin, verProducto);
// Mostrar Productos (CRUD)
router.get("/mostrarProductos", mostrarProductos);

/* Catálogo */

router.get("/mostrarFlores", mostrarFlores);
// Mostrar peluches
router.get("/mostrarPeluches", mostrarPeluches);

export default router;