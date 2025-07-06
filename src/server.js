import 'dotenv/config';
import express from "express";
import cors from "cors";
import pinoHttp from 'pino-http';

import { contact } from './services/contacts.js';

const logger = pinoHttp();
const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(logger);

export default function setupServer() {
    app.get("/contacts", async (req, res) => {
        const contacts = await contact.find();
        res.json({
            status: 200,
            message: "Successfully found contacts!",
            data: contacts,
        });
    });

    app.get("/contacts/:contactId", async (req, res) => {
        // const id = parseInt(req.params.contactId, 10); якщо потрібно перетворити id в Number
        const contacts = await contact.findById(req.params.contactId);

        if (contacts === null) {
            return res.status(404).json({ status: 404, message: 'Contact not found' });
        }

        res.json({
            status: 200,
            message: `Successfully found contact with id: ${req.params.contactId}!`,
            data: contacts
        });
    });

    app.use((req, res, next) => {
        res.status(404).json({ status: 404, message: 'Not Faund' });
    });

    app.listen(
        PORT || 3000,
        (error) => {
            if (error) {
                throw error;
            }

            console.log(`Server is running on port ${PORT}`);
        });
}
