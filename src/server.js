import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Impor semua modul rute
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/users.routes.js";
import articleRoutes from "./routes/articles.routes.js";
import plantRoutes from "./routes/plants.routes.js";
import eventRoutes from "./routes/events.routes.js";
import userEventRoutes from "./routes/userEvents.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import plantTypeRoutes from "./routes/plantType.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import pageRoutes from "./routes/page.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

dotenv.config();

const app = express();
const PORT = 3009;

// ▼▼▼ TAMBAHKAN BARIS INI ▼▼▼
// Memberitahu Express untuk mempercayai header dari reverse proxy (penting untuk HTTPS)
app.set('trust proxy', 1);
// ▲▲▲ AKHIR PERUBAHAN ▲▲▲

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- MIDDLEWARE DASAR ---
app.use(cors({
    origin: true,
    credentials: true,
}));

app.use(express.json());

app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});

// --- MENYAJIKAN FILE STATIK ---
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// --- RUTE-RUTE API ---
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/articles/management", articleRoutes);
app.use("/api/plants/management", plantRoutes);
app.use("/api/events/management", eventRoutes);
app.use("/api/events", userEventRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/plant-types", plantTypeRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api", pageRoutes);

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res
        .status(500)
        .json({ error: "Something went wrong!", message: err.message });
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});