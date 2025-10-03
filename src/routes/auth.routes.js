// routes/auth.routes.js

import { Router } from "express";
import {
	registerUser, // Nama diubah untuk konsistensi
	registerJournalist,
	loginAdmin,
	loginJournalist,
	loginUser, // Nama diubah untuk konsistensi
	getProfile,
	logout,
} from "../controllers/auth.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Rute Registrasi
router.post("/register/user", registerUser); // Direvisi
router.post("/register/journalist", registerJournalist);

// Rute Login
router.post("/login/admin", loginAdmin);
router.post("/login/journalist", loginJournalist);
router.post("/login/user", loginUser); // Direvisi

// Rute Terproteksi
router.get("/me", authenticateToken, getProfile); // Direvisi
router.post("/logout", authenticateToken, logout);

export default router;
