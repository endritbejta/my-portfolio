import { useEffect, useRef } from "react";
import { useReducedMotion } from "../hooks/useMotionPreference";
import { onPointerLeave, onPointerMove } from "../utils/pointer";
import classes from "./DotField.module.css";

// Grid geometry. --dot-gap and --dot-size are read from the stylesheet (they
// are shared tokens); these two are drawing details that live only here.
const OVERSCAN = 80; // px — the grid starts this far outside the viewport's top-left
const MAX_DPR = 2; // a 4px dot gains nothing from a 3x backing store

const FALLBACK = {
  gap: 40,
  size: 4,
  dot: [255, 255, 255],
  accent: [244, 63, 94],
  scale: 1,
  rest: 0.16,
};

const readNumber = (style, name, fallback) => {
  const value = parseFloat(style.getPropertyValue(name));
  return Number.isFinite(value) ? value : fallback;
};

const readRgb = (style, name, fallback) => {
  const parts = style.getPropertyValue(name).split(",").map((part) => Number(part.trim()));
  return parts.length === 3 && parts.every(Number.isFinite) ? parts : fallback;
};

// Everything the dots need from the stylesheet. Read rather than duplicated:
// the CSS owns the colours and the resting opacity, and two copies of a
// number drift the moment one is tuned. Re-read when the theme flips.
const readTokens = () => {
  const style = getComputedStyle(document.documentElement);
  return {
    gap: readNumber(style, "--dot-gap", FALLBACK.gap),
    size: readNumber(style, "--dot-size", FALLBACK.size),
    dot: readRgb(style, "--dot-rgb", FALLBACK.dot),
    accent: readRgb(style, "--accent-rgb", FALLBACK.accent),
    scale: readNumber(style, "--dot-alpha-scale", FALLBACK.scale),
    rest: readNumber(style, "--dot-rest-opacity", FALLBACK.rest),
  };
};

// The part of the tokens that differs between themes, and so the part that
// cross-fades when the theme flips.
const pickPalette = ({ dot, accent, scale, rest }) => ({ dot, accent, scale, rest });
const mixPalette = (from, to, t) => ({
  dot: mixRgb(from.dot, to.dot, t),
  accent: mixRgb(from.accent, to.accent, t),
  scale: mix(from.scale, to.scale, t),
  rest: mix(from.rest, to.rest, t),
});

// Cursor influence. PULL_RADIUS is the biggest lever on the per-frame
// arithmetic, though that is cheap now: the dots are painted, not styled.
const PULL_RADIUS = 420;
const PULL_RADIUS_SQ = PULL_RADIUS * PULL_RADIUS;
const MAX_MOVE = 4; // px — hard cap on how far any one dot travels

const GLOW_RADIUS = 200; // px — tighter than the pull, so dots move before they brighten
const GLOW_RADIUS_SQ = GLOW_RADIUS * GLOW_RADIUS;
const MAX_OPACITY = 1;

// One cheap early-out covers both effects
const REACH_SQ = Math.max(PULL_RADIUS_SQ, GLOW_RADIUS_SQ);

// Easing, as time constants of an exponential approach so it feels the same
// at 60Hz and 144Hz. Movement trails the cursor a little longer than the
// brightening does, as it did when these were CSS transitions.
const MOVE_TAU = 120; // ms
const GLOW_TAU = 55; // ms
const THEME_FADE = 250; // ms — dots cross-fade to the new theme's colours
const MAX_FRAME_MS = 50; // a long pause (hidden tab) must not become one huge step

// Below these a dot counts as settled; it is snapped to its target and the
// frame loop is allowed to stop.
const SETTLE_PX = 0.02;
const SETTLE_GLOW = 0.004;

// Lit dots are grouped into this many brightness levels and painted one
// fill per level. A fill per dot would cost far more than the arithmetic.
const LEVELS = 32;

// Height changes smaller than this are treated as mobile browser chrome
// appearing/disappearing rather than a real viewport change. The canvas is
// also drawn this much taller than the viewport, so the dots still reach the
// bottom edge when the address bar slides away.
const MOBILE_CHROME_PX = 150;

const TAU = Math.PI * 2;

const mix = (from, to, t) => from + (to - from) * t;
const mixRgb = (from, to, t) => [
  mix(from[0], to[0], t),
  mix(from[1], to[1], t),
  mix(from[2], to[2], t),
];
const rgba = (rgb, alpha) =>
  `rgba(${Math.round(rgb[0])},${Math.round(rgb[1])},${Math.round(rgb[2])},${alpha.toFixed(3)})`;

/**
 * Decorative background: a grid of dots that drift toward the cursor and
 * brighten as it nears them. Fixed to the viewport and behind all content,
 * so it never moves with scroll and never needs re-measuring on scroll.
 *
 * Painted on a single canvas. This used to be a few hundred styled DOM nodes,
 * and rewriting their styles on every mouse move was most of a frame's budget
 * on an ordinary laptop; here a frame is one pass of arithmetic and a handful
 * of fills, and nothing at all runs while the cursor is still.
 *
 * Inert for touch/coarse pointers (there is no cursor to follow), which still
 * get the static grid. With reduced motion — the OS setting or the site's own
 * switch — the dots are not drawn at all: the layer keeps only the page
 * gradient it paints behind everything.
 */
const DotField = () => {
  const fieldRef = useRef(null);
  const canvasRef = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const field = fieldRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (reduced || !field || !ctx) return undefined;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    let tokens = readTokens();
    let fadeFrom = null; // previous theme's palette while cross-fading
    let fadeStart = 0;
    let palette = pickPalette(tokens); // what is painted this frame

    // Per-dot state in flat arrays: positions at rest, the current offset
    // from rest, and how lit it is (0..1).
    let count = 0;
    let xs = new Float32Array(0);
    let ys = new Float32Array(0);
    let offX = new Float32Array(0);
    let offY = new Float32Array(0);
    let lit = new Float32Array(0);
    const levels = Array.from({ length: LEVELS + 1 }, () => []);

    let mouseX = null;
    let mouseY = null;
    let frame = 0;
    let lastTime = 0;
    let resizeTimer;
    let built = false;
    let builtW = 0;
    let builtH = 0;

    const draw = () => {
      const radius = tokens.size / 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dots at rest are the vast majority: one path, one fill.
      const restAlpha = palette.rest * palette.scale;
      for (const list of levels) list.length = 0;

      ctx.fillStyle = rgba(palette.dot, restAlpha);
      ctx.beginPath();
      for (let i = 0; i < count; i += 1) {
        if (lit[i] === 0 && offX[i] === 0 && offY[i] === 0) {
          ctx.moveTo(xs[i] + radius, ys[i]);
          ctx.arc(xs[i], ys[i], radius, 0, TAU);
        } else {
          levels[Math.round(lit[i] * LEVELS)].push(i);
        }
      }
      ctx.fill();

      for (let level = 0; level <= LEVELS; level += 1) {
        const list = levels[level];
        if (list.length === 0) continue;

        const t = level / LEVELS;
        const opacity = mix(palette.rest, MAX_OPACITY, t) * palette.scale;
        ctx.fillStyle = rgba(mixRgb(palette.dot, palette.accent, t), opacity);
        ctx.beginPath();
        for (const i of list) {
          const x = xs[i] + offX[i];
          const y = ys[i] + offY[i];
          ctx.moveTo(x + radius, y);
          ctx.arc(x, y, radius, 0, TAU);
        }
        ctx.fill();
      }
    };

    // Advances every dot toward where the cursor wants it and reports whether
    // anything is still moving. Cheap enough to run over the whole grid: it is
    // the style writes that cost, not the distance maths.
    const step = (now, dt) => {
      const moveAlpha = 1 - Math.exp(-dt / MOVE_TAU);
      const glowAlpha = 1 - Math.exp(-dt / GLOW_TAU);
      let busy = false;

      for (let i = 0; i < count; i += 1) {
        let targetX = 0;
        let targetY = 0;
        let targetLit = 0;

        if (mouseX !== null) {
          const dx = mouseX - xs[i];
          const dy = mouseY - ys[i];
          const distSq = dx * dx + dy * dy;

          // One squared-distance check gates both effects, so every dot
          // outside either radius skips the sqrt.
          if (distSq < REACH_SQ) {
            const dist = Math.sqrt(distSq);

            if (distSq < PULL_RADIUS_SQ) {
              const strength = 1 - dist / PULL_RADIUS;
              const pull = strength * strength * MAX_MOVE; // eased falloff, capped at MAX_MOVE
              const inv = dist > 0.01 ? pull / dist : 0;
              targetX = dx * inv;
              targetY = dy * inv;
            }

            // One proximity value feeds both effects: brightness and how far
            // the colour has shifted toward the accent.
            if (distSq < GLOW_RADIUS_SQ) targetLit = 1 - dist / GLOW_RADIUS;
          }
        }

        // Skip the settled majority outright.
        if (targetX === 0 && targetY === 0 && targetLit === 0 &&
            offX[i] === 0 && offY[i] === 0 && lit[i] === 0) continue;

        offX[i] += (targetX - offX[i]) * moveAlpha;
        offY[i] += (targetY - offY[i]) * moveAlpha;
        lit[i] += (targetLit - lit[i]) * glowAlpha;

        const settledMove =
          Math.abs(targetX - offX[i]) < SETTLE_PX && Math.abs(targetY - offY[i]) < SETTLE_PX;
        const settledLit = Math.abs(targetLit - lit[i]) < SETTLE_GLOW;

        if (settledMove) {
          offX[i] = targetX;
          offY[i] = targetY;
        }
        if (settledLit) lit[i] = targetLit;
        if (!settledMove || !settledLit) busy = true;
      }

      if (fadeFrom) {
        const t = Math.min((now - fadeStart) / THEME_FADE, 1);
        palette = mixPalette(fadeFrom, pickPalette(tokens), t);
        if (t < 1) busy = true;
        else fadeFrom = null;
      }

      return busy;
    };

    const tick = (now) => {
      const dt = Math.min(Math.max(now - lastTime, 0), MAX_FRAME_MS);
      lastTime = now;

      const busy = step(now, dt);
      draw();

      // Idles out once everything has settled; a mouse move restarts it.
      frame = busy ? requestAnimationFrame(tick) : 0;
    };

    const wake = () => {
      if (frame) return;
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    };

    // Sizes the canvas and lays the grid out. The dots are plain arithmetic
    // on the grid pitch, so unlike measuring DOM nodes this forces no layout.
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
      tokens = readTokens();
      palette = pickPalette(tokens);
      fadeFrom = null;

      const canvasH = height + MOBILE_CHROME_PX;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.ceil(width * dpr);
      canvas.height = Math.ceil(canvasH * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${canvasH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // The grid starts OVERSCAN outside the top-left corner, so the dots sit
      // where the old DOM grid put them. Only those inside the canvas are kept.
      const pitch = tokens.gap + tokens.size;
      const half = tokens.size / 2;
      const cols = Math.ceil((width + OVERSCAN) / pitch) + 1;
      const rows = Math.ceil((canvasH + OVERSCAN) / pitch) + 1;

      xs = new Float32Array(cols * rows);
      ys = new Float32Array(cols * rows);
      count = 0;
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          const x = -OVERSCAN + c * pitch + half;
          const y = -OVERSCAN + r * pitch + half;
          if (x < -half || y < -half || x > width + half || y > canvasH + half) continue;
          xs[count] = x;
          ys[count] = y;
          count += 1;
        }
      }
      offX = new Float32Array(count);
      offY = new Float32Array(count);
      lit = new Float32Array(count);

      draw();
      if (mouseX !== null) wake();
    };

    const onMouseMove = (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      wake();
    };

    const onMouseLeave = () => {
      mouseX = null;
      mouseY = null;
      wake();
    };

    const onFieldResize = () => {
      const { width, height } = field.getBoundingClientRect();

      // Rebuild on any width change, but only on a large height change:
      // on mobile the address bar showing and hiding resizes the viewport
      // vertically on almost every scroll, and re-laying the grid each time
      // would be pure waste.
      const settled =
        built && Math.abs(width - builtW) < 1 && Math.abs(height - builtH) < MOBILE_CHROME_PX;
      if (settled) return;

      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 150);
    };

    // Re-evaluated whenever the pointer query flips (the window moved to a
    // touch screen), not just on mount.
    let unsubscribe = () => {};
    const joinPointer = () => {
      const offMove = onPointerMove(onMouseMove);
      const offLeave = onPointerLeave(onMouseLeave);
      return () => {
        offMove();
        offLeave();
      };
    };

    const syncInteractivity = () => {
      unsubscribe();

      if (finePointer.matches) {
        unsubscribe = joinPointer();
      } else {
        onMouseLeave(); // drop every dot back to rest
      }
    };

    // The theme lives on <html data-theme>. The dots' colours come from it, so
    // read them again and fade across instead of snapping.
    const onThemeChange = () => {
      if (!built) return;
      fadeFrom = palette;
      fadeStart = performance.now();
      tokens = readTokens();
      wake();
    };

    build();
    syncInteractivity();

    // Fires once immediately, which is what recovers the case where the
    // layer had no size at mount.
    const resizeObserver = new ResizeObserver(onFieldResize);
    resizeObserver.observe(field);

    const themeObserver = new MutationObserver(onThemeChange);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    finePointer.addEventListener("change", syncInteractivity);

    return () => {
      cancelAnimationFrame(frame);
      frame = 0;
      clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      unsubscribe();
      finePointer.removeEventListener("change", syncInteractivity);
    };
  }, [reduced]);

  return (
    <div className={classes.field} ref={fieldRef} aria-hidden="true">
      {!reduced && <canvas className={classes.canvas} ref={canvasRef} />}
    </div>
  );
};

export default DotField;
