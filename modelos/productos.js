import mongoose, { Schema } from "mongoose";

// Creación del esquema del documento embebido Comentarios
const commentsSchema = mongoose.Schema({
    _id: false,
    commentEmail: {
        type: String,
        trim: true,
    },
    commentUsername: {
        type: String,
        trim: true,
    },
    commentContent: {
        type: String,
        trim: true,
    }
});

// Creación del esquema del documento embebido Valoraciones
const scoresSchema = mongoose.Schema({
    _id: false,
    scoreEmail: {
        type: String,
        trim: true,
    },
    scoreUsername: {
        type: String,
        trim: true,
    },
    scoreContent: {
        type: Number,
        trim: true,
    }
});

// Creación del esquema de la colección Productos
const productosSchema = mongoose.Schema({
    nombreProducto: {
        type: String,
        trim: true,
        required: true,
    },
    descrProducto: {
        type: String,
        trim: true,
        required: true,
    },
    tipoProducto: {
        type: String,
        trim: true,
        required: true,
    },
    precioProducto: {
        type: Number,
        trim: true,
        required: true,
    },
    cantidadInv: {
        type: Number,
        trim: true,
        required: true,
    },
    statusProducto: {
        type: String,
        trim: true,
        // required: true,
    },
    descuentoProducto: {
        type: Number,
        trim: true,
        default: 0
    },
    precioDescuento: {
        type: Number,
        trim: true,
    },
    imagenProducto: {
        type: [String],
        trim: true,
    },
    categoriaProducto: {
        type: String,
        trim: true,
        required: true,
    },
    temporadaProducto: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Temporada", /* Estas temporadas tendrán un tipo ObjectId para llamar por referencia */
        trim: true, 
    },
    valoracionesProducto: {
        type: [scoresSchema],
    },
    valoracionGlobal: {
        type: Number,
        trim: true,
        default: 0,
    },
    comentariosProducto: {
        type: [commentsSchema],
    }
});

// Creación del modelo
const Producto = mongoose.model("Producto", productosSchema);
export default Producto;
