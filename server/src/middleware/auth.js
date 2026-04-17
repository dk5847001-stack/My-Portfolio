import { verifyAuthToken } from "../lib/auth.js";
import { User } from "../models/user.js";

const readBearerToken = (authorizationHeader = "") => {
  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};

export const requireAuth = async (req, res, next) => {
  try {
    const token = readBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const payload = verifyAuthToken(token);
    const user = await User.findById(payload.sub).select("-passwordHash");

    if (!user) {
      return res.status(401).json({ message: "Account not found." });
    }

    req.auth = {
      token,
      user,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.auth?.user) {
    return res.status(401).json({ message: "Authentication required." });
  }

  if (!allowedRoles.includes(req.auth.user.role)) {
    return res.status(403).json({ message: "You do not have access to this route." });
  }

  return next();
};
