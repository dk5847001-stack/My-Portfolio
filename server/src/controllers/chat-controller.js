import { asyncHandler } from "../utils/async-handler.js";
import { ApiError, createNotFoundMessage } from "../utils/api-error.js";
import { normalizeEmail, sanitizeText } from "../utils/request.js";
import { serializeDocument } from "../utils/serializers.js";
import { ChatConversation } from "../models/chat-conversation.js";
import { createNotification } from "../services/notifications.js";
import { sendEmailNotification } from "../services/email.js";

const appendMessage = async (conversation, message) => {
  conversation.messages.push(message);
  conversation.lastMessageAt = new Date();
  await conversation.save();
  return conversation;
};

export const listChats = asyncHandler(async (_req, res) => {
  const conversations = await ChatConversation.find().sort({ lastMessageAt: -1 });
  res.json({ conversations: conversations.map(serializeDocument) });
});

export const createChatConversation = asyncHandler(async (req, res) => {
  const visitorName = sanitizeText(req.body?.visitorName || "");
  const visitorEmail = normalizeEmail(req.body?.visitorEmail || "");
  const text = sanitizeText(req.body?.text || "");

  if (!visitorName || !visitorEmail || !text) {
    throw new ApiError(400, "Visitor name, email, and message are required.");
  }

  const conversation = await ChatConversation.create({
    visitorName,
    visitorEmail,
    messages: [{ sender: "visitor", text }],
    lastMessageAt: new Date(),
  });

  await createNotification({
    title: "New live chat started",
    message: `${visitorName} opened a live chat conversation.`,
    type: "info",
    source: "chat",
    sourceId: String(conversation._id),
    link: "/chat",
  });

  await sendEmailNotification({
    to: process.env.NOTIFICATION_EMAIL,
    subject: "New live chat started",
    text: `${visitorName} (${visitorEmail}) wrote: ${text}`,
  }).catch(() => null);

  res.status(201).json({ conversation: serializeDocument(conversation) });
});

export const replyToChatConversation = asyncHandler(async (req, res) => {
  const conversation = await ChatConversation.findById(req.params.chatId);

  if (!conversation) {
    throw new ApiError(404, createNotFoundMessage("Chat conversation"));
  }

  const text = sanitizeText(req.body?.text || "");
  if (!text) {
    throw new ApiError(400, "Reply text is required.");
  }

  await appendMessage(conversation, {
    sender: "admin",
    text,
    sentBy: req.auth.user._id,
  });

  res.json({ conversation: serializeDocument(conversation) });
});

export const addVisitorMessage = asyncHandler(async (req, res) => {
  const conversation = await ChatConversation.findById(req.params.chatId);

  if (!conversation) {
    throw new ApiError(404, createNotFoundMessage("Chat conversation"));
  }

  const text = sanitizeText(req.body?.text || "");
  if (!text) {
    throw new ApiError(400, "Message text is required.");
  }

  await appendMessage(conversation, {
    sender: "visitor",
    text,
  });

  await createNotification({
    title: "New live chat message",
    message: `${conversation.visitorName || "Visitor"} sent a new message.`,
    type: "warning",
    source: "chat",
    sourceId: String(conversation._id),
    link: "/chat",
  });

  res.json({ conversation: serializeDocument(conversation) });
});

export const updateChatConversation = asyncHandler(async (req, res) => {
  const conversation = await ChatConversation.findByIdAndUpdate(
    req.params.chatId,
    { ...req.body },
    { new: true, runValidators: true }
  );

  if (!conversation) {
    throw new ApiError(404, createNotFoundMessage("Chat conversation"));
  }

  res.json({ conversation: serializeDocument(conversation) });
});
