import { NavLink, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Menu, CircleX, Wrench } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import "./Navigation.css";
import { useNavigation } from "../components/NavigationContext";

export function Navigation() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navRightRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  const { crumbs } = useNavigation();
  const location = useLocation();

  const navigate = useNavigate();

  const handleCloseApp = () => {
    if (window.electronAPI) {
      window.electronAPI.closeApp();
    } else {
      window.close();
    }
  };

  // Move sliding indicator
  const moveIndicator = () => {
    const activeLink = navRightRef.current?.querySelector(
      ".nav-link.active",
    ) as HTMLElement | null;

    if (activeLink && indicatorRef.current && navRightRef.current) {
      const linkRect = activeLink.getBoundingClientRect();
      const parentRect = navRightRef.current.getBoundingClientRect();

      indicatorRef.current.style.width = `${linkRect.width}px`;
      indicatorRef.current.style.transform = `translateX(${
        linkRect.left - parentRect.left
      }px)`;
    }
  };

  // Recalculate on route change
  useEffect(() => {
    moveIndicator();
  }, [location.pathname, crumbs]);

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

      <div className="nav-right" ref={navRightRef}>
        {/* Sliding Active Background */}
        <div className="nav-indicator" ref={indicatorRef} />

        <NavLink to="/" end className="nav-link">
          Home
        </NavLink>

        {crumbs.map((crumb, index) => (
          <NavLink key={index} to={crumb.path} className="nav-link">
            {crumb.label}
          </NavLink>
        ))}

        <div className="nav-dropdown" ref={dropdownRef}>
          <button className="dropdown-toggle" onClick={() => setOpen(!open)}>
            <Menu size={20} />
          </button>

          {open && (
            <div className="dropdown-content">
              <button className="dropdown-item" onClick={handleCloseApp}>
                <CircleX size={20} style={{ marginRight: 6 }} />
                Close App
              </button>

              <button
                className="dropdown-item"
                onClick={() => {
                  setOpen(false);
                  navigate("/tools");
                }}
              >
                <Wrench size={20} style={{ marginRight: 6 }} />
                Tools
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
