import mongoose from "mongoose";

export const objectId = mongoose.Schema.Types.ObjectId;

export const socialLinkSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      trim: true,
      maxlength: 40,
    },
    url: {
      type: String,
      trim: true,
      maxlength: 300,
    },
  },
  { _id: false }
);

export const seoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    keywords: [
      {
        type: String,
        trim: true,
        maxlength: 40,
      },
    ],
  },
  { _id: false }
);

export const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    alt: {
      type: String,
      trim: true,
      maxlength: 160,
    },
  },
  { _id: false }
);

export const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    changedBy: {
      type: objectId,
      ref: "User",
    },
    note: {
      type: String,
      trim: true,
      maxlength: 200,
    },
  },
  { _id: false }
);
