import 'dotenv/config';
import mongoose from "mongoose";

const { MONGODB_USER, MONGODB_PASSWORD, MONGODB_URL, MONGODB_DB } = process.env;

const mongoURI = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_URL}/${MONGODB_DB}?retryWrites=true&w=majority`;

// const MONGODB_URL = process.env.MONGODB_URL;

export default async function initMongoConnection() {
    await mongoose.connect(mongoURI);
    console.log("Mongo connection successfully established!");
}
