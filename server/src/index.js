import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {
  APP_NAME,
  DEFAULT_API_URL,
  ROLE_LABELS,
  ROLES,
} from "@portfolio/shared";
import { signAuthToken } from "./lib/auth.js";
import { requireAuth, requireRole } from "./middleware/auth.js";
import { User } from "./models/user.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI;
const allowedOrigins = (process.env.CLIENT_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS."));
    },
  })
);
app.use(express.json());

const normalizeEmail = (value = "") => value.trim().toLowerCase();
const sanitizeName = (value = "") => value.trim().replace(/\s+/g, " ");

const serializeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const buildAuthPayload = (user) => ({
  token: signAuthToken(user),
  user: serializeUser(user),
});

app.get("/api/health", (_req, res) => {
  res.json({
    app: APP_NAME,
    status: "ok",
    apiUrl: DEFAULT_API_URL,
    database:
      mongoose.connection.readyState === 1 ? "connected" : "not-connected",
  });
});

app.get("/api/auth/roles", (_req, res) => {
  res.json({
    roles: Object.values(ROLES).map((role) => ({
      value: role,
      label: ROLE_LABELS[role],
    })),
  });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const name = sanitizeName(req.body?.name);
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password || "";

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const usersCount = await User.countDocuments();
    const role = usersCount === 0 ? ROLES.SUPER_ADMIN : ROLES.USER;
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
    });

    return res.status(201).json(buildAuthPayload(user));
  } catch (error) {
    return res.status(500).json({ message: "Unable to register user." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password || "";

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    return res.json(buildAuthPayload(user));
  } catch (error) {
    return res.status(500).json({ message: "Unable to login user." });
  }
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({
    user: serializeUser(req.auth.user),
  });
});

app.get("/api/protected/profile", requireAuth, (req, res) => {
  res.json({
    message: `Welcome back, ${req.auth.user.name}.`,
    user: serializeUser(req.auth.user),
  });
});

app.get(
  "/api/protected/editor",
  requireAuth,
  requireRole(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR),
  (req, res) => {
    res.json({
      message: "Editor workspace unlocked.",
      user: serializeUser(req.auth.user),
    });
  }
);

app.get(
  "/api/protected/admin",
  requireAuth,
  requireRole(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  (req, res) => {
    res.json({
      message: "Admin dashboard unlocked.",
      user: serializeUser(req.auth.user),
    });
  }
);

app.get(
  "/api/protected/super-admin",
  requireAuth,
  requireRole(ROLES.SUPER_ADMIN),
  async (req, res) => {
    const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });

    res.json({
      message: "Super admin control room unlocked.",
      users: users.map(serializeUser),
    });
  }
);

const startServer = async () => {
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri);
      console.log("MongoDB connected.");
    } catch (error) {
      console.error("MongoDB connection failed:", error.message);
    }
  } else {
    console.log("MONGODB_URI not set. Starting server without database connection.");
  }

  app.listen(port, () => {
    console.log(`${APP_NAME} server listening on http://localhost:${port}`);
  });
};

startServer();
