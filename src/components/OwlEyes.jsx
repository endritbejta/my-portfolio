import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../hooks/useMotionPreference";
import classes from "./OwlEyes.module.css";

// How far from an eye's centre the cursor has to be before its pupil reaches
// full travel. Closer than that it leans only part of the way, so an eye that
// the cursor is nearly on top of looks at it rather than past it.
const LOOK_RADIUS = 260; // px

// How quickly the pupils catch up, as the time constant of an exponential
// ease (the same shape the cursor dot uses), so it feels the same at 60Hz and
// 144Hz. Well slower than the cursor: eyes should drift after it, not snap.
const FOLLOW_TAU = 160; // ms
const MAX_FRAME_MS = 50; // a long pause (hidden tab) must not become one huge step

// While the email is being copied the eyes shift awkwardly: a beat looking at
// the button, a beat darting toward the middle, and round again for as long
// as it is hovered.
const AWKWARD_LOOK_MS = 850;
const AWKWARD_AWAY_MS = 650;

// Below this the pupils count as settled and the frame loop is allowed to stop.
const SETTLE_PX = 0.02;

// Keeps the iris off the very rim of the eye at full travel.
const TRAVEL_PAD = 1.5; // px

/* What the brows do over each kind of link or button, keyed by the same cue
   names the cursor dot uses (a data-cursor value, or one worked out from the
   link). Anything not listed leaves the brows at rest. The poses live in the
   stylesheet; this only picks one. */
const MOODS = {
  mail: "surprised", // Email me: both brows shoot up
  copy: "sneaky", // Copy email: one brow furrows, the other arches
  download: "determined", // Resume: both brows knit
  external: "skeptic", // GitHub, LinkedIn: one brow cocked
  read: "curious", // a project card: a small lift
};

const moodFor = (node) => {
  const target = node instanceof Element ? node.closest("a[href], [data-cursor]") : null;
  if (!target) return null;

  let cue = target.dataset.cursor;
  if (!cue && target.tagName === "A") {
    const href = target.getAttribute("href") || "";
    if (target.hasAttribute("download")) cue = "download";
    else if (href.startsWith("mailto:")) cue = "mail";
    else if (target.target === "_blank" || /^https?:/i.test(href)) cue = "external";
    else if (href.includes("/projects/")) cue = "read";
  }
  return MOODS[cue] ?? null;
};

// A tapered brow: a point at the outer end, a rounded blob at the inner end.
const BROW_PATH = "M2 21 Q 24 -3 53 6 A 5.2 5.2 0 0 1 51 16.4 Q 27 7.5 2 21 Z";

/**
 * A pair of owl eyes whose pupils follow the cursor.
 *
 * Only the irises move, and only through `translate`, so a frame is two
 * rectangle reads and two style writes with no layout of its own. The loop
 * runs while the footer is on screen and the pupils are still catching up,
 * and stops otherwise; a mouse move or a scroll (which moves the eyes under a
 * still cursor) starts it again.
 *
 * With touch/coarse pointers there is no cursor to look at, and with reduced
 * motion nothing may move: either way the eyes stay looking straight ahead.
 *
 * The brows are a separate layer: hovering a link or button anywhere on the
 * page sets a mood on the root, and the stylesheet poses the brows to match.
 */
const OwlEyes = () => {
  const rootRef = useRef(null);
  // Shared between the two effects below: whether the eyes are looking away
  // (and the tracking loop's wake-up), without either re-running the other.
  const gazeRef = useRef({ since: 0, wake: null });
  const [mood, setMood] = useState(null);
  const reduced = useReducedMotion();

  // Brow reactions. Delegated from the document, so it covers every link and
  // button without any of them knowing about the owl, and React only hears
  // about it when the mood actually changes.
  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (reduced || !finePointer.matches) return undefined;

    const gaze = gazeRef.current;
    let hold = 0; // timer: a copy keeps the eyes shifty a moment after the click

    const apply = (next) => {
      setMood(next);
      // Caught in the act: the eyes keep flicking between the button and
      // each other (see AWKWARD_MS).
      gaze.since = next === "sneaky" ? performance.now() : 0;
      gaze.wake?.();
    };

    const onOver = (event) => {
      if (!hold) apply(moodFor(event.target));
    };
    const onLeave = () => {
      if (!hold) apply(null);
    };
    const onClick = (event) => {
      if (!(event.target instanceof Element) || !event.target.closest("[data-cursor='copy']")) return;
      apply("sneaky");
      clearTimeout(hold);
      hold = setTimeout(() => {
        hold = 0;
        apply(null);
      }, 1600);
    };

    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("click", onClick);
    return () => {
      clearTimeout(hold);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("click", onClick);
      gaze.since = 0;
      setMood(null);
    };
  }, [reduced]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return undefined;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const gaze = gazeRef.current;

    const eyes = [...root.querySelectorAll("[data-eye]")].map((el) => ({
      el,
      iris: el.querySelector("[data-iris]"),
      x: 0,
      y: 0,
      travelX: 0,
      travelY: 0,
    }));

    let pointer = null; // { x, y } in viewport coordinates, or null
    let visible = false;
    let frame = 0;
    let lastTime = 0;

    // Sizes come from the stylesheet (rem-based), so measure rather than
    // duplicate them here.
    const measure = () => {
      for (const eye of eyes) {
        // The eyes are ovals, so the iris has more room vertically than sideways.
        eye.travelX = Math.max(0, (eye.el.clientWidth - eye.iris.offsetWidth) / 2 - TRAVEL_PAD);
        eye.travelY = Math.max(0, (eye.el.clientHeight - eye.iris.offsetHeight) / 2 - TRAVEL_PAD);
      }
    };

    const tick = (now) => {
      const dt = Math.min(Math.max(now - lastTime, 0), MAX_FRAME_MS);
      lastTime = now;
      const alpha = 1 - Math.exp(-dt / FOLLOW_TAU);

      const cycle = AWKWARD_LOOK_MS + AWKWARD_AWAY_MS;
      const awayNow = gaze.since !== 0 && Math.max(now - gaze.since, 0) % cycle >= AWKWARD_LOOK_MS;

      // All reads first, then all writes: no layout is forced in between.
      const rects = eyes.map((eye) => eye.el.getBoundingClientRect());
      let busy = false;

      eyes.forEach((eye, i) => {
        let targetX = 0;
        let targetY = 0;

        if (awayNow) {
          // Eyes dart toward the middle and a little down: the look of someone
          // who would rather not have been seen.
          targetX = (i === 0 ? 1 : -1) * eye.travelX * 0.9;
          targetY = eye.travelY * 0.4;
        } else if (pointer) {
          const rect = rects[i];
          const dx = pointer.x - (rect.left + rect.width / 2);
          const dy = pointer.y - (rect.top + rect.height / 2);
          const dist = Math.hypot(dx, dy);

          if (dist > 0.5) {
            const reach = Math.min(dist / LOOK_RADIUS, 1);
            const lean = 1 - (1 - reach) * (1 - reach); // eases out: decisive, then capped
            targetX = (dx / dist) * eye.travelX * lean;
            targetY = (dy / dist) * eye.travelY * lean;
          }
        }

        eye.x += (targetX - eye.x) * alpha;
        eye.y += (targetY - eye.y) * alpha;

        if (Math.abs(targetX - eye.x) < SETTLE_PX && Math.abs(targetY - eye.y) < SETTLE_PX) {
          eye.x = targetX;
          eye.y = targetY;
        } else {
          busy = true;
        }

        eye.iris.style.translate = `${eye.x.toFixed(2)}px ${eye.y.toFixed(2)}px`;
      });

      // The awkward routine never settles; it runs until the hover ends.
      frame = busy || gaze.since !== 0 ? requestAnimationFrame(tick) : 0;
    };

    const wake = () => {
      if (frame || !visible) return;
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    };

    const onMouseMove = (event) => {
      pointer = { x: event.clientX, y: event.clientY };
      wake();
    };

    const onMouseLeave = () => {
      pointer = null; // eyes drift back to looking straight ahead
      wake();
    };

    // Scrolling moves the eyes under a cursor that has not moved.
    const onScroll = () => {
      if (pointer) wake();
    };

    // Re-evaluated whenever the pointer query flips (the window moved to a
    // touch screen), not just on mount.
    const syncInteractivity = () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("scroll", onScroll);

      if (finePointer.matches) {
        window.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseleave", onMouseLeave);
        window.addEventListener("scroll", onScroll, { passive: true });
      } else {
        onMouseLeave();
      }
    };

    gaze.wake = wake;
    measure();
    syncInteractivity();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(root);

    // Nothing to animate while the footer is off screen.
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
    });
    visibilityObserver.observe(root);

    finePointer.addEventListener("change", syncInteractivity);

    return () => {
      cancelAnimationFrame(frame);
      frame = 0;
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("scroll", onScroll);
      finePointer.removeEventListener("change", syncInteractivity);
      gaze.wake = null;
      for (const eye of eyes) eye.iris.style.removeProperty("translate");
    };
  }, [reduced]);

  return (
    <div className={classes.owl} ref={rootRef} aria-hidden="true" data-mood={mood ?? undefined}>
      {["left", "right"].map((side) => (
        <span key={side} className={`${classes.side} ${classes[side]}`}>
          <svg className={classes.brow} viewBox="0 0 60 24" focusable="false">
            <path d={BROW_PATH} />
          </svg>
          <span className={classes.eye} data-eye>
            <span className={classes.iris} data-iris>
              <span className={classes.pupil}>
                <span className={classes.glint} />
              </span>
            </span>
          </span>
        </span>
      ))}
    </div>
  );
};

export default OwlEyes;
