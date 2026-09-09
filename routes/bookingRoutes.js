import express from "express";
import Booking from "../models/Booking.js";
import Event from "../models/Event.js";
import User from "../models/User.js";
import { sendMail } from "../services/mailer.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

// =========================
// EVENT STATUS
// =========================

const getEventStatus = (
  startDate,
  endDate
) => {
  const now = new Date();

  const start =
    new Date(startDate);

  const end = endDate
    ? new Date(endDate)
    : new Date(startDate);

  if (now < start) {
    return "Upcoming";
  }

  if (
    now >= start &&
    now <= end
  ) {
    return "Ongoing";
  }

  return "Completed";
};

// =========================
// NORMALIZE VALUE
// =========================

const normalizeValue = (
  value
) => {
  return String(
    value || ""
  )
    .toUpperCase()
    .trim();
};

// =========================
// REGISTER EVENT
// =========================

router.post(
  "/register",
  authMiddleware,
  async (req, res) => {
    try {
      const { eventId } = req.body;

const userId =
  req.user.userId;
      // =========================
      // BASIC VALIDATION
      // =========================

      if (!eventId) {
  return res.status(400).json({
    message:
      "Event ID is required",
  });
}

      // =========================
      // FETCH USER + EVENT
      // =========================

      const user =
        await User.findById(
          userId
        );

      if (!user) {
        return res
          .status(404)
          .json({
            message:
              "User not found",
          });
      }

      const event =
        await Event.findById(
          eventId
        );

      if (!event) {
        return res
          .status(404)
          .json({
            message:
              "Event not found",
          });
      }

      // =========================
      // EVENT STATUS CHECK
      // =========================

      const eventStatus =
        getEventStatus(
          event.date,
          event.endDate
        );

      if (
        eventStatus ===
        "Completed"
      ) {
        return res
          .status(400)
          .json({
            message:
              "Registration is closed because this event is completed",
          });
      }

      // =========================
      // DUPLICATE CHECK
      // =========================

      const existing =
        await Booking.findOne({
          userId,
          eventId,
        });

      if (existing) {
        return res
          .status(409)
          .json({
            message:
              "Already registered",
          });
      }

      // =========================
      // DEPARTMENT ELIGIBILITY
      // =========================

      const userDepartment =
        normalizeValue(
          user.department
        );

      const allowedDepartments =
        (
          event.department ||
          []
        ).map(
          normalizeValue
        );

      const departmentEligible =
        allowedDepartments.length ===
          0 ||
        allowedDepartments.includes(
          "ALL"
        ) ||
        allowedDepartments.includes(
          userDepartment
        );

      if (
        !departmentEligible
      ) {
        return res
          .status(403)
          .json({
            message:
              "You are not eligible for this event based on your department",
          });
      }

      // =========================
      // YEAR ELIGIBILITY
      // =========================

      const userYear =
        normalizeValue(
          user.year
        );

      const allowedYears =
        (
          event.year || []
        ).map(
          normalizeValue
        );

      const yearEligible =
        allowedYears.length ===
          0 ||
        allowedYears.includes(
          "ALL"
        ) ||
        allowedYears.includes(
          userYear
        );

      if (!yearEligible) {
        return res
          .status(403)
          .json({
            message:
              "You are not eligible for this event based on your year",
          });
      }

      // =========================
      // CREATE BOOKING
      // =========================

      const booking =
        new Booking({
          userId,
          eventId,
        });

      await booking.save();

      // =========================
      // SEND CONFIRMATION EMAIL
      // =========================

      if (
        user.email &&
        event
      ) {
        try {
          await sendMail({
            to: user.email,

            subject:
              `Booking Confirmed - ${event.name}`,

            text:
              `Hello ${user.name}, your booking for ${event.name} is confirmed. Date: ${new Date(
                event.date
              ).toLocaleDateString()} | Location: ${event.location}`,

            html: `
              <div
                style="
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                "
              >
                <h2
                  style="
                    color: #6d28d9;
                  "
                >
                  ✅ Booking Confirmed
                </h2>

                <p>
                  Hello
                  <strong>
                    ${user.name}
                  </strong>,
                </p>

                <p>
                  Your booking has
                  been confirmed
                  successfully.
                </p>

                <div
                  style="
                    background:#f4f4f5;
                    padding:15px;
                    border-radius:10px;
                    margin:15px 0;
                  "
                >
                  <p>
                    <strong>
                      Event:
                    </strong>
                    ${event.name}
                  </p>

                  <p>
                    <strong>
                      Date:
                    </strong>
                    ${new Date(
                      event.date
                    ).toLocaleDateString()}
                  </p>

                  <p>
                    <strong>
                      Location:
                    </strong>
                    ${event.location}
                  </p>

                  <p>
                    <strong>
                      Category:
                    </strong>
                    ${event.category}
                  </p>

                  <p>
                    <strong>
                      Department:
                    </strong>
                    ${
                      event.department
                        ?.length
                        ? event.department.join(
                            ", "
                          )
                        : "ALL"
                    }
                  </p>

                  <p>
                    <strong>
                      Year:
                    </strong>
                    ${
                      event.year
                        ?.length
                        ? event.year.join(
                            ", "
                          )
                        : "ALL"
                    }
                  </p>
                </div>

                <p>
                  Thank you for
                  using
                  <strong>
                    Eventify
                  </strong>.
                </p>
              </div>
            `,
          });

          console.log(
            "✅ Booking confirmation email sent to:",
            user.email
          );
        } catch (
          mailError
        ) {
          console.error(
            "❌ Booking mail send failed:",
            mailError.message
          );
        }
      }

      // =========================
      // SUCCESS
      // =========================

      return res.json({
        message:
          "Registered successfully",
        booking,
      });
    } catch (error) {
      console.error(
        "Register booking error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Error registering",
        });
    }
  }
);

// =========================
// UNREGISTER EVENT
// =========================
router.delete(
  "/unregister",
  authMiddleware,
  async (req, res) => {
    try {
      // Event ID comes from frontend
      const { eventId } = req.body;

      // User ID comes securely from JWT
      const userId =
        req.user.userId;

      // Validate Event ID
      if (!eventId) {
        return res.status(400).json({
          message:
            "Event ID is required",
        });
      }

      // Find event
      const event =
        await Event.findById(
          eventId
        );

      if (!event) {
        return res.status(404).json({
          message:
            "Event not found",
        });
      }

      // Check event status
      const eventStatus =
        getEventStatus(
          event.date,
          event.endDate
        );

      if (
        eventStatus ===
        "Completed"
      ) {
        return res.status(400).json({
          message:
            "You cannot unregister from a completed event",
        });
      }

      // Delete only the logged-in user's booking
      const deletedBooking =
        await Booking.findOneAndDelete({
          userId,
          eventId,
        });

      if (!deletedBooking) {
        return res.status(404).json({
          message:
            "Booking not found",
        });
      }

      return res.json({
        message:
          "Unregistered successfully",
      });
    } catch (error) {
      console.error(
        "Unregister booking error:",
        error
      );

      return res.status(500).json({
        message:
          "Error unregistering",
      });
    }
  }
);

// =========================
// CHECK BOOKING
// =========================

router.get(
  "/check/:userId/:eventId",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        userId,
        eventId,
      } = req.params;

      // Make sure user can only
      // check their own booking
      if (
        req.user.userId !==
        userId
      ) {
        return res.status(403).json({
          message:
            "You are not allowed to check another user's booking",
        });
      }

      const existing =
        await Booking.findOne({
          userId:
            req.user.userId,
          eventId,
        });

      return res.json({
        registered:
          !!existing,
      });
    } catch (error) {
      console.error(
        "Check booking error:",
        error
      );

      return res.status(500).json({
        message:
          "Error checking booking",
      });
    }
  }
);

// =========================
// EVENT PARTICIPANTS
// ADMIN ONLY
// =========================

router.get(
  "/event/:eventId/participants",
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const {
        eventId,
      } = req.params;

      const bookings =
        await Booking.find({
          eventId,
        });

      const participants =
        await Promise.all(
          bookings.map(
            async (
              booking
            ) => {
              const user =
                await User.findById(
                  booking.userId
                );

              if (!user) {
                return null;
              }

              return {
                _id:
                  user._id,

                name:
                  user.name,

                email:
                  user.email,

                department:
                  user.department,

                year:
                  user.year,
              };
            }
          )
        );

      const filteredParticipants =
        participants.filter(
          Boolean
        );

      return res.json(
        filteredParticipants
      );
    } catch (error) {
      console.error(
        "Error fetching participants:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Error fetching participants",
        });
    }
  }
);

             

      

// =========================
// USER BOOKINGS
// =========================

router.get(
  "/:userId",
  authMiddleware,
  async (req, res) => {
    try {
      const requestedUserId =
        req.params.userId;

      const loggedInUserId =
        req.user.userId;

      // User can only access
      // their own bookings
      if (
        loggedInUserId !==
        requestedUserId
      ) {
        return res.status(403).json({
          message:
            "You are not allowed to access another user's bookings",
        });
      }

      // Use authenticated user ID
      // from JWT
      const bookings =
        await Booking.find({
          userId:
            loggedInUserId,
        }).sort({
          _id: -1,
        });

      const enrichedBookings =
        await Promise.all(
          bookings.map(
            async (booking) => {
              const bookingObj =
                booking.toObject();

              const event =
                await Event.findById(
                  booking.eventId
                );

              if (event) {
                const eventObj =
                  event.toObject();

                eventObj.eventStatus =
                  getEventStatus(
                    eventObj.date,
                    eventObj.endDate
                  );

                bookingObj.event =
                  eventObj;
              } else {
                bookingObj.event =
                  null;
              }

              return bookingObj;
            }
          )
        );

      return res.json(
        enrichedBookings
      );
    } catch (error) {
      console.error(
        "Error fetching bookings:",
        error
      );

      return res.status(500).json({
        message:
          "Error fetching bookings",
      });
    }
  }
);

export default router;