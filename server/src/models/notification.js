import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 400,
    },
    type: {
      type: String,
      enum: ["info", "success", "warning", "error"],
      default: "info",
    },
    source: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    sourceId: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    link: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    read: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ read: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);
