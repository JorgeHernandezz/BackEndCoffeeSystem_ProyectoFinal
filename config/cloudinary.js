import { v2 as cloudinary } from 'cloudinary';

// Configuración de Cloudinary
const cldConfig = () => {
    cloudinary.config({
        cloud_name: process.env.CLD_N,
        api_key: process.env.APK,
        api_secret: process.env.APS
      });
}

export default cldConfig
