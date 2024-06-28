import Temporada from "../modelos/temporadas.js";
import Producto from "../modelos/productos.js";
import Administrador from "../modelos/administrador.js";
import Cliente from "../modelos/cliente.js";

// Registro de temporadas en la base de datos
const registroTemporada = async (req, res) => {

    // Evitar temporadas duplicadas sin lanzar errores en la consola
    const { nombreTemporada,
            peluches,
            flores,
            descrTemporada,
            descuentoTemporada,
            fecInit,
            fecEnd } = req.body;
    const existeTemporada = await Temporada.findOne({ nombreTemporada });

    // Validamos que la temporada no exista
    if(existeTemporada){
        const error = new Error("La temporada ya está registrada");
        return res.status(400).json({ msg: error.message });
    }

    // Validamos que los arreglos no estén vacíos
    if(peluches.length < 1 || flores.length < 1){
        const error = new Error("No hay productos suficientes"); /* Mensaje sin ver */
        return res.status(400).json({ msg: error.message });
    }

    // Revisamos que todos los productos existan y tengan la categoría correcta
    let nombreProducto;
    let productosMod = [];
    for (let index = 0; index < peluches.length; index++) {
        nombreProducto = peluches[index];
        productosMod.push(nombreProducto);
        const producto1 = await Producto.findOne({ nombreProducto });
        if(!producto1){
            const error = new Error("El producto no existe");
            return res.status(404).json({ msg: error.message });
        }
        if(producto1.tipoProducto != "Peluche"){
            const error = new Error("El tipo de producto no coincide");
            return res.status(400).json({ msg: error.message });
        }
    }
    
    for (let index = 0; index < flores.length; index++) {
        nombreProducto = flores[index];
        productosMod.push(nombreProducto);
        const producto2 = await Producto.findOne({ nombreProducto });
        if(!producto2){
            const error = new Error("El producto no existe");
            return res.status(404).json({ msg: error.message });
        }
        if(producto2.tipoProducto != "Flor"){
            const error = new Error("El tipo de producto no coincide");
            return res.status(400).json({ msg: error.message });
        }
    }
    

    // Validamos que el descuento no sea mayor a 100% ni menor a 0%
    if(descuentoTemporada < 0 && descuentoTemporada > 100){
        const error = new Error("Descuento inválido");  /* Mensaje faltante */
        return res.status(400).json({ msg: error.message });
    }

    try {
        // Guardamos la nueva temporada
        const temporada = new Temporada({nombreTemporada, descrTemporada, descuentoTemporada, fecInit, fecEnd});
        await temporada.save();

        // Modificamos productos
        for (let index = 0; index < productosMod.length; index++) {
            nombreProducto = productosMod[index];
            const producto3 = await Producto.findOne({ nombreProducto });
            // Verificamos qué descuento se elige para el producto
            producto3.temporadaProducto.push(temporada._id);
            const seasons = producto3.temporadaProducto;
            // Obtenemos la fecha actual
            let date = new Date();
            const currentTime = date.valueOf();
            for (let i = 0; i < seasons.length; i++) {
                // Encontramos la temporada por su id
                let id = seasons[i];
                const temp = await Temporada.findById(id);
                // Definimos fecha de inicio
                date = temp.fecInit;
                const init = date.valueOf();
                // Definimos fecha de término
                date = temp.fecEnd;
                const end = date.valueOf();
                if(currentTime > init && currentTime < end){
                    producto3.descuentoProducto = temp.descuentoTemporada;
                    producto3.precioDescuento = producto3.precioProducto - (producto3.descuentoProducto * producto3.precioProducto)/100;
                    break;
                }
            }
            await producto3.save();
        }

        // Verificamos que no existan modificaciones en carritos de compras (para ambos productos)
        for (let index = 0; index < productosMod.length; index++) {
            nombreProducto = productosMod[index];
            const producto3 = await Producto.findOne({ nombreProducto });
            let clientes = await Cliente.find({ 'carritoCompras.producto_C': nombreProducto });
            for (let i = 0; i < clientes.length; i++) {
                let emailCliente = clientes[i].emailCliente;
                const clienteAModificar = await Cliente.findOne({ emailCliente });
                let compras = clienteAModificar.carritoCompras;
                for (let j = 0; j < compras.length; j++) {
                    if(compras[j].producto_C == nombreProducto){
                        compras[j].totalParcial_C = producto3.precioDescuento * compras[j].cantidad_C;
                    }
                }
                await clienteAModificar.save();
            }
        }

        res.json({
            msg: "La temporada ha sido creada con éxito"
        });
    } catch (error) {
        console.log(error);
    }
};

const modificarTemporada = async (req, res) => {
    // Autenticación del administrador
    let emailAdministrador;
    emailAdministrador = req.administrador.emailAdministrador;
    const admin = await Administrador.findOne({ emailAdministrador });
    if(admin.isAdmin == false){
        const error = new Error("Este usuario no es administrador"); /* Mensaje faltante */
        return res.status(403).json({msg: error.message});
    }

    let { nombreTemporada,
            newName,
            flores,
            peluches,
            descrTemporada,
            descuentoTemporada,
            fecInit,
            fecEnd } = req.body;
    const temporadaAModificar = await Temporada.findOne({ nombreTemporada });

    // Validamos si existe la temporada
    if(!temporadaAModificar){
        const error = new Error("Temporada no registrada"); /* Mensaje faltante */
        return res.status(403).json({msg: error.message});
    }

    // Verificar que no haya conflictos al nombrar
    if(nombreTemporada != newName){
        nombreTemporada = newName;
        const existeTemporada = await Temporada.findOne({ nombreTemporada });
        if(existeTemporada){
            const error = new Error("Esta temporada ya existe"); /* Mensaje faltante */
            return res.status(403).json({msg: error.message});
        }
    }

    // Verificamos si los productos son o no peluches o flores
    let nombreProducto;
    let productosMod = [];
    if(peluches.length > 0){
        for (let index = 0; index < peluches.length; index++) {
            nombreProducto = peluches[index];
            productosMod.push(nombreProducto);
            const producto1 = await Producto.findOne({ nombreProducto });
            if(!producto1){
                const error = new Error("El producto no existe");
                return res.status(404).json({ msg: error.message });
            }
            if(producto1.tipoProducto != "Peluche"){
                const error = new Error("El tipo de producto no coincide");
                return res.status(400).json({ msg: error.message });
            }
        }
    }
    if(flores.length > 0){
        for (let index = 0; index < flores.length; index++) {
            nombreProducto = flores[index];
            productosMod.push(nombreProducto);
            const producto2 = await Producto.findOne({ nombreProducto });
            if(!producto2){
                const error = new Error("El producto no existe");
                return res.status(404).json({ msg: error.message });
            }
            if(producto2.tipoProducto != "Flor"){
                const error = new Error("El tipo de producto no coincide");
                return res.status(400).json({ msg: error.message });
            }
        }
    }

    // Validamos que el descuento no sea mayor a 100% ni menor a 0%
    if(descuentoTemporada < 0 && descuentoTemporada > 100){
        const error = new Error("Descuento inválido");  /* Mensaje faltante */
        return res.status(400).json({ msg: error.message });
    }

    // Actualizamos información
    try {
        // Actualizaciones sencillas
        temporadaAModificar.nombreTemporada = nombreTemporada;
        temporadaAModificar.descrTemporada = descrTemporada;
        temporadaAModificar.fecInit = fecInit;
        temporadaAModificar.fecEnd = fecEnd;
        // Actualizaciones complejas
        temporadaAModificar.descuentoTemporada = descuentoTemporada;
        await temporadaAModificar.save();
        // Agregamos temporada a los productos
        for (let index = 0; index < productosMod.length; index++) {
            nombreProducto = productosMod[index];
            const producto3 = await Producto.findOne({ nombreProducto });
            // Verificamos qué descuento se elige para el producto
            const seasons = producto3.temporadaProducto;
            let flag0 = false;
            for (let x = 0; x < seasons.length; x++) {
                if(seasons[x].equals(temporadaAModificar._id)){
                    flag0 = true;
                }
            }
            if(flag0 == false){
                producto3.temporadaProducto.push(temporadaAModificar._id);
            }
            await producto3.save();
        }
        // Hallamos y modificamos los productos que ya tienen la temporada
        const id = temporadaAModificar._id;
        const productos = await Producto.find({ "temporadaProducto": id });
        for (let index = 0; index < productos.length; index++) {
            const producto = await Producto.findOne({ _id: productos[index] });
            // Reinicio del descuento
            if(producto.temporadaProducto.length < 1){
                producto.descuentoProducto = 0;
                producto.precioDescuento = producto.precioProducto;
            }
            else{
                let flag = false;
                const seasons = producto.temporadaProducto;
                // Obtenemos la fecha actual
                let date = new Date();
                const currentTime = date.valueOf();
                for (let k = 0; k < seasons.length; k++) {
                    // Encontramos la temporada por su id
                    let id = seasons[k];
                    const temp = await Temporada.findById(id);
                    // Definimos fecha de inicio
                    date = temp.fecInit;
                    const init = date.valueOf();
                    // Definimos fecha de término
                    date = temp.fecEnd;
                    const end = date.valueOf();
                    if(currentTime > init && currentTime < end){
                        producto.descuentoProducto = temp.descuentoTemporada;
                        producto.precioDescuento = producto.precioProducto - (producto.descuentoProducto * producto.precioProducto)/100;
                        flag = true
                        break;
                    }
                    if(flag == false){
                        producto.descuentoProducto = 0;
                        producto.precioDescuento = producto.precioProducto;
                    }
                }
            }
            await producto.save();

            // Actualizamos los precios del producto en cualquier carrito de compras
            nombreProducto = producto.nombreProducto;
            const clientes = await Cliente.find({ 'carritoCompras.producto_C': nombreProducto });
            for (let i = 0; i < clientes.length; i++) {
                let emailCliente = clientes[i].emailCliente;
                const clienteAModificar = await Cliente.findOne({ emailCliente });
                console.log(clienteAModificar);
                let compras = clienteAModificar.carritoCompras;
                for (let j = 0; j < compras.length; j++) {
                    if(compras[j].producto_C == producto.nombreProducto){
                        compras[j].totalParcial_C = producto.precioDescuento * compras[j].cantidad_C;
                    }
                }
                await clienteAModificar.save();
            }
        }
        // await temporadaAModificar.save();
        res.json({msg: "Se ha modificado la temporada"});  /* Mensaje faltante */
    } catch (error) {
        console.log(error);
    }
}

const verTemporada = async (req, res) => {
    // Autenticación del administrador
    let emailAdministrador;
    emailAdministrador = req.administrador.emailAdministrador;
    const admin = await Administrador.findOne({ emailAdministrador });
    if(admin.isAdmin == false){
        const error = new Error("Este usuario no es administrador"); /* Mensaje faltante */
        return res.status(403).json({msg: error.message});
    }

    const { nombreTemporada } = req.body;

    // Validamos si existe la temporada
    const temporada = await Temporada.findOne({ nombreTemporada });
    if(!temporada){
        const error = new Error("Temporada no registrada"); /* Mensaje faltante */
        return res.status(403).json({msg: error.message});
    }

    // Ver temporada
    try {
        res.json(temporada);
    } catch (error) {
        console.log(error);
    }
}

const eliminarTemporada = async (req, res) => {
    // Autenticación del administrador
    let emailAdministrador;
    emailAdministrador = req.administrador.emailAdministrador;
    const admin = await Administrador.findOne({ emailAdministrador });
    if(admin.isAdmin == false){
        const error = new Error("Este usuario no es administrador"); /* Mensaje faltante */
        return res.status(403).json({msg: error.message});
    }

    const { nombreTemporada } = req.body;
    const temporada = await Temporada.findOne({ nombreTemporada });

    // Validamos si existe la temporada
    if(!temporada){
        const error = new Error("Temporada no registrada"); /* Mensaje faltante */
        return res.status(403).json({msg: error.message});
    }

    // Eliminamos la temporada
    try {
        // Primero, eliminamos toda aparición de dicha temporada en toda la colección de productos
        // Seguido, reiniciamos los descuentos
        const id = temporada._id;
        const productos = await Producto.find({ "temporadaProducto": id });
        let temp = [];
        for (let index = 0; index < productos.length; index++) {
            const producto = await Producto.findOne({ _id: productos[index] });
            // Removemos la temporada del arreglo
            temp = producto.temporadaProducto;
            let newTemp = []
            for (let i = 0; i < temp.length; i++) {
                if(!temp[i].equals(id)){
                    newTemp.push(temp[i]);
                }
                // console.log(id);
                // console.log(temp[i]);
            }
            producto.temporadaProducto = newTemp;
            // Reinicio del descuento
            if(producto.temporadaProducto.length < 1){
                producto.descuentoProducto = 0;
                producto.precioDescuento = producto.precioProducto;
            }
            else{
                let flag = false;
                const seasons = producto.temporadaProducto;
                // Obtenemos la fecha actual
                let date = new Date();
                const currentTime = date.valueOf();
                for (let k = 0; k < seasons.length; k++) {
                    // Encontramos la temporada por su id
                    let id = seasons[k];
                    const temp = await Temporada.findById(id);
                    // Definimos fecha de inicio
                    date = temp.fecInit;
                    const init = date.valueOf();
                    // Definimos fecha de término
                    date = temp.fecEnd;
                    const end = date.valueOf();
                    if(currentTime > init && currentTime < end){
                        producto.descuentoProducto = temp.descuentoTemporada;
                        producto.precioDescuento = producto.precioProducto - (producto.descuentoProducto * producto.precioProducto)/100;
                        flag = true
                        break;
                    }
                    if(flag == false){
                        producto.descuentoProducto = 0;
                        producto.precioDescuento = producto.precioProducto;
                    }
                }
            }
            await producto.save();
            
            // Actualizamos los precios del producto en cualquier carrito de compras
            let nombreProducto = producto.nombreProducto;
            const clientes = await Cliente.find({ 'carritoCompras.producto_C': nombreProducto });
            for (let i = 0; i < clientes.length; i++) {
                let emailCliente = clientes[i].emailCliente;
                const clienteAModificar = await Cliente.findOne({ emailCliente });
                let compras = clienteAModificar.carritoCompras;
                for (let j = 0; j < compras.length; j++) {
                    if(compras[j].producto_C == nombreProducto){
                        compras[j].totalParcial_C = producto.precioDescuento * compras[j].cantidad_C;
                    }
                }
                await clienteAModificar.save();
            }
        }
        // Finalmente, eliminamos el documento que contiene la temporada
        await temporada.deleteOne();
        res.json({msg: "Se ha eliminado la temporada correctamente"});
    } catch (error) {
        console.log(error);
    }
}

const mostrarTemporadas = async (req, res) => {
    try {
        const documentos = await Temporada.find();
        res.json({ seasons: documentos });
    } catch (error) {
        console.log(error);
    }
}

export { registroTemporada,
        modificarTemporada,
        verTemporada,
        eliminarTemporada,
        mostrarTemporadas };
