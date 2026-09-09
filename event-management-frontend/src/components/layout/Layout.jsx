import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [theme, setTheme] = useState(() => {
    const savedTheme =
      localStorage.getItem("eventifyTheme");

    if (
      savedTheme === "light" ||
      savedTheme === "dark"
    ) {
      return savedTheme;
    }

    return "dark";
  });

  const navigate = useNavigate();
  const location = useLocation();

  const user = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("user")
      );
    } catch {
      return null;
    }
  })();

  const pageNames = {
    "/dashboard": "Dashboard",
    "/events": "Discover Events",
    "/all-events": "All Events",
    "/bookings": "My Bookings",
    "/profile": "My Profile",
  };

  const currentPage =
    location.pathname.startsWith("/event/")
      ? "Event Details"
      : pageNames[location.pathname] ||
        "Eventify";

  useEffect(() => {
    document.documentElement.dataset.theme =
      theme;

    document.documentElement.style.colorScheme =
      theme;

    localStorage.setItem(
      "eventifyTheme",
      theme
    );
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) =>
      current === "dark"
        ? "light"
        : "dark"
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    navigate("/login");
  };

  return (
    <div className="eventify-app-shell">
      {/* DESKTOP SIDEBAR */}

      <aside className="eventify-desktop-sidebar">
        <Sidebar />
      </aside>

      {/* MOBILE OVERLAY */}

      {mobileMenuOpen && (
        <div
          className="eventify-mobile-overlay"
          onClick={() =>
            setMobileMenuOpen(false)
          }
        />
      )}

      {/* MOBILE SIDEBAR */}

      <aside
        className={`eventify-mobile-sidebar ${
          mobileMenuOpen
            ? "eventify-mobile-sidebar-open"
            : ""
        }`}
      >
        <button
          type="button"
          onClick={() =>
            setMobileMenuOpen(false)
          }
          className="eventify-mobile-close"
          aria-label="Close menu"
        >
          ✕
        </button>

        <Sidebar />
      </aside>

      {/* MAIN */}

      <div className="eventify-app-main">
        <div className="eventify-user-topbar">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(true)
              }
              className="eventify-menu-button"
              aria-label="Open menu"
            >
              ☰
            </button>

            <div className="min-w-0">
              <p className="text-xs text-slate-500">
                Eventify
              </p>

              <h2 className="text-lg font-bold text-white truncate">
                {currentPage}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="eventify-theme-toggle"
              aria-label={`Switch to ${
                theme === "dark"
                  ? "light"
                  : "dark"
              } mode`}
              title={`Switch to ${
                theme === "dark"
                  ? "light"
                  : "dark"
              } mode`}
            >
              <span className="eventify-theme-icon">
                {theme === "dark"
                  ? "☀"
                  : "☾"}
              </span>

              <span className="eventify-theme-label">
                {theme === "dark"
                  ? "Light"
                  : "Dark"}
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/profile")
              }
              className="eventify-top-profile"
            >
              <div className="eventify-top-avatar">
                {user?.name
                  ?.charAt(0)
                  .toUpperCase() || "U"}
              </div>

              <div className="eventify-top-profile-copy hidden sm:block text-left min-w-0">
                <p className="eventify-top-profile-name text-sm font-semibold">
                  {user?.name || "User"}
                </p>

                <p className="eventify-top-profile-meta text-xs">
                  {user?.department ||
                    "Student"}
                  {user?.year
                    ? ` • Year ${user.year}`
                    : ""}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="eventify-top-logout"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Keep existing Navbar functionality if needed */}
        <div className="hidden">
          <Navbar />
        </div>

        <main className="eventify-app-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
