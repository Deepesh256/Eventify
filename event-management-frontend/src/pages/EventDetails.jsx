import React, {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import API from "../services/api";
import toast from "react-hot-toast";

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

  music: {
    mainCategory: "Arts & Culture",
    category: "Music",
  },

  dance: {
    mainCategory: "Arts & Culture",
    category: "Dance",
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
};

const LEGACY_MAIN_CATEGORY_MAP = {
  technical: "Technology & Innovation",
  tech: "Technology & Innovation",

  sports: "Sports & Athletics",
  sport: "Sports & Athletics",

  cultural: "Arts & Culture",
  culture: "Arts & Culture",

  workshop: "Workshops & Learning",

  seminar: "Seminars & Conferences",
  conference: "Seminars & Conferences",

  gaming: "Gaming & Esports",

  photography: "Photography & Media",
  media: "Photography & Media",

  club: "Clubs & Community",
};

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const getDisplayCategory = (event) => {
  if (!event?.category) {
    return "";
  }

  const normalized =
    normalizeText(event.category);

  if (LEGACY_CATEGORY_MAP[normalized]) {
    return LEGACY_CATEGORY_MAP[normalized]
      .category;
  }

  return String(event.category).trim();
};

const getDisplayMainCategory = (event) => {
  if (event?.mainCategory) {
    const normalized =
      normalizeText(
        event.mainCategory
      );

    if (
      LEGACY_MAIN_CATEGORY_MAP[
        normalized
      ]
    ) {
      return LEGACY_MAIN_CATEGORY_MAP[
        normalized
      ];
    }

    return String(
      event.mainCategory
    ).trim();
  }

  const normalizedCategory =
    normalizeText(event?.category);

  return (
    LEGACY_CATEGORY_MAP[
      normalizedCategory
    ]?.mainCategory || ""
  );
};

// ============================================================
// STATUS COLOR
// ============================================================

const getStatusColor = (status) => {
  if (status === "Upcoming") {
    return "bg-green-500/20 text-green-300 border border-green-500/30";
  }

  if (status === "Ongoing") {
    return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30";
  }

  if (status === "Completed") {
    return "bg-red-500/20 text-red-300 border border-red-500/30";
  }

  return "bg-gray-500/20 text-gray-300 border border-gray-500/30";
};

// ============================================================
// EVENT DETAILS
// ============================================================

const EventDetails = () => {
  const { id } = useParams();

  const [event, setEvent] =
    useState(null);

  const [
    registered,
    setRegistered,
  ] = useState(false);

  const [
    registering,
    setRegistering,
  ] = useState(false);

  // ============================================================
  // USER
  // ============================================================

  const user = (() => {
    try {
      return JSON.parse(
        localStorage.getItem(
          "user"
        )
      );
    } catch {
      return null;
    }
  })();

  // ============================================================
  // FETCH EVENT
  // ============================================================

  useEffect(() => {
    const fetchEvent =
      async () => {
        try {
          const res =
            await API.get(
              `/events/${id}`
            );

          setEvent(res.data);
        } catch (err) {
          console.error(
            "Error fetching event details:",
            err
          );
        }
      };

    fetchEvent();
  }, [id]);

  // ============================================================
  // CHECK REGISTRATION
  // ============================================================

  useEffect(() => {
    const checkBooking =
      async () => {
        try {
          const res =
            await API.get(
              `/bookings/check/${user._id}/${id}`
            );

          setRegistered(
            res.data.registered
          );
        } catch (err) {
          console.error(
            "Error checking booking:",
            err
          );
        }
      };

    if (user?._id && id) {
      checkBooking();
    }
  }, [id, user?._id]);

  // ============================================================
  // LOADING
  // ============================================================

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="eventify-loading-spinner mx-auto" />

          <p className="text-slate-400 text-lg mt-4">
            Loading event...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // EVENT INFORMATION
  // ============================================================

  const isCompleted =
    event.eventStatus ===
    "Completed";

  const displayMainCategory =
    getDisplayMainCategory(event);

  const displayCategory =
    getDisplayCategory(event);

  // ============================================================
  // USER ELIGIBILITY
  // ============================================================

  const userDepartment =
    user?.department
      ?.toUpperCase()
      .trim();

  const userYear =
    user?.year
      ?.toUpperCase()
      .trim();

  const allowedDepartments =
    event.department || [];

  const allowedYears =
    event.year || [];

  const normalizedDepartments =
    allowedDepartments.map(
      (dept) =>
        String(dept)
          .toUpperCase()
          .trim()
    );

  const normalizedYears =
    allowedYears.map(
      (year) =>
        String(year)
          .toUpperCase()
          .trim()
    );

  const departmentEligible =
    normalizedDepartments.length === 0 ||
    normalizedDepartments.includes(
      "ALL"
    ) ||
    normalizedDepartments.includes(
      userDepartment
    );

  const yearEligible =
    normalizedYears.length === 0 ||
    normalizedYears.includes(
      "ALL"
    ) ||
    normalizedYears.includes(
      userYear
    );

  const isEligible =
    departmentEligible &&
    yearEligible;

  // ============================================================
  // REGISTER
  // ============================================================

  const handleRegister =
    async () => {
      if (!user?._id) {
        toast.error("Please login to register for this event.");

        return;
      }

      if (registered) {
        toast.error("You are already registered for this event.");

        return;
      }

      if (isCompleted) {
        toast.error("Registration is closed because this event is completed.");

        return;
      }

      if (!isEligible) {
        toast.error("You are not eligible to register for this event based on your department or year.");

        return;
      }

      try {
        setRegistering(true);

        const res =
          await API.post(
            "/bookings/register",
            {
              userId: user._id,
              eventId: id,
            }
          );

        toast.success(res.data.message ||
            "Registered successfully");

        setRegistered(true);
      } catch (err) {
        console.error(
          "Registration error:",
          err
        );

        toast.error(err.response?.data
            ?.message ||
            "Unable to register for this event.");
      } finally {
        setRegistering(false);
      }
    };

  // ============================================================
  // FALLBACK IMAGE
  // ============================================================

  const fallbackImage =
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30";

  // ============================================================
  // FORMATTED DATE
  // ============================================================

  const formattedDate =
    event.date
      ? new Date(
          event.date
        ).toLocaleDateString(
          "en-IN",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        )
      : "Date not available";

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-6 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* ================================================= */}
        {/* POSTER */}
        {/* ================================================= */}

        <div className="w-full bg-black/30 border border-white/10 rounded-3xl overflow-hidden shadow-2xl mb-7">
          <img
            src={
              event.image ||
              fallbackImage
            }
            alt={`${event.name} poster`}
            onError={(e) => {
              e.currentTarget.onerror =
                null;

              e.currentTarget.src =
                fallbackImage;
            }}
            className="
              w-full
              max-h-[700px]
              object-contain
              mx-auto
              bg-black/20
            "
          />
        </div>

        {/* ================================================= */}
        {/* EVENT HEADER */}
        {/* ================================================= */}

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5 md:p-7 mb-6">
          {/* CATEGORY */}

          <div className="flex flex-wrap gap-2 mb-4">
            {displayMainCategory && (
              <span className="px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-400/20 text-violet-300 text-xs font-semibold">
                {displayMainCategory}
              </span>
            )}

            {displayCategory && (
              <span className="px-3 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-400/20 text-fuchsia-300 text-xs font-semibold">
                {displayCategory}
              </span>
            )}

            {event.eventStatus && (
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(
                  event.eventStatus
                )}`}
              >
                {event.eventStatus}
              </span>
            )}

            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                event.resultStatus ===
                "announced"
                  ? "bg-emerald-500/10 border-emerald-400/20 text-emerald-300"
                  : "bg-slate-500/10 border-slate-400/20 text-slate-300"
              }`}
            >
              {event.resultStatus ===
              "announced"
                ? "🏆 Results Announced"
                : "Results Pending"}
            </span>
          </div>

          {/* TITLE */}

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            {event.name}
          </h1>

          {/* META */}

          <div className="flex flex-wrap gap-4 mt-5 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <span>📅</span>

              <span>
                {formattedDate}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span>📍</span>

              <span>
                {event.location ||
                  "Location not available"}
              </span>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* MAIN CONTENT */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* LEFT */}

          <div className="space-y-6">
            {/* ABOUT */}

            <section className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5 md:p-7">
              <p className="text-violet-300 text-sm font-semibold mb-2">
                EVENT INFORMATION
              </p>

              <h2 className="text-2xl font-bold mb-4">
                About Event
              </h2>

              <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                {event.description ||
                  "No description available"}
              </p>
            </section>

            {/* WINNERS */}

            <section className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5 md:p-7">
              <div className="mb-5">
                <p className="text-yellow-300 text-sm font-semibold mb-2">
                  EVENT RESULTS
                </p>

                <h2 className="text-2xl font-bold">
                  🏆 Winners
                </h2>
              </div>

              {event.resultStatus !==
                "announced" ||
              !event.winners?.length ? (
                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-6 text-center">
                  <div className="text-3xl mb-3">
                    🏆
                  </div>

                  <p className="text-slate-400">
                    Winners will be
                    announced after the
                    event.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {event.winners.map(
                    (
                      winner,
                      index
                    ) => {
                      const positionIcon =
                        winner.position ===
                        "1st"
                          ? "🥇"
                          : winner.position ===
                            "2nd"
                          ? "🥈"
                          : winner.position ===
                            "3rd"
                          ? "🥉"
                          : "🏆";

                      return (
                        <div
                          key={
                            winner.user ||
                            index
                          }
                          className="rounded-2xl border border-yellow-400/20 bg-yellow-500/[0.05] p-5"
                        >
                          <div className="text-3xl mb-3">
                            {
                              positionIcon
                            }
                          </div>

                          <p className="text-yellow-300 text-sm font-semibold">
                            {
                              winner.position
                            }{" "}
                            Place
                          </p>

                          <h3 className="text-white font-semibold text-lg mt-2">
                            {
                              winner.name
                            }
                          </h3>

                          {winner.department && (
                            <p className="text-sm text-slate-400 mt-2">
                              Department:{" "}
                              {
                                winner.department
                              }
                            </p>
                          )}

                          {winner.year && (
                            <p className="text-sm text-slate-400 mt-1">
                              Year:{" "}
                              {
                                winner.year
                              }
                            </p>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </section>
          </div>

          {/* ================================================= */}
          {/* RIGHT SIDE */}
          {/* ================================================= */}

          <aside className="space-y-6">
            {/* ELIGIBILITY */}

            <section className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5">
              <div className="flex items-start justify-between gap-3 mb-5">
                <div>
                  <p className="text-violet-300 text-xs font-semibold mb-1">
                    PARTICIPATION
                  </p>

                  <h2 className="text-xl font-bold">
                    Event Eligibility
                  </h2>
                </div>

                {user?._id && (
                  <span
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                      isEligible
                        ? "bg-green-500/10 text-green-300 border-green-500/30"
                        : "bg-red-500/10 text-red-300 border-red-500/30"
                    }`}
                  >
                    {isEligible
                      ? "✓ Eligible"
                      : "✕ Not Eligible"}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <EligibilityItem
                  label="Department"
                  value={
                    event.department
                      ?.length
                      ? event.department.includes(
                          "ALL"
                        )
                        ? "All Departments"
                        : event.department.join(
                            ", "
                          )
                      : "All Departments"
                  }
                />

                <EligibilityItem
                  label="Year"
                  value={
                    event.year?.length
                      ? event.year.includes(
                          "ALL"
                        )
                        ? "All Years"
                        : event.year.join(
                            ", "
                          )
                      : "All Years"
                  }
                />
              </div>

              {/* NOT ELIGIBLE */}

              {user?._id &&
                !isEligible && (
                  <div className="mt-4 bg-red-500/[0.07] border border-red-500/20 rounded-xl p-4">
                    <p className="text-sm text-red-300 font-medium mb-2">
                      You are not
                      eligible for this
                      event.
                    </p>

                    {!departmentEligible && (
                      <p className="text-xs text-slate-400">
                        Your department
                        does not match the
                        eligible
                        departments.
                      </p>
                    )}

                    {!yearEligible && (
                      <p className="text-xs text-slate-400 mt-1">
                        Your year does
                        not match the
                        eligible years.
                      </p>
                    )}
                  </div>
                )}
            </section>

            {/* REGISTRATION */}

            <section className="rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.08] to-fuchsia-500/[0.05] p-5">
              <p className="text-violet-300 text-xs font-semibold mb-2">
                REGISTRATION
              </p>

              <h2 className="text-xl font-bold">
                Join this event
              </h2>

              <p className="text-sm text-slate-400 mt-2 mb-5">
                Register to reserve
                your participation in
                this event.
              </p>

              <button
                type="button"
                onClick={
                  handleRegister
                }
                disabled={
                  registered ||
                  isCompleted ||
                  !isEligible ||
                  registering
                }
                className={`w-full py-3.5 px-4 font-semibold rounded-xl transition ${
                  registered
                    ? "bg-green-500/10 text-green-300 border border-green-500/30 cursor-not-allowed"
                    : isCompleted
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : !isEligible
                    ? "bg-red-500/10 text-red-300 border border-red-500/30 cursor-not-allowed"
                    : registering
                    ? "bg-violet-500/40 cursor-wait"
                    : "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-900/20"
                }`}
              >
                {registered
                  ? "Already Registered ✓"
                  : isCompleted
                  ? "Event Completed"
                  : !isEligible
                  ? "Not Eligible"
                  : registering
                  ? "Registering..."
                  : "Register Now"}
              </button>

              {!user?._id && (
                <p className="text-center text-xs text-slate-400 mt-3">
                  Please login to
                  register for this
                  event.
                </p>
              )}

              {registered && (
                <p className="text-center text-xs text-green-300 mt-3">
                  ✓ You have
                  successfully
                  registered for this
                  event.
                </p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// ELIGIBILITY ITEM
// ============================================================

const EligibilityItem = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/30 p-4">
      <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
        {label}
      </p>

      <p className="text-white font-medium">
        {value}
      </p>
    </div>
  );
};

export default EventDetails;