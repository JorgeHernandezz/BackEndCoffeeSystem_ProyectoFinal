import mongoose, { Schema } from "mongoose";

// Creación del esquema del documento embebido Detalles
const detallesSchema = mongoose.Schema({
    _id : false,
    producto_P: {
        type: String,
        trim: true,
    },
    cantidad_P: {
        type: Number,
        trim: true,
    },
    totalParcial_P: {
        type: Number,
        trim: true,
    },
    img_P: {
        type: String,
        trim: true,
    }
});

// Creación del esquema del documento embebido Destino
const destinoSchema = mongoose.Schema({
    _id : false,
    /* delegacion: {
        type: String,
        trim: true,
    }, */
    codigoPostal_P: {
        type: String,
        trim: true,
    },
    colonia_P: {
        type: String,
        trim: true,
    },
    calle_P: {
        type: String,
        trim: true,
    },
    numInt_P: {
        type: String,
        trim: true,
    },
    numExt_P: {
        type: String,
        trim: true,
    }
});

// Creación del esquema del documento embebido Tarjeta de Pago
const tarjetaPagoSchema = mongoose.Schema({
    _id : false,
    numTarjeta_P: {
        type: String,
        trim: true,
    },
    fechaVencimiento_P: {
        type: String,
        trim: true,
    },
    cvv_P: {
        type: String,
        trim: true,
    }
});

// Creación del esquema de la colección Pedidos
const pedidosSchema = mongoose.Schema({
    nombrePedido: {
        type: String,
        trim: true,
    },
    clientePedido:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cliente", /* Referencia del cliente que hizo el pedido */
        trim: true, 
    },
    fechaPedido: {
        type: Date,
        trim: true,
        default: () => new Date(),
    },
    fechaCompra: {
        type: Date,
        trim: true,
    },
    fechaEnvio: {
        type: Date,
        trim: true,
    },
    fechaEntrega: {
        type: Date,
        trim: true,
        default: () => {
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() + 4);
            return currentDate;
          },
    },
    fechaLimiteDev: {
        type: Date,
        trim: true,
        default: () => {
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() + 15);
            return currentDate;
          },
    },
    fechaCancelacion: {
        type: Date,
        trim: true,
    },
    totalArticulos: {
        type: Number,
        trim: true,
        default: 0,
    },
    costoArticulos: {
        type: Number,
        trim: true,
        default: 0,
    },
    costoEnvio: {
        type: Number,
        trim: true,
        default: 0,
    },
    costoTotal: {
        type: Number,
        trim: true,
        default: 0,
    },
    isStarted: {
        type: Boolean,
        trim: true,
        default: true,
    },
    isFinished: {
        type: Boolean,
        trim: true,
        default: false,
    },
    // Estatus de la entrega
    deliverStatus: {
        type: String,
        trim: true,
        default: "",
    },
    // -----
    isPaid: {
        type: Boolean,
        trim: true,
        default: false,
    },
    isCancelled: {
        type: Boolean,
        trim: true,
        default: false,
    },
    // Estatus de la devolución
    returnStatus: {
        type: String,
        trim: true,
        default: "",
    },
    // -----
    returnMotif: {
        type: String,
        trim: true,
    },
    metodoPago: {
        type: String,
        trim: true,
    },
    metodoEntrega: {
        type: String,
        trim: true,
    },
    detallesPedido: {
        type: [detallesSchema],
    },
    destinoPedido: {
        type: destinoSchema,
    },
    tarjetaPedido: {
        type: tarjetaPagoSchema,
    }
});

// Creación del modelo
const Pedido = mongoose.model("Pedido", pedidosSchema);
export default Pedido;
