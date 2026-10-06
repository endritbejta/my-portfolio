import { FiCopy, FiMaximize2, FiMinus, FiSquare, FiX } from "react-icons/fi";
import classes from "./WindowControls.module.css";

/**
 * Window controls for the preview frame, in the visitor's own OS style.
 * They do what their real counterparts do, to a frame rather than a window:
 * close unloads the site, minimize folds the frame down to its title bar,
 * and maximize / zoom takes it fullscreen.
 */
/* macOS's close and minimize glyphs, drawn rather than borrowed from an icon
   set; the green button uses the diagonal-arrows icon. All are revealed on
   hover by the stylesheet, as on a real window. */
const Glyph = ({ children }) => (
  <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">
    {children}
  </svg>
);

const CloseGlyph = () => (
  <Glyph>
    <path d="M3.4 3.4l5.2 5.2M8.6 3.4L3.4 8.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </Glyph>
);

const MinimizeGlyph = () => (
  <Glyph>
    <path d="M2.8 6h6.4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </Glyph>
);

/* Windows 11's caption glyphs: hairline strokes on a 10px grid. */
const Caption = ({ children }) => (
  <svg viewBox="0 0 10 10" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1">
    {children}
  </svg>
);

const MinimizeCaption = () => (
  <Caption>
    <path d="M0 5.5H10" />
  </Caption>
);

const MaximizeCaption = () => (
  <Caption>
    <rect x="0.5" y="0.5" width="9" height="9" rx="1.5" />
  </Caption>
);

const RestoreCaption = () => (
  <Caption>
    <rect x="0.5" y="2.5" width="7" height="7" rx="1.3" />
    <path d="M2.5 2.5V1.8A1.3 1.3 0 0 1 3.8 0.5H8.2A1.3 1.3 0 0 1 9.5 1.8V6.2A1.3 1.3 0 0 1 8.2 7.5H7.5" />
  </Caption>
);

const CloseCaption = () => (
  <Caption>
    <path d="M0.5 0.5L9.5 9.5M9.5 0.5L0.5 9.5" />
  </Caption>
);

const WindowControls = ({ os, minimized, fullscreen, onClose, onMinimize, onToggleFullscreen }) => {
  const minimizeLabel = minimized ? "Restore preview" : "Minimize preview";
  const fullscreenLabel = fullscreen ? "Exit fullscreen" : "Fullscreen";

  if (os === "mac") {
    return (
      <div className={classes.lights} role="group" aria-label="Window controls">
        <button
          type="button"
          className={`${classes.light} ${classes.close}`}
          onClick={onClose}
          aria-label="Close preview"
          title="Close"
        >
          <CloseGlyph />
        </button>
        <button
          type="button"
          className={`${classes.light} ${classes.minimize}`}
          onClick={onMinimize}
          aria-label={minimizeLabel}
          aria-keyshortcuts="M"
          aria-pressed={minimized}
          title={minimized ? "Restore" : "Minimize"}
        >
          <MinimizeGlyph />
        </button>
        <button
          type="button"
          className={`${classes.light} ${classes.zoom}`}
          onClick={onToggleFullscreen}
          aria-label={fullscreenLabel}
          aria-keyshortcuts="F"
          aria-pressed={fullscreen}
          title={fullscreenLabel}
        >
          <FiMaximize2 aria-hidden="true" />
        </button>
      </div>
    );
  }

  // Linux, ChromeOS and anything else: system-neutral round buttons with
  // plain icons, rather than imitating a desktop we can't identify.
  if (os === "other") {
    return (
      <div className={classes.generic} role="group" aria-label="Window controls">
        <button
          type="button"
          onClick={onMinimize}
          aria-label={minimizeLabel}
          aria-keyshortcuts="M"
          aria-pressed={minimized}
          title={minimized ? "Restore" : "Minimize"}
        >
          <FiMinus aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onToggleFullscreen}
          aria-label={fullscreenLabel}
          aria-keyshortcuts="F"
          aria-pressed={fullscreen}
          title={fullscreenLabel}
        >
          {fullscreen ? <FiCopy aria-hidden="true" /> : <FiSquare aria-hidden="true" />}
        </button>
        <button type="button" onClick={onClose} aria-label="Close preview" title="Close">
          <FiX aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div className={classes.caption} role="group" aria-label="Window controls">
      <button
        type="button"
        onClick={onMinimize}
        aria-label={minimizeLabel}
        aria-keyshortcuts="M"
        aria-pressed={minimized}
        title={minimized ? "Restore" : "Minimize"}
      >
        <MinimizeCaption />
      </button>
      <button
        type="button"
        onClick={onToggleFullscreen}
        aria-label={fullscreenLabel}
        aria-keyshortcuts="F"
        aria-pressed={fullscreen}
        title={fullscreenLabel}
      >
        {fullscreen ? <RestoreCaption /> : <MaximizeCaption />}
      </button>
      <button type="button" className={classes.captionClose} onClick={onClose} aria-label="Close preview" title="Close">
        <CloseCaption />
      </button>
    </div>
  );
};

export default WindowControls;
