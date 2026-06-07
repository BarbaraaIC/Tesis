import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/configDb.js";
import routes from "./routes/index.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', routes);

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Backend funcionando");
});

async function start() {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en puerto ${PORT}`);
    });
}

start();