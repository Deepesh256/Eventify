import { useNavigate } from "react-router-dom";

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

const LEGACY_CATEGORY_MAP = {
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

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const getMainCategory = (event) => {
  const value = normalize(
    event?.mainCategory
  );

  if (LEGACY_MAIN_CATEGORY_MAP[value]) {
    return LEGACY_MAIN_CATEGORY_MAP[
      value
    ];
  }

  return (
    event?.mainCategory ||
    "General Event"
  );
};

const getCategory = (event) => {
  const value = normalize(event?.category);

  if (LEGACY_CATEGORY_MAP[value]) {
    return LEGACY_CATEGORY_MAP[value];
  }

  return (
    event?.category ||
    "General"
  );
};

const startOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfDay = (value) => {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
};

const getEventStatus = (event) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(
    23,
    59,
    59,
    999
  );

  const start = startOfDay(event.date);
  const end = endOfDay(
    event.endDate || event.date
  );

  if (
    start <= todayEnd &&
    end >= todayStart
  ) {
    return {
      key: "ongoing",
      label: "Happening Today",
    };
  }

  if (start > todayEnd) {
    return {
      key: "upcoming",
      label: "Upcoming",
    };
  }

  return {
    key: "completed",
    label: "Completed",
  };
};

const formatDate = (value) => {
  if (!value) return "Date not available";

  return new Date(value).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  const status =
    getEventStatus(event);

  const mainCategory =
    getMainCategory(event);

  const category =
    getCategory(event);

  const startDate =
    formatDate(event.date);

  const endDate =
    event.endDate
      ? formatDate(event.endDate)
      : "";

  const hasDateRange =
    endDate &&
    event.endDate?.slice?.(0, 10) !==
      event.date?.slice?.(0, 10);

  const openEvent = () => {
    navigate(`/event/${event._id}`);
  };

  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" ||
      e.key === " "
    ) {
      e.preventDefault();
      openEvent();
    }
  };

  return (
    <article
      className="eventify-event-card"
      role="button"
      tabIndex={0}
      onClick={openEvent}
      onKeyDown={handleKeyDown}
    >
      <div className="eventify-event-poster">
        {event.image ? (
          <img
            src={event.image}
            alt={`${event.name} poster`}
            loading="lazy"
          />
        ) : (
          <div className="eventify-event-poster-fallback">
            <span className="eventify-event-poster-fallback-label">
              {mainCategory}
            </span>

            <span className="eventify-event-poster-fallback-title">
              {event.name}
            </span>
          </div>
        )}
      </div>

      <div className="eventify-event-content">
        <div className="eventify-card-topline">
          <div className="eventify-card-category-group">
            <span className="eventify-card-category">
              {category}
            </span>

            <span className="eventify-card-main-category">
              {mainCategory}
            </span>
          </div>

          <span
            className={`eventify-card-status eventify-status-${status.key}`}
          >
            {status.label}
          </span>
        </div>

        <h3 className="eventify-event-title">
          {event.name}
        </h3>

        <div className="eventify-event-meta">
          <div className="eventify-event-meta-row">
            <span className="eventify-event-meta-icon">
              📅
            </span>

            <span className="eventify-event-date-range">
              {startDate}
              {hasDateRange
                ? ` → ${endDate}`
                : ""}
            </span>
          </div>

          <div className="eventify-event-meta-row">
            <span className="eventify-event-meta-icon">
              📍
            </span>

            <span className="eventify-event-location">
              {event.location ||
                "Location not specified"}
            </span>
          </div>
        </div>

        {(event.department?.length > 0 ||
          event.year?.length > 0) && (
          <div className="eventify-eligibility-mini">
            <div>
              <span className="eventify-meta-label">
                Departments
              </span>

              <span>
                {event.department?.join(
                  ", "
                ) || "ALL"}
              </span>
            </div>

            <div>
              <span className="eventify-meta-label">
                Years
              </span>

              <span>
                {event.year?.join(", ") ||
                  "ALL"}
              </span>
            </div>
          </div>
        )}

        {event.resultStatus ===
          "announced" && (
          <span className="eventify-result-badge">
            Results Announced
          </span>
        )}
      </div>
    </article>
  );
};

export default EventCard;
