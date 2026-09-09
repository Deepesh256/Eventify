import { NavLink } from "react-router-dom";

const navItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: "▦",
  },
  {
    to: "/events",
    label: "Discover",
    icon: "◉",
  },
  {
    to: "/all-events",
    label: "All Events",
    icon: "▣",
  },
  {
    to: "/bookings",
    label: "My Bookings",
    icon: "◫",
  },
  {
    to: "/profile",
    label: "Profile",
    icon: "♙",
  },
];

const Sidebar = () => {
  const user = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("user")
      );
    } catch {
      return null;
    }
  })();

  const userName =
    user?.name?.trim() || "User";

  const department =
    user?.department || "Student";

  const year = user?.year
    ? `Year ${user.year}`
    : "";

  return (
    <div className="eventify-sidebar">
      <div className="eventify-sidebar-brand">
        <div className="eventify-logo">
          E
        </div>

        <div className="eventify-sidebar-brand-copy">
          <h1 className="eventify-sidebar-brand-name">
            Eventify ✨
          </h1>

          <p className="eventify-sidebar-brand-subtitle">
            Discover. Join. Experience.
          </p>
        </div>
      </div>

      <p className="eventify-sidebar-menu-label">
        MENU
      </p>

      <nav className="eventify-sidebar-menu">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `eventify-sidebar-link ${
                isActive
                  ? "eventify-sidebar-link-active"
                  : ""
              }`
            }
          >
            <span className="eventify-sidebar-link-icon">
              {item.icon}
            </span>

            <span>{item.label}</span>

            <span className="eventify-sidebar-active-dot" />
          </NavLink>
        ))}
      </nav>

      <div className="eventify-sidebar-spacer" />

      <div className="eventify-sidebar-bottom">
        <NavLink
          to="/profile"
          className="eventify-sidebar-user"
        >
          <div className="eventify-sidebar-user-avatar">
            {userName
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="eventify-sidebar-user-info">
            <p className="eventify-sidebar-user-name">
              {userName}
            </p>

            <p className="eventify-sidebar-user-meta">
              {department}
              {year ? ` • ${year}` : ""}
            </p>
          </div>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
