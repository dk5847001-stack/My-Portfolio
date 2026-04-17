import mongoose from "mongoose";
import { objectId } from "./helpers.js";

const activityLogSchema = new mongoose.Schema(
  {
    actor: {
      type: objectId,
      ref: "User",
    },
    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    entityType: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    entityId: {
      type: objectId,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 400,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      trim: true,
      maxlength: 64,
    },
    userAgent: {
      type: String,
      trim: true,
      maxlength: 400,
    },
    severity: {
      type: String,
      enum: ["info", "warning", "error"],
      default: "info",
    },
  },
  {
    timestamps: true,
  }
);

activityLogSchema.index({ actor: 1, createdAt: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
activityLogSchema.index({ severity: 1, createdAt: -1 });

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
