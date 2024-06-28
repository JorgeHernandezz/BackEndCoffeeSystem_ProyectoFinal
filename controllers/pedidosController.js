import Pedido from "../modelos/pedidos.js";
import Cliente from "../modelos/cliente.js";
import Producto from "../modelos/productos.js";
import cardValidator from "card-validator";


// Generar pedido
const generarPedido = async (req, res) => {
    // Realizamos validación del cliente
    let emailCliente;
    emailCliente = req.cliente.emailCliente;
    const cliente = await Cliente.findOne({ emailCliente });
    if(!cliente){
        const error = new Error("Este usuario no ha iniciado sesión"); /* Mensaje faltante */
        return res.status(403).json({msg: error.message});
    }

    // Validamos que el carrito no esté vacío
    if(cliente.carritoCompras.length < 1){
        const error = new Error("No hay productos en el carrito."); /* Mensaje faltante */
        return res.status(404).json({msg: error.message});
    }

    // Verificamos que no se quieran comprar excedentes de inventario
    const prec = cliente.carritoCompras;
    for (let index = 0; index < prec.length; index++) {
        if(prec[index].cantidad_C > prec[index].copiaInv_C){
            const error = new Error(`Hubo una modificación en el inventario del producto '${prec[index].producto_C}'. Decremente la cantidad a comprar.`); /* Mensaje faltante */
            return res.status(403).json({msg: error.message});
        }
    }

    // Generamos el pedido
    try {
        const nombrePedido = `${cliente.usernameCliente}_${Date.now().toString()}`
        const pedido = new Pedido({ nombrePedido });
        await pedido.save();
        // Definimos los detalles del pedido
        pedido.detallesPedido = [];
        let compras = cliente.carritoCompras;
        // console.log(compras);
        for (let index = 0; index < compras.length; index++) {
            let detalles = {
                producto_P: compras[index].producto_C,
                cantidad_P: compras[index].cantidad_C,
                totalParcial_P: compras[index].totalParcial_C,
                img_P: compras[index].img_C
            }
            pedido.detallesPedido.push(detalles);
        }
        await pedido.save();
        // Definimos el resto de atributos del pedido
        let comprasPedido = pedido.detallesPedido;
        for (let index = 0; index < comprasPedido.length; index++) {
            pedido.costoArticulos += comprasPedido[index].totalParcial_P;
            pedido.totalArticulos += comprasPedido[index].cantidad_P;
        }
        
        if(pedido.costoArticulos < 300){
            pedido.costoEnvio += 0;
        }
        let total = pedido.costoArticulos + pedido.costoEnvio;
        pedido.costoTotal = total;
        pedido.clientePedido = cliente._id;
        await pedido.save();
        // Almacenamos el nombre del pedido en los pedidos del cliente
        cliente.pedidosCliente.push(pedido.nombrePedido);
        await cliente.save();
        res.json({ pedido });  /* Mensaje faltante */
    } catch (error) {
        console.log(error);
    }
};



const mostrarPedidoPorNombre = async (req, res) => {
    const { nombrePedido } = req.params;

    try {
        const pedido = await Pedido.findOne({ nombrePedido });
        if (!pedido) {
            return res.status(404).json({ msg: "Pedido no encontrado" });
        }
        res.json(pedido);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Error al obtener el pedido" });
    }
};




const mostrarPedidos = async (req, res) => {
    try {
        const pedidos = await Pedido.find();
        res.json(pedidos);
    } catch (error) {

        console.log(error);
        res.status(500).json({ msg: "Error al obtener los pedidos" });
    }
};







// Cancelar pedido
const cancelarPedido = async (req, res) => {
    // Realizamos validación del cliente
    let emailCliente;
    emailCliente = req.cliente.emailCliente;
    const cliente = await Cliente.findOne({ emailCliente });
    if(!cliente){
        const error = new Error("Este usuario no ha iniciado sesión"); /* Mensaje faltante */
        return res.status(403).json({msg: error.message});
    }

    // Verificamos que el pedido exista
    const { nombrePedido } = req.body;
    const pedido = await Pedido.findOne({ nombrePedido });
    if(!pedido){
        const error = new Error("El número de pedido es incorrecto");
        return res.status(404).json({msg: error.message});
    }

    // Cancelamos (removemos) el pedido
    try {
        // Buscamos y eliminamos las instancias del pedido a eliminar
        const pedidos = cliente.pedidosCliente;
        let newPedidos = [];
        for (let index = 0; index < pedidos.length; index++) {
            if(nombrePedido != pedidos[index]){
                newPedidos.push(pedidos[index]);
            }
        }
        cliente.pedidosCliente = newPedidos;
        await cliente.save();
        // Añadimos fecha de cancelación
        pedido.fechaCancelacion = new Date();
        // Cancelamos el pedido
        pedido.isCancelled = true;
        pedido.isFinished = true;
        await pedido.save();
        res.json({ msg: "Se ha cancelado el pedido" }); /* Mensaje faltante */
    } catch (error) {
        console.log(error);
    }
}

// Pagar pedido
const pagarPedido = async (req, res) => {
    // Realizamos validación del cliente
    let emailCliente;
    emailCliente = req.cliente.emailCliente;
    const cliente = await Cliente.findOne({ emailCliente });
    if(!cliente){
        const error = new Error("Este usuario no ha iniciado sesión"); /* Mensaje faltante */
        return res.status(403).json({msg: error.message});
    }

    const { nombrePedido,
            metodoPago,
            metodoEntrega,
            fechaEntrega,
            tarjetaPedido,
            destinoPedido } = req.body;

    const { numTarjeta_P,
            fechaVencimiento_P,
            cvv_P
             } = tarjetaPedido;

    const { codigoPostal_P,
            colonia_P,
            calle_P,
            numInt_P,
            numExt_P } = destinoPedido;

    // Verificamos que exista el pedido
    const pedido = await Pedido.findOne({ nombrePedido });
    if(!pedido){
        const error = new Error("El número de pedido es incorrecto");
        return res.status(404).json({msg: error.message});
    }

    // Validamos que el pedido no se haya pagado
    if(pedido.isPaid == true){
        const error = new Error("Ocurrió un error");
        return res.status(400).json({msg: error.message});
    }
    
    // Validamos método de pago
    if(metodoPago != "Tarjeta de débito o crédito"){
        const error = new Error("Método de pago inválido"); /* Mensaje faltante */
        return res.status(403).json({msg: error.message});
    }

    // Validamos método de entrega
    if(metodoEntrega != "En dirección indicada"){
        const error = new Error("Método de entrega inválido"); /* Mensaje faltante */
        return res.status(403).json({msg: error.message});
    }

    /* Hallar modo de validar la fecha de entrega */

    // Validamos el número de tarjeta
    const tarjetaValida = cardValidator.number(numTarjeta_P);
    if(!tarjetaValida.isValid){
        const error = new Error("Número de tarjeta inválido"); /* Mensaje faltante */
        return res.status(403).json({msg: error.message});
    }

    // Realizamos el pago
    try {
        // Llenamos la información
        pedido.metodoPago = metodoPago;
        pedido.metodoEntrega = metodoEntrega;
        if(fechaEntrega != undefined){
            pedido.fechaEntrega = fechaEntrega;
        }
        let date = new Date();
        await pedido.save();
        pedido.fechaCompra = date;
        // Verificamos el método de pago
        if (metodoPago == "Tarjeta de débito o crédito") {
            let tarjeta = {
                numTarjeta_P: numTarjeta_P,
                fechaVencimiento_P: fechaVencimiento_P,
                cvv_P: cvv_P
            };
            tarjeta = {
                numTarjeta_P: numTarjeta_P,
                fechaVencimiento_P: undefined,
                cvv_P: undefined
            }
            pedido.tarjetaPedido = tarjeta;
        }
        // Verificamos método de entrega
        if (metodoEntrega == "En dirección indicada") {
           const destino = {
                codigoPostal_P: codigoPostal_P,
                colonia_P: colonia_P,
                calle_P: calle_P,
                numExt_P: numExt_P,
                numInt_P: numInt_P
            };
            pedido.destinoPedido = destino;
        }
        // Marcamos el pedido como pagado
        pedido.isPaid = true;
        pedido.deliverStatus = "En preparación";
        await pedido.save();
        // Actualizar inventario (pendiente)
        let pedidos = pedido.detallesPedido;
        for (let index = 0; index < pedidos.length; index++) {
            let nombreProducto = pedidos[index].producto_P;
            const producto = await Producto.findOne({ nombreProducto });
            producto.cantidadInv -= pedidos[index].cantidad_P;
            await producto.save();
        }
        // Vaciamos el carrito de compras del cliente
        cliente.carritoCompras = [];
        await cliente.save();
        res.json({ msg: "El pedido se ha pagado" });    /* Mensajes faltante */
    } catch (error) {
        console.log(error);
    }
}



const actualizarPedidoPorNombre = async (req, res) => {
    const { nombrePedido } = req.params;
    const cambios = req.body;

    try {
        const pedido = await Pedido.findOneAndUpdate(
            { nombrePedido },
            { $set: cambios },
            { new: true }
        );
        if (!pedido) {
            return res.status(404).json({ msg: "Pedido no encontrado" });
        }
        res.json({ msg: "Pedido actualizado con éxito", pedido });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Error al actualizar el pedido" });
    }
};




const eliminarPedidoPorNombre = async (req, res) => {
    const { nombrePedido } = req.params;

    try {
        const pedido = await Pedido.findOneAndDelete({ nombrePedido });
        if (!pedido) {
            return res.status(404).json({ msg: "Pedido no encontrado" });
        }
        res.json({ msg: "Pedido eliminado con éxito" });
    } catch (error) {
		console.log(error);
        res.status(500).json({ msg: "Error al eliminar el pedido" });
    }
};


const agregarPedido = async (req, res) => {
    const {
        nombrePedido,
        detallesPedido,
        clienteId,
        metodoEntrega,
        metodoPago,
        destinoPedido,
        tarjetaPedido
    } = req.body;

    try {
        // Verificar si el pedido ya existe para evitar duplicados
        const pedidoExistente = await Pedido.findOne({ nombrePedido });
        if (pedidoExistente) {
            return res.status(400).json({ msg: "Ya existe un pedido con este nombre." });
        }

        // Crear nuevo pedido
        const nuevoPedido = new Pedido({
            nombrePedido,
            detallesPedido,
            clientePedido: clienteId,
            estadoPedido: 'Pendiente', // Estado inicial del pedido
            costoArticulos: detallesPedido.reduce((acc, item) => acc + item.totalParcial_P, 0),
            totalArticulos: detallesPedido.reduce((acc, item) => acc + item.cantidad_P, 0),
            metodoEntrega,
            metodoPago,
            destinoPedido,
            tarjetaPedido
        });

        // Calcula el costo de envío según tu lógica de negocio
        nuevoPedido.costoEnvio = nuevoPedido.costoArticulos > 300 ? 0 : 20; // Ejemplo de lógica de envío
        nuevoPedido.costoTotal = nuevoPedido.costoArticulos + nuevoPedido.costoEnvio;

        // Guardar el nuevo pedido en la base de datos
        await nuevoPedido.save();

        res.status(201).json({ msg: "Pedido creado exitosamente", pedido: nuevoPedido });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Error al crear el pedido" });
    }
};



















const solicitarReembolso = async (req, res) => {
    // Realizamos validación del cliente
    let emailCliente;
    emailCliente = req.cliente.emailCliente;
    const cliente = await Cliente.findOne({ emailCliente });
    if(!cliente){
        const error = new Error("Este usuario no ha iniciado sesión"); /* Mensaje faltante */
        return res.status(403).json({msg: error.message});
    }

    // Verificamos que exista el pedido
    const { nombrePedido,
            returnMotif } = req.body;
    const pedido = await Pedido.findOne({ nombrePedido });
    if(!pedido){
        const error = new Error("El número de pedido es incorrecto");
        return res.status(404).json({msg: error.message});
    }

    // Verificamos que ya esté entregado el pedido
    // Validamos que no se haya solicitado ya el reembolso
    if(pedido.deliverStatus != "Entregado"){
        const error = new Error("El pedido aún no se ha entregado");
        return res.status(400).json({msg: error.message});
    }

    // Validamos que no se haya solicitado ya el reembolso
    if(pedido.returnStatus == "Pendiente"){
        const error = new Error("Ocurrió un error");
        return res.status(400).json({msg: error.message});
    }

    // Validamos que no se haya excedido la fecha límite de devoluciones
    const date = new Date();
    const currentTime = date.valueOf();
    const end = pedido.fechaLimiteDev;
    const endPeriod = end.valueOf();
    if(currentTime > endPeriod){
        const error = new Error("Se ha terminado el periodo de devoluciones");  /* Mensaje faltante */
        return res.status(400).json({msg: error.message});
    }

    // Solicitamos el reembolso
    try {
        pedido.returnStatus = "Pendiente";
        pedido.returnMotif = returnMotif;
        await pedido.save();
        res.json({ msg: "Se ha solicitado el reembolso" });
    } catch (error) {
        console.log(error);
    }
}

export { generarPedido,
        cancelarPedido,
        pagarPedido,
        mostrarPedidoPorNombre,
        mostrarPedidos,
        agregarPedido,
        eliminarPedidoPorNombre,
        actualizarPedidoPorNombre,
        solicitarReembolso }; 
