import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiMenu, FiMoon, FiSearch, FiSun, FiX } from "react-icons/fi";
import { NAV_LINKS, SECTION_IDS } from "../constants";
import { useOs } from "../hooks/useOs";
import { useTheme } from "../hooks/useTheme";
import { useScrollProgress } from "../hooks/useScrollProgress";
import { useScrollSpy } from "../hooks/useScrollSpy";
import classes from "./Navbar.module.css";


/**
 * The shortcut hint, as it is written on each kind of system: ⌘ K on macOS,
 * Ctrl K everywhere else. The icon is a search magnifier on all of them — it
 * says what the palette is for, and doesn't depend on a key symbol the
 * visitor's keyboard may not have.
 */
const SHORTCUT = {
  mac: { key: "⌘", label: "Open command palette (⌘K)" },
  windows: { key: "Ctrl", label: "Open command palette (Ctrl+K)" },
  other: { key: "Ctrl", label: "Open command palette (Ctrl+K)" },
};

/**
 * Command-palette trigger button.
 * Hidden on touch/mobile (keyboard shortcuts don't apply there).
 */
const PaletteButton = ({ onOpen }) => {
  const { key, label } = SHORTCUT[useOs()];

  return (
    <button
      type="button"
      className={`${classes.iconButton} ${classes.paletteButton}`}
      onClick={onOpen}
      aria-label={label}
      title={label}
    >
      <FiSearch aria-hidden="true" />
      <kbd className={classes.kbd}>{key} K</kbd>
    </button>
  );
};

const Navbar = ({ onOpenPalette }) => {
  const { theme, toggleTheme } = useTheme();
  const progress = useScrollProgress();
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const activeId = useScrollSpy(isHome ? SECTION_IDS : []);
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu on navigation and lock body scroll while open.
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className={classes.navbar}>
      <div
        className={classes.progress}
        style={{ transform: `scaleX(${progress})` }}
        aria-hidden="true"
      />
      <div className={`container ${classes.inner}`}>
        <Link to="/" className={classes.logo} aria-label="Endrit Bejta — home">
          <span className={classes.logoMark}>EB</span>
          <span className={classes.logoText}>endrit bejta</span>
        </Link>

        <nav
          id="primary-navigation"
          className={`${classes.nav} ${menuOpen ? classes.navOpen : ""}`}
          aria-label="Primary"
        >
          <ul role="list">
            {NAV_LINKS.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`/#${id}`}
                  className={activeId === id ? classes.active : ""}
                  aria-current={activeId === id ? "true" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={classes.actions}>
          <PaletteButton onOpen={onOpenPalette} />
          <button
            type="button"
            className={classes.iconButton}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}
          </button>
          <button
            type="button"
            className={`${classes.iconButton} ${classes.menuButton}`}
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
