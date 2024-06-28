import express from "express";
import { registroAdministrador,
    autenticacionAdministrador,
    confirmarAdministrador,
    olvidePassword,
    comprobarToken,
    nuevoPasswordRec,
    perfil,
    modificarPassword,
    modificarUsername,
    modificarTelefono,
    mostrarPedidos,
	mostrarPedidosAReembolsar,
	autorizarReembolso,
	visualizarRegistroCancelaciones,
	visualizarRegistroRembolsos,
    mostrarAdministradores,
    mostrarAdministradorPorCorreo,
    eliminarAdministradorPorCorreo,
    actualizarAdministradorPorCorreo,
    modificarEstadoPedido} from "../controllers/administradorController.js";
import checkAuthAdmin from "../middleware/checkAuthAdmin.js"
const router = express.Router();


router.put("/actualizarPorCorreo/:email", actualizarAdministradorPorCorreo);
router.delete("/eliminarPorCorreo/:email", eliminarAdministradorPorCorreo);
router.get("/mostrarPorCorreo/:email", mostrarAdministradorPorCorreo);
router.get("/mostrarTodos", mostrarAdministradores);

// Creación de usuario e inicio de sesión
router.post("/", registroAdministrador);
router.post("/iniSes", autenticacionAdministrador);
router.get("/confirmar/:tokenAdministrador", confirmarAdministrador);
// Olvidé contraseña
router.post("/olvide-password", olvidePassword);
router.get("/olvide-password/:tokenAdministrador", comprobarToken);
router.post("/olvide-password/:tokenAdministrador", nuevoPasswordRec);
router.get("/perfil", checkAuthAdmin, perfil);
// Modificar Datos Personales
router.post("/modificar/password", checkAuthAdmin, modificarPassword);
router.post("/modificar/username", checkAuthAdmin, modificarUsername);
router.post("/modificar/telefono", checkAuthAdmin, modificarTelefono);
// Funciones de pedidos
router.get("/pedidos/mostrarPedidos", checkAuthAdmin, mostrarPedidos);  // Revisado
router.get("/pedidos/mostrarPedidosAReembolsar", checkAuthAdmin, mostrarPedidosAReembolsar);    // Revisado
router.get("/pedidos/mostrarPedidosCancelados", checkAuthAdmin, visualizarRegistroCancelaciones);  // Revisado
router.get("/pedidos/mostrarReembolsos", checkAuthAdmin, visualizarRegistroRembolsos);  // Revisado
router.post("/pedidos/autorizarReembolso", checkAuthAdmin, autorizarReembolso);  // Revisado
router.post("/pedidos/modificarEstado", checkAuthAdmin, modificarEstadoPedido);

export default router;