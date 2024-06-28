import express from "express";
import { generarPedido,
    cancelarPedido,
    mostrarPedidos,
    mostrarPedidoPorNombre,
    pagarPedido,
    agregarPedido,
    eliminarPedidoPorNombre,
    actualizarPedidoPorNombre,
    solicitarReembolso } from "../controllers/pedidosController.js";
import checkAuth from "../middleware/checkAuth.js";
import { generarPDFPedidos } from '../controllers/pdfPedidosController.js';
const router = express.Router();


router.get('/generar-pdf-pedidos', generarPDFPedidos);
router.post("/agregarPedido", agregarPedido);

router.delete("/eliminarPedido/:nombrePedido", eliminarPedidoPorNombre);

router.get("/mostrarPedido/:nombrePedido", mostrarPedidoPorNombre);
router.put("/actualizarPedido/:nombrePedido", actualizarPedidoPorNombre);


router.get("/mostrarPedidos", mostrarPedidos);

// Generación de pedido
router.get("/", checkAuth, generarPedido);
// Cancelación del pedido
router.post("/cancelarPedido", checkAuth, cancelarPedido);
// Pago del pedido
router.post("/pagarPedido", checkAuth, pagarPedido);
// Solicitud de reembolso
router.post("/solicitarReembolso", checkAuth, solicitarReembolso);


export default router;
