import Producto from "../modelos/productos.js";
import Administrador from "../modelos/administrador.js"
import Cliente from "../modelos/cliente.js";
import Pedido from "../modelos/pedidos.js";
// import Temporada from "../modelos/temporadas.js";
import { v2 as cloudinary } from 'cloudinary';

const verProductoPorNombre = async (req, res) => {
    const { nombreProducto } = req.params;  // Cambiado de req.body a req.params
    try {
        const producto = await Producto.findOne({ nombreProducto: nombreProducto });
        if (!producto) {
            return res.status(404).json({ msg: "Producto no encontrado" });
        }
        res.json(producto);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Error al obtener el producto" });
    }
};


const actualizarProductoPorNombre = async (req, res) => {
    const { nombreProducto } = req.params;
    const datosActualizados = req.body;

    try {
        const producto = await Producto.findOneAndUpdate(
            { nombreProducto: nombreProducto },
            { $set: datosActualizados },
            { new: true }
        );
        if (!producto) {
            return res.status(404).json({ msg: "Producto no encontrado" });
        }
        res.json({ msg: "Producto actualizado exitosamente", producto });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Error al actualizar el producto" });
    }
};





const eliminarProductoPorNombre = async (req, res) => {
    const { nombreProducto } = req.params;

    try {
        const producto = await Producto.findOneAndDelete({ nombreProducto: nombreProducto });
        if (!producto) {
            return res.status(404).json({ msg: "Producto no encontrado" });
        }
        res.json({ msg: "Producto eliminado exitosamente" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Error al eliminar el producto" });
    }
};













//Registro de productos en la base de datos
const registroProducto = async(req, res) => {
    // Autenticación del administrador
    let emailAdministrador;
    emailAdministrador = req.administrador.emailAdministrador;
    const admin = await Administrador.findOne({ emailAdministrador });
    if(admin.isAdmin == false){
        const error = new Error("Este usuario no es administrador"); /* Mensaje faltante */
        return res.status(403).json({msg: error.message});
    }

    // Evitar productos duplicados
    const { nombreProducto,
            descrProducto,
            tipoProducto,
            precioProducto,
            categoriaProducto,
            cantidadInv,
            descuentoProducto,
            imagenes } = req.body;
    const existeProducto = await Producto.findOne({ nombreProducto });

    // Validamos que el producto no exista
    if(existeProducto){
        const error = new Error("Producto ya registrado");  /* Mensaje faltante */
        return res.status(400).json({ msg: error.message});
    }

    // Validamos que el tipo de producto sea valido
    if (tipoProducto !== "Flor" && tipoProducto !== "Peluche") {
        const error = new Error("Tipo de producto inválido");   /* Mensaje faltante */
        return res.status(403).json({ msg: error.message });
    }

    // Validamos que la cantidad de imágenes sea correcta
    if(imagenes.length < 3){
        const error = new Error("Cantidad de imágenes insuficiente");   /* Mensaje faltante */
        return res.status(403).json({ msg: error.message});
    }

    try{
        const producto = new Producto({nombreProducto,
                                        descrProducto,
                                        tipoProducto,
                                        precioProducto,
                                        categoriaProducto,
                                        cantidadInv,
                                        descuentoProducto});
        producto.precioDescuento = producto.precioProducto - (producto.descuentoProducto * producto.precioProducto)/100;
        // Determinamos el Status del producto
        if(producto.cantidadInv > 30){
            producto.statusProducto = "Disponible";
        }
        else if(producto.cantidadInv > 0){
            producto.statusProducto = "Pocos";
        }
        else{
            producto.statusProducto = "Agotado";
        }

        // Insertamos imagenes
        async function uploadImg(path){
            try {
                const result = await new Promise((resolve, reject) => {
                    cloudinary.uploader.upload(path, async (error, result) => {
                        if(error){
                            reject(error);
                        }
                        else{
                            resolve(result);
                            await producto.imagenProducto.push(result.public_id);
                            // Guardamos cambios
                            await producto.save();
                        }
                    });
                });
            } catch (error) {
                console.log(error);
            }
        }
        // Esperamos tiempo antes de subir todas las imágenes, una por una
        function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
          }
        for (let index = 0; index < imagenes.length; index++) {
            // await delay(50);
            await uploadImg(imagenes[index]);
            // await delay(50);
        }

        //Regresamos confirmacion
        res.json({
            msg: "Producto registrado exitosamente" /* Mensaje faltante */
        })
    }
    catch(error){
        console.log(error);
    }
};


const registroProductoPost = async (req, res) => {
    const { nombreProducto, descrProducto, tipoProducto, precioProducto, categoriaProducto, cantidadInv, descuentoProducto, imagenes } = req.body;

    try {
        // Verificar si el producto ya existe para evitar duplicados
        const existeProducto = await Producto.findOne({ nombreProducto });
        if (existeProducto) {
            return res.status(400).json({ msg: "El producto ya existe" });
        }

        // Crear nuevo producto
        const nuevoProducto = new Producto({
            nombreProducto,
            descrProducto,
            tipoProducto,
            precioProducto,
            categoriaProducto,
            cantidadInv,
            descuentoProducto: descuentoProducto || 0,  // El descuento es opcional
            imagenes
        });

        // Guardar el producto en la base de datos
        await nuevoProducto.save();
        res.status(201).json({ msg: "Producto registrado exitosamente", producto: nuevoProducto });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Error al registrar el producto" });
    }
};














const modificarProducto = async (req, res) => {
    // Autenticación del administrador
    let emailAdministrador;
    emailAdministrador = req.administrador.emailAdministrador;
    const admin = await Administrador.findOne({ emailAdministrador });
    if(admin.isAdmin == false){
        const error = new Error("Este usuario no es administrador"); /* Mensaje faltante */
        return res.status(403).json({msg: error.message});
    }
    
    let {nombreProducto,
        nuevoNombre,
        descrProducto,
        tipoProducto,
        precioProducto,
        cantidadInv,
        descuentoProducto,
        imagenesAdd,
        imagenesRem,
        categoriaProducto,} = req.body;
    
    const productoAModificar = await Producto.findOne({ nombreProducto });

    // Se confirma que exista el producto
    if(!productoAModificar){
        const error = new Error("Producto no registrado");  /* Mensaje faltante */
        return res.status(403).json({msg: error.message});
    }

    // Verificamos que no haya conflictos de nombre
    let oldName = nombreProducto;
    if(nombreProducto != nuevoNombre){
        nombreProducto = nuevoNombre;
        const existeProducto = await Producto.findOne({ nombreProducto });
        if(existeProducto){
            const error = new Error("Este producto ya existe"); /* Mensaje faltante */
            return res.status(403).json({msg: error.message});
        }
    }

    // Validamos que el tipo de producto sea valido
    if (tipoProducto !== "Flor" && tipoProducto !== "Peluche") {
        const error = new Error("Tipo de producto inválido");   /* Mensaje faltante */
        return res.status(403).json({ msg: error.message });
    }

    // Se verifica que se sigan existiendo como mínimo tres imágenes tras los cambios
    if(productoAModificar.imagenProducto.length + imagenesAdd.length - imagenesRem.length < 3){

        const error = new Error("Cantidad de imágenes insuficiente");   /* Mensaje faltante */
        return res.status(403).json({ msg: error.message});
    }

    // Se actualiza la informacion
    try{
        // Modificaciones simples
        productoAModificar.nombreProducto = nombreProducto;
        productoAModificar.descrProducto = descrProducto;
        productoAModificar.precioProducto = precioProducto;
        productoAModificar.cantidadInv = cantidadInv;
        productoAModificar.categoriaProducto = categoriaProducto;
        productoAModificar.descuentoProducto = descuentoProducto;
        productoAModificar.precioDescuento = precioProducto - (productoAModificar.descuentoProducto * precioProducto)/100;


        // Modificaciones complejas
        productoAModificar.tipoProducto = tipoProducto;

        // Determinamos el Status del producto
        if(productoAModificar.cantidadInv > 30){
            productoAModificar.statusProducto = "Disponible";
        }
        else if(productoAModificar.cantidadInv > 0){
            productoAModificar.statusProducto = "Pocos";
        }
        else{
            productoAModificar.statusProducto = "Agotado";
        }
        
        await productoAModificar.save();

        // Imágenes
        // ¿Se están añadiendo las imágenes?
        if(imagenesAdd.length != 0){
            async function uploadImg(path){
                try {
                    const result = await new Promise((resolve, reject) => {
                        cloudinary.uploader.upload(path, async (error, result) => {
                            if(error){
                                reject(error);
                            }
                            else{
                                resolve(result);
                                productoAModificar.imagenProducto.push(result.public_id);
                                // Guardamos cambios
                                await productoAModificar.save();
                            }
                        });
                    });
                } catch (error) {
                    console.log(error);
                }
            }
            function delay(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
              }
            for (let index = 0; index < imagenesAdd.length; index++) {
                uploadImg(imagenesAdd[index]);
                await delay(200);
            }
        }
        // ¿Se están eliminando las imágenes?
        if(imagenesRem.length != 0){
            // Aislamos las imágenes que se quieren eliminar
            let ogImg = productoAModificar.imagenProducto;
            console.log(ogImg);
            let delImg = [];
            for (let index = 0; index < imagenesRem.length; index++) {
                delImg.push(ogImg[imagenesRem[index]]);
            }

            // Guardamos sólo las imágenes que se quieren conservar
            let newImg = [];
            for (let i = 0; i < ogImg.length; i++) {
                let flag = 0;
                for (let j= 0; j < delImg.length; j++) {
                    if(ogImg[i] === delImg[j]){
                        flag = 1;
                        break;
                    } 
                }
                if(flag !== 1){
                    newImg.push(ogImg[i]);
                }
            }

            // Eliminamos las imágenes de la API Cloudinary, una por una
            async function removeImage(publicId) {
                try {
                  const result = await cloudinary.uploader.destroy(publicId);
                } catch (error) {
                    console.log(error);
                }
            }
            for (let index = 0; index < delImg.length; index++) {
                removeImage(delImg[index]);
            }

            console.log(delImg);
            console.log(newImg);

            // Subimos las imágenes restantes a la base de datos
            productoAModificar.imagenProducto = undefined;
            productoAModificar.imagenProducto = [...newImg];
            await productoAModificar.save();
        }

        // Revisamos que no haya cambios en algún carrito de compras
        // Especificamos que sólo se buscan carritos cuyo contenido incluya algún producto con el viejo nombre
        let clientes = await Cliente.find({ 'carritoCompras.producto_C': oldName });
        // console.log(clientes);
        for (let i = 0; i < clientes.length; i++) {
            let emailCliente = clientes[i].emailCliente;
            const clienteAModificar = await Cliente.findOne({ emailCliente });
            let compras = clienteAModificar.carritoCompras;
            for (let j = 0; j < compras.length; j++) {
                if(compras[j].producto_C == oldName){
                    compras[j].producto_C = productoAModificar.nombreProducto; 
                    compras[j].totalParcial_C = productoAModificar.precioDescuento * compras[j].cantidad_C; 
                    compras[j].copiaInv_C = productoAModificar.cantidadInv;
                    compras[j].img_C = productoAModificar.imagenProducto[0];
                }
            }
            await clienteAModificar.save();
        }
        // Revisamos que no haya cambios en favoritos
        clientes = await Cliente.find({ 'favoritos.productoFav': oldName });
        for (let i = 0; i < clientes.length; i++) {
            let emailCliente = clientes[i].emailCliente;
            const clienteAModificar = await Cliente.findOne({ emailCliente });
            let favoritos = clienteAModificar.favoritos;
            for (let j = 0; j < favoritos.length; j++) {
                if(favoritos[j].productoFav == oldName){
                    favoritos[j].productoFav = productoAModificar.nombreProducto; 
                    favoritos[j].descrFav = productoAModificar.descrProducto;
                    favoritos[j].imgFav = productoAModificar.imagenProducto[0];
                }
            }
            await clienteAModificar.save();
        }
        // Revisamos que no haya problemas con las fotos de los detalles de ningún pedido
        const imagen = productoAModificar.imagenProducto[0];
        const pedidos = await Pedido.find({ 'detallesPedido.img_P': imagen });
        for (let i = 0; i < pedidos.length; i++) {
            console.log(pedidos[i]);
            const nombrePedido = pedidos[i].nombrePedido;
            const pedido = await Pedido.findOne({ nombrePedido });
            console.log(pedido);
            pedido.detallesPedido.img_P = productoAModificar.imagenProducto[0];
            await pedido.save();
        }

        // Guardamos los cambios
        await productoAModificar.save();
        res.json({msg: "El cambio ha sido guardado con éxito"});
    }

    catch(error){
        console.log(error);
    }
}

const verProducto = async(req, res) => {
    // Autenticación del administrador
    let emailAdministrador;
    emailAdministrador = req.administrador.emailAdministrador;
    const admin = await Administrador.findOne({ emailAdministrador });
    if(admin.isAdmin == false){
        const error = new Error("Este usuario no es administrador"); /* Mensaje faltante */
        return res.status(403).json({msg: error.message});
    }

    const { nombreProducto } = req.body;
    // Se confirma que exista el producto
    const producto = await Producto.findOne({ nombreProducto });
    if(!producto){
        const error = new Error("Producto no registrado"); /* Mensaje faltante */
        return res.status(403).json({msg: error.message});
    }
    res.json(producto);
}

const eliminarProducto = async(req, res) => {
    // Autenticación del administrador
    let emailAdministrador;
    emailAdministrador = req.administrador.emailAdministrador;
    const admin = await Administrador.findOne({ emailAdministrador });
    if(admin.isAdmin == false){
        const error = new Error("Este usuario no es administrador"); /* Mensaje faltante */
        return res.status(403).json({msg: error.message});
    }
    
    const {nombreProducto} = req.body;

    const producto = await Producto.findOne({ nombreProducto });

    if(!producto){
        const error = new Error("Producto no registrado");
        return res.status(403).json({msg: error.message});
    }

    try {
        async function removeImage(publicId) {
            try {
              const result = await cloudinary.uploader.destroy(publicId);
            } catch (error) {
                console.log(error);
            }
        }

        // Eliminamos las imágenes del producto de Cloudinary, una por una
        let arrImg = producto.imagenProducto;
        for (let index = 0; index < arrImg.length; index++) {
            removeImage(arrImg[index]);
        }

        // Borramos cualquier instancia del producto en cualquier carrito de compras
        // Especificamos que sólo se buscan carritos cuyo contenido incluya algún producto con el viejo nombre
        const clientes = await Cliente.find({ 'carritoCompras.producto_C': nombreProducto });
        for (let i = 0; i < clientes.length; i++) {
            let emailCliente = clientes[i].emailCliente;
            const clienteAModificar = await Cliente.findOne({ emailCliente });
            let compras = clienteAModificar.carritoCompras;
            let newCompras = [];
            for (let j = 0; j < compras.length; j++) {
                if(compras[j].producto_C != nombreProducto){
                    newCompras.push(compras[j]);
                }
            }
            clienteAModificar.carritoCompras = newCompras;
            await clienteAModificar.save();
        }

        await producto.deleteOne();
        res.json({msg: "Producto eliminado"});
    } catch (error) {
        console.log(error)
    }
}

const mostrarProductos = async (req, res) => {
    try {
        const documentos = await Producto.find();
        res.json({ products: documentos });
    } catch (error) {
        console.log(error);
    }
}

const mostrarFlores = async (req, res) => {
    try {
        // Especificamos que sólo se buscan flores
        const flores = { tipoProducto: "Flor" };

        const documentos = await Producto.find(flores);
        res.json({ fleurs: documentos });
    } catch (error) {
        console.log(error);
    }
}

const mostrarPeluches = async (req, res) => {
    try {
        // Especificamos que sólo se buscan peluches
        const peluches = { tipoProducto: "Peluche" };

        const documentos = await Producto.find(peluches);
        res.json({ plushies: documentos });
    } catch (error) {
        console.log(error);
    }
}

export{registroProducto,
    verProducto,
    modificarProducto,
    eliminarProducto,
    mostrarProductos,
    mostrarFlores,
    verProductoPorNombre,
    actualizarProductoPorNombre,
    eliminarProductoPorNombre,
    registroProductoPost,
    mostrarPeluches
};