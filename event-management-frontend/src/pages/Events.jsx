import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import API from "../services/api";
import EventCard from "../components/EventCard";

// ============================================================
// PROFESSIONAL CATEGORY STRUCTURE
// ============================================================

const EVENT_CATEGORIES = [
  {
    mainCategory: "Technology & Innovation",
    eventTypes: [
      "Programming & Development",
      "AI & Machine Learning",
      "Web Development",
      "App Development",
      "Data Science",
      "Cybersecurity",
      "Hackathons",
    ],
  },
  {
    mainCategory: "Sports & Athletics",
    eventTypes: [
      "Cricket",
      "Kabaddi",
      "Football",
      "Volleyball",
      "Basketball",
      "Badminton",
      "Athletics",
      "Chess",
    ],
  },
  {
    mainCategory: "Arts & Culture",
    eventTypes: [
      "Music",
      "Dance",
      "Singing",
      "Drama & Theatre",
      "Fine Arts",
      "Cultural Festivals",
    ],
  },
  {
    mainCategory: "Workshops & Learning",
    eventTypes: [
      "Technical Workshops",
      "Skill Development",
      "Career Workshops",
      "Hands-on Training",
    ],
  },
  {
    mainCategory: "Seminars & Conferences",
    eventTypes: [
      "Seminars",
      "Guest Lectures",
      "Conferences",
      "Expert Talks",
    ],
  },
  {
    mainCategory: "Gaming & Esports",
    eventTypes: [
      "Esports",
      "PC Gaming",
      "Mobile Gaming",
    ],
  },
  {
    mainCategory: "Photography & Media",
    eventTypes: [
      "Photography",
      "Videography",
      "Content Creation",
      "Short Film",
    ],
  },
  {
    mainCategory: "Clubs & Community",
    eventTypes: [
      "Club Activities",
      "Volunteering",
      "Community Programs",
      "Networking Events",
    ],
  },
];

// ============================================================
// LEGACY INTEREST / CATEGORY SUPPORT
// ============================================================

const LEGACY_INTEREST_MAP = {
  tech: "Programming & Development",
  coding: "Programming & Development",
  ai: "AI & Machine Learning",

  music: "Music",
  dance: "Dance",

  cricket: "Cricket",
  kabaddi: "Kabaddi",
  sports: "Athletics",

  workshop: "Technical Workshops",
  seminar: "Seminars",

  gaming: "Esports",
  photography: "Photography",
  club: "Club Activities",
};

const LEGACY_MAIN_CATEGORY_MAP = {
  technical: "Technology & Innovation",
  tech: "Technology & Innovation",

  cultural: "Arts & Culture",
  culture: "Arts & Culture",

  sports: "Sports & Athletics",
  sport: "Sports & Athletics",

  workshop: "Workshops & Learning",

  seminar: "Seminars & Conferences",
  conference: "Seminars & Conferences",

  gaming: "Gaming & Esports",

  photography: "Photography & Media",
  media: "Photography & Media",

  club: "Clubs & Community",
};

// ============================================================
// HELPERS
// ============================================================

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const normalizeInterest = (interest) => {
  const normalized =
    normalizeText(interest);

  if (
    LEGACY_INTEREST_MAP[
      normalized
    ]
  ) {
    return LEGACY_INTEREST_MAP[
      normalized
    ];
  }

  return String(interest || "").trim();
};

const getMainCategoryForType = (
  eventType
) => {
  const group =
    EVENT_CATEGORIES.find(
      (item) =>
        item.eventTypes.includes(
          eventType
        )
    );

  return (
    group?.mainCategory || ""
  );
};

const getEventCategory = (event) => {
  if (!event?.category) {
    return "";
  }

  const normalized =
    normalizeText(
      event.category
    );

  if (
    LEGACY_INTEREST_MAP[
      normalized
    ]
  ) {
    return LEGACY_INTEREST_MAP[
      normalized
    ];
  }

  return String(
    event.category
  ).trim();
};

const getEventMainCategory = (
  event
) => {
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

  const category =
    getEventCategory(event);

  return getMainCategoryForType(
    category
  );
};

const getEventStatus = (event) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const start = new Date(event.date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(
    event.endDate || event.date
  );
  end.setHours(23, 59, 59, 999);

  if (
    start <= todayEnd &&
    end >= todayStart
  ) {
    return "ongoing";
  }

  if (start > todayEnd) {
    return "upcoming";
  }

  return "completed";
};

const Events = () => {
  const [events, setEvents] =
    useState([]);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState("all");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [
    loading,
    setLoading,
  ] = useState(true);

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

  // No default "music".
  // Recommendations should only use actual selected interests.

  const userInterests =
    Array.isArray(
      user?.interests
    )
      ? user.interests
      : [];

  // ============================================================
  // NORMALIZED USER INTERESTS
  // ============================================================

  const normalizedUserInterests =
    useMemo(() => {
      return [
        ...new Set(
          userInterests
            .map(
              normalizeInterest
            )
            .filter(Boolean)
        ),
      ];
    }, [userInterests]);

  // ============================================================
  // FETCH EVENTS
  // ============================================================

  useEffect(() => {
    const fetchEvents =
      async () => {
        try {
          setLoading(true);

          const { data } =
            await API.get(
              "/events"
            );

          const eventList =
            Array.isArray(data)
              ? data
              : [];

          setEvents(
            eventList
          );
        } catch (error) {
          console.error(
            "Error fetching events:",
            error
          );

          setEvents([]);
        } finally {
          setLoading(false);
        }
      };

    fetchEvents();
  }, []);

  // ============================================================
  // RECOMMENDATIONS
  // EXACT AREAS OF INTEREST ONLY
  // ============================================================

  const recommendedEvents =
    useMemo(() => {
      if (
        normalizedUserInterests
          .length === 0
      ) {
        return [];
      }

      const interestSet =
        new Set(
          normalizedUserInterests.map(
            normalizeText
          )
        );

      return events.filter(
        (event) => {
          const eventCategory =
            getEventCategory(
              event
            );

          return interestSet.has(
            normalizeText(
              eventCategory
            )
          );
        }
      );
    }, [
      events,
      normalizedUserInterests,
    ]);

  // ============================================================
  // NORMAL SEARCH + MAIN CATEGORY FILTER
  // ============================================================

  const matchesFilters = (
    event
  ) => {
    const term =
      normalizeText(
        searchTerm
      );

    const eventCategory =
      getEventCategory(event);

    const eventMainCategory =
      getEventMainCategory(
        event
      );

    // Location is intentionally used here
    // for normal search only.
    const searchMatches =
      !term ||
      normalizeText(
        event.name
      ).includes(term) ||
      normalizeText(
        eventCategory
      ).includes(term) ||
      normalizeText(
        eventMainCategory
      ).includes(term) ||
      normalizeText(
        event.location
      ).includes(term);

    const categoryMatches =
      categoryFilter ===
        "all" ||
      eventMainCategory ===
        categoryFilter;

    const eventStatus =
      getEventStatus(event);

    const statusMatches =
      statusFilter === "all" ||
      eventStatus === statusFilter;

    return (
      searchMatches &&
      categoryMatches &&
      statusMatches
    );
  };

  // ============================================================
  // FILTERED RECOMMENDED
  // ============================================================

  const filteredRecommendedEvents =
    useMemo(() => {
      return recommendedEvents.filter(
        matchesFilters
      );
    }, [
      recommendedEvents,
      searchTerm,
      categoryFilter,
      statusFilter,
    ]);

  // ============================================================
  // EXPLORE MORE
  // ============================================================

  const filteredExploreEvents =
    useMemo(() => {
      const recommendedIds =
        new Set(
          recommendedEvents.map(
            (event) =>
              event._id
          )
        );

      return events
        .filter(
          (event) =>
            !recommendedIds.has(
              event._id
            )
        )
        .filter(
          matchesFilters
        );
    }, [
      events,
      recommendedEvents,
      searchTerm,
      categoryFilter,
      statusFilter,
    ]);

  const totalVisible =
    filteredRecommendedEvents
      .length +
    filteredExploreEvents
      .length;

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="eventify-user-page">
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="eventify-page-header">
        <div>
          <p className="eventify-section-label">
            DISCOVER
          </p>

          <h1 className="eventify-user-title">
            Find your next event
          </h1>

          <p className="eventify-user-subtitle">
            Personalized
            recommendations based only
            on your selected areas of
            interest.
          </p>
        </div>

        <div className="eventify-page-count">
          {events.length} Events
        </div>
      </div>

      {/* ================================================= */}
      {/* SEARCH + FILTER */}
      {/* ================================================= */}

      <div className="eventify-filter-panel">
        <div className="eventify-search-box">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search events, categories or locations..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
          />
        </div>

        <select
          value={
            categoryFilter
          }
          onChange={(e) =>
            setCategoryFilter(
              e.target.value
            )
          }
          className="eventify-filter-select"
        >
          <option value="all">
            All Categories
          </option>

          {EVENT_CATEGORIES.map(
            (group) => (
              <option
                key={
                  group.mainCategory
                }
                value={
                  group.mainCategory
                }
              >
                {
                  group.mainCategory
                }
              </option>
            )
          )}
        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
          className="eventify-filter-select"
          aria-label="Filter by event status"
        >
          <option value="all">
            All Status
          </option>

          <option value="ongoing">
            Happening Today
          </option>

          <option value="upcoming">
            Upcoming
          </option>

          <option value="completed">
            Completed
          </option>
        </select>

        <span className="eventify-filter-count">
          {totalVisible} found
        </span>
      </div>

      {/* ================================================= */}
      {/* LOADING */}
      {/* ================================================= */}

      {loading ? (
        <div className="eventify-empty-state mt-8">
          <div className="eventify-loading-spinner" />

          <p className="mt-4">
            Finding events for you...
          </p>
        </div>
      ) : (
        <>
          {/* ================================================= */}
          {/* RECOMMENDED */}
          {/* ================================================= */}

          <section className="mt-10">
            <div className="eventify-page-heading-row">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  ✨ Recommended for
                  You
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Exact matches from
                  your selected areas of
                  interest.
                </p>
              </div>

              <span className="eventify-section-count">
                {
                  filteredRecommendedEvents
                    .length
                }
              </span>
            </div>

            {normalizedUserInterests
              .length === 0 ? (
              <div className="eventify-empty-state">
                <div className="text-3xl">
                  ✨
                </div>

                <p className="font-semibold text-white mt-3">
                  Add your areas of
                  interest
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  Select interests in
                  your profile to receive
                  personalized event
                  recommendations.
                </p>
              </div>
            ) : filteredRecommendedEvents
                .length === 0 ? (
              <div className="eventify-empty-state">
                <div className="text-3xl">
                  ✨
                </div>

                <p className="font-semibold text-white mt-3">
                  No matching
                  recommendations
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  There are currently no
                  events matching your
                  selected areas of
                  interest.
                </p>
              </div>
            ) : (
              <div className="eventify-events-grid">
                {filteredRecommendedEvents.map(
                  (event) => (
                    <EventCard
                      key={
                        event._id
                      }
                      event={
                        event
                      }
                    />
                  )
                )}
              </div>
            )}
          </section>

          {/* ================================================= */}
          {/* EXPLORE MORE */}
          {/* ================================================= */}

          <section className="mt-12">
            <div className="eventify-page-heading-row">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Explore More
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Discover other
                  available events
                  outside your current
                  interests.
                </p>
              </div>

              <span className="eventify-section-count">
                {
                  filteredExploreEvents
                    .length
                }
              </span>
            </div>

            {filteredExploreEvents.length ===
            0 ? (
              <div className="eventify-empty-state">
                No other events match
                your current search or
                filter.
              </div>
            ) : (
              <div className="eventify-events-grid">
                {filteredExploreEvents.map(
                  (event) => (
                    <EventCard
                      key={
                        event._id
                      }
                      event={
                        event
                      }
                    />
                  )
                )}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default Events;