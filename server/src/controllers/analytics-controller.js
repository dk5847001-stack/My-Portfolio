import { asyncHandler } from "../utils/async-handler.js";
import { ApiError, createNotFoundMessage } from "../utils/api-error.js";
import { serializeDocument } from "../utils/serializers.js";
import { Analytics } from "../models/analytics.js";

export const listAnalytics = asyncHandler(async (_req, res) => {
  const analytics = await Analytics.find().sort({ date: -1 });
  res.json({ analytics: analytics.map(serializeDocument) });
});

export const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await Analytics.findById(req.params.analyticsId);

  if (!analytics) {
    throw new ApiError(404, createNotFoundMessage("Analytics"));
  }

  res.json({ analytics: serializeDocument(analytics) });
});

export const createAnalytics = asyncHandler(async (req, res) => {
  const analytics = await Analytics.create(req.body);
  res.status(201).json({ analytics: serializeDocument(analytics) });
});

export const updateAnalytics = asyncHandler(async (req, res) => {
  const analytics = await Analytics.findByIdAndUpdate(req.params.analyticsId, req.body, {
    new: true,
    runValidators: true,
  });

  if (!analytics) {
    throw new ApiError(404, createNotFoundMessage("Analytics"));
  }

  res.json({ analytics: serializeDocument(analytics) });
});

export const deleteAnalytics = asyncHandler(async (req, res) => {
  const analytics = await Analytics.findByIdAndDelete(req.params.analyticsId);

  if (!analytics) {
    throw new ApiError(404, createNotFoundMessage("Analytics"));
  }

  res.json({ message: "Analytics entry deleted successfully." });
});
