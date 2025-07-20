import 'dotenv/config';
import express from "express";
import cors from "cors";
import pinoHttp from 'pino-http';
import contactsRouter from './routers/contacts.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';


// const logger = pinoHttp();
const app = express();
const PORT = process.env.PORT;

app.use(cors());
// app.use(logger);
app.use(express.json());

export default function setupServer() {
    app.use('/contacts', contactsRouter);
    app.use(notFoundHandler);
    app.use(errorHandler);


    app.listen(
        PORT || 3000,
        (error) => {
            if (error) {
                throw error;
            }

            console.log(`Server is running on port ${PORT}`);
        });
}
