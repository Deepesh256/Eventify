import express from "express";
import Event from "../models/Event.js";

import {
  addEvent,
  getAllEvents,
  getEventById,
  recommendEvents,
  updateEventWinners,
} from "../controllers/eventController.js";

import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

// ======================================================
// PUBLIC ROUTES
// ======================================================

/* Recommendation */
router.post(
  "/recommend",
  recommendEvents
);

/* Get all events */
router.get(
  "/",
  getAllEvents
);

/* Get single event by ID */
router.get(
  "/:id",
  getEventById
);

// ======================================================
// ADMIN PROTECTED ROUTES
// ======================================================

/* Add event */
router.post(
  "/",
  adminAuthMiddleware,
  addEvent
);

/* Delete event */
router.delete(
  "/delete/:id",
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const deletedEvent =
        await Event.findByIdAndDelete(
          req.params.id
        );

      if (!deletedEvent) {
        return res.status(404).json({
          message:
            "Event not found",
        });
      }

      return res.status(200).json({
        message:
          "Event deleted successfully",
      });
    } catch (error) {
      console.error(
        "DELETE EVENT ERROR:",
        error
      );

      return res.status(500).json({
        message:
          error.message,
      });
    }
  }
);

/* Update event */
router.put(
  "/update/:id",
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const updatedData = {
        ...req.body,
      };

      if (updatedData.date) {
        updatedData.date =
          new Date(
            updatedData.date
          );
      }

      if (updatedData.endDate) {
        updatedData.endDate =
          new Date(
            updatedData.endDate
          );
      }

      const updatedEvent =
        await Event.findByIdAndUpdate(
          req.params.id,
          updatedData,
          {
            new: true,
            runValidators: true,
          }
        );

      if (!updatedEvent) {
        return res.status(404).json({
          message:
            "Event not found",
        });
      }

      return res.status(200).json(
        updatedEvent
      );
    } catch (error) {
      console.error(
        "UPDATE EVENT ERROR:",
        error
      );

      return res.status(500).json({
        message:
          error.message,
      });
    }
  }
);

/* Update winners for event */
router.put(
  "/:id/winners",
  adminAuthMiddleware,
  updateEventWinners
);

export default router;