import { useEffect, useRef, useState } from "react";
import classes from "./ScrambleText.module.css";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";

const TICK_MS = 30;
// Characters revealed per tick — 1/3 means each letter churns for ~3 ticks
// before it locks, which is what makes it read as a decode rather than a fade.
const REVEAL_PER_TICK = 1 / 3;

const randomLike = (char) => {
  // Case-preserving: swapping a lowercase letter for a capital changes the
  // glyph's width and weight, so an all-caps scramble makes a mixed-case word
  // jump around and read as a different word. Matching the case keeps the
  // silhouette steady.
  const pool = char === char.toUpperCase() ? UPPER : LOWER;
  return pool[Math.floor(Math.random() * pool.length)];
};

/**
 * Scrambles its text on hover, then decodes it back left to right.
 *
 * Text is held in state rather than written to the DOM node, so a re-render
 * can never fight the animation or leave it stuck mid-scramble.
 */
const ScrambleText = ({ children, className = "" }) => {
  const text = String(children);
  const [display, setDisplay] = useState(text);
  const spanRef = useRef(null);
  const timer = useRef(null);

  // An interval outliving the component would keep calling setState on it.
  useEffect(() => () => clearInterval(timer.current), []);

  const stop = () => {
    clearInterval(timer.current);
    timer.current = null;
    setDisplay(text); // always land on the real text, never a random frame
    spanRef.current?.style.removeProperty("min-width");
  };

  const scramble = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = spanRef.current;
    // Pin the resting width before the first scrambled frame, so whatever
    // follows this word doesn't shuffle sideways while it runs. Measured only
    // when idle — mid-scramble the width is already wrong.
    if (el && !timer.current) {
      el.style.minWidth = `${el.offsetWidth}px`;
    }

    clearInterval(timer.current);
    let revealed = 0;

    timer.current = setInterval(() => {
      if (revealed >= text.length) {
        stop();
        return;
      }

      setDisplay(
        text
          .split("")
          .map((char, index) => {
            if (index < revealed) return char;
            // Spaces and punctuation stay put; only letters churn.
            return /[a-z]/i.test(char) ? randomLike(char) : char;
          })
          .join("")
      );

      revealed += REVEAL_PER_TICK;
    }, TICK_MS);
  };

  return (
    <span
      ref={spanRef}
      className={[classes.scramble, className].filter(Boolean).join(" ")}
      onMouseEnter={scramble}
      /* Keyboard and touch users get the same effect on focus/tap rather than
         nothing at all. */
      onFocus={scramble}
      tabIndex={0}
    >
      {display}
    </span>
  );
};

export default ScrambleText;
