import mongoose from "mongoose";
import { imageSchema, seoSchema, objectId } from "./helpers.js";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 140,
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: 240,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    category: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    techStack: [
      {
        type: String,
        trim: true,
        maxlength: 50,
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 30,
      },
    ],
    thumbnail: imageSchema,
    gallery: [imageSchema],
    projectUrl: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    repositoryUrl: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    clientName: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    completionDate: Date,
    featured: {
      type: Boolean,
      default: false,
    },
    published: {
      type: Boolean,
      default: false,
    },
    seo: seoSchema,
    createdBy: {
      type: objectId,
      ref: "User",
    },
    updatedBy: {
      type: objectId,
      ref: "User",
    },
    githubSync: {
      provider: {
        type: String,
        trim: true,
        maxlength: 30,
      },
      repoId: {
        type: String,
        trim: true,
        maxlength: 60,
      },
      repoName: {
        type: String,
        trim: true,
        maxlength: 160,
      },
      repoOwner: {
        type: String,
        trim: true,
        maxlength: 120,
      },
      pushedAt: Date,
      syncedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ slug: 1 }, { unique: true });
projectSchema.index({ featured: 1, published: 1 });
projectSchema.index({ createdAt: -1 });

export const Project = mongoose.model("Project", projectSchema);
