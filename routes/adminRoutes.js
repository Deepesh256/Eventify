import express from "express";

import {
  adminLogin,
} from "../controllers/adminController.js";

import {
  addEvent,
} from "../controllers/eventController.js";

import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

// =========================
// ADMIN LOGIN
// PUBLIC ROUTE
// =========================

router.post(
  "/login",
  adminLogin
);

// =========================
// ADD EVENT
// ADMIN ONLY
// =========================

router.post(
  "/add-event",
  adminAuthMiddleware,
  addEvent
);

export default router;