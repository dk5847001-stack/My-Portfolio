import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { APP_NAME, DEFAULT_API_URL } from "@portfolio/shared";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    app: APP_NAME,
    status: "ok",
    apiUrl: DEFAULT_API_URL,
    database:
      mongoose.connection.readyState === 1 ? "connected" : "not-connected",
  });
});

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

