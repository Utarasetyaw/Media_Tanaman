// controllers/auth.controller.js

import { PrismaClient, Prisma } from '@prisma/client'; // DIPERBAIKI: Impor Prisma untuk error handling
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Fungsi helper untuk validasi input umum
const validateInput = (res, data) => {
    const { name, email, password } = data;

    if (name === undefined) { // Name tidak wajib untuk login
        if (!email || !password) {
            return res.status(400).json({ error: "Email dan password wajib diisi" });
        }
    } else { // Wajib untuk register
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Nama, email, dan password wajib diisi" });
        }
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Format email tidak valid" });
    }

    if (password && password.length < 8) {
        return res.status(400).json({ error: "Password minimal harus 8 karakter" });
    }
    return null; // Tidak ada error
};


/**
 * =================================================================
 * REGISTRASI
 * =================================================================
 */

/**
 * @desc Mendaftarkan pengguna baru sebagai PESERTA (USER).
 */
export const registerParticipant = async (req, res) => {
    const { name, email, password } = req.body;

    const validationError = validateInput(res, { name, email, password });
    if (validationError) return;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await prisma.user.create({
            data: { 
                name, 
                email, 
                password: hashedPassword,
                role: 'USER' // DIUBAH: 'PARTICIPANT' menjadi 'USER' agar sesuai schema
            },
        });

        delete user.password;
        res.status(21).json({ message: "Registrasi peserta berhasil", user });

    } catch (error) {
        // DIPERBAIKI: Penanganan error yang lebih aman dan spesifik
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return res.status(409).json({ error: "Email ini sudah terdaftar." });
        }
        console.error("Register Participant error:", error);
        res.status(500).json({ error: "Gagal mendaftarkan peserta." });
    }
};

/**
 * @desc Mendaftarkan pengguna baru sebagai JURNALIS.
 */
export const registerJournalist = async (req, res) => {
    const { name, email, password } = req.body;
    
    const validationError = validateInput(res, { name, email, password });
    if (validationError) return;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await prisma.user.create({
            data: { 
                name, 
                email, 
                password: hashedPassword,
                role: 'JOURNALIST'
            },
        });

        delete user.password;
        res.status(201).json({ message: "Registrasi jurnalis berhasil", user });

    } catch (error) {
        // DIPERBAIKI: Penanganan error yang lebih aman dan spesifik
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return res.status(409).json({ error: "Email ini sudah terdaftar." });
        }
        console.error("Register Journalist error:", error);
        res.status(500).json({ error: "Gagal mendaftarkan jurnalis." });
    }
};

/**
 * =================================================================
 * LOGIN
 * =================================================================
 */

// Fungsi helper untuk proses login, agar tidak duplikat kode
const handleLogin = async (req, res, expectedRole) => {
    const { email, password } = req.body;

    const validationError = validateInput(res, { email, password });
    if (validationError) return;

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: "Email tidak ditemukan" });
        }
        
        if (user.role !== expectedRole) {
            return res.status(403).json({ error: "Akses ditolak. Role tidak sesuai untuk endpoint ini." });
        }
        
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ error: "Password salah" });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        delete user.password;

        res.json({
            message: `Login ${expectedRole.toLowerCase()} berhasil`,
            token,
            user,
        });

    } catch (error) {
        console.error(`Login ${expectedRole} error:`, error);
        res.status(500).json({ error: "Terjadi kesalahan tak terduga." });
    }
};

/**
 * @desc Login sebagai ADMIN.
 */
export const loginAdmin = (req, res) => handleLogin(req, res, 'ADMIN');

/**
 * @desc Login sebagai JURNALIS.
 */
export const loginJournalist = (req, res) => handleLogin(req, res, 'JOURNALIST');

/**
 * @desc Login sebagai PESERTA (USER).
 */
export const loginParticipant = (req, res) => handleLogin(req, res, 'USER'); // DIUBAH: 'PARTICIPANT' menjadi 'USER'


/**
 * =================================================================
 * FUNGSI LAINNYA (TETAP SAMA)
 * =================================================================
 */

/**
 * @desc Mendapatkan data profil pengguna yang sedang login.
 */
export const getProfile = async (req, res) => {
    const userId = req.user.userId;

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        delete user.password;
        res.json(user);
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ error: "Could not fetch user profile." });
    }
};

/**
 * @desc Logout pengguna (stateless).
 */
export const logout = (req, res) => {
    res.status(200).json({ message: "Logout successful" });
};