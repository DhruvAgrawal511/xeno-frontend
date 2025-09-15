// src/components/NavBar.jsx
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function NavBar() {
  const { user, logout } = useAuth();

  const linkClass = ({ isActive }) => (isActive ? "active" : "");

  return (
    <div className="nav">
      <div className="brand">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="url(#g)" strokeWidth="2" />
          <defs>
            <linearGradient id="g" x1="0" x2="24">
              <stop stopColor="#7c3aed" />
              <stop offset="1" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
        </svg>
        <div>
          Xeno Mini CRM
        </div>
      </div>

      <div className="navlinks">
        <NavLink to="/" className={linkClass}>Home</NavLink>
        <NavLink to="/customers" className={linkClass}>Customers</NavLink>
        <NavLink to="/orders" className={linkClass}>Orders</NavLink>
        <NavLink to="/segments" className={linkClass}>Segments</NavLink>
        <NavLink to="/campaigns" className={linkClass}>Campaigns</NavLink>
        <NavLink to="/history" className={linkClass}>History</NavLink>
      </div>

      <div className="right">
        {user && <span className="kbd">{user.email}</span>}
        {user && (
          <button className="btn ghost" onClick={logout}>
            Logout
          </button>
        )}
      </div>
    </div>
  );
}
