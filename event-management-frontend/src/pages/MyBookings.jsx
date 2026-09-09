import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import API from "../services/api";
import Poster from "../components/Poster";
import ConfirmModal from "../components/ConfirmModal";
import toast from "react-hot-toast";

// ============================================
// STATUS STYLE
// ============================================

const getStatusStyle = (status) => {
  const normalizedStatus = String(
    status || ""
  )
    .trim()
    .toLowerCase();

  if (normalizedStatus === "upcoming") {
    return "eventify-status-upcoming";
  }

  if (normalizedStatus === "ongoing") {
    return "eventify-status-ongoing";
  }

  if (normalizedStatus === "completed") {
    return "eventify-status-completed";
  }

  return "eventify-status-default";
};

// ============================================
// CHECK IF EVENT IS COMPLETED
// ============================================

const checkIsCompleted = (event) => {
  if (!event) {
    return false;
  }

  const eventStatus = String(
    event.eventStatus || ""
  )
    .trim()
    .toLowerCase();

  const resultStatus = String(
    event.resultStatus || ""
  )
    .trim()
    .toLowerCase();

  // 1. Backend explicitly says completed
  if (eventStatus === "completed") {
    return true;
  }

  // 2. Results have already been announced
  // User should no longer be able to unregister.
  if (resultStatus === "announced") {
    return true;
  }

  // 3. Winners already exist
  // This also means the event has finished.
  if (
    Array.isArray(event.winners) &&
    event.winners.length > 0
  ) {
    return true;
  }

  // 4. Check event end date
  const finalDate =
    event.endDate || event.date;

  if (!finalDate) {
    return false;
  }

  const endDate =
    new Date(finalDate);

  if (
    Number.isNaN(
      endDate.getTime()
    )
  ) {
    return false;
  }

  // If date is stored only as YYYY-MM-DD,
  // allow registration/unregistration until
  // the end of that date.
  if (
    typeof finalDate === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(
      finalDate
    )
  ) {
    endDate.setHours(
      23,
      59,
      59,
      999
    );
  }

  return new Date() > endDate;
};

// ============================================
// MY BOOKINGS
// ============================================

const MyBookings = () => {
  const [
    bookings,
    setBookings,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    unregisterEventId,
    setUnregisterEventId,
  ] = useState(null);

  const navigate = useNavigate();

  const user = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("user")
      );
    } catch {
      return null;
    }
  })();

  // ============================================
  // FETCH BOOKINGS
  // ============================================

  useEffect(() => {
    const fetchBookings =
      async () => {
        if (!user?._id) {
          setLoading(false);
          return;
        }

        try {
          const res =
            await API.get(
              `/bookings/${user._id}`
            );

          setBookings(
            Array.isArray(res.data)
              ? res.data
              : []
          );
        } catch (error) {
          console.error(
            "Bookings error:",
            error
          );

          setBookings([]);

          toast.error(
            error.response?.data
              ?.message ||
              "Failed to load bookings"
          );
        } finally {
          setLoading(false);
        }
      };

    fetchBookings();
  }, [user?._id]);

  // ============================================
  // VALID BOOKINGS ONLY
  // ============================================

  // Old booking records can remain if their
  // event was deleted. Do not display or count
  // those orphan bookings.

  const visibleBookings =
    bookings.filter(
      (booking) =>
        Boolean(booking.event)
    );

  // ============================================
  // OPEN UNREGISTER MODAL
  // ============================================

  const handleUnregister = (
    eventId
  ) => {
    setUnregisterEventId(eventId);
  };

  // ============================================
  // CONFIRM UNREGISTER
  // ============================================

  const confirmUnregister =
    async () => {
      if (!unregisterEventId) {
        return;
      }

      const eventId =
        unregisterEventId;

      try {
        const res =
          await API.delete(
            "/bookings/unregister",
            {
              data: {
                eventId,
              },
            }
          );

        toast.success(
          res.data.message ||
            "Unregistered successfully"
        );

        setUnregisterEventId(null);

        setBookings(
          (previous) =>
            previous.filter(
              (booking) => {
                const bookingEventId =
                  booking.event?._id ||
                  booking.eventId;

                return (
                  String(
                    bookingEventId
                  ) !==
                  String(eventId)
                );
              }
            )
        );
      } catch (error) {
        console.error(
          "Unregister error:",
          error
        );

        toast.error(
          error.response?.data
            ?.message ||
            "Failed to unregister"
        );

        setUnregisterEventId(null);
      }
    };

  // ============================================
  // CURRENT USER WINNER
  // ============================================

  const getCurrentUserWinner =
    (winners = []) =>
      winners.find(
        (winner) =>
          String(winner.user) ===
            String(user?._id) ||
          String(
            winner.user?._id
          ) ===
            String(user?._id) ||
          winner.name
            ?.toLowerCase() ===
            user?.name
              ?.toLowerCase()
      );

  // ============================================
  // UI
  // ============================================

  return (
    <div className="eventify-user-page">
      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div className="eventify-page-header">
        <div>
          <p className="eventify-section-label">
            REGISTRATIONS
          </p>

          <h1 className="eventify-user-title">
            My Bookings
          </h1>

          <p className="eventify-user-subtitle">
            Manage your registered events
            and check your results.
          </p>
        </div>

        <div className="eventify-page-count">
          {visibleBookings.length}{" "}
          Booked
        </div>
      </div>

      {/* ================================= */}
      {/* LOADING */}
      {/* ================================= */}

      {loading ? (
        <div className="eventify-empty-state mt-8">
          Loading your bookings...
        </div>
      ) : visibleBookings.length ===
        0 ? (
        /* ================================= */
        /* EMPTY STATE */
        /* ================================= */

        <div className="eventify-empty-state mt-8">
          <div className="text-4xl">
            🎟️
          </div>

          <h2 className="text-xl font-bold text-white mt-4">
            No bookings yet
          </h2>

          <p className="text-slate-500 mt-2">
            Find an event you like and
            register to see it here.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/events")
            }
            className="eventify-button-primary mt-6"
          >
            Explore Events →
          </button>
        </div>
      ) : (
        /* ================================= */
        /* BOOKINGS GRID */
        /* ================================= */

        <div className="eventify-bookings-grid mt-8">
          {visibleBookings.map(
            (booking) => {
              const event =
                booking.event;

              const currentWinner =
                getCurrentUserWinner(
                  event.winners || []
                );

              const isCompleted =
                checkIsCompleted(
                  event
                );

              return (
                <article
                  key={booking._id}
                  className="eventify-booking-card"
                >
                  {/* ================================= */}
                  {/* POSTER */}
                  {/* ================================= */}

                  <div className="eventify-booking-poster">
                    <Poster
                      event={event}
                    />

                    {event.eventStatus && (
                      <span
                        className={`eventify-card-status ${getStatusStyle(
                          event.eventStatus
                        )}`}
                      >
                        {
                          event.eventStatus
                        }
                      </span>
                    )}
                  </div>

                  {/* ================================= */}
                  {/* CONTENT */}
                  {/* ================================= */}

                  <div className="p-5">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="eventify-card-category">
                        {event.category ||
                          "Event"}
                      </span>

                      <span
                        className={
                          event.resultStatus ===
                          "announced"
                            ? "eventify-result-badge"
                            : "eventify-pending-badge"
                        }
                      >
                        {event.resultStatus ===
                        "announced"
                          ? "🏆 Results Announced"
                          : "Results Pending"}
                      </span>
                    </div>

                    {/* EVENT NAME */}

                    <h2 className="text-xl font-bold text-white">
                      {event.name}
                    </h2>

                    {/* DATE + LOCATION */}

                    <div className="space-y-2 text-sm text-slate-400 mt-4">
                      <p>
                        📅{" "}
                        {event.date
                          ? new Date(
                              event.date
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : "Date unavailable"}
                      </p>

                      <p>
                        📍{" "}
                        {event.location ||
                          "Location unavailable"}
                      </p>
                    </div>

                    {/* ================================= */}
                    {/* CURRENT USER WINNER */}
                    {/* ================================= */}

                    {currentWinner && (
                      <div className="eventify-winner-message">
                        <span className="text-2xl">
                          🎉
                        </span>

                        <div>
                          <p className="font-bold text-yellow-200">
                            Congratulations!
                          </p>

                          <p className="text-sm text-yellow-100/70">
                            You secured{" "}
                            {
                              currentWinner.position
                            }{" "}
                            place.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* ================================= */}
                    {/* WINNERS */}
                    {/* ================================= */}

                    {event.resultStatus ===
                      "announced" &&
                      event.winners
                        ?.length > 0 && (
                        <div className="eventify-winners-mini">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                            Winners
                          </p>

                          {event.winners.map(
                            (
                              winner,
                              index
                            ) => (
                              <div
                                key={
                                  index
                                }
                                className="eventify-winner-row"
                              >
                                <span>
                                  {winner.position ===
                                  "1st"
                                    ? "🥇"
                                    : winner.position ===
                                      "2nd"
                                    ? "🥈"
                                    : winner.position ===
                                      "3rd"
                                    ? "🥉"
                                    : "🏆"}
                                </span>

                                <div>
                                  <p className="text-sm font-semibold text-white">
                                    {
                                      winner.name
                                    }
                                  </p>

                                  <p className="text-xs text-slate-500">
                                    {
                                      winner.position
                                    }{" "}
                                    Place
                                  </p>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}

                    {/* ================================= */}
                    {/* ACTION BUTTONS */}
                    {/* ================================= */}

                    <div
                      className={`grid gap-3 mt-5 ${
                        isCompleted
                          ? "grid-cols-1"
                          : "grid-cols-2"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/event/${event._id}`
                          )
                        }
                        className="eventify-button-secondary"
                      >
                        View Details
                      </button>

                      {/* Never show Unregister when:
                          - event is Completed
                          - results are announced
                          - winners exist
                          - event end date has passed */}

                      {!isCompleted && (
                        <button
                          type="button"
                          onClick={() =>
                            handleUnregister(
                              event._id
                            )
                          }
                          className="eventify-danger-button"
                        >
                          Unregister
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </div>
      )}

      {/* ================================= */}
      {/* UNREGISTER CONFIRMATION */}
      {/* ================================= */}

      <ConfirmModal
        isOpen={Boolean(
          unregisterEventId
        )}
        title="Unregister from Event?"
        message="Are you sure you want to unregister from this event? This action will remove your registration."
        confirmText="Yes, Unregister"
        cancelText="Cancel"
        danger
        onConfirm={
          confirmUnregister
        }
        onCancel={() =>
          setUnregisterEventId(null)
        }
      />
    </div>
  );
};

export default MyBookings;