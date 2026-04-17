import bcrypt from "bcryptjs";
import { ROLE_LABELS, ROLES } from "@portfolio/shared";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { buildAuthPayload, serializeUser } from "../utils/serializers.js";
import { normalizeEmail, sanitizeText } from "../utils/request.js";
import { User } from "../models/user.js";

export const listRoles = asyncHandler(async (_req, res) => {
  res.json({
    roles: Object.values(ROLES).map((role) => ({
      value: role,
      label: ROLE_LABELS[role],
    })),
  });
});

export const register = asyncHandler(async (req, res) => {
  const name = sanitizeText(req.body?.name);
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password || "";

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required.");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters.");
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const usersCount = await User.countDocuments();
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: usersCount === 0 ? ROLES.SUPER_ADMIN : ROLES.USER,
  });

  res.status(201).json(buildAuthPayload(user));
});

export const login = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password || "";

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required.");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password.");
  }

  res.json(buildAuthPayload(user));
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: serializeUser(req.auth.user) });
});
