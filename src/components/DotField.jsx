import { useEffect, useRef } from "react";
import classes from "./DotField.module.css";

/* Grid geometry. Kept in sync with --dot-gap / --dot-size in global.css:
   the CSS sizes the dots, these numbers place the interaction math. */
const GAP = 40;
const SIZE = 4;
const OVERSCAN = 80; // px past each viewport edge — matches .grid's inset

// Read from --dot-rest-opacity rather than duplicated here: the CSS sets the
// dots' resting value from the same token, and two copies of the number would
// drift the moment one is tuned.
const FALLBACK_REST_OPACITY = 0.16;
const readRestOpacity = () => {
  const value = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--dot-rest-opacity")
  );
  return Number.isFinite(value) ? value : FALLBACK_REST_OPACITY;
};

// Cursor influence. PULL_RADIUS is the single biggest lever on frame cost:
// at this size the circle covers most of the grid, so most dots do work on
// every frame. Shrink it first if the effect ever feels heavy.
const PULL_RADIUS = 420;
const PULL_RADIUS_SQ = PULL_RADIUS * PULL_RADIUS;
const MAX_MOVE = 4; // px — hard cap on how far any one dot travels

const GLOW_RADIUS = 200; // px — tighter than the pull, so dots move before they brighten
const GLOW_RADIUS_SQ = GLOW_RADIUS * GLOW_RADIUS;
const MAX_OPACITY = 1;

// One cheap early-out covers both effects
const REACH_SQ = Math.max(PULL_RADIUS_SQ, GLOW_RADIUS_SQ);

// Guard for very large displays — without it a 5K monitor would build (and
// write inline styles to) tens of thousands of nodes.
const MAX_DOTS = 4000;

// Height changes smaller than this are treated as mobile browser chrome
// appearing/disappearing rather than a real viewport change.
const MOBILE_CHROME_PX = 150;

/**
 * Decorative background: a grid of dots that drift toward the cursor and
 * brighten as it nears them. Fixed to the viewport and behind all content,
 * so it never moves with scroll and never needs re-measuring on scroll.
 *
 * Inert for touch/coarse pointers (there is no cursor to follow) and for
 * `prefers-reduced-motion`, both of which still get the static grid.
 */
const DotField = () => {
  const fieldRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    const field = fieldRef.current;
    const grid = gridRef.current;
    if (!field || !grid) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    let dots = [];
    let restOpacity = readRestOpacity();
    let mouseX = null;
    let mouseY = null;
    let ticking = false;
    let resizeTimer;
    let built = false;
    let builtW = 0;
    let builtH = 0;

    const settle = (dot) => {
      if (dot.moved) {
        dot.el.style.removeProperty("transform");
        dot.moved = false;
      }
      if (dot.lit) {
        dot.el.style.removeProperty("--opacity");
        dot.lit = false;
      }
    };

    const update = () => {
      ticking = false;

      for (const dot of dots) {
        if (mouseX === null) {
          settle(dot);
          continue;
        }

        const dx = mouseX - dot.x;
        const dy = mouseY - dot.y;
        const distSq = dx * dx + dy * dy;

        // One squared-distance check gates both effects, so every dot
        // outside either radius skips all sqrt and style work.
        if (distSq >= REACH_SQ) {
          settle(dot);
          continue;
        }

        const dist = Math.sqrt(distSq);

        if (distSq < PULL_RADIUS_SQ) {
          const strength = 1 - dist / PULL_RADIUS;
          const pull = strength * strength * MAX_MOVE; // eased falloff, capped at MAX_MOVE
          const inv = dist > 0.01 ? pull / dist : 0;
          dot.el.style.transform = `translate(${(dx * inv).toFixed(1)}px, ${(
            dy * inv
          ).toFixed(1)}px)`;
          dot.moved = true;
        } else if (dot.moved) {
          dot.el.style.removeProperty("transform");
          dot.moved = false;
        }

        if (distSq < GLOW_RADIUS_SQ) {
          const t = 1 - dist / GLOW_RADIUS;
          const opacity = restOpacity + (MAX_OPACITY - restOpacity) * t;
          dot.el.style.setProperty("--opacity", opacity.toFixed(2));
          dot.lit = true;
        } else if (dot.lit) {
          dot.el.style.removeProperty("--opacity");
          dot.lit = false;
        }
      }
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    // Read every dot's center in one pass. Batched on purpose: no style
    // writes in between, so this costs a single layout rather than one per
    // dot. Positions stay valid until the next resize because the field is
    // fixed to the viewport.
    const cachePositions = () => {
      for (const dot of dots) {
        const rect = dot.el.getBoundingClientRect();
        dot.x = rect.left + rect.width / 2;
        dot.y = rect.top + rect.height / 2;
      }
    };

    // Built with DOM APIs rather than JSX deliberately: these are a few
    // thousand purely decorative nodes that never re-render from state, so
    // putting them through React's reconciler would cost a lot for nothing.
    const build = () => {
      // Measured from the field itself rather than window.innerWidth, so the
      // grid is sized by the same number the observer below watches. A zero
      // measurement means the layer has no layout yet — building against it
      // would leave a grid a few dots wide, so bail and wait to be called
      // again when there is a real size.
      const { width, height } = field.getBoundingClientRect();
      if (width < 1 || height < 1) return;

      built = true;
      builtW = width;
      builtH = height;

      grid.textContent = "";
      dots = [];
      restOpacity = readRestOpacity();

      const areaW = width + OVERSCAN * 2;
      const areaH = height + OVERSCAN * 2;
      const cols = Math.ceil(areaW / (SIZE + GAP)) + 2;
      const rows = Math.ceil(areaH / (SIZE + GAP)) + 2;

      const rowEls = [];
      for (let r = 0; r < rows && dots.length < MAX_DOTS; r += 1) {
        const rowEl = document.createElement("div");
        rowEl.className = classes.row;

        const rowDots = [];
        for (let c = 0; c < cols && dots.length + rowDots.length < MAX_DOTS; c += 1) {
          const el = document.createElement("span");
          el.className = classes.dot;
          rowDots.push(el);
        }

        rowEl.append(...rowDots);
        rowEls.push(rowEl);
        dots.push(...rowDots.map((el) => ({ el, x: 0, y: 0, moved: false, lit: false })));
      }

      grid.append(...rowEls);
      cachePositions();
    };

    const onMouseMove = (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      requestUpdate();
    };

    const onMouseLeave = () => {
      mouseX = null;
      mouseY = null;
      requestUpdate();
    };

    const onFieldResize = () => {
      const { width, height } = field.getBoundingClientRect();

      // Rebuild on any width change, but only on a large height change:
      // on mobile the address bar showing and hiding resizes the viewport
      // vertically on almost every scroll, and rebuilding several hundred
      // nodes each time would be pure waste.
      const settled =
        built && Math.abs(width - builtW) < 1 && Math.abs(height - builtH) < MOBILE_CHROME_PX;
      if (settled) return;

      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 150);
    };

    // Re-evaluated whenever either query flips (OS motion setting changed,
    // or the window moved to a touch screen), not just on mount.
    const syncInteractivity = () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);

      if (finePointer.matches && !reduceMotion.matches) {
        window.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseleave", onMouseLeave);
      } else {
        onMouseLeave(); // drop every dot back to rest
      }
    };

    build();
    syncInteractivity();

    // Fires once immediately, which is what recovers the case where the
    // layer had no size at mount.
    const observer = new ResizeObserver(onFieldResize);
    observer.observe(field);

    reduceMotion.addEventListener("change", syncInteractivity);
    finePointer.addEventListener("change", syncInteractivity);

    return () => {
      clearTimeout(resizeTimer);
      observer.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      reduceMotion.removeEventListener("change", syncInteractivity);
      finePointer.removeEventListener("change", syncInteractivity);
      grid.textContent = "";
    };
  }, []);

  return (
    <div className={classes.field} ref={fieldRef} aria-hidden="true">
      <div className={classes.grid} ref={gridRef} />
    </div>
  );
};

export default DotField;
