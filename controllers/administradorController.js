import Administrador from "../modelos/administrador.js";
import Pedido from "../modelos/pedidos.js";
import Cliente from "../modelos/cliente.js";
import generarID from "../helpers/generarID.js";
import generarJWT from "../helpers/generarJWT.js";
import { emailRegistro, emailRestablecer } from "../helpers/emails.js";

// Registro del administrador en la base de datos
const registroAdministrador = async (req, res) => {
    // Evitar administradores duplicados sin lanzar errores en la consola
    const { emailAdministrador } = req.body;
    const existeAdministrador = await Administrador.findOne({ emailAdministrador });

    // Validamos que el administrador no exista ya
    if(existeAdministrador){
        const error = new Error("Correo asociado a una cuenta");
        return res.status(400).json({ msg: error.message });
    }

    try {
        const administrador = new Administrador(req.body);
        administrador.usernameAdministrador = `${administrador.nombreAdministrador} ${administrador.apellidoAdministrador}`;
        administrador.tokenAdministrador = generarID();
        await administrador.save();

        // Enviamos el email de confirmación
        emailRegistro({
            email: administrador.emailAdministrador,
            nombre: administrador.usernameAdministrador,
            token: administrador.tokenAdministrador
        })

        res.json({
            msg: "Cuenta creada con éxito"
        });
    } catch (error) {
        console.log(error);
    }
};


const mostrarAdministradores = async (req, res) => {
    try {
        const administradores = await Administrador.find({});
        res.json(administradores);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Error al obtener los administradores" });
    }
};

const mostrarAdministradorPorCorreo = async (req, res) => {
    const { email } = req.params;
    try {
        const administrador = await Administrador.findOne({ emailAdministrador: email });
        if (!administrador) {
            return res.status(404).json({ msg: "Administrador no encontrado" });
        }
        res.json(administrador);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Error al obtener el administrador" });
    }
};


const eliminarAdministradorPorCorreo = async (req, res) => {
    const { email } = req.params;
    try {
        const administrador = await Administrador.findOneAndDelete({ emailAdministrador: email });
        if (!administrador) {
            return res.status(404).json({ msg: "Administrador no encontrado" });
        }
        res.json({ msg: "Administrador eliminado exitosamente" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Error al eliminar el administrador" });
    }
};


const actualizarAdministradorPorCorreo = async (req, res) => {
    const { email } = req.params;
    const datosActualizados = req.body;

    try {
        const administrador = await Administrador.findOne({ emailAdministrador: email });
        if (!administrador) {
            return res.status(404).json({ msg: "Administrador no encontrado" });
        }

        // Actualiza cada campo que se haya enviado en el cuerpo de la solicitud
        Object.keys(datosActualizados).forEach(key => {
            administrador[key] = datosActualizados[key];
        });

        await administrador.save();
        res.json({ msg: "Administrador actualizado exitosamente", administrador });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Error al actualizar el administrador" });
    }
};




















// Autenticación del Usuario
const autenticacionAdministrador = async (req, res) => {
    const { emailAdministrador, passwordAdministrador } = req.body;
    // Comprobamos si el usuario existe
    const administrador = await Administrador.findOne({ emailAdministrador });
    if(!administrador){
        const error = new Error("Correo o contraseña incorrectos");
        return res.status(404).json({msg: error.message});
    }
    // Comprobamos is el usuario está confirmado
    if(!administrador.isConfirmed){
        const error = new Error("Usuario sin confirmar");  /* Mensaje faltante */
        return res.status(403).json({msg: error.message});
    }
    // Confirmamos la password
    if(await administrador.comprobarPassword(passwordAdministrador)){
        res.json({_id: administrador._id,
            username: administrador.usernameAdministrador,
            email: administrador.emailAdministrador,
            token: generarJWT(administrador._id)});
    }
    else{
        const error = new Error("Correo o contraseña incorrectos");
        return res.status(403).json({msg: error.message});
    }
}

// Uso de Token para confirmar administrador
const confirmarAdministrador = async (req, res) => {
    const { tokenAdministrador } = req.params;
    const administradorConfirmar = await Administrador.findOne({ tokenAdministrador });
    if(!administradorConfirmar) {
        const error = new Error("Código de verificación inválido");
        return res.status(403).json({msg: error.message});
    }
    try {
        administradorConfirmar.isConfirmed = true;
        administradorConfirmar.isAdmin = true;
        administradorConfirmar.tokenAdministrador = undefined;
        await administradorConfirmar.save();
        res.json({msg: "Cuenta confirmada con éxito"})  /* Mensaje faltante */
    } catch (error) {
        console.log(error);
    }
}

// Olvidé mi contraseña
const olvidePassword = async (req, res) => {
    const { emailAdministrador } = req.body;
    // Comprobamos si el usuario existe
    const administrador = await Administrador.findOne({ emailAdministrador });
    if(!administrador){
        const error = new Error("El correo no está registrado");   /* Mensaje faltante */
        return res.status(404).json({msg: error.message});
    }
    try {
        administrador.tokenAdministrador = generarID();
        await administrador.save();
        // Enviamos el email para restablecer la contraseña
        emailRestablecer({
            email: administrador.emailAdministrador,
            nombre: administrador.usernameAdministrador,
            token: administrador.tokenAdministrador
        })
        res.json({
            msg: "Se ha enviado un correo con las instrucciones a seguir"   /* Mensaje faltante */
        });
    } catch (error) {
        console.log(error);
    }
}

// Uso de Token para confirmar administrador
const comprobarToken = async (req, res) => {
    const { tokenAdministrador } = req.params;
    const tokenValido = await Administrador.findOne({ tokenAdministrador });
    if(!tokenValido) {
        const error = new Error("Código de verificación inválido");
        return res.status(403).json({msg: error.message});
    }
    try {
        res.json({msg: "Código de verificación correcto"})
    } catch (error) {
        console.log(error);
    }
}

// Reestablecer contraseña
const nuevoPasswordRec = async (req, res) => {
    const { tokenAdministrador } = req.params;
    const { nuevaPassword } = req.body;

    const administrador = await Administrador.findOne({ tokenAdministrador });
    if(!administrador) {
        const error = new Error("Código de verificación inválido");
        return res.status(403).json({msg: error.message});
    }
    try {
        administrador.passwordAdministrador = nuevaPassword;
        administrador.tokenAdministrador = undefined;
        administrador.save();
        res.json({msg: "Cambio guardado exitosamente"})
    } catch (error) {
        console.log(error);
    }
}

// Perfil
const perfil = async (req, res) => {
    const { administrador } = req;
    res.json(administrador);
}

// Modificar password
const modificarPassword = async (req, res) => {
    let emailAdministrador;
    emailAdministrador = req.administrador.emailAdministrador;
    const { newPassword } = req.body;
    // Encontramos el documento del administrador que está realizando la operación
    const administradorAModificar = await Administrador.findOne({ emailAdministrador });
    if(!administradorAModificar.isConfirmed){
        const error = new Error("Ocurrió un error.");
        return res.status(403).json({msg: error.message});
    }
    // Realizamos la operación
    try {
        administradorAModificar.passwordAdministrador = newPassword;
        administradorAModificar.save();
        res.json({msg: "Cambio guardado exitosamente"});
    } catch (error) {
        console.log(error);
    }
}

// Modificar username
const modificarUsername = async (req, res) => {
    let emailAdministrador;
    emailAdministrador = req.administrador.emailAdministrador;
    const { nombre, apellido } = req.body;
    // Encontramos el documento del administrador que está realizando la operación
    const administradorAModificar = await Administrador.findOne({ emailAdministrador });
    if(!administradorAModificar.isConfirmed){
        const error = new Error("Ocurrió un error.");
        return res.status(403).json({msg: error.message});
    }
    // Realizamos la operación
    try {
        administradorAModificar.nombreAdministrador = nombre;
        administradorAModificar.apellidoAdministrador = apellido;
        administradorAModificar.usernameAdministrador = `${administradorAModificar.nombreAdministrador} ${administradorAModificar.apellidoAdministrador}`;
        administradorAModificar.save();
        res.json({msg: "Cambio guardado exitosamente"});
    } catch (error) {
        console.log(error);
    }
}

// Modificar teléfono
const modificarTelefono = async (req, res) => {
    let emailAdministrador;
    emailAdministrador = req.administrador.emailAdministrador;
    const { telefono } = req.body;
    // Encontramos el documento del administrador que está realizando la operación
    const administradorAModificar = await Administrador.findOne({ emailAdministrador });
    if(!administradorAModificar.isConfirmed){
        const error = new Error("Ocurrió un error.");
        return res.status(403).json({msg: error.message});
    }
    // Realizamos la operación
    try {
        administradorAModificar.telefonoAdministrador = telefono;
        administradorAModificar.save();
        res.json({msg: "Cambio guardado exitosamente"});
    } catch (error) {
        console.log(error);
    }
}

/* Interacción con pedidos */
const mostrarPedidos = async (req, res) => {
    //Autenticamos al administrador
    let emailAdministrador;
    emailAdministrador = req.administrador.emailAdministrador;
    const admin = await Administrador.findOne({ emailAdministrador });
    if(admin.isAdmin == false){
        const error = new Error("Este usuario no es administrador"); /* Mensaje faltante */
        return res.status(403).json({msg: error.message});
    }

    //Obtenemos los Pedidos
    try {
        const documentos = await Pedido.find();
        if (documentos.length < 1) {
            const error = new Error("No existen pedidos");
            return res.status(404).json({ msg: error.message });
        }
        res.json({ pedidos: documentos });
    } catch (error) {
        console.log(error);
    }
}

const mostrarPedidosAReembolsar = async (req, res) => {

    //Autenticamos al administrador
    let emailAdministrador;
    emailAdministrador = req.administrador.emailAdministrador;
    const admin = await Administrador.findOne({ emailAdministrador });
    if(admin.isAdmin == false){
        const error = new Error("Este usuario no es administrador"); /* Mensaje faltante */
        return res.status(403).json({msg: error.message});
    }
    //Buscamos unicamente los pedidos en solicitud de reembolso
    const aRembolsar = {returnStatus: "Pendiente"};

    //Obtenemos los pedidos
    try {
        const documentos = await Pedido.find(aRembolsar);
        if (documentos.length < 1) {
            const error = new Error("No existen pedidos con solicitudes de reembolso"); /* Mensaje faltante */
            return res.status(404).json({ msg: error.message });
          }

        res.json({ pedidosRem: documentos });
    } catch (error) {
        console.log(error);
    }

}

const autorizarReembolso = async (req, res) => {
    // Autenticación del administrador
    let emailAdministrador;
    emailAdministrador = req.administrador.emailAdministrador;
    const admin = await Administrador.findOne({ emailAdministrador });
    if(admin.isAdmin == false){
        const error = new Error("Este usuario no es administrador"); /* Mensaje faltante */
        return res.status(403).json({msg: error.message});
    }

    // Verificamos que exista el pedido
    const { nombrePedido,
            status } = req.body;
    const pedido = await Pedido.findOne({ nombrePedido });
    if(!pedido){
        const error = new Error("El número de pedido es incorrecto");
        return res.status(404).json({msg: error.message});
    }

    // Verificamos que el status coincida con los status disponibles
    if(status != "Procesada" && status != "Rechazada"){
        const error = new Error("Estado de solicitud incorrecto");  /* Mensaje sin mostrar */
        return res.status(403).json({msg: error.message});
    }
    
    // Verificamos que el pedido pueda editarse
    if(pedido.isFinished == true){
        const error = new Error("Este pedido ya no puede editarse");  /* Mensaje faltante */
        return res.status(403).json({msg: error.message});
    }

    // Validamos que se haya solicitado ya el reembolso
    if(pedido.returnStatus == "Pendiente"){
        // Autorizamos el reembolso
        try {
            pedido.returnStatus = status;
            await pedido.save();
            if(status == "Procesada"){
                pedido.isFinished = true;
                res.json({ msg: "Se ha autorizado la devolución" });    /* Mensaje faltante */
            }
            else if(status == "Rechazada"){
                pedido.isFinished = true;
                res.json({ msg: "Se ha rechazado la devolución" });    /* Mensaje faltante */
            }
        } catch (error) {
            console.log(error);
        }
    }
    else{
        const error = new Error("Este pedido no pudo procesarse");   /* Mensaje faltante */
        return res.status(403).json({msg: error.message});
    }
}

//Registro de Cancelaciones
const visualizarRegistroCancelaciones = async (req, res) => {
    //Realizamos validacion del administrador
    let emailAdministrador;
    emailAdministrador = req.administrador.emailAdministrador;
    const administrador = await Administrador.findOne({ emailAdministrador })
    if (!administrador) {
      const error = new Error("Ocurrio un error");
      return res.status(403).json({ msg: error.message });
    }

    try {
      //Buscamos los pedidos cancelados
      const documentos = await Pedido.find({ isCancelled: true });

      if (documentos.length < 1) {
        const error = new Error("No existen pedidos cancelados");
        return res.status(404).json({ msg: error.message });
      }

      // Mostramos los pedidos cancelados
      return res.status(200).json({ cancelados: documentos });
    } catch (error) {
      return res.status(500).json({ msg: "Error al obtener los pedidos cancelados" });
    }
}

const modificarEstadoPedido = async (req, res) => {
    // Autenticación del administrador
    let emailAdministrador;
    emailAdministrador = req.administrador.emailAdministrador;
    const admin = await Administrador.findOne({ emailAdministrador });
    if(admin.isAdmin == false){
        const error = new Error("Este usuario no es administrador"); /* Mensaje faltante */
        return res.status(403).json({msg: error.message});
    }

    // Verificamos que exista el pedido
    const { nombrePedido,
            status } = req.body;
    const pedido = await Pedido.findOne({ nombrePedido });
    if(!pedido){
        const error = new Error("El número de pedido es incorrecto");
        return res.status(404).json({msg: error.message});
    }

    // Verificamos que el status coincida con los status disponibles
    if(status != "En preparación" && status != "En camino" && status != "Entregado"){
        const error = new Error("Estado de solicitud incorrecto");  /* Mensaje sin mostrar */
        return res.status(403).json({msg: error.message});
    }

    // Validamos que se haya pagado el pedido
    if(pedido.deliverStatus != ""){
        // Modificamos el status
        try {
            pedido.deliverStatus = status;

            // Verificamos si el pedido se ha enviado
            if(status == "En camino"){
                const date = new Date();
                pedido.fechaEnvio = date;
            }

            // Movemos ese pedido de la lista de pedidos a la lista de entregados
            if(status == "Entregado"){
                const date = new Date();
                pedido.fechaEntrega = date;
                const id = pedido.clientePedido;
                const cliente = await Cliente.findById(id);
                console.log(cliente);
                const pedCliente = cliente.pedidosCliente;
                const entrCliente = cliente.entregadosCliente;
                const newPedidos = [];
                for (let index = 0; index < pedCliente.length; index++) {
                    if(pedCliente[index] != pedido.nombrePedido){
                        newPedidos.push(pedCliente[index]);
                    }
                }
                cliente.pedidosCliente = newPedidos;
                entrCliente.push(pedido.nombrePedido);
                await cliente.save();
            }

            await pedido.save();
            res.json({ msg: "Se ha actualizado el status del pedido" });    /* Mensaje faltante */
        } catch (error) {
            console.log(error);
        }
    }
    else{
        const error = new Error("Este pedido no pudo procesarse");   /* Mensaje faltante */
        return res.status(403).json({msg: error.message});
    }
}

//Registro de rembolsos
const visualizarRegistroRembolsos = async (req, res) => {
    // Autenticamos al administrador
    let emailAdministrador;
    emailAdministrador = req.administrador.emailAdministrador;
    const admin = await Administrador.findOne({ emailAdministrador });
    if (admin.isAdmin == false) {
        const error = new Error("Este usuario no es administrador");
        return res.status(403).json({ msg: error.message });
    }
  
    // Buscamos los pedidos con returnStatus "Procesada" o "Rechazada"
    const estado = { returnStatus: { $in: ["Procesada", "Rechazada"] } };

    // Obtenemos los pedidos
    try {
        const documentos = await Pedido.find(estado);
        if (documentos.length < 1) {
            const error = new Error("No existen pedidos con solicitudes de reembolso");
            return res.status(404).json({ msg: error.message });
        }

        res.json({ pedidosRem: documentos });
    } catch (error) {
        console.log(error);
    }
}

export { registroAdministrador,
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
    modificarEstadoPedido};
