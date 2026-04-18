import { Notification } from "../models/notification.js";

export const createNotification = async ({
  title,
  message,
  type = "info",
  source = "",
  sourceId = "",
  link = "",
  metadata = {},
}) => {
  try {
    return await Notification.create({
      title,
      message,
      type,
      source,
      sourceId,
      link,
      metadata,
    });
  } catch {
    return null;
  }
};
