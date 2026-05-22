import { NavLink } from "react-router-dom";

export default function BottomNav() {
  const linkStyle = ({ isActive }) =>
    `nav-link nav-item-lite text-center ${isActive ? "active" : ""}`;

  return (
    <nav
      className="navbar fixed-bottom nav-surface"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="container d-flex justify-content-around align-items-center">
        <NavLink to="/dashboard" className={linkStyle}>
          <span>🏠</span> <br />
          <small>Home</small>
        </NavLink>

        <NavLink to="/trackers" className={linkStyle}>
          📌 <br />
          <small>Trackers</small>
        </NavLink>

        <NavLink to="/reports" className={linkStyle}>
          <span>📂</span> <br />
          <small>Reports</small>
        </NavLink>

        <NavLink to="/emergency" className={linkStyle}>
          <span>🚨</span> <br />
          <small>Emergency</small>
        </NavLink>

        <NavLink to="/settings" className={linkStyle}>
          <span>⚙️</span> <br />
          <small>Settings</small>
        </NavLink>
      </div>
    </nav>
  );
}