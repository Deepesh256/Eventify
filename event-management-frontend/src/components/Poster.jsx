import React from "react";

const Poster = ({ event }) => {

  const category = event.category?.toLowerCase();

  // 🎨 Dynamic Background based on category
  const getBackground = () => {
    if (["tech", "coding", "ai"].includes(category))
      return "from-blue-500 via-purple-600 to-indigo-700";
    if (["music", "dance"].includes(category))
      return "from-pink-500 via-red-500 to-yellow-500";
    if (["cricket", "kabaddi", "sports"].includes(category))
      return "from-orange-500 via-red-600 to-yellow-600";
    return "from-gray-700 to-gray-900";
  };

  return (
  <div
    className={`relative w-full h-56 rounded-2xl overflow-hidden bg-gradient-to-br ${getBackground()} shadow-lg hover:shadow-2xl transition-all duration-300`}
  >

    {/* Overlay for depth */}
    <div className="absolute inset-0 bg-black/20"></div>

    {/* Content */}
    <div className="relative p-4 h-full flex flex-col justify-between text-white">

      {/* Top Row */}
      <div className="flex justify-between items-center">

        {/* Category Badge */}
        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium tracking-wide">
          {event.category}
        </span>

        {/* Location */}
        <span className="text-xs text-white/80">
          📍 {event.location}
        </span>

      </div>

      {/* Center Title */}
      <div>
        <h2 className="text-2xl font-extrabold uppercase tracking-wider drop-shadow-md">
          {event.name}
        </h2>
      </div>

      {/* Bottom Row */}
      <div className="text-xs text-white/90 flex justify-between items-center">
        <span>📅 {new Date(event.date).toLocaleDateString()}</span>
      </div>

    </div>
  </div>
);
  
};

export default Poster;