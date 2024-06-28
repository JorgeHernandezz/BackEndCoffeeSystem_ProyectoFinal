import jwt from "jsonwebtoken";
import Administrador from "../modelos/administrador.js";

const checkAuthAdmin = async (req, res, next) => {
    let token;
    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ){
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.administrador = await Administrador.findById(decoded.id).select(
                "-nombreAdministrador -passwordAdministrador -telefonoAdministrador -tokenAdministrador"
            );
        } catch (error) {
            return res.status(404).json({
                msg: "Hubo un error"
            });
        }
    }

    if(!token){
        const error = new Error("Token de administrador no válido");
        return res.status(401).json({
            msg: error.message
        });
    }

    return next();
}

export default checkAuthAdmin;
