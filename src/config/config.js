import { config } from "dotenv";
config()

if (!process.env.MONGO_URI) {
    throw new Error("Mongo URI is not defined in env variables");

}

if (!process.env.JWT_SECRET) {
    throw new Error("JWT Secret is not defined in env variables");

}


const configList = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET
}

export default configList