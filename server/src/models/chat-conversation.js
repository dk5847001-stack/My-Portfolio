import mongoose from "mongoose";
import { objectId } from "./helpers.js";

const chatMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ["visitor", "admin", "system"],
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1500,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    sentBy: {
      type: objectId,
      ref: "User",
    },
  },
  { _id: false }
);

const chatConversationSchema = new mongoose.Schema(
  {
    visitorName: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    visitorEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 120,
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    messages: [chatMessageSchema],
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

chatConversationSchema.index({ status: 1, lastMessageAt: -1 });
chatConversationSchema.index({ visitorEmail: 1, updatedAt: -1 });

export const ChatConversation = mongoose.model("ChatConversation", chatConversationSchema);
