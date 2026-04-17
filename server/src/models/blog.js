import mongoose from "mongoose";
import { imageSchema, seoSchema, objectId } from "./helpers.js";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 160,
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: 260,
    },
    content: {
      type: String,
      trim: true,
      maxlength: 25000,
    },
    coverImage: imageSchema,
    author: {
      type: objectId,
      ref: "User",
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 30,
      },
    ],
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    publishedAt: Date,
    readTimeMinutes: {
      type: Number,
      min: 1,
      max: 120,
    },
    seo: seoSchema,
  },
  {
    timestamps: true,
  }
);

blogSchema.index({ slug: 1 }, { unique: true });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ author: 1, createdAt: -1 });

export const Blog = mongoose.model("Blog", blogSchema);
