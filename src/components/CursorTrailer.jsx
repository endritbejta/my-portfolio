import { useEffect, useRef, useState } from "react";
import { FiArrowUpRight, FiDownload, FiFileText, FiMail, FiPlay } from "react-icons/fi";
import classes from "./CursorTrailer.module.css";

const ICONS = {
  external: FiArrowUpRight,
  internal: FiArrowUpRight,
  read: FiFileText,
  download: FiDownload,
  mail: FiMail,
  video: FiPlay,
};

// The trailing feel comes entirely from this: each frame starts an 800ms
// animation toward the cursor's current position, so the dot is always
// chasing a target that has already moved on.
const LAG_MS = 800;

const SCALE_REST = 1;
const SCALE_HOVER = 3;
const SCALE_HOVER_LARGE = 8; // for media tiles, where there's room for it

const INTERACTIVE = 'a[href], button, [role="button"], [data-cursor]';

/**
 * Works out what the cursor is over and which cue to show. An explicit
 * data-cursor wins; otherwise the type is derived from the link itself, so
 * new links anywhere on the site are covered without being tagged by hand.
 */
const resolveTarget = (node) => {
  const target = node instanceof Element ? node.closest(INTERACTIVE) : null;
  if (!target) return null;

  const large = target.dataset.cursorSize === "lg";

  if (target.dataset.cursor) {
    return { type: target.dataset.cursor, large };
  }

  if (target.tagName !== "A") return { type: "internal", large };

  const href = target.getAttribute("href") || "";
  if (target.hasAttribute("download")) return { type: "download", large };
  if (href.startsWith("mailto:")) return { type: "mail", large };
  if (target.target === "_blank" || /^https?:/i.test(href)) {
    return { type: "external", large };
  }
  if (href.includes("/projects/")) return { type: "read", large };
  return { type: "internal", large };
};

/**
 * A dot that trails the cursor and swells into an icon over anything
 * clickable. Additive — the native cursor stays visible, so nothing depends
 * on this rendering.
 *
 * Not rendered at all for coarse pointers (no cursor to trail) or
 * `prefers-reduced-motion`.
 */
const CursorTrailer = () => {
  const dotRef = useRef(null);
  const [enabled, setEnabled] = useState(false);
  const [type, setType] = useState(null);
  const [visible, setVisible] = useState(false);

  // Whether to render at all, re-checked if the OS setting or device changes.
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    const sync = () => setEnabled(finePointer.matches && !reduceMotion.matches);

    sync();
    reduceMotion.addEventListener("change", sync);
    finePointer.addEventListener("change", sync);
    return () => {
      reduceMotion.removeEventListener("change", sync);
      finePointer.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    const dot = dotRef.current;
    if (!enabled || !dot) return undefined;

    let pointerX = 0;
    let pointerY = 0;
    let hovering = false;
    let large = false;
    let ticking = false;
    let animation = null;

    const frame = () => {
      ticking = false;

      // Each new animation replaces the last. Committing the in-flight value
      // to inline style before cancelling is what keeps the motion smooth:
      // cancel alone would drop the fill and snap the dot back to its base
      // transform, and leaving the old animations to fill instead would pile
      // up a new Animation object every frame for as long as the mouse moves.
      if (animation) {
        try {
          animation.commitStyles();
        } catch {
          // commitStyles throws if the element became undisplayed; the next
          // animation still starts from a sane transform, so carry on.
        }
        animation.cancel();
      }

      const scale = hovering ? (large ? SCALE_HOVER_LARGE : SCALE_HOVER) : SCALE_REST;
      const x = pointerX - dot.offsetWidth / 2;
      const y = pointerY - dot.offsetHeight / 2;

      animation = dot.animate(
        { transform: `translate(${x}px, ${y}px) scale(${scale})` },
        { duration: LAG_MS, fill: "forwards" }
      );
    };

    const requestFrame = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(frame);
    };

    const onMouseMove = (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;

      const found = resolveTarget(event.target);
      hovering = found !== null;
      large = found?.large ?? false;

      // Only touches React when the cue actually changes, not per event.
      setType((current) => (found?.type ?? null) === current ? current : found?.type ?? null);
      setVisible(true);
      requestFrame();
    };

    const onMouseLeave = () => {
      setVisible(false);
      hovering = false;
      large = false;
      requestFrame();
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      if (animation) animation.cancel();
    };
  }, [enabled]);

  if (!enabled) return null;

  const Icon = type ? ICONS[type] ?? FiArrowUpRight : null;

  return (
    <div
      ref={dotRef}
      className={`${classes.trailer} ${visible ? classes.visible : ""}`}
      aria-hidden="true"
    >
      <span className={`${classes.icon} ${Icon ? classes.iconVisible : ""}`}>
        {Icon && <Icon />}
      </span>
    </div>
  );
};

export default CursorTrailer;
