import User from "../models/User.js";
import Event from "../models/Event.js";
import { sendMail } from "../services/mailer.js";

// ============================================================
// PROFESSIONAL EVENT CATEGORY STRUCTURE
// ============================================================

const EVENT_CATEGORIES = {
  "Technology & Innovation": [
    "Programming & Development",
    "AI & Machine Learning",
    "Web Development",
    "App Development",
    "Data Science",
    "Cybersecurity",
    "Hackathons",
  ],

  "Sports & Athletics": [
    "Cricket",
    "Kabaddi",
    "Football",
    "Volleyball",
    "Basketball",
    "Badminton",
    "Athletics",
    "Chess",
  ],

  "Arts & Culture": [
    "Music",
    "Dance",
    "Singing",
    "Drama & Theatre",
    "Fine Arts",
    "Cultural Festivals",
  ],

  "Workshops & Learning": [
    "Technical Workshops",
    "Skill Development",
    "Career Workshops",
    "Hands-on Training",
  ],

  "Seminars & Conferences": [
    "Seminars",
    "Guest Lectures",
    "Conferences",
    "Expert Talks",
  ],

  "Gaming & Esports": [
    "Esports",
    "PC Gaming",
    "Mobile Gaming",
  ],

  "Photography & Media": [
    "Photography",
    "Videography",
    "Content Creation",
    "Short Film",
  ],

  "Clubs & Community": [
    "Club Activities",
    "Volunteering",
    "Community Programs",
    "Networking Events",
  ],
};

// ============================================================
// LEGACY CATEGORY SUPPORT
// ============================================================

const LEGACY_CATEGORY_MAP = {
  tech: {
    mainCategory: "Technology & Innovation",
    category: "Programming & Development",
  },

  coding: {
    mainCategory: "Technology & Innovation",
    category: "Programming & Development",
  },

  ai: {
    mainCategory: "Technology & Innovation",
    category: "AI & Machine Learning",
  },

  hackathon: {
    mainCategory: "Technology & Innovation",
    category: "Hackathons",
  },

  music: {
    mainCategory: "Arts & Culture",
    category: "Music",
  },

  dance: {
    mainCategory: "Arts & Culture",
    category: "Dance",
  },

  cultural: {
    mainCategory: "Arts & Culture",
    category: "Cultural Festivals",
  },

  cricket: {
    mainCategory: "Sports & Athletics",
    category: "Cricket",
  },

  kabaddi: {
    mainCategory: "Sports & Athletics",
    category: "Kabaddi",
  },

  sports: {
    mainCategory: "Sports & Athletics",
    category: "Athletics",
  },

  workshop: {
    mainCategory: "Workshops & Learning",
    category: "Technical Workshops",
  },

  seminar: {
    mainCategory: "Seminars & Conferences",
    category: "Seminars",
  },

  gaming: {
    mainCategory: "Gaming & Esports",
    category: "Esports",
  },

  photography: {
    mainCategory: "Photography & Media",
    category: "Photography",
  },

  club: {
    mainCategory: "Clubs & Community",
    category: "Club Activities",
  },

  networking: {
    mainCategory: "Clubs & Community",
    category: "Networking Events",
  },
};

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

// ============================================================
// FIND MAIN CATEGORY
// ============================================================

const getMainCategory = (category) => {
  if (!category) {
    return "";
  }

  const normalizedCategory =
    normalizeText(category);

  // Legacy category
  if (
    LEGACY_CATEGORY_MAP[
      normalizedCategory
    ]
  ) {
    return LEGACY_CATEGORY_MAP[
      normalizedCategory
    ].mainCategory;
  }

  // New professional category
  for (const [
    mainCategory,
    eventTypes,
  ] of Object.entries(
    EVENT_CATEGORIES
  )) {
    const match =
      eventTypes.some(
        (eventType) =>
          normalizeText(
            eventType
          ) ===
          normalizedCategory
      );

    if (match) {
      return mainCategory;
    }
  }

  return "";
};

// ============================================================
// NORMALIZE SPECIFIC CATEGORY
// ============================================================

const normalizeEventCategory = (
  category
) => {
  if (!category) {
    return "";
  }

  const normalized =
    normalizeText(category);

  if (
    LEGACY_CATEGORY_MAP[
      normalized
    ]
  ) {
    return LEGACY_CATEGORY_MAP[
      normalized
    ].category;
  }

  return String(category).trim();
};

// ============================================================
// VALIDATE MAIN CATEGORY + EVENT TYPE
// ============================================================

const isValidCategoryPair = (
  mainCategory,
  category
) => {
  if (
    !mainCategory ||
    !category
  ) {
    return false;
  }

  const allowedTypes =
    EVENT_CATEGORIES[
      mainCategory
    ];

  if (!allowedTypes) {
    return false;
  }

  return allowedTypes.includes(
    category
  );
};

// ============================================================
// EVENT STATUS
// ============================================================

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

// ============================================================
// FORMAT EVENT
// ============================================================

const formatEventWithStatus = (
  event
) => {
  const eventObj =
    event.toObject();

  eventObj.eventStatus =
    getEventStatus(
      eventObj.date,
      eventObj.endDate
    );

  return eventObj;
};

// ============================================================
// ADD EVENT
// ============================================================

export const addEvent = async (
  req,
  res
) => {
  try {
    const {
      name,
      date,
      endDate,
      location,
      category,
      mainCategory,
      image,
      description = "No description available",
      department = ["ALL"],
      year = ["ALL"],
    } = req.body;

    // --------------------------------------------------------
    // REQUIRED FIELDS
    // --------------------------------------------------------

    if (
      !name ||
      !date ||
      !location ||
      !category
    ) {
      return res.status(400).json({
        message:
          "Name, date, location and event type are required",
      });
    }

    // --------------------------------------------------------
    // NORMALIZE CATEGORY
    // --------------------------------------------------------

    const normalizedCategory =
      normalizeEventCategory(
        category
      );

    // Use mainCategory sent by the new admin dashboard.
    // If absent, derive it for legacy compatibility.

    const resolvedMainCategory =
      mainCategory?.trim() ||
      getMainCategory(
        normalizedCategory
      );

    if (!resolvedMainCategory) {
      return res.status(400).json({
        message:
          "Unable to determine the main category for this event",
      });
    }

    // --------------------------------------------------------
    // VALIDATE CATEGORY RELATIONSHIP
    // --------------------------------------------------------

    if (
      !isValidCategoryPair(
        resolvedMainCategory,
        normalizedCategory
      )
    ) {
      return res.status(400).json({
        message:
          "The selected event type does not belong to the selected main category",
      });
    }

    // --------------------------------------------------------
    // CREATE EVENT
    // --------------------------------------------------------

    const event =
      new Event({
        name: name.trim(),

        date:
          new Date(date),

        endDate:
          endDate
            ? new Date(
                endDate
              )
            : null,

        location:
          location.trim(),

        mainCategory:
          resolvedMainCategory,

        category:
          normalizedCategory,

        image:
          image || "",

        description:
          description ||
          "No description available",

        department:
          Array.isArray(
            department
          ) &&
          department.length
            ? department
            : ["ALL"],

        year:
          Array.isArray(year) &&
          year.length
            ? year
            : ["ALL"],
      });

    await event.save();

    const formattedEvent =
      formatEventWithStatus(
        event
      );

    return res
      .status(201)
      .json({
        message:
          "Event added successfully",

        event:
          formattedEvent,
      });
  } catch (error) {
    console.error(
      "Error adding event:",
      error
    );

    return res
      .status(500)
      .json({
        message:
          error.message ||
          "Server error",
      });
  }
};

// ============================================================
// GET ALL EVENTS
// ============================================================

export const getAllEvents =
  async (req, res) => {
    try {
      const events =
        await Event.find().sort({
          date: 1,
        });

      const formattedEvents =
        events.map((event) =>
          formatEventWithStatus(
            event
          )
        );

      return res
        .status(200)
        .json(
          formattedEvents
        );
    } catch (error) {
      console.error(
        "Error fetching events:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to fetch events",
        });
    }
  };

// ============================================================
// GET SINGLE EVENT
// ============================================================

export const getEventById =
  async (req, res) => {
    try {
      const event =
        await Event.findById(
          req.params.id
        );

      if (!event) {
        return res
          .status(404)
          .json({
            message:
              "Event not found",
          });
      }

      const formattedEvent =
        formatEventWithStatus(
          event
        );

      return res
        .status(200)
        .json(
          formattedEvent
        );
    } catch (error) {
      console.error(
        "Error fetching event by ID:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to fetch event",
        });
    }
  };

// ============================================================
// UPDATE WINNERS
// ============================================================

export const updateEventWinners =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const { winners } =
        req.body;

      if (
        !Array.isArray(
          winners
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Winners must be an array",
          });
      }

      const event =
        await Event.findById(
          id
        );

      if (!event) {
        return res
          .status(404)
          .json({
            message:
              "Event not found",
          });
      }

      event.winners =
        winners;

      event.resultStatus =
        "announced";

      await event.save();

      // ======================================================
      // SEND WINNER EMAILS
      // ======================================================

      for (
        const winner
        of winners
      ) {
        try {
          if (!winner.user) {
            continue;
          }

          const user =
            await User.findById(
              winner.user
            );

          if (!user?.email) {
            continue;
          }

          await sendMail({
            to: user.email,

            subject:
              `🎉 Congratulations! You won ${event.name}`,

            text:
              `Congrats ${user.name}! You secured ${winner.position} place in ${event.name}`,

            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                <h2 style="color: #16a34a;">
                  🎉 Congratulations ${user.name}!
                </h2>

                <p>
                  You have secured
                  <strong>${winner.position}</strong>
                  place in:
                </p>

                <div
                  style="
                    background: #f4f4f5;
                    padding: 15px;
                    border-radius: 10px;
                  "
                >
                  <p>
                    <strong>Event:</strong>
                    ${event.name}
                  </p>

                  <p>
                    <strong>Position:</strong>
                    ${winner.position}
                  </p>

                  <p>
                    <strong>Date:</strong>
                    ${new Date(
                      event.date
                    ).toLocaleDateString()}
                  </p>

                  <p>
                    <strong>Location:</strong>
                    ${event.location}
                  </p>
                </div>

                <p>
                  Keep shining ✨
                  <br />
                  Team Eventify
                </p>
              </div>
            `,
          });

          console.log(
            "✅ Winner mail sent:",
            user.email
          );
        } catch (err) {
          console.error(
            "❌ Winner mail failed:",
            err.message
          );
        }
      }

      return res.json({
        message:
          "Winners updated & emails sent",
      });
    } catch (error) {
      console.error(
        "Winner update error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Error updating winners",
        });
    }
  };

// ============================================================
// RECOMMEND EVENTS
// ============================================================
// Kept for backward compatibility.
//
// The current frontend Events.jsx performs deterministic,
// exact interest matching locally. Therefore this endpoint
// no longer calls the external ML service and does not use
// location.
// ============================================================

export const recommendEvents =
  async (req, res) => {
    try {
      const rawInterests =
        req.body.interests ||
        req.body.user_interests ||
        [];

      const interests =
        Array.isArray(
          rawInterests
        )
          ? rawInterests
          : [];

      const normalizedInterests =
        [
          ...new Set(
            interests
              .map(
                normalizeEventCategory
              )
              .filter(Boolean)
          ),
        ];

      if (
        normalizedInterests
          .length === 0
      ) {
        return res.json({
          recommendedEvents:
            [],
        });
      }

      const events =
        await Event.find();

      const interestSet =
        new Set(
          normalizedInterests.map(
            normalizeText
          )
        );

      const recommended =
        events
          .filter(
            (event) => {
              const eventCategory =
                normalizeEventCategory(
                  event.category
                );

              return interestSet.has(
                normalizeText(
                  eventCategory
                )
              );
            }
          )
          .map((event) =>
            formatEventWithStatus(
              event
            )
          );

      return res.json({
        recommendedEvents:
          recommended,
      });
    } catch (error) {
      console.error(
        "Recommendation error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Recommendation failed",
        });
    }
  };