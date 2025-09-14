import jwt from 'jsonwebtoken';

/**
 * Middleware untuk memverifikasi token JWT (Autentikasi).
 * Jika token valid, payload pengguna akan ditambahkan ke `req.user`.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedUser; // Menambahkan payload { userId, role } ke request
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired' });
    }
    // Untuk token tidak valid lainnya (signature salah, dll.)
    return res.status(403).json({ error: 'Invalid token' });
  }
};

/**
 * Middleware untuk memvalidasi peran (role) pengguna (Otorisasi).
 * Harus digunakan setelah middleware `authenticateToken`.
 * @param {string[]} allowedRoles - Array berisi peran yang diizinkan, contoh: ['ADMIN', 'JOURNALIST'].
 */
export const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "You do not have permission to perform this action" });
    }
    next();
  };
};