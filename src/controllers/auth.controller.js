// controllers/auth.controller.js

import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// REVISI: Fungsi validasi sekarang mengembalikan error, bukan mengirim response.
const validateInput = (data) => {
	const { name, email, password } = data;
	const isRegister = name !== undefined;

	if (isRegister && (!name || !email || !password)) {
		return { status: 400, error: "Nama, email, dan password wajib diisi" };
	}
	if (!isRegister && (!email || !password)) {
		return { status: 400, error: "Email dan password wajib diisi" };
	}
	if (!/\S+@\S+\.\S+/.test(email)) {
		return { status: 400, error: "Format email tidak valid" };
	}
	if (password && password.length < 8) {
		return { status: 400, error: "Password minimal harus 8 karakter" };
	}
	return null; // Valid
};

// Fungsi helper untuk registrasi
const handleRegistration = async (req, res, role) => {
	const validationError = validateInput(req.body);
	if (validationError) {
		return res
			.status(validationError.status)
			.json({ error: validationError.error });
	}

	const { name, email, password } = req.body;
	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		const user = await prisma.user.create({
			data: { name, email, password: hashedPassword, role },
		});
		delete user.password;
		res
			.status(201)
			.json({ message: `Registrasi ${role.toLowerCase()} berhasil`, user });
	} catch (error) {
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2002"
		) {
			return res.status(409).json({ error: "Email ini sudah terdaftar." });
		}
		console.error(`Register ${role} error:`, error);
		res
			.status(500)
			.json({ error: `Gagal mendaftarkan ${role.toLowerCase()}.` });
	}
};

// REVISI: Menggunakan nama fungsi yang konsisten dengan route
export const registerUser = (req, res) => handleRegistration(req, res, "USER");
export const registerJournalist = (req, res) =>
	handleRegistration(req, res, "JOURNALIST");

// Fungsi helper untuk proses login (tidak banyak berubah)
const handleLogin = async (req, res, expectedRole) => {
	const validationError = validateInput(req.body);
	if (validationError) {
		return res
			.status(validationError.status)
			.json({ error: validationError.error });
	}

	const { email, password } = req.body;
	try {
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) {
			return res.status(404).json({ error: "Email tidak ditemukan" });
		}
		if (user.role !== expectedRole) {
			return res
				.status(403)
				.json({ error: "Akses ditolak. Peran tidak sesuai." });
		}
		const isPasswordCorrect = await bcrypt.compare(password, user.password);
		if (!isPasswordCorrect) {
			return res.status(401).json({ error: "Password salah" });
		}
		const token = jwt.sign(
			{ userId: user.id, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: "24h" }
		);
		delete user.password;
		res.json({
			message: `Login ${expectedRole.toLowerCase()} berhasil`,
			token,
			user,
		});
	} catch (error) {
		console.error(`Login ${expectedRole} error:`, error);
		res.status(500).json({ error: "Terjadi kesalahan server." });
	}
};

// REVISI: Menggunakan nama fungsi yang konsisten dengan route
export const loginAdmin = (req, res) => handleLogin(req, res, "ADMIN");
export const loginJournalist = (req, res) =>
	handleLogin(req, res, "JOURNALIST");
export const loginUser = (req, res) => handleLogin(req, res, "USER");

// Mendapatkan data profil pengguna yang sedang login
export const getProfile = async (req, res) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: req.user.userId },
		});
		if (!user) {
			return res.status(404).json({ error: "Pengguna tidak ditemukan" });
		}
		delete user.password;
		res.json(user);
	} catch (error) {
		console.error("Get profile error:", error);
		res.status(500).json({ error: "Gagal mengambil profil." });
	}
};

// Logout pengguna (stateless)
export const logout = (req, res) => {
	res.status(200).json({ message: "Logout berhasil" });
};
