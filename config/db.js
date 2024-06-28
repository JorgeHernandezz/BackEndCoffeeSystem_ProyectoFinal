import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(
            'mongodb+srv://webclient74:CRx3w5Zk1D1HWlHV@coffeesystem.4ulrkzk.mongodb.net/', {
            //process.env.MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
            );
        const url = `${connection.connection.host}:${connection.connection.port}`;
        console.log(`MongoDB se encuentra conectado en ${url}`);
    } catch (error) {
        console.log(`error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
