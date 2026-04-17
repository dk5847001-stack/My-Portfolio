import mongoose from "mongoose";
import { imageSchema, seoSchema, socialLinkSchema, objectId } from "./helpers.js";

const portfolioSchema = new mongoose.Schema(
  {
    heroTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    heroSubtitle: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 120,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 40,
    },
    resumeUrl: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    avatar: imageSchema,
    coverImage: imageSchema,
    skills: [
      {
        type: String,
        trim: true,
        maxlength: 50,
      },
    ],
    services: [
      {
        title: {
          type: String,
          trim: true,
          maxlength: 100,
        },
        description: {
          type: String,
          trim: true,
          maxlength: 400,
        },
      },
    ],
    socialLinks: [socialLinkSchema],
    seo: seoSchema,
    isPublic: {
      type: Boolean,
      default: true,
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

portfolioSchema.index({ updatedAt: -1 });

export const Portfolio = mongoose.model("Portfolio", portfolioSchema);
