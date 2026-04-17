import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    pageViews: {
      type: Number,
      default: 0,
      min: 0,
    },
    uniqueVisitors: {
      type: Number,
      default: 0,
      min: 0,
    },
    contactSubmissions: {
      type: Number,
      default: 0,
      min: 0,
    },
    blogViews: {
      type: Number,
      default: 0,
      min: 0,
    },
    projectViews: {
      type: Number,
      default: 0,
      min: 0,
    },
    topPages: [
      {
        path: {
          type: String,
          trim: true,
          maxlength: 200,
        },
        views: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],
    trafficSources: [
      {
        source: {
          type: String,
          trim: true,
          maxlength: 80,
        },
        visits: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],
    deviceBreakdown: {
      mobile: {
        type: Number,
        default: 0,
        min: 0,
      },
      desktop: {
        type: Number,
        default: 0,
        min: 0,
      },
      tablet: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

analyticsSchema.index({ date: 1 }, { unique: true });

export const Analytics = mongoose.model("Analytics", analyticsSchema);
