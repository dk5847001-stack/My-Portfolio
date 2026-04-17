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
    clickCount: {
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
    topClicks: [
      {
        target: {
          type: String,
          trim: true,
          maxlength: 160,
        },
        path: {
          type: String,
          trim: true,
          maxlength: 200,
        },
        count: {
          type: Number,
          default: 0,
          min: 0,
        },
        lastClickedAt: Date,
      },
    ],
    heatmapPoints: [
      {
        path: {
          type: String,
          trim: true,
          maxlength: 200,
        },
        x: {
          type: Number,
          min: 0,
          max: 1,
        },
        y: {
          type: Number,
          min: 0,
          max: 1,
        },
        count: {
          type: Number,
          default: 0,
          min: 0,
        },
        lastSeen: Date,
      },
    ],
    liveVisitors: [
      {
        sessionId: {
          type: String,
          trim: true,
          maxlength: 120,
        },
        path: {
          type: String,
          trim: true,
          maxlength: 200,
        },
        source: {
          type: String,
          trim: true,
          maxlength: 120,
        },
        userAgent: {
          type: String,
          trim: true,
          maxlength: 300,
        },
        lastSeen: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

analyticsSchema.index({ date: 1 }, { unique: true });

export const Analytics = mongoose.model("Analytics", analyticsSchema);
