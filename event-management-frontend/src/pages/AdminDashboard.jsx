import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminAPI from "../services/adminApi";
import toast from "react-hot-toast";
import ConfirmModal from "../components/ConfirmModal";
// ============================================================
// PROFESSIONAL EVENT CATEGORY STRUCTURE
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
// LEGACY CATEGORY SUPPORT
// Keeps your old MongoDB events usable.
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

// ============================================================
// HELPERS
// ============================================================

const getMainCategoryForType = (eventType) => {
  const group = EVENT_CATEGORIES.find((item) =>
    item.eventTypes.includes(eventType)
  );

  return group?.mainCategory || "";
};

const normalizeLegacyCategory = (category) => {
  if (!category) {
    return {
      mainCategory: "",
      category: "",
    };
  }

  const key = String(category).trim().toLowerCase();

  if (LEGACY_CATEGORY_MAP[key]) {
    return LEGACY_CATEGORY_MAP[key];
  }

  return {
    mainCategory: getMainCategoryForType(category),
    category,
  };
};

const getEventMainCategory = (event) => {
  if (event?.mainCategory) {
    // Convert older mainCategory values if they exist.
    const legacyMain = String(event.mainCategory)
      .trim()
      .toLowerCase();

    if (
      legacyMain === "technical" ||
      legacyMain === "tech"
    ) {
      return "Technology & Innovation";
    }

    if (
      legacyMain === "sports" ||
      legacyMain === "sport"
    ) {
      return "Sports & Athletics";
    }

    if (
      legacyMain === "cultural" ||
      legacyMain === "culture"
    ) {
      return "Arts & Culture";
    }

    if (legacyMain === "workshop") {
      return "Workshops & Learning";
    }

    if (
      legacyMain === "seminar" ||
      legacyMain === "conference"
    ) {
      return "Seminars & Conferences";
    }

    if (legacyMain === "gaming") {
      return "Gaming & Esports";
    }

    if (
      legacyMain === "photography" ||
      legacyMain === "media"
    ) {
      return "Photography & Media";
    }

    if (legacyMain === "club") {
      return "Clubs & Community";
    }

    return event.mainCategory;
  }

  return normalizeLegacyCategory(event?.category)
    .mainCategory;
};

const getDisplayCategory = (event) => {
  if (!event?.category) return "N/A";

  return normalizeLegacyCategory(event.category)
    .category;
};

const Dashboard = () => {
  const navigate = useNavigate();

  // ============================================================
  // GENERAL STATE
  // ============================================================

  const [events, setEvents] = useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  // ============================================================
  // CREATE EVENT STATE
  // ============================================================
const [newEvent, setNewEvent] = useState({
  name: "",
  date: "",
  endDate: "",
  location: "",

  mainCategory: "",
  category: "",

  image: "",
  description: "",

  department: [],
  year: [],

  autoGeneratePoster: true,
});

const [isCreatingEvent, setIsCreatingEvent] =
  useState(false);
 
  // ============================================================
  // EDIT EVENT STATE
  // ============================================================

  const [editingEvent, setEditingEvent] =
    useState(null);

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [endDate, setEndDate] =
  useState("");
  const [location, setLocation] =
    useState("");

  const [mainCategory, setMainCategory] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [image, setImage] = useState("");

  const [description, setDescription] =
    useState("");

  const [
    editDepartment,
    setEditDepartment,
  ] = useState([]);

  const [editYear, setEditYear] =
    useState([]);

  // ============================================================
  // PARTICIPANTS / WINNERS
  // ============================================================

  const [
    participantsMap,
    setParticipantsMap,
  ] = useState({});

  const [
    winnerSelections,
    setWinnerSelections,
  ] = useState({});

  const [deleteEventId, setDeleteEventId] =
  useState(null);

  // ============================================================
  // BACKEND URL
  // ============================================================

  const backendURL = (
  AdminAPI.defaults.baseURL ||
  "https://eventify-backend-s1n6.onrender.com/api"
).replace(/\/api\/?$/, "");
  // ============================================================
  // CATEGORY OPTIONS
  // ============================================================

  const createCategoryOptions = useMemo(() => {
    return (
      EVENT_CATEGORIES.find(
        (group) =>
          group.mainCategory ===
          newEvent.mainCategory
      )?.eventTypes || []
    );
  }, [newEvent.mainCategory]);

  const editCategoryOptions = useMemo(() => {
    return (
      EVENT_CATEGORIES.find(
        (group) =>
          group.mainCategory ===
          mainCategory
      )?.eventTypes || []
    );
  }, [mainCategory]);
// ============================================================
// DATE STATUS
// ============================================================

const isUpcomingEvent = (event) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventEndDate = new Date(event.endDate || event.date);
  eventEndDate.setHours(23, 59, 59, 999);
  return eventEndDate >= today;
};

const isTodayEvent = (event) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const eventStart = new Date(event.date);
  eventStart.setHours(0, 0, 0, 0);
  const eventEnd = new Date(event.endDate || event.date);
  eventEnd.setHours(23, 59, 59, 999);
  return eventStart <= todayEnd && eventEnd >= todayStart;
};

// ============================================================
// FETCH EVENTS
// ============================================================
 
  const fetchEvents = async () => {
    try {
      const res =
        await AdminAPI.get("/events");

      const eventData = Array.isArray(res.data)
        ? res.data
        : [];

      setEvents(eventData);

      const initialSelections = {};

      eventData.forEach((event) => {
        initialSelections[event._id] = {
          first:
            event.winners?.find(
              (winner) =>
                winner.position === "1st"
            )?.user || "",

          second:
            event.winners?.find(
              (winner) =>
                winner.position === "2nd"
            )?.user || "",

          third:
            event.winners?.find(
              (winner) =>
                winner.position === "3rd"
            )?.user || "",
        };
      });

      setWinnerSelections(
        initialSelections
      );
    } catch (error) {
      console.error(
        "Error fetching events:",
        error
      );

      toast.error("Failed to fetch events");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // ============================================================
// FILTER EVENTS
// ============================================================

const filteredEvents = useMemo(() => {
  const search =
    searchTerm.trim().toLowerCase();

  return events.filter((event) => {
    const eventMainCategory =
      getEventMainCategory(event);

    const eventCategory =
      getDisplayCategory(event);

    const matchesSearch =
      !search ||
      event.name
        ?.toLowerCase()
        .includes(search) ||
      event.location
        ?.toLowerCase()
        .includes(search) ||
      eventCategory
        ?.toLowerCase()
        .includes(search) ||
      eventMainCategory
        ?.toLowerCase()
        .includes(search);

    const matchesCategory =
      categoryFilter === "all" ||
      eventMainCategory ===
        categoryFilter;

    const upcoming =
      isUpcomingEvent(event);

    const today =
      isTodayEvent(event);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "today" &&
        today) ||
      (statusFilter ===
        "upcoming" &&
        upcoming &&
        !today) ||
      (statusFilter ===
        "completed" &&
        !upcoming);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStatus
    );
  });
}, [
  events,
  searchTerm,
  categoryFilter,
  statusFilter,
]);

// ============================================================
// DASHBOARD STATISTICS
// ============================================================

const todayCount = events.filter(
  isTodayEvent
).length;

const upcomingCount = events.filter(
  (event) =>
    isUpcomingEvent(event) &&
    !isTodayEvent(event)
).length;

const completedCount = events.filter(
  (event) => !isUpcomingEvent(event)
).length;

const announcedResultsCount =
  events.filter(
    (event) =>
      event.resultStatus ===
      "announced"
  ).length;
  // ============================================================
  // CREATE CATEGORY CHANGE
  // ============================================================

  const handleCreateMainCategoryChange = (
    value
  ) => {
    setNewEvent((prev) => ({
      ...prev,
      mainCategory: value,
      category: "",
    }));
  };

  // ============================================================
  // ADD EVENT
  // ============================================================

 const handleAddEvent = async (e) => {
  e.preventDefault();

  // Prevent accidental double submission
  if (isCreatingEvent) return;

  // Basic information validation
  if (
    !newEvent.name.trim() ||
    !newEvent.date ||
    !newEvent.location.trim()
  ) {
    toast.error("Please complete the basic event information");
    return;
  }

  // End date validation
  if (
    newEvent.endDate &&
    new Date(newEvent.endDate) <
      new Date(newEvent.date)
  ) {
    toast.error("End date cannot be before the start date");
    return;
  }

  // Category validation
  if (
    !newEvent.mainCategory ||
    !newEvent.category
  ) {
    toast.error("Please select Main Category and Event Type");
    return;
  }

  // Department validation
  if (
    newEvent.department.length === 0
  ) {
    toast.error("Please select at least one eligible department");
    return;
  }

  // Year validation
  if (newEvent.year.length === 0) {
    toast.error("Please select at least one eligible year");
    return;
  }

  try {
    setIsCreatingEvent(true);

    const eventData = {
      ...newEvent,

      name: newEvent.name.trim(),

      date: newEvent.date,

      endDate:
        newEvent.endDate || null,

      location:
        newEvent.location.trim(),

      mainCategory:
        newEvent.mainCategory,

      category:
        newEvent.category,

      image:
        newEvent.image.trim(),

      description:
        newEvent.description.trim(),

      department:
        newEvent.department,

      year:
        newEvent.year,
    };

    const manualImageUrl =
      newEvent.image.trim();

    // ========================================================
    // POSTER
    // Manual URL always gets priority
    // ========================================================

    if (manualImageUrl) {
      eventData.image =
        manualImageUrl;
    } else if (
      newEvent.autoGeneratePoster
    ) {
      try {
        const posterRes =
          await AdminAPI.post(
            "/posters/generate",
            {
              name:
                newEvent.name.trim(),

              mainCategory:
                newEvent.mainCategory,

              category:
                newEvent.category,

              date:
                newEvent.date,

              location:
                newEvent.location.trim(),

              description:
                newEvent.description.trim(),
            }
          );

        if (
          posterRes.data?.imageUrl
        ) {
          const posterPath =
            posterRes.data.imageUrl;

          eventData.image =
            posterPath.startsWith(
              "http"
            )
              ? posterPath
              : `${backendURL}${posterPath}`;
        }
      } catch (posterError) {
        console.error(
          "Poster generation failed:",
          posterError.response?.data ||
            posterError.message
        );

        toast("Poster generation failed, but the event will still be created.");
      }
    }

    // This is frontend-only.
    // Do not save it in MongoDB.
    delete eventData.autoGeneratePoster;

    // ========================================================
    // CREATE EVENT
    // ========================================================

    await AdminAPI.post(
      "/events",
      eventData
    );

    toast.success("Event created successfully!");

    // ========================================================
    // RESET FORM
    // ========================================================

    setNewEvent({
      name: "",
      date: "",
      endDate: "",
      location: "",

      mainCategory: "",
      category: "",

      image: "",
      description: "",

      department: [],
      year: [],

      autoGeneratePoster: true,
    });

    // Refresh events
    await fetchEvents();

    // Move admin to Manage Events
    setTimeout(() => {
      scrollToSection(
        "manage-events"
      );
    }, 150);
  } catch (error) {
    console.error(
      "Add event error:",
      error.response?.data ||
        error.message
    );

    toast.error(error.response?.data?.message ||
        "Failed to add event");
  } finally {
    setIsCreatingEvent(false);
  }
};

  // ============================================================
  // DELETE EVENT
  // ============================================================

const handleDelete = (eventId) => {
  setDeleteEventId(eventId);
};

const confirmDelete = async () => {
  if (!deleteEventId) return;

  const eventId = deleteEventId;

  try {
      await AdminAPI.delete(
        `/events/delete/${eventId}`
      );

      toast.success("Event deleted successfully");
      setDeleteEventId(null);

      fetchEvents();
    } catch (error) {
  console.error(
    "DELETE ERROR:",
    error.response?.data ||
      error.message
  );

  toast.error(
    error.response?.data?.message ||
      "Failed to delete event"
  );

  setDeleteEventId(null);
}
};

  // ============================================================
  // OPEN EDIT EVENT
  // ============================================================
const editEvent = (event) => {
  const normalized =
    normalizeLegacyCategory(
      event.category
    );

  const detectedMainCategory =
    getEventMainCategory(event) ||
    normalized.mainCategory;

  const detectedCategory =
    normalized.category ||
    event.category ||
    "";

  setEditingEvent(event);

  setName(
    event.name || ""
  );

  setDate(
    event.date
      ? event.date.slice(0, 10)
      : ""
  );

  setEndDate(
    event.endDate
      ? event.endDate.slice(0, 10)
      : ""
  );

  setLocation(
    event.location || ""
  );

  setMainCategory(
    detectedMainCategory
  );

  setCategory(
    detectedCategory
  );

  setImage(
    event.image || ""
  );

  setDescription(
    event.description || ""
  );

  setEditDepartment(
    event.department || []
  );

  setEditYear(
    event.year || []
  );
};
    
    
  

  // ============================================================
  // EDIT MAIN CATEGORY
  // ============================================================

  const handleEditMainCategoryChange = (
    value
  ) => {
    setMainCategory(value);
    setCategory("");
  };

  // ============================================================
  // CREATE DEPARTMENT
  // ============================================================

  const handleDepartmentChange = (
    dept,
    checked
  ) => {
    if (dept === "ALL") {
      setNewEvent((prev) => ({
        ...prev,

        department: checked
          ? ["ALL"]
          : [],
      }));

      return;
    }

    setNewEvent((prev) => {
      let updated =
        prev.department.filter(
          (item) => item !== "ALL"
        );

      if (checked) {
        updated = [
          ...updated,
          dept,
        ];
      } else {
        updated =
          updated.filter(
            (item) =>
              item !== dept
          );
      }

      return {
        ...prev,
        department: updated,
      };
    });
  };

  // ============================================================
  // CREATE YEAR
  // ============================================================

  const handleYearChange = (
    yearValue,
    checked
  ) => {
    if (yearValue === "ALL") {
      setNewEvent((prev) => ({
        ...prev,

        year: checked
          ? ["ALL"]
          : [],
      }));

      return;
    }

    setNewEvent((prev) => {
      let updated =
        prev.year.filter(
          (item) => item !== "ALL"
        );

      if (checked) {
        updated = [
          ...updated,
          yearValue,
        ];
      } else {
        updated =
          updated.filter(
            (item) =>
              item !== yearValue
          );
      }

      return {
        ...prev,
        year: updated,
      };
    });
  };

  // ============================================================
  // EDIT DEPARTMENT
  // ============================================================

  const handleEditDepartmentChange = (
    dept,
    checked
  ) => {
    if (dept === "ALL") {
      setEditDepartment(
        checked ? ["ALL"] : []
      );

      return;
    }

    setEditDepartment((prev) => {
      let updated =
        prev.filter(
          (item) =>
            item !== "ALL"
        );

      if (checked) {
        updated = [
          ...updated,
          dept,
        ];
      } else {
        updated =
          updated.filter(
            (item) =>
              item !== dept
          );
      }

      return updated;
    });
  };

  // ============================================================
  // EDIT YEAR
  // ============================================================

  const handleEditYearChange = (
    yearValue,
    checked
  ) => {
    if (yearValue === "ALL") {
      setEditYear(
        checked ? ["ALL"] : []
      );

      return;
    }

    setEditYear((prev) => {
      let updated =
        prev.filter(
          (item) =>
            item !== "ALL"
        );

      if (checked) {
        updated = [
          ...updated,
          yearValue,
        ];
      } else {
        updated =
          updated.filter(
            (item) =>
              item !== yearValue
          );
      }

      return updated;
    });
  };

  // ============================================================
  // RESET EDIT FORM
  // ============================================================

 const closeEditModal = () => {
  setEditingEvent(null);

  setName("");
  setDate("");
  setEndDate("");
  setLocation("");

  setMainCategory("");
  setCategory("");

  setImage("");
  setDescription("");

  setEditDepartment([]);
  setEditYear([]);
};

  // ============================================================
  // UPDATE EVENT
  // ============================================================
const updateEvent = async (e) => {
  e.preventDefault();

  if (!editingEvent) return;

  // Basic information validation
  if (
    !name.trim() ||
    !date ||
    !location.trim()
  ) {
    toast.error("Please complete the basic event information");
    return;
  }

  // End date validation
  if (
    endDate &&
    new Date(endDate) <
      new Date(date)
  ) {
    toast.error("End date cannot be before the start date");
    return;
  }

  // Category validation
  if (!mainCategory) {
    toast.error("Please select Main Category");
    return;
  }

  if (!category) {
    toast.error("Please select Event Type");
    return;
  }

  // Eligibility validation
  if (
    editDepartment.length === 0
  ) {
    toast.error("Please select at least one eligible department");
    return;
  }

  if (editYear.length === 0) {
    toast.error("Please select at least one eligible year");
    return;
  }

  try {
    const updatedEventData = {
      name: name.trim(),

      date,

      endDate:
        endDate || null,

      location:
        location.trim(),

      mainCategory,

      category,

      image:
        image.trim(),

      description:
        description.trim(),

      department:
        editDepartment,

      year:
        editYear,
    };

    await AdminAPI.put(
      `/events/update/${editingEvent._id}`,
      updatedEventData
    );

    toast.success("Event updated successfully!");

    closeEditModal();

    await fetchEvents();
  } catch (error) {
    console.error(
      "UPDATE EVENT ERROR:",
      error.response?.data ||
        error.message
    );

    toast.error(error.response?.data?.message ||
        "Failed to update event");
  }
};
  
   

  // ============================================================
  // FETCH PARTICIPANTS
  // ============================================================

  const fetchParticipants =
    async (eventId) => {
      try {
        if (
          participantsMap[eventId]
        ) {
          return;
        }

        const res =
          await AdminAPI.get(
            `/bookings/event/${eventId}/participants`
          );

        setParticipantsMap(
          (prev) => ({
            ...prev,

            [eventId]:
              Array.isArray(res.data)
                ? res.data
                : [],
          })
        );
      } catch (error) {
        console.error(
          "Error fetching participants:",
          error
        );

        toast.error("Failed to fetch participants");
      }
    };

  // ============================================================
  // WINNER SELECTION
  // ============================================================

  const handleWinnerSelection = (
    eventId,
    place,
    userId
  ) => {
    setWinnerSelections(
      (prev) => ({
        ...prev,

        [eventId]: {
          ...prev[eventId],

          [place]:
            userId,
        },
      })
    );
  };

  // ============================================================
  // SAVE WINNERS
  // ============================================================

  const handleSaveWinners =
    async (eventId) => {
      try {
        const participants =
          participantsMap[
            eventId
          ] || [];

        const selected =
          winnerSelections[
            eventId
          ] || {};

        const selectedIds = [
          selected.first,
          selected.second,
          selected.third,
        ].filter(Boolean);

        const uniqueIds =
          new Set(selectedIds);

        if (
          selectedIds.length !==
          uniqueIds.size
        ) {
          toast.error("Same participant cannot be selected for multiple positions");

          return;
        }

        const getParticipant = (
          userId
        ) =>
          participants.find(
            (participant) =>
              String(
                participant._id
              ) ===
              String(userId)
          );

        const firstUser =
          getParticipant(
            selected.first
          );

        const secondUser =
          getParticipant(
            selected.second
          );

        const thirdUser =
          getParticipant(
            selected.third
          );

        const winners = [
          firstUser && {
            user: firstUser._id,

            position: "1st",

            name:
              firstUser.name,

            department:
              firstUser.department ||
              "",

            year:
              firstUser.year ||
              "",
          },

          secondUser && {
            user: secondUser._id,

            position: "2nd",

            name:
              secondUser.name,

            department:
              secondUser.department ||
              "",

            year:
              secondUser.year ||
              "",
          },

          thirdUser && {
            user: thirdUser._id,

            position: "3rd",

            name:
              thirdUser.name,

            department:
              thirdUser.department ||
              "",

            year:
              thirdUser.year ||
              "",
          },
        ].filter(Boolean);

        await AdminAPI.put(
          `/events/${eventId}/winners`,
          {
            winners,
          }
        );

        toast.success("Winners updated successfully");

        fetchEvents();
      } catch (error) {
        console.error(
          "Error updating winners:",
          error
        );

        toast.error("Failed to update winners");
      }
    };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    localStorage.removeItem(
      "admin"
    );

    localStorage.removeItem(
      "adminToken"
    );

    navigate(
      "/admin-login"
    );
  };

  // ============================================================
  // SCROLL HELPER
  // ============================================================

  const scrollToSection = (
    id
  ) => {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-violet-700/20 rounded-full blur-3xl" />

        <div className="absolute top-40 right-0 w-96 h-96 bg-fuchsia-700/10 rounded-full blur-3xl" />

        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-700/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
{/* ================================================= */}
{/* HEADER */}
{/* ================================================= */}

<header className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-xl shadow-2xl shadow-black/20 p-5 md:p-7 mb-6">

  {/* Decorative Glow */}

  <div className="absolute -top-24 right-0 h-56 w-56 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

  <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-fuchsia-600/10 blur-3xl pointer-events-none" />

  <div className="relative flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

    {/* Left */}

    <div className="max-w-2xl">

      <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-400/20 px-3 py-1.5 rounded-full text-violet-300 text-xs font-semibold uppercase tracking-[0.16em] mb-4">

        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />

        Admin Control Center

      </div>

      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">

        Manage Eventify

        <span className="block mt-1 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">

          from one workspace.

        </span>

      </h1>

      <p className="text-slate-400 mt-4 leading-7">

        Create and organize events,
        review schedules, manage
        participants and publish
        competition results.

      </p>

    </div>

    {/* Right */}

    <div className="flex flex-col gap-3 xl:min-w-[360px]">

      <div className="grid grid-cols-2 gap-2">

        <button
          type="button"
          onClick={() =>
            scrollToSection(
              "dashboard-overview"
            )
          }
          className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 hover:border-white/20 transition"
        >
          Overview
        </button>

        <button
          type="button"
          onClick={() =>
            scrollToSection(
              "add-event"
            )
          }
          className="px-4 py-3 rounded-xl bg-violet-500/10 border border-violet-400/20 text-violet-300 hover:bg-violet-500/20 transition"
        >
          + Create Event
        </button>

        <button
          type="button"
          onClick={() =>
            scrollToSection(
              "manage-events"
            )
          }
          className="px-4 py-3 rounded-xl bg-fuchsia-500/10 border border-fuchsia-400/20 text-fuchsia-300 hover:bg-fuchsia-500/20 transition"
        >
          Manage Events
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-400/20 text-red-300 hover:bg-red-500/20 transition"
        >
          Logout
        </button>

      </div>

      {/* Admin Session */}

      <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">

        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500 font-semibold">

          Administrator Session

        </p>

        <div className="flex items-center justify-between gap-4 mt-1.5">

          <p className="text-sm font-semibold text-slate-200">

            Eventify Admin

          </p>

          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300">

            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

            Secure

          </span>

        </div>

      </div>

    </div>

  </div>

</header>

{/* ================================================= */}
{/* DASHBOARD OVERVIEW */}
{/* ================================================= */}

<section
  id="dashboard-overview"
  className="scroll-mt-6 mb-7"
>

  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">

    <div>

      <p className="text-violet-300 text-xs font-semibold uppercase tracking-[0.16em]">

        Dashboard Overview

      </p>

      <h2 className="text-2xl font-bold mt-1">

        Event Operations

      </h2>

    </div>

    <p className="text-sm text-slate-500">

      Live summary from your current
      event records

    </p>

  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">

    <StatCard
      icon="▦"
      title="Total Events"
      value={events.length}
      description="All event records"
      accent="violet"
    />

    <StatCard
      icon="↗"
      title="Upcoming"
      value={upcomingCount}
      description="Scheduled after today"
      accent="blue"
    />

    <StatCard
      icon="●"
      title="Today"
      value={todayCount}
      description="Happening today"
      accent="emerald"
    />

    <StatCard
      icon="✓"
      title="Completed"
      value={completedCount}
      description="Past events"
      accent="slate"
    />

    <StatCard
      icon="★"
      title="Results"
      value={announcedResultsCount}
      description="Results announced"
      accent="fuchsia"
    />

  </div>

</section>

{/* ================================================= */}
{/* QUICK ACTIONS */}
{/* ================================================= */}

<section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">

  {/* Create */}

  <button
    type="button"
    onClick={() =>
      scrollToSection("add-event")
    }
    className="group text-left rounded-2xl border border-violet-400/15 bg-gradient-to-br from-violet-500/[0.10] to-white/[0.025] p-5 hover:border-violet-400/30 hover:-translate-y-0.5 transition"
  >

    <div className="flex items-start justify-between gap-4">

      <div>

        <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-300">

          Quick Action

        </p>

        <h3 className="text-lg font-bold mt-2">

          Create a New Event

        </h3>

        <p className="text-sm text-slate-400 mt-2 leading-6">

          Add event details,
          eligibility, categories and
          an automatic poster.

        </p>

      </div>

      <span className="text-2xl text-violet-300 group-hover:translate-x-1 transition">

        →

      </span>

    </div>

  </button>

  {/* Manage */}

  <button
    type="button"
    onClick={() =>
      scrollToSection(
        "manage-events"
      )
    }
    className="group text-left rounded-2xl border border-fuchsia-400/15 bg-gradient-to-br from-fuchsia-500/[0.08] to-white/[0.025] p-5 hover:border-fuchsia-400/30 hover:-translate-y-0.5 transition"
  >

    <div className="flex items-start justify-between gap-4">

      <div>

        <p className="text-xs font-bold uppercase tracking-[0.14em] text-fuchsia-300">

          Event Management

        </p>

        <h3 className="text-lg font-bold mt-2">

          Manage Existing Events

        </h3>

        <p className="text-sm text-slate-400 mt-2 leading-6">

          Search, filter, edit or
          remove existing Eventify
          events.

        </p>

      </div>

      <span className="text-2xl text-fuchsia-300 group-hover:translate-x-1 transition">

        →

      </span>

    </div>

  </button>

  {/* Participants */}

  <button
    type="button"
    onClick={() =>
      scrollToSection(
        "manage-events"
      )
    }
    className="group text-left rounded-2xl border border-emerald-400/15 bg-gradient-to-br from-emerald-500/[0.07] to-white/[0.025] p-5 hover:border-emerald-400/30 hover:-translate-y-0.5 transition"
  >

    <div className="flex items-start justify-between gap-4">

      <div>

        <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-300">

          Participants & Results

        </p>

        <h3 className="text-lg font-bold mt-2">

          Manage Competition Results

        </h3>

        <p className="text-sm text-slate-400 mt-2 leading-6">

          Open an event to review
          participants and choose
          winners.

        </p>

      </div>

      <span className="text-2xl text-emerald-300 group-hover:translate-x-1 transition">

        →

      </span>

    </div>

  </button>

</section>
            
              
       

        

        {/* ================================================= */}
        {/* CREATE EVENT */}
        {/* ================================================= */}

        <form
          id="add-event"
          onSubmit={handleAddEvent}
          className="rounded-3xl border border-white/10 bg-white/[0.045] backdrop-blur-xl p-5 md:p-7 mb-8 scroll-mt-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-7">
            <div>
              <p className="text-violet-300 text-sm font-semibold mb-2">
                Event Management
              </p>

              <h2 className="text-2xl md:text-3xl font-bold">
                Create New Event
              </h2>

              <p className="text-slate-400 mt-2 max-w-2xl">
                Add event information,
                categorize it accurately
                and define student
                eligibility.
              </p>
            </div>

            <div className="text-sm text-slate-500">
              * Required fields must be
              completed
            </div>
          </div>

          {/* Basic information */}

          <SectionTitle>
            Basic Information
          </SectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <FormField label="Event Name">
              <input
                type="text"
                placeholder="Example: AI Innovation Challenge"
                value={
                  newEvent.name
                }
                onChange={(e) =>
                  setNewEvent(
                    (prev) => ({
                      ...prev,

                      name:
                        e.target
                          .value,
                    })
                  )
                }
                required
                className={inputClass}
              />
            </FormField>

            <FormField label="Start Date *">
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) =>
                  setNewEvent((prev) => ({
                    ...prev,
                    date: e.target.value,
                    endDate:
                      prev.endDate &&
                      prev.endDate < e.target.value
                        ? ""
                        : prev.endDate,
                  }))
                }
                required
                className={inputClass}
              />
            </FormField>

            <FormField label="End Date">
              <input
                type="date"
                min={newEvent.date || undefined}
                value={newEvent.endDate}
                onChange={(e) =>
                  setNewEvent((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                className={inputClass}
              />
              <p className="text-xs text-slate-500 mt-2">
                Optional for single-day events.
              </p>
            </FormField>

            <FormField label="Location">
              <input
                type="text"
                placeholder="Example: Main Auditorium"
                value={
                  newEvent.location
                }
                onChange={(e) =>
                  setNewEvent(
                    (prev) => ({
                      ...prev,

                      location:
                        e.target
                          .value,
                    })
                  )
                }
                required
                className={inputClass}
              />
            </FormField>

          <div className="md:col-span-2">
  <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
      <div>
        <p className="font-semibold text-white">
          Event Poster
        </p>

        <p className="text-sm text-slate-400 mt-1">
          Use your own poster URL or allow Eventify to generate one automatically.
        </p>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={
            newEvent.autoGeneratePoster
          }
          onChange={(e) =>
            setNewEvent({
              ...newEvent,
              autoGeneratePoster:
                e.target.checked,
            })
          }
          className="w-4 h-4 accent-violet-500"
        />

        <span className="text-sm text-slate-300">
          Automatic Poster
        </span>
      </label>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Manual Poster URL
        </label>

        <input
          type="url"
          value={newEvent.image}
          onChange={(e) =>
            setNewEvent({
              ...newEvent,
              image: e.target.value,
            })
          }
          placeholder="https://example.com/poster.jpg"
          className={inputClass}
        />

        <p className="text-xs text-slate-500 mt-2">
          A manual URL will be used instead of automatic generation.
        </p>
      </div>

      <div>
        <p className="block text-sm font-medium text-slate-300 mb-2">
          Poster Preview
        </p>

        <div className="min-h-[190px] rounded-2xl border border-white/10 bg-slate-950/50 overflow-hidden flex items-center justify-center">
          {newEvent.image ? (
            <img
              src={newEvent.image}
              alt="Event poster preview"
              className="w-full h-52 object-contain bg-black/20"
              onError={(e) => {
                e.currentTarget.style.display =
                  "none";
              }}
            />
          ) : (
            <div className="text-center px-5 py-8">
              <div className="text-4xl mb-3">
                🖼️
              </div>

              <p className="text-sm text-slate-400">
                {newEvent.autoGeneratePoster
                  ? "A poster will be generated when the event is created."
                  : "Enter a poster URL to preview it here."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>

    {newEvent.image &&
      newEvent.autoGeneratePoster && (
        <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Manual poster URL detected. This image will be used instead of automatic poster generation.
        </div>
      )}
  </div>
</div>  
          </div>

          {/* Category */}

          <SectionTitle>
            Event Classification
          </SectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <FormField label="Main Category">
              <select
                value={
                  newEvent.mainCategory
                }
                onChange={(e) =>
                  handleCreateMainCategoryChange(
                    e.target.value
                  )
                }
                required
                className={inputClass}
              >
                <option value="">
                  Select Main Category
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
            </FormField>

            <FormField label="Specific Event Type">
              <select
                value={
                  newEvent.category
                }
                onChange={(e) =>
                  setNewEvent(
                    (prev) => ({
                      ...prev,

                      category:
                        e.target
                          .value,
                    })
                  )
                }
                required
                disabled={
                  !newEvent.mainCategory
                }
                className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="">
                  {newEvent.mainCategory
                    ? "Select Event Type"
                    : "Select Main Category First"}
                </option>

                {createCategoryOptions.map(
                  (eventType) => (
                    <option
                      key={
                        eventType
                      }
                      value={
                        eventType
                      }
                    >
                      {eventType}
                    </option>
                  )
                )}
              </select>
            </FormField>
          </div>

          <FormField label="Event Description">
            <textarea
              placeholder="Describe the event, objectives and important information..."
              value={
                newEvent.description
              }
              onChange={(e) =>
                setNewEvent(
                  (prev) => ({
                    ...prev,

                    description:
                      e.target
                        .value,
                  })
                )
              }
              className={`${inputClass} min-h-[130px] resize-y`}
            />
          </FormField>

          {/* Eligibility */}

          <div className="mt-7">
            <SectionTitle>
              Student Eligibility
            </SectionTitle>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <EligibilityBox
                title="Eligible Departments"
                options={[
                  "CSE",
                  "EEE",
                  "MECH",
                  "IT",
                  "ALL",
                ]}
                selected={
                  newEvent.department
                }
                onChange={
                  handleDepartmentChange
                }
              />

              <EligibilityBox
                title="Eligible Years"
                options={[
                  "I",
                  "II",
                  "III",
                  "IV",
                  "ALL",
                ]}
                selected={
                  newEvent.year
                }
                onChange={
                  handleYearChange
                }
              />
            </div>
          </div>

          <div className="mt-7 flex flex-col sm:flex-row sm:items-center gap-3">
  <button
    type="submit"
    disabled={isCreatingEvent}
    className="min-w-[220px] px-7 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 font-semibold text-white shadow-lg shadow-violet-900/20 transition disabled:opacity-60 disabled:cursor-not-allowed"
  >
    {isCreatingEvent
      ? newEvent.autoGeneratePoster &&
        !newEvent.image.trim()
        ? "Generating Poster & Creating..."
        : "Creating Event..."
      : "Create Event"}
  </button>

  {isCreatingEvent && (
    <p className="text-sm text-slate-400">
      {newEvent.autoGeneratePoster &&
      !newEvent.image.trim()
        ? "Generating your event poster and saving the event..."
        : "Saving event information..."}
    </p>
  )}
</div>

        </form>

        {/* ================================================= */}
        {/* MANAGE EVENTS */}
        {/* ================================================= */}

        <section
          id="manage-events"
          className="rounded-3xl border border-white/10 bg-white/[0.045] backdrop-blur-xl p-5 md:p-7 scroll-mt-6"
        >
          <div className="mb-6">
            <p className="text-fuchsia-300 text-sm font-semibold mb-2">
              Administration
            </p>

            <h2 className="text-2xl md:text-3xl font-bold">
              Manage Events
            </h2>

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mt-2">
              <p className="text-slate-400">
                Search, filter, edit, delete and manage event participants and results.
              </p>
              <span className="shrink-0 inline-flex items-center rounded-full border border-white/10 bg-slate-950/40 px-3 py-1.5 text-xs font-semibold text-slate-300">
                Showing {filteredEvents.length} of {events.length} events
              </span>
            </div>
          </div>

          {/* Filters */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">
            <input
              type="text"
              placeholder="Search event, location or category..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              className={inputClass}
            />

            <select
              value={
                categoryFilter
              }
              onChange={(e) =>
                setCategoryFilter(
                  e.target.value
                )
              }
              className={inputClass}
            >
              <option value="all">
                All Main Categories
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
              className={inputClass}
            >
              <option value="all">
                All Events
              </option>

              <option value="today">
                Happening Today
              </option>

              <option value="upcoming">
                Upcoming
              </option>

              <option value="completed">
                Completed
              </option>
            </select>
          </div>

          {events.length === 0 ? (
            <EmptyState text="No events found." />
          ) : filteredEvents.length ===
            0 ? (
            <EmptyState text="No events match your filters." />
          ) : (
            <div className="space-y-5">
              {filteredEvents.map(
                (event) => (
                  <EventAdminCard
                    key={
                      event._id
                    }
                    event={event}
                    mainCategory={getEventMainCategory(
                      event
                    )}
                    category={getDisplayCategory(
                      event
                    )}
                    upcoming={isUpcomingEvent(
                      event
                    )}
                    today={isTodayEvent(
  event
)}
                    participants={
                      participantsMap[
                        event._id
                      ]
                    }
                    winnerSelection={
                      winnerSelections[
                        event._id
                      ] || {}
                    }
                    onEdit={() =>
                      editEvent(event)
                    }
                    onDelete={() =>
                      handleDelete(
                        event._id
                      )
                    }
                    onLoadParticipants={() =>
                      fetchParticipants(
                        event._id
                      )
                    }
                    onWinnerChange={(
                      place,
                      userId
                    ) =>
                      handleWinnerSelection(
                        event._id,
                        place,
                        userId
                      )
                    }
                    onSaveWinners={() =>
                      handleSaveWinners(
                        event._id
                      )
                    }
                  />
                )
              )}
            </div>
          )}
        </section>
      </div>

      {/* ================================================= */}
      {/* EDIT MODAL */}
      {/* ================================================= */}

      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 shadow-2xl p-5 md:p-7">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-violet-300 text-sm font-semibold">
                  Event Management
                </p>

                <h2 className="text-2xl font-bold mt-1">
                  Edit Event
                </h2>

                <p className="text-slate-400 text-sm mt-1">
                  Update event
                  information and
                  eligibility.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeEditModal
                }
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Event Name">
                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </FormField>

              <FormField label="Start Date">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    const nextDate = e.target.value;
                    setDate(nextDate);

                    if (
                      endDate &&
                      endDate < nextDate
                    ) {
                      setEndDate("");
                    }
                  }}
                  className={inputClass}
                />
              </FormField>

              <FormField label="End Date">
                <input
                  type="date"
                  min={date || undefined}
                  value={endDate}
                  onChange={(e) =>
                    setEndDate(
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </FormField>

              <FormField label="Location">
                <input
                  type="text"
                  value={location}
                  onChange={(e) =>
                    setLocation(
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </FormField>

              <FormField label="Image URL">
                <input
                  type="url"
                  value={image}
                  onChange={(e) =>
                    setImage(
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </FormField>

              <FormField label="Main Category">
                <select
                  value={
                    mainCategory
                  }
                  onChange={(e) =>
                    handleEditMainCategoryChange(
                      e.target.value
                    )
                  }
                  className={inputClass}
                >
                  <option value="">
                    Select Main Category
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
              </FormField>

              <FormField label="Specific Event Type">
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target.value
                    )
                  }
                  disabled={
                    !mainCategory
                  }
                  className={`${inputClass} disabled:opacity-50`}
                >
                  <option value="">
                    Select Event Type
                  </option>

                  {editCategoryOptions.map(
                    (eventType) => (
                      <option
                        key={
                          eventType
                        }
                        value={
                          eventType
                        }
                      >
                        {eventType}
                      </option>
                    )
                  )}
                </select>
              </FormField>
            </div>

            <div className="mt-4">
              <FormField label="Event Description">
                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  className={`${inputClass} min-h-[120px]`}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
              <EligibilityBox
                title="Department Eligibility"
                options={[
                  "CSE",
                  "EEE",
                  "MECH",
                  "IT",
                  "ALL",
                ]}
                selected={
                  editDepartment
                }
                onChange={
                  handleEditDepartmentChange
                }
              />

              <EligibilityBox
                title="Year Eligibility"
                options={[
                  "I",
                  "II",
                  "III",
                  "IV",
                  "ALL",
                ]}
                selected={
                  editYear
                }
                onChange={
                  handleEditYearChange
                }
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-7">
              <button
                type="button"
                onClick={updateEvent}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 font-semibold"
              >
                Save Changes
              </button>

              <button
                type="button"
                onClick={
                  closeEditModal
                }
                className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={Boolean(deleteEventId)}
        title="Delete Event?"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteEventId(null)}
      />

    </div>
  );
};
   

// ============================================================
// SHARED UI
// ============================================================

const inputClass =
  "w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20";

const StatCard = ({
  icon,
  title,
  value,
  description,
  accent = "violet",
}) => {

  const accentClasses = {

    violet: {
      icon:
        "border-violet-400/20 bg-violet-500/10 text-violet-300",

      value:
        "from-violet-300 to-fuchsia-300",
    },

    blue: {
      icon:
        "border-blue-400/20 bg-blue-500/10 text-blue-300",

      value:
        "from-blue-300 to-cyan-300",
    },

    emerald: {
      icon:
        "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",

      value:
        "from-emerald-300 to-teal-300",
    },

    fuchsia: {
      icon:
        "border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-300",

      value:
        "from-fuchsia-300 to-pink-300",
    },

    slate: {
      icon:
        "border-slate-400/20 bg-slate-500/10 text-slate-300",

      value:
        "from-slate-200 to-slate-400",
    },
  };

  const current =
    accentClasses[accent] ||
    accentClasses.violet;

  return (

    <div className="group rounded-2xl border border-white/10 bg-white/[0.045] backdrop-blur-xl p-5 hover:bg-white/[0.065] hover:border-white/15 hover:-translate-y-0.5 transition">

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-sm font-medium text-slate-400">

            {title}

          </p>

          <p
            className={`text-3xl font-bold mt-2 bg-gradient-to-r ${current.value} bg-clip-text text-transparent`}
          >

            {value}

          </p>

        </div>

        <div
          className={`h-10 w-10 rounded-xl border flex items-center justify-center text-base font-bold ${current.icon}`}
        >

          {icon}

        </div>

      </div>

      <p className="text-xs text-slate-500 mt-3">

        {description}

      </p>

    </div>
  );
};

const SectionTitle = ({
  children,
}) => {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-1 h-6 rounded-full bg-gradient-to-b from-violet-500 to-fuchsia-500" />

      <h3 className="font-semibold text-lg">
        {children}
      </h3>
    </div>
  );
};

const FormField = ({
  label,
  children,
}) => {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-300 mb-2">
        {label}
      </span>

      {children}
    </label>
  );
};

const EligibilityBox = ({
  title,
  options,
  selected,
  onChange,
}) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
      <p className="font-semibold mb-4">
        {title}
      </p>

      <div className="flex flex-wrap gap-2">
        {options.map(
          (option) => {
            const active =
              selected.includes(
                option
              );

            return (
              <label
                key={option}
                className={`cursor-pointer px-3 py-2 rounded-xl border text-sm font-medium transition ${
                  active
                    ? "bg-violet-500/20 border-violet-400/40 text-violet-200"
                    : "bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.06]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) =>
                    onChange(
                      option,
                      e.target.checked
                    )
                  }
                  className="hidden"
                />

                {option}
              </label>
            );
          }
        )}
      </div>
    </div>
  );
};

const EmptyState = ({
  text,
}) => {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/30 py-16 text-center">
      <div className="text-4xl mb-3">
        📅
      </div>

      <p className="text-slate-400">
        {text}
      </p>
    </div>
  );
};

// ============================================================
// ADMIN EVENT CARD
// ============================================================

const EventAdminCard = ({
  event,
  mainCategory,
  category,
  upcoming,
  today,
  participants,
  winnerSelection,
  onEdit,
  onDelete,
  onLoadParticipants,
  onWinnerChange,
  onSaveWinners,
}) => {
  const resultsAnnounced =
    event.resultStatus ===
    "announced";

  const [participantSearch, setParticipantSearch] = useState("");

  const filteredParticipants = useMemo(() => {
    if (!Array.isArray(participants)) return [];
    const search = participantSearch.trim().toLowerCase();
    if (!search) return participants;
    return participants.filter((participant) =>
      [participant.name, participant.email, participant.department, participant.year]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search))
    );
  }, [participants, participantSearch]);

  const selectedWinnerIds = [
    winnerSelection.first,
    winnerSelection.second,
    winnerSelection.third,
  ].filter(Boolean).map(String);

  return (
    <article className="rounded-3xl border border-white/10 bg-slate-950/35 overflow-hidden">
      <div className="p-5 md:p-6">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
          {/* Event information */}

          <div className="flex flex-col md:flex-row gap-5 flex-1">
            {event.image ? (
              <img
                src={event.image}
                alt={event.name}
                className="w-full md:w-36 h-48 object-cover rounded-2xl border border-white/10"
              />
            ) : (
              <div className="w-full md:w-36 h-48 rounded-2xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-white/10 flex items-center justify-center text-4xl">
                📅
              </div>
            )}

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-400/20 text-violet-300 text-xs font-semibold">
                  {mainCategory ||
                    "Uncategorized"}
                </span>

                <span className="px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-400/20 text-fuchsia-300 text-xs font-semibold">
                  {category}
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    today
                      ? "bg-blue-500/10 border-blue-400/20 text-blue-300"
                      : upcoming
                      ? "bg-emerald-500/10 border-emerald-400/20 text-emerald-300"
                      : "bg-slate-500/10 border-slate-400/20 text-slate-300"
                  }`}
                >
                  {today ? "Happening Today" : upcoming ? "Upcoming" : "Completed"}
                </span>
              </div>

              <h3 className="text-xl font-bold">
                {event.name}
              </h3>

              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400 mt-3">
                <span>
                  📅{" "}
                  {event.date ? new Date(event.date).toLocaleDateString() : "N/A"}
                  {event.endDate &&
                    new Date(event.endDate).toDateString() !== new Date(event.date).toDateString() && (
                      <> → {new Date(event.endDate).toLocaleDateString()}</>
                    )}
                </span>

                <span>
                  📍{" "}
                  {event.location ||
                    "N/A"}
                </span>
              </div>

              {event.description && (
                <p className="text-sm text-slate-400 mt-4 line-clamp-3">
                  {
                    event.description
                  }
                </p>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                <EligibilityTag
                  title="Departments"
                  values={
                    event.department
                  }
                />

                <EligibilityTag
                  title="Years"
                  values={event.year}
                />
              </div>
            </div>
          </div>

          {/* Actions */}

          <div className="flex flex-wrap xl:flex-col gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-400/20 text-violet-300 hover:bg-violet-500/20 transition"
            >
              Edit
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-400/20 text-red-300 hover:bg-red-500/20 transition"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Winners section */}

        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h4 className="font-semibold text-lg">
                Participants & Winners
              </h4>

              <p className="text-sm text-slate-500 mt-1">
                Load registered students
                and publish the top three
                winners.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <span
                className={`px-3 py-1.5 rounded-full border text-xs font-semibold ${
                  resultsAnnounced
                    ? "bg-emerald-500/10 border-emerald-400/20 text-emerald-300"
                    : "bg-amber-500/10 border-amber-400/20 text-amber-300"
                }`}
              >
                {resultsAnnounced
                  ? "Results Announced"
                  : "Results Pending"}
              </span>

              <button
                type="button"
                onClick={
                  onLoadParticipants
                }
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition"
              >
                View Participants
              </button>
            </div>
          </div>

          <div className="mt-4 inline-flex items-center gap-3 bg-white/[0.04] border border-white/10 px-4 py-2 rounded-xl">
            <span className="text-sm text-slate-400">
              Participants
            </span>

            <span className="min-w-7 h-7 px-2 rounded-lg bg-violet-600 flex items-center justify-center text-xs font-bold">
              {participants?.length ||
                0}
            </span>
          </div>

          {participants ===
          undefined ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm text-slate-500">
              Click{" "}
              <span className="text-slate-300">
                View Participants
              </span>{" "}
              to load registered
              students.
            </div>
          ) : participants.length ===
            0 ? (
            <div className="mt-4 rounded-2xl border border-red-400/10 bg-red-500/[0.04] p-4 text-sm text-red-300">
              No participants registered
              for this event.
            </div>
          ) : (
            <>
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-200">Registered Participants</p>
                    <p className="text-xs text-slate-500 mt-1">{filteredParticipants.length} of {participants.length} participants shown</p>
                  </div>
                  <input type="text" value={participantSearch} onChange={(e) => setParticipantSearch(e.target.value)} placeholder="Search name, email, department or year..." className={`${inputClass} md:max-w-sm`} />
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
                  {filteredParticipants.length === 0 ? (
                    <div className="md:col-span-2 xl:col-span-3 rounded-xl border border-dashed border-white/10 p-5 text-center text-sm text-slate-500">No participants match your search.</div>
                  ) : filteredParticipants.map((participant) => (
                    <div key={participant._id} className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                      <p className="font-semibold text-sm text-white truncate">{participant.name || "Unnamed Participant"}</p>
                      {participant.email && <p className="text-xs text-slate-500 mt-1 truncate">{participant.email}</p>}
                      <div className="flex flex-wrap gap-2 mt-2 text-[11px] text-slate-400">
                        <span className="rounded-lg bg-white/[0.04] px-2 py-1">{participant.department || "Department N/A"}</span>
                        <span className="rounded-lg bg-white/[0.04] px-2 py-1">Year {participant.year || "N/A"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 mb-3">
                <p className="font-semibold text-slate-200">Winner Selection</p>
                <p className="text-xs text-slate-500 mt-1">Choose unique participants for the top three positions.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <WinnerSelect
                  label="🥇 1st Place"
                  value={
                    winnerSelection.first ||
                    ""
                  }
                  participants={
                    participants
                  }
                  selectedIds={selectedWinnerIds}
                  currentValue={winnerSelection.first || ""}
                  onChange={(
                    value
                  ) =>
                    onWinnerChange(
                      "first",
                      value
                    )
                  }
                />

                <WinnerSelect
                  label="🥈 2nd Place"
                  value={
                    winnerSelection.second ||
                    ""
                  }
                  participants={
                    participants
                  }
                  selectedIds={selectedWinnerIds}
                  currentValue={winnerSelection.second || ""}
                  onChange={(
                    value
                  ) =>
                    onWinnerChange(
                      "second",
                      value
                    )
                  }
                />

                <WinnerSelect
                  label="🥉 3rd Place"
                  value={
                    winnerSelection.third ||
                    ""
                  }
                  participants={
                    participants
                  }
                  selectedIds={selectedWinnerIds}
                  currentValue={winnerSelection.third || ""}
                  onChange={(
                    value
                  ) =>
                    onWinnerChange(
                      "third",
                      value
                    )
                  }
                />
              </div>

              <button
                type="button"
                onClick={
                  onSaveWinners
                }
                className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold transition"
              >
                Save Winners
              </button>
            </>
          )}

          {/* Current winners */}

          {event.winners?.length >
            0 && (
            <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.06] p-4">
              <p className="font-semibold text-emerald-300 mb-3">
                Current Winners
              </p>

              <div className="space-y-2">
                {event.winners.map(
                  (
                    winner,
                    index
                  ) => (
                    <div
                      key={
                        winner.user ||
                        index
                      }
                      className="flex flex-wrap gap-2 text-sm"
                    >
                      <span className="font-semibold text-white">
                        {
                          winner.position
                        }
                      </span>

                      <span className="text-slate-400">
                        {winner.name}

                        {winner.department
                          ? ` • ${winner.department}`
                          : ""}

                        {winner.year
                          ? ` • ${winner.year}`
                          : ""}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

const EligibilityTag = ({
  title,
  values,
}) => {
  const displayValues =
    Array.isArray(values) &&
    values.length > 0
      ? values.join(", ")
      : "N/A";

  return (
    <span className="text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-slate-400">
      <span className="text-slate-300">
        {title}:
      </span>{" "}
      {displayValues}
    </span>
  );
};

const WinnerSelect = ({
  label,
  value,
  participants,
  selectedIds = [],
  currentValue = "",
  onChange,
}) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="font-semibold mb-3">
        {label}
      </p>

      <select
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        className={inputClass}
      >
        <option value="">
          Select Participant
        </option>

        {participants.map(
          (participant) => (
            <option
              key={participant._id}
              value={participant._id}
              disabled={selectedIds.includes(String(participant._id)) && String(participant._id) !== String(currentValue)}
            >
              {participant.name}
              {" - "}
              {participant.department ||
                "N/A"}
              {" - "}
              {participant.year ||
                "N/A"}
            </option>
          )
        )}
      </select>
      
    </div>
  );
};

export default Dashboard;