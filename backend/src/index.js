import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/configDb.js";
import routes from "./routes/index.routes.js";
import webhookWhatsApp from "./routes/whatsappWebhook.routes.js";
import { iniciarRecordatorios } from "./services/recordatorio.service.js";

const app = express();

app.use("/webhook", webhookWhatsApp);

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

iniciarRecordatorios();
start();