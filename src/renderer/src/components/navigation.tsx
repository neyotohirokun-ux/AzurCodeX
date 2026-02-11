import { NavLink } from "react-router-dom";
import { Menu } from "lucide-react"; // Lucide icon
import { useState, useEffect, useRef } from "react";
import "./Navigation.css";

export function Navigation() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleCloseApp = () => {
    if (window.electronAPI) {
      window.electronAPI.closeApp();
    } else {
      window.close();
    }
  };

  // Close dropdown if click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="nav">
      <div className="nav-left">
        <span className="nav-logo">Azur CodeX</span>
      </div>

      <div className="nav-right">
        <NavLink to="*" className="nav-link">
          Home
        </NavLink>
        <NavLink to="/nationlist/0" className="nav-link">
          Nations
        </NavLink>

        <div className="nav-dropdown" ref={dropdownRef}>
          <button className="dropdown-toggle" onClick={() => setOpen(!open)}>
            <Menu size={20} />
          </button>
          {open && (
            <div className="dropdown-content">
              <button className="dropdown-item" onClick={handleCloseApp}>
                Close App
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
