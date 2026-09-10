import React from "react";

const Poster = ({ event }) => {
  const category =
    event?.category?.toLowerCase() || "";

  // Background used only when event has no image
  const getBackground = () => {
    if (
      ["tech", "coding", "ai"].includes(
        category
      )
    ) {
      return "from-blue-500 via-purple-600 to-indigo-700";
    }

    if (
      ["music", "dance"].includes(category)
    ) {
      return "from-pink-500 via-red-500 to-yellow-500";
    }

    if (
      [
        "cricket",
        "kabaddi",
        "sports",
      ].includes(category)
    ) {
      return "from-orange-500 via-red-600 to-yellow-600";
    }

    return "from-gray-700 to-gray-900";
  };

  // ============================================
  // REAL EVENT IMAGE
  // ============================================

  if (event?.image) {
    return (
      <div className="relative w-full h-56 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
        <img
          src={event.image}
          alt={event.name || "Event"}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            console.error(
              "Failed to load event image:",
              event.image
            );

            e.currentTarget.style.display =
              "none";
          }}
        />

        {/* Slight overlay for better appearance */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
      </div>
    );
  }

  // ============================================
  // FALLBACK POSTER
  // Only shown when event.image does not exist
  // ============================================

  return (
    <div
      className={`relative w-full h-56 rounded-2xl overflow-hidden bg-gradient-to-br ${getBackground()} shadow-lg hover:shadow-2xl transition-all duration-300`}
    >
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative p-4 h-full flex flex-col justify-between text-white">
        {/* TOP */}

        <div className="flex justify-between items-center">
          <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium tracking-wide">
            {event?.category || "Event"}
          </span>

          <span className="text-xs text-white/80">
            📍{" "}
            {event?.location ||
              "Location unavailable"}
          </span>
        </div>

        {/* TITLE */}

        <div>
          <h2 className="text-2xl font-extrabold uppercase tracking-wider drop-shadow-md">
            {event?.name || "Event"}
          </h2>
        </div>

        {/* DATE */}

        <div className="text-xs text-white/90 flex justify-between items-center">
          <span>
            📅{" "}
            {event?.date
              ? new Date(
                  event.date
                ).toLocaleDateString(
                  "en-IN"
                )
              : "Date unavailable"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Poster;