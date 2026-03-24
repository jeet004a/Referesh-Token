import mongoose from "mongoose";
import configList from "./config.js";
export const connectDB = async () => {
    await mongoose.connect(configList.MONGO_URI)
    console.log('Database connected successfully')
}
