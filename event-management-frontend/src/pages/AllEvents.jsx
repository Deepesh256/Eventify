import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import API from "../services/api";
import EventCard from "../components/EventCard";

const AllEvents = () => {
  const [events, setEvents] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("all");

  const [loading, setLoading] =
    useState(true);

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
          "Error fetching events:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      return events.filter(
        (event) => {
          const searchMatch =
            !term ||
            event.name
              ?.toLowerCase()
              .includes(term) ||
            event.category
              ?.toLowerCase()
              .includes(term) ||
            event.location
              ?.toLowerCase()
              .includes(term);

          const statusMatch =
            status === "all" ||
            event.eventStatus ===
              status;

          return (
            searchMatch &&
            statusMatch
          );
        }
      );
    }, [events, search, status]);

  return (
    <div className="eventify-user-page">
      <div className="eventify-page-header">
        <div>
          <p className="eventify-section-label">
            EVENT DIRECTORY
          </p>

          <h1 className="eventify-user-title">
            All Events
          </h1>

          <p className="eventify-user-subtitle">
            Browse every event available
            on Eventify.
          </p>
        </div>

        <div className="eventify-page-count">
          {filteredEvents.length} Events
        </div>
      </div>

      <div className="eventify-filter-panel">
        <div className="eventify-search-box">
          <span>⌕</span>

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search all events..."
          />
        </div>

        <select
          value={status}
          onChange={(e) =>
            setStatus(
              e.target.value
            )
          }
          className="eventify-filter-select"
        >
          <option value="all">
            All Status
          </option>

          <option value="Upcoming">
            Upcoming
          </option>

          <option value="Ongoing">
            Ongoing
          </option>

          <option value="Completed">
            Completed
          </option>
        </select>
      </div>

      {loading ? (
        <div className="eventify-empty-state mt-8">
          Loading events...
        </div>
      ) : filteredEvents.length ===
        0 ? (
        <div className="eventify-empty-state mt-8">
          <div className="text-3xl">
            🔎
          </div>

          <p className="font-semibold text-white mt-3">
            No events found
          </p>
        </div>
      ) : (
        <div className="eventify-events-grid mt-8">
          {filteredEvents.map(
            (event) => (
              <EventCard
                key={event._id}
                event={event}
              />
            )
          )}
        </div>
      )}
    </div>
  );
};

export default AllEvents;