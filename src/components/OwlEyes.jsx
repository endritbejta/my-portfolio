import { useEffect, useRef, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
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

// Below this the pupils count as settled and the frame loop is allowed to stop.
const SETTLE_PX = 0.02;

// Keeps the iris off the very rim of the eye at full travel.
const TRAVEL_PAD = 1.5; // px

/* Routines: what the eyes do while a particular button is hovered. Each is a
   list of steps played in order (and `rounds` times over), after which the eyes
   go back to normal even if the cursor stays put.

     ms     how long the step lasts
     look   "cursor" (follow it), "user" (straight out at the visitor), "twin"
            (the same link elsewhere on the page: the footer icon for a contact
            button and vice versa; the cursor if there is none), or [x, y],
            each -1..1, a fixed glance as a fraction of the pupil's travel
     pose   the brows' pose, a data-pose value that the stylesheet defines
     pupils optional: "wide" dilates the irises

   Anything hovered that has no routine just gets its brow pose (STATIC_POSES). */
const ROUTINES = {
  // Copy email, footer Contact: caught out.
  sneaky: {
    rounds: 2,
    steps: [
      { ms: 1500, look: "cursor", pose: "sneaky" },
      { ms: 1500, look: "user", pose: "sneaky-user" },
    ],
  },
  // Email me: thrilled. Wide eyes on the button, gazing up dreamily while the
  // brows bounce, then back to the button.
  surprised: {
    rounds: 1,
    steps: [
      { ms: 900, look: "cursor", pose: "surprised", pupils: "wide" },
      { ms: 1000, look: [0, -1], pose: "bounce", pupils: "wide" },
      { ms: 900, look: "cursor", pose: "surprised", pupils: "wide" },
    ],
  },
  // Resume, footer Skills: flirty. The left brow wiggles, a sideways glance
  // with the right brow wiggling back, then the left again.
  flirty: {
    rounds: 1,
    steps: [
      { ms: 1200, look: "cursor", pose: "flirty" },
      { ms: 1200, look: [-1, 0.25], pose: "flirty-b" },
      { ms: 1200, look: "cursor", pose: "flirty" },
    ],
  },
  // GitHub, LinkedIn: "and I have those down here too". The eyes go from the
  // hovered button to its twin (the same link in the footer, or in the contact
  // card above it) and back, pointing out that they are there as well.
  skeptic: {
    rounds: 2,
    steps: [
      { ms: 900, look: "cursor", pose: "skeptic" },
      { ms: 1300, look: "twin", pose: "point" },
    ],
  },
};

const STATIC_POSES = new Set(["curious"]);

/* What each kind of link or button maps to, keyed by the same cue names the
   cursor dot uses (a data-cursor value, or one worked out from the link). Each
   value is a ROUTINES key or a STATIC_POSES entry; anything not listed leaves
   the eyes alone. */
const MOODS = {
  mail: "surprised",
  copy: "sneaky",
  download: "flirty",
  external: "skeptic",
  read: "curious", // a project card
};

// Footer links get their own reactions, matched on where they point.
const FOOTER_MOODS = {
  "#contact": "sneaky",
  "#skills": "flirty",
};

/** What the pointer is over, as { target, mood }, or null if it is nothing the eyes react to. */
const moodFor = (node) => {
  const target = node instanceof Element ? node.closest("a[href], [data-cursor]") : null;
  if (!target) return null;

  const href = target.tagName === "A" ? target.getAttribute("href") || "" : "";

  if (href && target.closest("footer")) {
    const hash = Object.keys(FOOTER_MOODS).find((key) => href.endsWith(key));
    if (hash) return { target, mood: FOOTER_MOODS[hash] };
  }

  let cue = target.dataset.cursor;
  if (!cue && href) {
    if (target.hasAttribute("download")) cue = "download";
    else if (href.startsWith("mailto:")) cue = "mail";
    else if (target.target === "_blank" || /^https?:/i.test(href)) cue = "external";
    else if (href.includes("/projects/")) cue = "read";
  }
  const mood = MOODS[cue];
  return mood ? { target, mood } : null;
};

// The other copy of a link: GitHub and LinkedIn each appear in the hero, the
// contact card and the footer, so hovering one has the eyes point at the
// nearest of the others (the card above the footer, or the footer below it).
const twinOf = (target) => {
  const href = target?.getAttribute?.("href");
  if (!href) return null;

  const mid = (element) => {
    const box = element.getBoundingClientRect();
    return box.top + box.height / 2;
  };
  const here = mid(target);

  let nearest = null;
  let best = Infinity;
  for (const link of document.querySelectorAll("a[href]")) {
    if (link === target || link.getAttribute("href") !== href) continue;
    const distance = Math.abs(mid(link) - here);
    if (distance < best) {
      best = distance;
      nearest = link;
    }
  }
  return nearest;
};

/* The dizzy easter egg: swing the cursor from one side of the eyes to the
   other a couple of times in quick succession and the irises roll up out of
   the eyes and back in from underneath while stars and question marks orbit. */
const FLIP_DEAD = 60; // px either side of the eyes' centre that counts as "a side"
const FLIP_REACH_Y = 360; // px above/below the eyes within which swings count
const FLIPS_NEEDED = 4; // side changes (two there-and-back swings)...
const FLIP_WINDOW_MS = 3000; // ...within this long
const DIZZY_MS = 3200;
// The irises roll in opposite directions: one goes up and out of the top of
// its eye and comes back in from the bottom while the other goes down and out
// of the bottom and comes back in from the top, in a loop.
const ROLL_PERIOD_MS = 380; // one full trip, at full speed
const ROLL_SLOWDOWN_MS = 1200; // the roll winds down over the end of the spell

const STORAGE_KEY = "owl-eyes";

const readClosed = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "closed";
  } catch {
    return false; // storage blocked: eyes start open
  }
};

// A tapered brow: a point at the outer end, a rounded blob at the inner end.
const BROW_PATH = "M2 21 Q 24 -3 53 6 A 5.2 5.2 0 0 1 51 16.4 Q 27 7.5 2 21 Z";

/**
 * A pair of cartoon eyes whose pupils follow the cursor.
 *
 * Only the irises move, and only through `translate`, so a frame is two
 * rectangle reads and two style writes with no layout of its own. The loop
 * runs while the footer is on screen and something is moving, and stops
 * otherwise; a mouse move or a scroll (which moves the eyes under a still
 * cursor) starts it again.
 *
 * Hovering a link or button anywhere on the page starts that button's routine
 * (see ROUTINES). The brows, pupil size and wobble are all driven by data
 * attributes on the root (data-pose, data-pupils, data-dizzy) that the
 * stylesheet reads, so React never re-renders for any of it.
 *
 * With touch/coarse pointers there is no cursor to look at, and with reduced
 * motion nothing may move: either way the eyes stay looking straight ahead.
 */
const OwlEyes = () => {
  const rootRef = useRef(null);
  const reduced = useReducedMotion();
  const [closed, setClosed] = useState(readClosed);

  const toggleClosed = () => {
    const next = !closed;
    setClosed(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "closed" : "open");
    } catch {
      // not saved, still works for this visit
    }
  };

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
      rollH: 0,
      rollFrom: 0,
    }));

    let pointer = null; // { x, y } in viewport coordinates, or null
    let visible = false;
    let frame = 0;
    let lastTime = 0;
    let centre = { x: 0, y: 0 }; // of the pair, in viewport coordinates

    // What the pointer is over, and what the eyes are doing about it.
    let current = null; // the hovered element a routine/pose belongs to
    let spent = null; // an element whose routine already ran: quiet until the pointer leaves it
    let locked = false; // a click-started routine plays out whatever the pointer does
    let twin = null; // the hovered link's other copy, for "twin" steps
    let routine = null; // { def, start } while one is playing
    let staticPose = null;

    // Dizzy easter egg state.
    let dizzy = null; // { start, until } while wobbling
    let side = 0; // which side of the eyes the cursor was last on: -1, 1, or 0
    let flips = []; // timestamps of recent side changes

    // Shut eyes (the switch beside them) mean no tracking and no reactions: the
    // pupils settle to the middle while the lids come down in CSS.
    const isClosed = () => root.hasAttribute("data-closed");

    const setAttr = (name, value) => {
      if (value === null) {
        if (name in root.dataset) delete root.dataset[name];
      } else if (root.dataset[name] !== value) {
        root.dataset[name] = value;
      }
    };

    // Sizes come from the stylesheet (rem-based), so measure rather than
    // duplicate them here.
    const measure = () => {
      for (const eye of eyes) {
        // The eyes are ovals, so the iris has more room vertically than sideways.
        eye.travelX = Math.max(0, (eye.el.clientWidth - eye.iris.offsetWidth) / 2 - TRAVEL_PAD);
        eye.travelY = Math.max(0, (eye.el.clientHeight - eye.iris.offsetHeight) / 2 - TRAVEL_PAD);
        // How far from centre the iris is entirely out of the eye.
        eye.rollH = (eye.el.clientHeight + eye.iris.offsetHeight) / 2;
      }
      const rect = root.getBoundingClientRect();
      centre = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    };

    // The step of the playing routine at `now`; null if none is playing, and
    // undefined once it has played all its rounds.
    const currentStep = (now) => {
      if (!routine) return null;
      const { steps, rounds } = routine.def;
      const cycle = steps.reduce((total, step) => total + step.ms, 0);
      const elapsed = Math.max(now - routine.start, 0);
      if (elapsed >= cycle * rounds) return undefined;

      let at = elapsed % cycle;
      for (const step of steps) {
        if (at < step.ms) return step;
        at -= step.ms;
      }
      return steps[steps.length - 1];
    };

    const finishRoutine = () => {
      locked = false;
      spent = current;
      current = null;
      routine = null;
      staticPose = null;
    };

    // Brings the data attributes in line with what should be happening now,
    // and returns it for the frame loop.
    const sync = (now) => {
      if (isClosed()) {
        routine = null;
        staticPose = null;
        current = null;
        twin = null;
        locked = false;
        dizzy = null;
        flips = [];
        for (const name of ["pose", "pupils", "dizzy"]) setAttr(name, null);
        return { step: null, dizzyNow: false };
      }

      let step = currentStep(now);
      if (step === undefined) {
        finishRoutine();
        step = null;
      }
      const dizzyNow = dizzy !== null && now < dizzy.until;

      setAttr("pose", step ? step.pose : staticPose);
      setAttr("pupils", !dizzyNow && step?.pupils ? step.pupils : null);
      setAttr("dizzy", dizzyNow ? "" : null);
      return { step, dizzyNow };
    };

    const tick = (now) => {
      const dt = Math.min(Math.max(now - lastTime, 0), MAX_FRAME_MS);
      lastTime = now;

      const { step, dizzyNow } = sync(now);
      if (dizzy && !dizzyNow) {
        dizzy = null;
        flips = [];
      }
      const alpha = 1 - Math.exp(-dt / FOLLOW_TAU);

      // All reads first, then all writes: no layout is forced in between.
      const rects = eyes.map((eye) => eye.el.getBoundingClientRect());
      centre = {
        x: (rects[0].left + rects[rects.length - 1].right) / 2,
        y: (rects[0].top + rects[0].bottom) / 2,
      };
      let busy = false;

      // What the pupils aim at: the cursor, or, for a "twin" step, the same
      // link elsewhere on the page.
      let aim = isClosed() ? null : pointer;
      if (step?.look === "twin") {
        if (twin) {
          const box = twin.getBoundingClientRect();
          aim = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
        }
      }

      eyes.forEach((eye, i) => {
        let targetX = 0;
        let targetY = 0;

        if (dizzyNow) {
          // Up and out of the top (left eye) or down and out of the bottom
          // (right eye), then round again, with a little sway side to side. Driven directly, not eased: the wrap
          // from top to bottom must be a jump, not a streak.
          const span = 2 * eye.rollH;
          const t = Math.min(now - dizzy.start, DIZZY_MS);
          const slowFrom = DIZZY_MS - ROLL_SLOWDOWN_MS;
          // Distance rolled, in full-speed milliseconds: constant speed, then
          // speed falling linearly to nothing at the end, so it coasts to a stop.
          const u = Math.max(t - slowFrom, 0);
          const rolledMs = Math.min(t, slowFrom) + u - (u * u) / (2 * ROLL_SLOWDOWN_MS);
          const calm = 1 - u / ROLL_SLOWDOWN_MS; // 1 -> 0 over the slowdown
          const rolled = (rolledMs / ROLL_PERIOD_MS) * span * (i === 0 ? -1 : 1);
          eye.y = ((((eye.rollFrom + rolled + eye.rollH) % span) + span) % span) - eye.rollH;
          eye.x = Math.sin((t / 380) * (i ? -1 : 1) + i) * eye.travelX * 0.45 * calm;
          busy = true;
          eye.iris.style.translate = `${eye.x.toFixed(2)}px ${eye.y.toFixed(2)}px`;
          return;
        } else if (step && step.look !== "cursor" && step.look !== "twin") {
          if (step.look !== "user") {
            targetX = step.look[0] * eye.travelX;
            targetY = step.look[1] * eye.travelY;
          } // "user": pupils centred, looking straight out of the screen
        } else if (aim) {
          const rect = rects[i];
          const dx = aim.x - (rect.left + rect.width / 2);
          const dy = aim.y - (rect.top + rect.height / 2);
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

      // A routine or a dizzy spell keeps the loop going even when the pupils
      // happen to be still for a moment.
      frame = busy || routine !== null || dizzyNow ? requestAnimationFrame(tick) : 0;
    };

    const wake = () => {
      if (frame || !visible) return;
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    };

    // Starts the routine (or just the pose) for what is hovered, or clears it.
    const apply = (hit) => {
      const now = performance.now();
      current = hit?.target ?? null;
      twin = twinOf(current);
      const def = hit ? ROUTINES[hit.mood] : null;
      routine = def ? { def, start: now } : null;
      staticPose = hit && !def && STATIC_POSES.has(hit.mood) ? hit.mood : null;
      sync(now);
      wake();
    };

    const onOver = (event) => {
      if (locked || isClosed()) return;
      const hit = moodFor(event.target);
      const target = hit?.target ?? null;
      if (target && target === spent) return; // already played: quiet until it is left
      spent = null;
      if (target === current) return; // moving about inside the same button
      apply(hit);
    };

    const onClick = (event) => {
      if (isClosed()) return;
      if (!(event.target instanceof Element) || !event.target.closest("[data-cursor='copy']")) return;
      const hit = moodFor(event.target);
      if (!hit) return;
      // Copying plays the whole routine through, whatever the pointer does.
      locked = true;
      spent = null;
      apply(hit);
    };

    const onMouseMove = (event) => {
      pointer = { x: event.clientX, y: event.clientY };

      // Dizzy: count the cursor swinging from one side of the eyes to the other.
      if (visible && !dizzy && !isClosed() && Math.abs(pointer.y - centre.y) < FLIP_REACH_Y) {
        const dx = pointer.x - centre.x;
        const next = dx > FLIP_DEAD ? 1 : dx < -FLIP_DEAD ? -1 : 0;
        if (next !== 0 && next !== side) {
          const now = performance.now();
          if (side !== 0) {
            flips = flips.filter((time) => now - time < FLIP_WINDOW_MS);
            flips.push(now);
            if (flips.length >= FLIPS_NEEDED) {
              dizzy = { start: now, until: now + DIZZY_MS };
              for (const eye of eyes) eye.rollFrom = eye.y;
              flips = [];
            }
          }
          side = next;
        }
      }

      wake();
    };

    const onMouseLeave = () => {
      pointer = null; // eyes drift back to looking straight ahead
      side = 0;
      flips = [];
      if (!locked) {
        spent = null;
        apply(null);
      } else {
        wake();
      }
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
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);

      if (finePointer.matches) {
        window.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseleave", onMouseLeave);
        document.addEventListener("mouseover", onOver, { passive: true });
        document.addEventListener("click", onClick);
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
      if (visible) {
        measure();
        wake();
      }
    });
    visibilityObserver.observe(root);

    finePointer.addEventListener("change", syncInteractivity);

    // Closing or opening the eyes wakes the loop so the pupils settle (or
    // pick the cursor back up) without waiting for a mouse move.
    const closedObserver = new MutationObserver(wake);
    closedObserver.observe(root, { attributes: true, attributeFilter: ["data-closed"] });

    return () => {
      closedObserver.disconnect();
      cancelAnimationFrame(frame);
      frame = 0;
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
      finePointer.removeEventListener("change", syncInteractivity);
      for (const eye of eyes) eye.iris.style.removeProperty("translate");
      for (const name of ["pose", "pupils", "dizzy"]) setAttr(name, null);
    };
  }, [reduced]);

  return (
    <div className={classes.row}>
      <div className={classes.owl} ref={rootRef} aria-hidden="true" data-closed={closed ? "" : undefined}>
        {/* Stars and question marks that circle above the brows when dizzy. */}
        <span className={classes.sparks}>
          {["★", "?", "★", "?", "★", "?"].map((glyph, index) => (
            <i key={index}>
              <b>{glyph}</b>
            </i>
          ))}
        </span>
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

      <button
        type="button"
        className={classes.toggle}
        aria-pressed={closed}
        aria-label={closed ? "Open the eyes" : "Close the eyes"}
        title={closed ? "Open the eyes" : "Close the eyes"}
        onClick={toggleClosed}
      >
        {closed ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
      </button>
    </div>
  );
};

export default OwlEyes;
