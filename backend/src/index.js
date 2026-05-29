
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/configDb.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Backend funcionandoo");
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
