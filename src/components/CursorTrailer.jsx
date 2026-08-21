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

   FOLLOW_MS is how long the dot takes to visually arrive once the pointer
   stops — the closest equivalent to a CSS transition's duration, and matched
   here to --cursor-swell so the trail and the swell feel like one motion.
   An exponential ease never technically ends, so it is converted to a time
   constant: the last visible pixel of a move is closed at ~6.6 tau, measured.
   Raising it lengthens the tail while moving too, roughly in proportion. */
const FOLLOW_MS = 800;
const FOLLOW_TAU = FOLLOW_MS / 6.6;

/* A stalled tab (or a slow frame) must not teleport the dot, but it should
   not crawl back either — clamping the delta keeps one long gap from
   resolving in a single jump. */
const MAX_FRAME_MS = 100;

// Below this the dot has effectively arrived, so the loop can stop.
const SETTLE_PX = 0.05;

/* Anchors only — plus anything opting in explicitly. Deliberately excludes
   <button>: the cue promises "this takes you somewhere", and the buttons on
   this site (theme toggle, command palette, copy email, mobile menu) do not.
   The Button component renders an <a> whenever it has an href and a <button>
   otherwise, so navigating buttons are already covered by the anchor case. */
const INTERACTIVE = 'a[href], [data-cursor]';

/**
 * Works out what the cursor is over: which cue to show, and how far to swell.
 * An explicit data-cursor wins; otherwise the type is derived from the link
 * itself, so new links anywhere on the site are covered without being tagged
 * by hand. `closest` matches the innermost target, so a link inside a tagged
 * region resolves to the link and takes its own size.
 */
const resolveTarget = (node) => {
  const target = node instanceof Element ? node.closest(INTERACTIVE) : null;
  if (!target) return null;

  const size = target.dataset.cursorSize === "lg" ? "lg" : "sm";
  const typed = (type) => ({ type, size });

  if (target.dataset.cursor) return typed(target.dataset.cursor);
  if (target.tagName !== "A") return typed("internal");

  const href = target.getAttribute("href") || "";
  if (target.hasAttribute("download")) return typed("download");
  if (href.startsWith("mailto:")) return typed("mail");
  if (target.target === "_blank" || /^https?:/i.test(href)) return typed("external");
  if (href.includes("/projects/")) return typed("read");
  return typed("internal");
};

/**
 * A dot that trails the cursor and swells into an icon over anything that
 * navigates, standing in for the native pointer while it does (see the
 * .cursor-none rule in global.css).
 *
 * Not rendered at all for coarse pointers (no cursor to trail) or
 * `prefers-reduced-motion` — and because the native cursor is only hidden
 * from inside this effect, those cases keep the normal pointer.
 */
const CursorTrailer = () => {
  const dotRef = useRef(null);
  const [enabled, setEnabled] = useState(false);
  const [target, setTarget] = useState(null); // { type, size } | null
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

    let lastKey = null;
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

      // Only `translate` — the scale lives in CSS so its transition survives.
      dot.style.translate = `${(x - half).toFixed(2)}px ${(y - half).toFixed(2)}px`;

      const arrived =
        Math.abs(pointerX - x) < SETTLE_PX && Math.abs(pointerY - y) < SETTLE_PX;

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

      // Only touch React when the cue actually changes, not on every event.
      const next = resolveTarget(event.target);
      const key = next ? `${next.type}:${next.size}` : null;
      if (key !== lastKey) {
        lastKey = key;
        setTarget(next);
        // Over something clickable the swollen dot stands in for the pointer.
        document.documentElement.classList.toggle("cursor-none", next !== null);
      }

      setVisible(true);
      run();
    };

    const onMouseLeave = () => {
      lastKey = null;
      setTarget(null);
      document.documentElement.classList.remove("cursor-none");
      setVisible(false);
      run();
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      if (frame) cancelAnimationFrame(frame);
      // Never leave the page without a pointer if this unmounts mid-hover.
      document.documentElement.classList.remove("cursor-none");
    };
  }, [enabled]);

  if (!enabled) return null;

  const Icon = target ? ICONS[target.type] ?? FiArrowUpRight : null;

  return (
    <div
      ref={dotRef}
      className={[classes.trailer, visible && classes.visible, target && classes.hovering]
        .filter(Boolean)
        .join(" ")}
      data-size={target?.size}
      aria-hidden="true"
    >
      <span className={`${classes.icon} ${Icon ? classes.iconVisible : ""}`}>
        {/* Heavier than Feather's default 2, to read at the swollen size */}
        {Icon && <Icon strokeWidth={2.5} />}
      </span>
    </div>
  );
};

export default CursorTrailer;
