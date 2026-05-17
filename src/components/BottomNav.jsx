import { NavLink } from "react-router-dom";

export default function BottomNav() {
  const linkStyle = ({ isActive }) =>
    `nav-link text-center ${isActive ? "text-primary fw-bold" : "text-muted"}`;

  return (
    <nav
      className="navbar fixed-bottom bg-white border-top"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="container d-flex justify-content-around">
        <NavLink to="/dashboard" className={linkStyle}>
          🏠 <br />
          <small>Home</small>
        </NavLink>

        <NavLink to="/trackers" className={linkStyle}>
          📌 <br />
          <small>Trackers</small>
        </NavLink>

        <NavLink to="/reports" className={linkStyle}>
          📂 <br />
          <small>Reports</small>
        </NavLink>

        <NavLink to="/settings" className={linkStyle}>
          ⚙️ <br />
          <small>Settings</small>
        </NavLink>
      </div>
    </nav>
  );
}