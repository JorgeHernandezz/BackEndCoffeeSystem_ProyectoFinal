import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

// Creación del esquema del documento embebido Direccion
const direccionSchema = mongoose.Schema({
    _id : false,
    /* delegacion: {
        type: String,
        trim: true,
    }, */
    codigoPostal: {
        type: String,
        trim: true,
    },
    colonia: {
        type: String,
        trim: true,
    },
    calle: {
        type: String,
        trim: true,
    },
    numInt: {
        type: String,
        trim: true,
    },
    numExt: {
        type: String,
        trim: true,
    },
    referencia1: {
        type: String,
        trim: true,
    },
    referencia2: {
        type: String,
        trim: true,
    },
    indicacionesAd: {
        type: String,
        trim: true,
    }
});

// Creación del esquema del documento embebido Tarjeta
const tarjetaSchema = mongoose.Schema({
    _id : false,
    numTarjeta: {
        type: String,
        trim: true,
    },
    fechaVencimiento: {
        type: String,
        trim: true,
    },
    cvv: {
        type: String,
        trim: true,
    },
    titularTarjeta: {
        type: String,
        trim: true,
    },
});

// Creación del esquema del documento embebido CarritoCompras
const carritoComprasSchema = mongoose.Schema({
    _id : false,
    producto_C: {
        type: String,
        trim: true,
    },
    cantidad_C: {
        type: Number,
        trim: true,
    },
    totalParcial_C: {
        type: Number,
        trim: true,
    },
    copiaInv_C: {
        type: Number,
        trim: true
    },
    img_C: {
        type: String,
        trim: true
    }
});

// Creación del esquema del documento embebido Favoritos
const favoritosSchema = mongoose.Schema({
    _id : false,
    idFav: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Producto", /* Referencia del producto favorito del cliente */
        trim: true, 
    },
    productoFav: {
        type: String,
        trim: true,
    },
    descrFav: {
        type: String,
        trim: true,
    },
    imgFav: {
        type: String,
        trim: true,
    }
});


// Creación del esquema de la colección Cliente -----
const clienteSchema = mongoose.Schema({
    nombreCliente: {
        type: String,
        required: true,
        trim: true,
    },
    apellidoCliente: {
        type: String,
        required: true,
        trim: true,
    },
    usernameCliente: {
        type: String,
        required: true,
        trim: true,
    },
    passwordCliente: {
        type: String,
        required: true,
        trim: true,
    },
    emailCliente: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    telefonoCliente: {
        type: String,
        // required: true,
        trim: true,
    },
    isConfirmed: {
        type: Boolean,
        default: false,
    },
    direccionCliente: {
        type: [direccionSchema],
    },
    tarjetaCliente: {
        type: [tarjetaSchema],
    },
    pedidosCliente: {
        type: [String],
        trim: true,
    },
    entregadosCliente: {
        type: [String],
        trim: true,
    },
    carritoCompras: {
        type: [carritoComprasSchema],
    },
    favoritos: {
        type: [favoritosSchema],
        trim: true,
    },
    tokenCliente: {
        type: String,
    }
}, {
    timestamps: true,
});

// Hasheamos la contraseña del cliente
clienteSchema.pre('save', async function(next){
    if(!this.isModified("passwordCliente")){
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.passwordCliente = await bcrypt.hash(this.passwordCliente, salt);
});

// Creamos un método que ayuda a comparar la contraseña del usuario
clienteSchema.methods.comprobarPassword = async function(passwordFormulario){
    return await bcrypt.compare(passwordFormulario, this.passwordCliente);
}

// Creación del modelo
const Cliente = mongoose.model("Cliente", clienteSchema);
export default Cliente;
