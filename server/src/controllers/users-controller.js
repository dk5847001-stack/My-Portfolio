import bcrypt from "bcryptjs";
import { ROLES } from "@portfolio/shared";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError, createNotFoundMessage } from "../utils/api-error.js";
import { normalizeEmail, sanitizeText } from "../utils/request.js";
import { serializeUser } from "../utils/serializers.js";
import { User } from "../models/user.js";

export const listUsers = asyncHandler(async (req, res) => {
  const role = req.query.role;
  const search = req.query.search?.trim();
  const filter = {};

  if (role && Object.values(ROLES).includes(role)) {
    filter.role = role;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(filter).select("-passwordHash").sort({ createdAt: -1 });
  res.json({ users: users.map(serializeUser) });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select("-passwordHash");

  if (!user) {
    throw new ApiError(404, createNotFoundMessage("User"));
  }

  res.json({ user: serializeUser(user) });
});

export const createUser = asyncHandler(async (req, res) => {
  const name = sanitizeText(req.body?.name);
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password || "";
  const role = req.body?.role || ROLES.USER;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required.");
  }

  if (!Object.values(ROLES).includes(role)) {
    throw new ApiError(400, "Invalid role.");
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const user = await User.create({
    name,
    email,
    role,
    passwordHash: await bcrypt.hash(password, 10),
  });

  res.status(201).json({ user: serializeUser(user) });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);

  if (!user) {
    throw new ApiError(404, createNotFoundMessage("User"));
  }

  if (req.body.name !== undefined) {
    user.name = sanitizeText(req.body.name);
  }

  if (req.body.email !== undefined) {
    user.email = normalizeEmail(req.body.email);
  }

  if (req.body.role !== undefined) {
    if (!Object.values(ROLES).includes(req.body.role)) {
      throw new ApiError(400, "Invalid role.");
    }

    user.role = req.body.role;
  }

  if (req.body.password) {
    if (req.body.password.length < 8) {
      throw new ApiError(400, "Password must be at least 8 characters.");
    }

    user.passwordHash = await bcrypt.hash(req.body.password, 10);
  }

  await user.save();
  res.json({ user: serializeUser(user) });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.userId);

  if (!user) {
    throw new ApiError(404, createNotFoundMessage("User"));
  }

  res.json({ message: "User deleted successfully." });
});
