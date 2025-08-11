import path from 'node:path';
import 'dotenv/config';
import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import router from './routers/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { swaggerDocs } from './middlewares/swaggerDocs.js';


const logger = pinoHttp();
// const app = express();
const PORT = process.env.PORT;

// app.use(cors());

// app.use(express.json());
// app.use(cookieParser());

export default function setupServer() {
    const app = express();
    app.use(cors());
    app.use(logger);
    app.use(express.json());
    app.use(cookieParser());
    // app.use('/uploads', express.static(UPLOAD_DIR));
    app.use('/api-docs', swaggerDocs());
    app.use('/photo', express.static(path.resolve('src/uploads/photo')));
    // app.use('/contacts', contactsRouter);
    app.use(router);
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
