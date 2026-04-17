import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { APP_NAME, DEFAULT_API_URL } from "@portfolio/shared";
import { authRouter } from "./routes/auth-routes.js";
import { usersRouter } from "./routes/users-routes.js";
import { portfoliosRouter } from "./routes/portfolios-routes.js";
import { projectsRouter } from "./routes/projects-routes.js";
import { blogsRouter } from "./routes/blogs-routes.js";
import { messagesRouter } from "./routes/messages-routes.js";
import { analyticsRouter } from "./routes/analytics-routes.js";
import { settingsRouter } from "./routes/settings-routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import "./models/index.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI;
const allowedOrigins = (process.env.CLIENT_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS."));
    },
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    app: APP_NAME,
    status: "ok",
    apiUrl: DEFAULT_API_URL,
    database: mongoose.connection.readyState === 1 ? "connected" : "not-connected",
    models: mongoose.modelNames(),
    routes: [
      "/api/auth",
      "/api/users",
      "/api/portfolios",
      "/api/projects",
      "/api/blogs",
      "/api/messages",
      "/api/analytics",
      "/api/settings",
    ],
  });
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/portfolios", portfoliosRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/blogs", blogsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/settings", settingsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri);
      console.log("MongoDB connected.");
    } catch (error) {
      console.error("MongoDB connection failed:", error.message);
    }
  } else {
    console.log("MONGODB_URI not set. Starting server without database connection.");
  }

  app.listen(port, () => {
    console.log(`${APP_NAME} server listening on http://localhost:${port}`);
  });
};

startServer();
