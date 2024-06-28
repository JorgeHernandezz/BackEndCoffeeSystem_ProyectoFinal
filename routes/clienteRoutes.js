import express from "express";
import { registroCliente,
    autenticacionCliente,
    confirmarCliente,
    olvidePassword,
    comprobarToken,
    nuevoPasswordRec,
    perfil,
    modificarPassword,
    modificarUsername,
    modificarTelefono,
    modificarDireccion,
    modificarTarjeta,
    valorarProducto,
    agregarComentario,
    verPeluches,
    verFlores,
    agregarFavoritos,
	verFavoritos,
	visualizarValoracionComentarios,
    agregarProductoCarrito,
    incrementarProductoCarrito,
    decrementarProductoCarrito,
    eliminarProductoCarrito,
    vaciarCarrito,
    visualizarCarrito,
    verHistorialPedidos,
    verTarjetas,
    verDirecciones,
    eliminarFavoritos,
    verProductoAValorar,
    verHistorialEntregados,
    mostrarClientes,
    mostrarClientePorCorreo,
    eliminarClientePorCorreo,
    actualizarClientePorCorreo,
    verSeguimientoPedido } from "../controllers/clienteController.js";
import checkAuth from "../middleware/checkAuth.js";
const router = express.Router();



router.put("/actualizarPorCorreo/:email", actualizarClientePorCorreo);
router.delete("/eliminar/:email", eliminarClientePorCorreo);

//http://localhost:4000/api/cliente/mostrarClientes
router.get("/mostrarClientes", mostrarClientes);


//mostrar clientes buscando por correo
//http://localhost:4000/api/cliente/mostrarCliente/jorgehdz17489@gmail.com
router.get("/mostrarCliente/:email", mostrarClientePorCorreo);



// Creación de usuario e inicio de sesión
router.post("/", registroCliente);
router.post("/iniSes", autenticacionCliente);
router.get("/confirmar/:tokenCliente", confirmarCliente);
// Olvidé contraseña
router.post("/olvide-password", olvidePassword);
router.get("/olvide-password/:tokenCliente", comprobarToken);
router.post("/olvide-password/:tokenCliente", nuevoPasswordRec);
router.get("/perfil", checkAuth, perfil);
// Modificar Datos Personales
router.post("/modificar/password", checkAuth, modificarPassword);
router.post("/modificar/username", checkAuth, modificarUsername);
router.post("/modificar/telefono", checkAuth, modificarTelefono);
router.post("/modificar/direccion", checkAuth, modificarDireccion);
router.post("/modificar/tarjeta", checkAuth, modificarTarjeta);
// Interacción con productos
router.post("/interaccionPro/valorar", checkAuth, valorarProducto);
router.post("/interaccionPro/comentar", checkAuth, agregarComentario);
router.post("/interaccionPro/verAValorar", checkAuth, verProductoAValorar);
router.get("/interaccionPro/verFlores", checkAuth, verFlores);
router.get("/interaccionPro/verPeluches", checkAuth, verPeluches);
router.post("/interaccionPro/agregarFavoritos", checkAuth, agregarFavoritos);   // Revisado
router.post("/interaccionPro/eliminarFavoritos", checkAuth, eliminarFavoritos);
router.get("/interaccionPro/verFavoritos", checkAuth, verFavoritos);    // Revisado
router.post("/interaccionPro/visualizarVC", checkAuth, visualizarValoracionComentarios);    // Revisado
// Interacción con carrito
router.post("/carrito/agregarProducto", checkAuth, agregarProductoCarrito);
router.post("/carrito/incrementarProducto", checkAuth, incrementarProductoCarrito);
router.post("/carrito/decrementarProducto", checkAuth, decrementarProductoCarrito);
router.post("/carrito/eliminarProducto", checkAuth, eliminarProductoCarrito);
router.get("/carrito/vaciarCarrito", checkAuth, vaciarCarrito);
router.get("/carrito/visualizarCarrito", checkAuth, visualizarCarrito);
// Interacción con pedidos
router.get("/interaccionPed/visualizar", checkAuth, verHistorialPedidos);
router.get("/interaccionPed/visualizarEntregados", checkAuth, verHistorialEntregados);
router.post("/interaccionPed/visualizarSeguimiento", checkAuth, verSeguimientoPedido);
router.get("/interaccionPed/verTarjetas", checkAuth, verTarjetas);
router.get("/interaccionPed/verDirecciones", checkAuth, verDirecciones);

export default router;
