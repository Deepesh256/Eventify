import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import API from "../services/api";
import EventCard from "../components/EventCard";

const UserDashboard = () => {
  const [events, setEvents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

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

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res =
          await API.get("/events");

        setEvents(
          Array.isArray(res.data)
            ? res.data
            : []
        );
      } catch (error) {
        console.error(
          "Dashboard events error:",
          error
        );

        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const upcomingEvents =
    useMemo(
      () =>
        events.filter(
          (event) =>
            event.eventStatus ===
            "Upcoming"
        ),
      [events]
    );

  const ongoingEvents =
    events.filter(
      (event) =>
        event.eventStatus === "Ongoing"
    );

  const completedEvents =
    events.filter(
      (event) =>
        event.eventStatus ===
        "Completed"
    );

  const featuredEvents =
    upcomingEvents.slice(0, 3);

  return (
    <div className="eventify-user-page">
      {/* WELCOME */}

      <section className="eventify-dashboard-hero">
        <div>
          <div className="eventify-pill mb-4">
            ✨ Welcome to Eventify
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white">
            Welcome back,{" "}
            <span className="eventify-gradient-text">
              {user?.name?.split(" ")[0] ||
                "Student"}
            </span>
          </h1>

          <p className="text-slate-400 mt-3 max-w-xl">
            Discover events, manage your
            registrations and stay updated
            with the latest results.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              type="button"
              onClick={() =>
                navigate("/events")
              }
              className="eventify-button-primary"
            >
              Explore Events →
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/bookings")
              }
              className="eventify-button-secondary"
            >
              My Bookings
            </button>
          </div>
        </div>

        <div className="eventify-dashboard-decoration">
          🎉
        </div>
      </section>

      {/* STATS */}

      <section className="eventify-dashboard-stats">
        <div className="eventify-stat-card">
          <div className="eventify-stat-icon">
            📅
          </div>

          <div>
            <p className="eventify-stat-number">
              {events.length}
            </p>

            <p className="eventify-stat-label">
              Total Events
            </p>
          </div>
        </div>

        <div className="eventify-stat-card">
          <div className="eventify-stat-icon">
            🚀
          </div>

          <div>
            <p className="eventify-stat-number">
              {upcomingEvents.length}
            </p>

            <p className="eventify-stat-label">
              Upcoming
            </p>
          </div>
        </div>

        <div className="eventify-stat-card">
          <div className="eventify-stat-icon">
            ⚡
          </div>

          <div>
            <p className="eventify-stat-number">
              {ongoingEvents.length}
            </p>

            <p className="eventify-stat-label">
              Ongoing
            </p>
          </div>
        </div>

        <div className="eventify-stat-card">
          <div className="eventify-stat-icon">
            🏆
          </div>

          <div>
            <p className="eventify-stat-number">
              {completedEvents.length}
            </p>

            <p className="eventify-stat-label">
              Completed
            </p>
          </div>
        </div>
      </section>

      {/* EVENTS */}

      <section className="mt-10">
        <div className="eventify-page-heading-row">
          <div>
            <p className="eventify-section-label">
              DISCOVER
            </p>

            <h2 className="text-2xl font-bold text-white mt-1">
              Upcoming Events
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Events you may want to
              explore next.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/events")
            }
            className="eventify-text-button"
          >
            View all →
          </button>
        </div>

        {loading ? (
          <div className="eventify-empty-state">
            Loading events...
          </div>
        ) : featuredEvents.length ===
          0 ? (
          <div className="eventify-empty-state">
            <div className="text-3xl mb-3">
              📭
            </div>

            <p className="font-semibold text-white">
              No upcoming events
            </p>

            <p className="text-sm text-slate-500 mt-1">
              New events will appear here.
            </p>
          </div>
        ) : (
          <div className="eventify-events-grid">
            {featuredEvents.map(
              (event) => (
                <EventCard
                  key={event._id}
                  event={event}
                />
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default UserDashboard;