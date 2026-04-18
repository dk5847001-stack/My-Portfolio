import { asyncHandler } from "../utils/async-handler.js";
import { ApiError, createNotFoundMessage } from "../utils/api-error.js";
import { serializeDocument } from "../utils/serializers.js";
import { Notification } from "../models/notification.js";

export const listNotifications = asyncHandler(async (_req, res) => {
  const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
  res.json({ notifications: notifications.map(serializeDocument) });
});

export const updateNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.notificationId,
    { ...req.body },
    { new: true, runValidators: true }
  );

  if (!notification) {
    throw new ApiError(404, createNotFoundMessage("Notification"));
  }

  res.json({ notification: serializeDocument(notification) });
});
