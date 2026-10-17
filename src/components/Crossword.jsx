import { useEffect, useMemo, useRef, useState } from "react";
import classes from "./Crossword.module.css";

const COLS = 9;
const ROWS = 8;
const PALETTE_SIZE = 6; // the six Rubik's cube sticker colours
// A lit cube lingers this long after the pointer leaves, which draws the trail.
const TRAIL_MIN_MS = 1000;
const TRAIL_SPREAD_MS = 500;

// [word, col, row, dx, dy] — SYSTEMS runs across, the rest cross it.
const WORDS = [
  ["SYSTEMS", 1, 3, 1, 0],
  ["KEDS", 1, 0, 0, 1],
  ["POWER", 5, 0, 0, 1],
  ["STORE", 3, 3, 0, 1],
  ["SHIP", 7, 3, 0, 1],
];

// Rows 5-7 of the first three columns are free of words: the portrait sits there.
const PORTRAIT = { col: 0, row: 5, size: 3 };

const inPortrait = (c, r) =>
  c >= PORTRAIT.col &&
  c < PORTRAIT.col + PORTRAIT.size &&
  r >= PORTRAIT.row &&
  r < PORTRAIT.row + PORTRAIT.size;

const randomColor = (except) => {
  let next;
  do {
    next = Math.floor(Math.random() * PALETTE_SIZE);
  } while (next === except);
  return next;
};

const trailDelay = () => TRAIL_MIN_MS + Math.random() * TRAIL_SPREAD_MS;

// letters[key] = { letter, words: [indexes of the words crossing here] }
const buildLetters = () => {
  const letters = {};
  WORDS.forEach(([word, col, row, dx, dy], wordIndex) => {
    [...word].forEach((letter, i) => {
      const key = `${col + dx * i},${row + dy * i}`;
      letters[key] ??= { letter, words: [] };
      letters[key].words.push(wordIndex);
    });
  });
  return letters;
};

const LETTERS = buildLetters();

/**
 * Decorative crossword for the About section. Hovering (or tapping) a letter
 * lights just that tile in a random Rubik's cube colour; the filler cells are grey
 * cubes that take a random colour under the pointer and drift back to grey a
 * second or so after it leaves, so moving across them paints a fading trail.
 * The colours live in the --cube-* tokens in the stylesheet.
 */
const Crossword = ({ portrait, portraitAlt }) => {
  const [cubes, setCubes] = useState(() =>
    Array.from({ length: COLS * ROWS }, () => null),
  );
  const [active, setActive] = useState(null);
  const timers = useRef({});

  useEffect(() => {
    const pending = timers.current;
    return () => Object.values(pending).forEach(clearTimeout);
  }, []);

  const setCube = (index, color) =>
    setCubes((prev) => prev.map((c, i) => (i === index ? color : c)));

  const paintCube = (index) => {
    clearTimeout(timers.current[index]);
    setCubes((prev) =>
      prev.map((c, i) => (i === index ? randomColor(c ?? undefined) : c)),
    );
  };

  const releaseCube = (index) => {
    clearTimeout(timers.current[index]);
    timers.current[index] = setTimeout(() => setCube(index, null), trailDelay());
  };

  const light = (key) =>
    setActive((prev) => ({ key, color: randomColor(prev?.color) }));

  const cells = useMemo(
    () =>
      Array.from({ length: COLS * ROWS }, (_, index) => {
        const c = index % COLS;
        const r = Math.floor(index / COLS);
        return { index, key: `${c},${r}`, c, r };
      }),
    [],
  );

  return (
    <div className={classes.wrap}>
      <div className={classes.grid}>
        {cells.map(({ index, key, c, r }) => {
          if (inPortrait(c, r)) return null;

          const letter = LETTERS[key];
          if (letter) {
            const isLit = active?.key === key;
            return (
              <div
                key={key}
                aria-hidden="true"
                className={`${classes.cell} ${classes.letter}`}
                data-c={isLit ? active.color : undefined}
                onPointerEnter={(e) =>
                  e.pointerType === "mouse" && light(key)
                }
                onPointerLeave={(e) =>
                  e.pointerType === "mouse" && setActive(null)
                }
                onClick={() => light(key)}
              >
                {letter.letter}
              </div>
            );
          }

          return (
            <div
              key={key}
              aria-hidden="true"
              className={`${classes.cell} ${classes.cube}`}
              data-c={cubes[index]}
              onPointerEnter={(e) =>
                e.pointerType === "mouse" && paintCube(index)
              }
              onPointerLeave={(e) =>
                e.pointerType === "mouse" && releaseCube(index)
              }
              onClick={() => {
                paintCube(index);
                releaseCube(index);
              }}
            />
          );
        })}

        <div
          className={classes.portrait}
          style={{
            gridColumn: `${PORTRAIT.col + 1} / span ${PORTRAIT.size}`,
            gridRow: `${PORTRAIT.row + 1} / span ${PORTRAIT.size}`,
          }}
        >
          <img
            src={portrait}
            alt={portraitAlt}
            width="320"
            height="320"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
};

export default Crossword;
