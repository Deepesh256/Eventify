import "dotenv/config";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import adminRoutes from "./routes/adminRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import posterRoutes from "./routes/posterRoutes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================
// CORS
// =========================

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://eventifybydeepesh.vercel.app",
];
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without origin
      // Example: Postman
      if (!origin) {
        return callback(null, true);
      }

      // Allow any localhost port
      if (/^http:\/\/localhost:\d+$/.test(origin)) {
        return callback(null, true);
      }

      // Allow deployed frontend URLs
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ CORS blocked:", origin);

      return callback(
        new Error("Not allowed by CORS")
      );
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
    ],

    credentials: true,
  })
);

// =========================
// MIDDLEWARE
// =========================

app.use(express.json());

// Serve generated posters
app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

// =========================
// ROUTES
// =========================

app.use("/api/admin", adminRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/posters", posterRoutes);

// =========================
// TEST ROUTE
// =========================

app.get("/", (req, res) => {
  res.send(
    "Event Management API is running"
  );
});

// =========================
// DATABASE CONNECTION
// =========================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(
      "✅ MongoDB Connected"
    );
  })
  .catch((err) => {
    console.log(
      "❌ MongoDB Error:",
      err
    );
  });

// =========================
// SERVER
// =========================

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT}`
  );
});