import { useEffect, useRef } from "react";
import { useReducedMotion } from "../hooks/useMotionPreference";
import classes from "./OwlEyes.module.css";

// How far from an eye's centre the cursor has to be before its pupil reaches
// full travel. Closer than that it leans only part of the way, so an eye that
// the cursor is nearly on top of looks at it rather than past it.
const LOOK_RADIUS = 260; // px

// How quickly the pupils catch up, as the time constant of an exponential
// ease (the same shape the cursor dot uses), so it feels the same at 60Hz and
// 144Hz. A little slower than the cursor: eyes should feel like they notice.
const FOLLOW_TAU = 70; // ms
const MAX_FRAME_MS = 50; // a long pause (hidden tab) must not become one huge step

// Below this the pupils count as settled and the frame loop is allowed to stop.
const SETTLE_PX = 0.02;

// Keeps the iris off the very rim of the eye at full travel.
const TRAVEL_PAD = 1.5; // px

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
 */
const OwlEyes = () => {
  const rootRef = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return undefined;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

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

      // All reads first, then all writes: no layout is forced in between.
      const rects = eyes.map((eye) => eye.el.getBoundingClientRect());
      let busy = false;

      eyes.forEach((eye, i) => {
        let targetX = 0;
        let targetY = 0;

        if (pointer) {
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

      frame = busy ? requestAnimationFrame(tick) : 0;
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
      for (const eye of eyes) eye.iris.style.removeProperty("translate");
    };
  }, [reduced]);

  return (
    <div className={classes.owl} ref={rootRef} aria-hidden="true">
      {[0, 1].map((side) => (
        <span key={side} className={classes.eye} data-eye>
          <span className={classes.iris} data-iris>
            <span className={classes.glint} />
          </span>
        </span>
      ))}
    </div>
  );
};

export default OwlEyes;
