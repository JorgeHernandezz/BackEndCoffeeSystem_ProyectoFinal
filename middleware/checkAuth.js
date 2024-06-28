import jwt from "jsonwebtoken";
import Cliente from "../modelos/cliente.js";


const checkAuth = async (req, res, next) => {
    let token;
    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ){
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.cliente = await Cliente.findById(decoded.id).select(
                "-passwordCliente -token -createdAt -updatedAt -__v -telefonoCliente -isAdmin -pedidosCliente -direccionCliente -tarjetaCliente"
            );
        } catch (error) {
            return res.status(404).json({
                msg: "Hubo un error"
            });
        }
    }

    if(!token){
        const error = new Error("Token de usuario no válido");
        return res.status(401).json({
            msg: error.message
        });
    }

    return next();
}

export default checkAuth;
