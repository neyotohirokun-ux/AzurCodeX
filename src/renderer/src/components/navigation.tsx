import { NavLink } from "react-router-dom";
import "./Navigation.css";

export function Navigation() {
  return (
    <nav className="nav">
      <div className="nav-left">
        <span className="nav-logo">Azur CodeX</span>
      </div>

      <div className="nav-right">
        <NavLink to="*" className="nav-link">
          Home
        </NavLink>
        <NavLink to="/nation/0" className="nav-link">
          Nations
        </NavLink>
      </div>
    </nav>
  );
}
