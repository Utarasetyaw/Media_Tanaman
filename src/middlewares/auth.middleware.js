// middlewares/auth.middleware.js

import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ error: "Authentication token required" });
	}
	const token = authHeader.split(" ")[1];
	try {
		const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decodedUser;
		next();
	} catch (error) {
		if (error.name === "TokenExpiredError") {
			return res.status(401).json({ error: "Token has expired" });
		}
		return res.status(403).json({ error: "Invalid token" });
	}
};

export const authorizeRoles = (allowedRoles) => {
	return (req, res, next) => {
		if (!req.user || !allowedRoles.includes(req.user.role)) {
			return res
				.status(403)
				.json({ error: "You do not have permission to perform this action" });
		}
		next();
	};
};
