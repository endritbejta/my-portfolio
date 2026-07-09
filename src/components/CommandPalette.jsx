import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiExternalLink,
  FiFileText,
  FiGithub,
  FiLinkedin,
  FiMail,
  FiMoon,
  FiNavigation,
  FiSearch,
} from "react-icons/fi";
import { NAV_LINKS } from "../constants";
import { profile, socials } from "../data/profile";
import { projects } from "../data/projects";
import { useTheme } from "../hooks/useTheme";
import classes from "./CommandPalette.module.css";

/**
 * Ctrl/Cmd+K command palette: jump to sections, open case studies,
 * hit external links, copy email, toggle theme. Fully keyboard driven.
 */
const CommandPalette = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const commands = useMemo(
    () => [
      ...NAV_LINKS.map(({ id, label }) => ({
        id: `section-${id}`,
        group: "Navigate",
        label: `Go to ${label}`,
        icon: <FiNavigation />,
        run: () => {
          window.location.assign(`/#${id}`);
        },
      })),
      ...projects
        .filter((project) => project.caseStudy)
        .map((project) => ({
          id: `project-${project.slug}`,
          group: "Case studies",
          label: project.title,
          icon: <FiFileText />,
          run: () => navigate(`/projects/${project.slug}`),
        })),
      {
        id: "github",
        group: "Links",
        label: "Open GitHub profile",
        icon: <FiGithub />,
        run: () => window.open(socials.github, "_blank", "noreferrer"),
      },
      {
        id: "linkedin",
        group: "Links",
        label: "Open LinkedIn",
        icon: <FiLinkedin />,
        run: () => window.open(socials.linkedin, "_blank", "noreferrer"),
      },
      {
        id: "resume",
        group: "Links",
        label: "Download resume",
        icon: <FiExternalLink />,
        run: () => window.open(profile.resume, "_blank", "noreferrer"),
      },
      {
        id: "email",
        group: "Actions",
        label: `Copy email (${profile.email})`,
        icon: <FiMail />,
        run: () => navigator.clipboard?.writeText(profile.email),
      },
      {
        id: "theme",
        group: "Actions",
        label: "Toggle dark / light mode",
        icon: <FiMoon />,
        run: toggleTheme,
      },
    ],
    [navigate, toggleTheme]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((command) =>
      `${command.group} ${command.label}`.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Reset and focus when opened; lock scroll while open.
  useEffect(() => {
    if (!open) return undefined;
    setQuery("");
    setActiveIndex(0);
    document.body.style.overflow = "hidden";
    const id = setTimeout(() => inputRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = "";
      clearTimeout(id);
    };
  }, [open]);

  useEffect(() => setActiveIndex(0), [query]);

  // Keep the active option scrolled into view.
  useEffect(() => {
    listRef.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) return null;

  const runCommand = (command) => {
    onClose();
    command.run();
  };

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault();
      runCommand(results[activeIndex]);
    }
  };

  return (
    <div
      className={classes.overlay}
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className={classes.palette}
        onKeyDown={onKeyDown}
      >
        <div className={classes.inputRow}>
          <FiSearch aria-hidden="true" className={classes.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-results"
            aria-activedescendant={results[activeIndex]?.id}
            placeholder="Type a command or search…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <kbd>esc</kbd>
        </div>
        <ul id="palette-results" role="listbox" ref={listRef} className={classes.results}>
          {results.length === 0 && (
            <li className={classes.empty}>No results for “{query}”</li>
          )}
          {results.map((command, index) => (
            <li
              key={command.id}
              id={command.id}
              role="option"
              aria-selected={index === activeIndex}
              className={index === activeIndex ? classes.activeOption : ""}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => runCommand(command)}
            >
              <span className={classes.optionIcon} aria-hidden="true">
                {command.icon}
              </span>
              <span className={classes.optionLabel}>{command.label}</span>
              <span className={classes.optionGroup}>{command.group}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CommandPalette;
