import { asyncHandler } from "../utils/async-handler.js";
import { ApiError, createNotFoundMessage } from "../utils/api-error.js";
import { serializeDocument } from "../utils/serializers.js";
import { Settings } from "../models/settings.js";

export const listSettings = asyncHandler(async (_req, res) => {
  const settings = await Settings.find().sort({ updatedAt: -1 });
  res.json({ settings: settings.map(serializeDocument) });
});

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.findById(req.params.settingsId);

  if (!settings) {
    throw new ApiError(404, createNotFoundMessage("Settings"));
  }

  res.json({ settings: serializeDocument(settings) });
});

export const createSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.create({
    ...req.body,
    updatedBy: req.auth.user._id,
  });

  res.status(201).json({ settings: serializeDocument(settings) });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.findByIdAndUpdate(
    req.params.settingsId,
    { ...req.body, updatedBy: req.auth.user._id },
    { new: true, runValidators: true }
  );

  if (!settings) {
    throw new ApiError(404, createNotFoundMessage("Settings"));
  }

  res.json({ settings: serializeDocument(settings) });
});

export const deleteSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.findByIdAndDelete(req.params.settingsId);

  if (!settings) {
    throw new ApiError(404, createNotFoundMessage("Settings"));
  }

  res.json({ message: "Settings deleted successfully." });
});
