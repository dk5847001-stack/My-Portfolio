import mongoose from "mongoose";
import { statusHistorySchema, objectId } from "./helpers.js";

const messageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
    },
    subject: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
    status: {
      type: String,
      enum: ["new", "read", "replied", "archived"],
      default: "new",
    },
    source: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "contact-form",
    },
    assignedTo: {
      type: objectId,
      ref: "User",
    },
    statusHistory: [statusHistorySchema],
    repliedAt: Date,
    spamScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    spamSignals: [
      {
        type: String,
        trim: true,
        maxlength: 80,
      },
    ],
    spamVerdict: {
      type: String,
      enum: ["clean", "review", "blocked"],
      default: "clean",
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ email: 1, createdAt: -1 });
messageSchema.index({ status: 1, createdAt: -1 });
messageSchema.index({ spamVerdict: 1, createdAt: -1 });

export const Message = mongoose.model("Message", messageSchema);
