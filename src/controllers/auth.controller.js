import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

/**
 * Mendaftarkan pengguna baru (default role: USER).
 */
export const register = async (req, res) => {
    const { name, email, password } = req.body;

    // --- Validasi Input ---
    if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required" });
    }

    // Validasi format email sederhana
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
    }

    // Validasi kekuatan password
    if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Membuat user, role akan otomatis menjadi 'USER' sesuai default di schema.prisma
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword },
        });

        // Hapus password dari objek sebelum dikirim kembali
        delete user.password;

        res.status(201).json({ message: "User created successfully", user });

    } catch (error) {
        // Cek spesifik jika error disebabkan oleh email yang sudah ada
        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
            return res.status(409).json({ error: "User with this email already exists" });
        }
        // Error lainnya
        console.error("Register error:", error);
        res.status(500).json({ error: "Could not create user" });
    }
};

/**
 * Login pengguna dan mengembalikan token JWT.
 */
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: "Email tidak ditemukan" });
        }
        
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ error: "Password salah" });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Token berlaku selama 24 jam
        );

        // Hapus password dari objek sebelum dikirim kembali
        delete user.password;

        res.json({
            message: "Login successful",
            token,
            user, // Kirim semua data user (tanpa password)
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "An unexpected error occurred." });
    }
};

/**
 * Mendapatkan data profil pengguna yang sedang login.
 */
export const getProfile = async (req, res) => {
    // userId diambil dari token oleh middleware 'authenticate'
    const userId = req.user.userId;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            // Anda bisa menyertakan data relasi di sini jika perlu
            // contoh: include: { submissions: true }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Hapus password dari objek sebelum dikirim kembali
        delete user.password;

        res.json(user);
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ error: "Could not fetch user profile." });
    }
};

/**
 * Logout pengguna (stateless).
 */
export const logout = async (req, res) => {
    // Untuk JWT, logout ditangani di sisi klien dengan menghapus token.
    // Backend hanya perlu mengonfirmasi permintaan.
    res.status(200).json({ message: "Logout successful" });
};