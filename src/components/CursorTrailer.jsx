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

/* Trailing is an exponential ease toward the pointer, run every frame: the
   dot closes a fixed fraction of the remaining gap per unit time, so it moves
   the instant the pointer does and keeps moving while it travels.
   These are time constants in ms — roughly "how long to close ~63% of the
   gap". Lower is tighter to the cursor, higher is a longer tail. */
const FOLLOW_TAU = 90;
const SCALE_TAU = 120;

/* A stalled tab (or a slow frame) must not teleport the dot, but it should
   not crawl back either — clamping the delta keeps one long gap from
   resolving in a single jump. */
const MAX_FRAME_MS = 100;

// Below this the dot has effectively arrived, so the loop can stop.
const SETTLE_PX = 0.05;
const SETTLE_SCALE = 0.002;

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

    // Transforms don't affect layout, so the dot's own size is read once
    // rather than every frame.
    const half = dot.offsetWidth / 2;

    let pointerX = 0;
    let pointerY = 0;
    let x = 0;
    let y = 0;
    let placed = false; // first move drops the dot in rather than flying it in

    let targetScale = SCALE_REST;
    let scale = SCALE_REST;

    let lastType = null;
    let frame = 0;
    let lastTime = 0;

    const tick = (now) => {
      const dt = Math.min(now - lastTime, MAX_FRAME_MS);
      lastTime = now;

      // Exponential ease, expressed against elapsed time so the trail feels
      // identical at 60Hz and 144Hz instead of being twice as fast on one.
      const posAlpha = 1 - Math.exp(-dt / FOLLOW_TAU);
      x += (pointerX - x) * posAlpha;
      y += (pointerY - y) * posAlpha;

      const scaleAlpha = 1 - Math.exp(-dt / SCALE_TAU);
      scale += (targetScale - scale) * scaleAlpha;

      dot.style.transform = `translate3d(${(x - half).toFixed(2)}px, ${(
        y - half
      ).toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;

      const arrived =
        Math.abs(pointerX - x) < SETTLE_PX &&
        Math.abs(pointerY - y) < SETTLE_PX &&
        Math.abs(targetScale - scale) < SETTLE_SCALE;

      // Idle out when there's nothing left to move; a mousemove restarts it.
      frame = arrived ? 0 : requestAnimationFrame(tick);
    };

    const run = () => {
      if (frame) return;
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    };

    const onMouseMove = (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;

      if (!placed) {
        x = pointerX;
        y = pointerY;
        placed = true;
      }

      const found = resolveTarget(event.target);
      targetScale = found ? (found.large ? SCALE_HOVER_LARGE : SCALE_HOVER) : SCALE_REST;

      // Only touch React when the cue actually changes, not on every event.
      const nextType = found?.type ?? null;
      if (nextType !== lastType) {
        lastType = nextType;
        setType(nextType);
      }

      setVisible(true);
      run();
    };

    const onMouseLeave = () => {
      targetScale = SCALE_REST;
      setVisible(false);
      run();
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      if (frame) cancelAnimationFrame(frame);
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
