import mongoose from "mongoose";
import { seoSchema, socialLinkSchema, objectId } from "./helpers.js";

const settingsSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      default: "Portfolio",
    },
    siteUrl: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    supportEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 120,
    },
    contactPhone: {
      type: String,
      trim: true,
      maxlength: 40,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    allowRegistrations: {
      type: Boolean,
      default: true,
    },
    defaultSeo: seoSchema,
    socialLinks: [socialLinkSchema],
    integrations: {
      googleAnalyticsId: {
        type: String,
        trim: true,
        maxlength: 80,
      },
      metaPixelId: {
        type: String,
        trim: true,
        maxlength: 80,
      },
      aiAssistantName: {
        type: String,
        trim: true,
        maxlength: 80,
      },
    },
    branding: {
      logoUrl: {
        type: String,
        trim: true,
        maxlength: 300,
      },
      faviconUrl: {
        type: String,
        trim: true,
        maxlength: 300,
      },
      primaryColor: {
        type: String,
        trim: true,
        maxlength: 20,
      },
    },
    updatedBy: {
      type: objectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

settingsSchema.index({ updatedAt: -1 });

export const Settings = mongoose.model("Settings", settingsSchema);
