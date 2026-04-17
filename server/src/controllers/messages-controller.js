import { asyncHandler } from "../utils/async-handler.js";
import { ApiError, createNotFoundMessage } from "../utils/api-error.js";
import { normalizeEmail, sanitizeText } from "../utils/request.js";
import { serializeDocument } from "../utils/serializers.js";
import { Message } from "../models/message.js";

export const listMessages = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const messages = await Message.find(filter)
    .populate("assignedTo", "name email role")
    .sort({ createdAt: -1 });

  res.json({ messages: messages.map(serializeDocument) });
});

export const getMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.messageId).populate(
    "assignedTo",
    "name email role"
  );

  if (!message) {
    throw new ApiError(404, createNotFoundMessage("Message"));
  }

  res.json({ message: serializeDocument(message) });
});

export const createMessage = asyncHandler(async (req, res) => {
  const name = sanitizeText(req.body?.name);
  const email = normalizeEmail(req.body?.email);
  const body = sanitizeText(req.body?.message || "");

  if (!name || !email || !body) {
    throw new ApiError(400, "Name, email, and message are required.");
  }

  const message = await Message.create({
    ...req.body,
    name,
    email,
    message: body,
    statusHistory: [{ status: "new" }],
  });

  res.status(201).json({ message: serializeDocument(message) });
});

export const updateMessage = asyncHandler(async (req, res) => {
  const current = await Message.findById(req.params.messageId);

  if (!current) {
    throw new ApiError(404, createNotFoundMessage("Message"));
  }

  if (req.body.status && req.body.status !== current.status) {
    current.statusHistory.push({
      status: req.body.status,
      changedBy: req.auth.user._id,
      note: sanitizeText(req.body.statusNote || ""),
    });
  }

  Object.assign(current, req.body);

  if (req.body.status === "replied" && !current.repliedAt) {
    current.repliedAt = new Date();
  }

  await current.save();
  await current.populate("assignedTo", "name email role");

  res.json({ message: serializeDocument(current) });
});

export const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findByIdAndDelete(req.params.messageId);

  if (!message) {
    throw new ApiError(404, createNotFoundMessage("Message"));
  }

  res.json({ message: "Message deleted successfully." });
});
