import mongoose from "mongoose";
import { ApiError } from "../utils/api-error.js";

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (error, _req, res, _next) => {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      message: error.message,
      details: error.details,
    });
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      message: "Validation failed.",
      details: Object.values(error.errors).map((item) => item.message),
    });
  }

  if (error?.code === 11000) {
    return res.status(409).json({
      message: "Duplicate value detected.",
      details: error.keyValue,
    });
  }

  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      message: "Invalid resource identifier.",
    });
  }

  return res.status(500).json({
    message: error.message || "Internal server error.",
  });
};
