import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import API from "../services/api";
import Poster from "../components/Poster";
import toast from "react-hot-toast";

const getStatusStyle = (
  status
) => {
  if (status === "Upcoming") {
    return "eventify-status-upcoming";
  }

  if (status === "Ongoing") {
    return "eventify-status-ongoing";
  }

  if (status === "Completed") {
    return "eventify-status-completed";
  }

  return "eventify-status-default";
};

const MyBookings = () => {
  const [bookings, setBookings] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const navigate =
    useNavigate();

  const user = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("user")
      );
    } catch {
      return null;
    }
  })();

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
        } finally {
          setLoading(false);
        }
      };

    fetchBookings();
  }, [user?._id]);

  const handleUnregister =
    async (eventId) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to unregister from this event?"
        );

      if (!confirmed) {
        return;
      }

      try {
        const res =
          await API.delete(
            "/bookings/unregister",
            {
              data: {
                userId:
                  user._id,

                eventId,
              },
            }
          );

        toast.success(res.data.message);

        setBookings(
          (previous) =>
            previous.filter(
              (booking) =>
                String(
                  booking.eventId
                ) !==
                String(eventId)
            )
        );
      } catch (error) {
        console.error(
          "Unregister error:",
          error
        );

        toast.error(error.response?.data
            ?.message ||
            "Failed to unregister");
      }
    };

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

  return (
    <div className="eventify-user-page">
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
          {bookings.length} Booked
        </div>
      </div>

      {loading ? (
        <div className="eventify-empty-state mt-8">
          Loading your bookings...
        </div>
      ) : bookings.length === 0 ? (
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
        <div className="eventify-bookings-grid mt-8">
          {bookings.map(
            (booking) => {
              const event =
                booking.event;

              if (!event) {
                return null;
              }

              const currentWinner =
                getCurrentUserWinner(
                  event.winners || []
                );

              const isCompleted =
                event.eventStatus ===
                "Completed";

              return (
                <article
                  key={booking._id}
                  className="eventify-booking-card"
                >
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

                    <h2 className="text-xl font-bold text-white">
                      {event.name}
                    </h2>

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

                    <div className="grid grid-cols-2 gap-3 mt-5">
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

                      <button
                        type="button"
                        onClick={() =>
                          handleUnregister(
                            event._id
                          )
                        }
                        disabled={
                          isCompleted
                        }
                        className="eventify-danger-button"
                      >
                        {isCompleted
                          ? "Completed"
                          : "Unregister"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </div>
      )}
    </div>
  );
};

export default MyBookings;