import classes from "./GitGraphArt.module.css";

const WIDTH = 300;
const HEIGHT = 320;
const LANES = 11;
const LANE_GAP = WIDTH / (LANES + 1);
const ROW = 12;
const GROUPS = 3;

// Small seeded PRNG so the graph is the same on every render and every build.
const mulberry32 = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const laneX = (lane) => Math.round((lane + 1) * LANE_GAP * 10) / 10;

/**
 * Builds a `git log --graph` style history: lanes run down the page, branches
 * peel off and merge back, commits sit on whichever lanes are alive.
 */
const buildGraph = () => {
  const rand = mulberry32(2022);
  const active = new Set([5]);
  const straights = Array.from({ length: GROUPS }, () => "");
  let curves = "";
  const commits = [];

  for (let y = 0; y < HEIGHT; y += ROW) {
    const next = y + ROW;
    const lanes = [...active];

    // Branch: a live lane forks into a free neighbour.
    if (rand() < 0.7 && active.size < LANES - 2) {
      const from = lanes[Math.floor(rand() * lanes.length)];
      const free = [from - 2, from - 1, from + 1, from + 2].filter(
        (l) => l >= 0 && l < LANES && !active.has(l),
      );
      if (free.length) {
        const to = free[Math.floor(rand() * free.length)];
        curves += `M${laneX(from)} ${y} C${laneX(from)} ${y + 8} ${laneX(to)} ${y + 4} ${laneX(to)} ${next} `;
        active.add(to);
      }
    }

    // Merge: a live lane folds back into the nearest other lane.
    if (rand() < 0.45 && active.size > 3) {
      const live = [...active];
      const from = live[Math.floor(rand() * live.length)];
      const others = live.filter((l) => l !== from);
      const to = others.reduce((a, b) =>
        Math.abs(b - from) < Math.abs(a - from) ? b : a,
      );
      curves += `M${laneX(from)} ${y} C${laneX(from)} ${y + 8} ${laneX(to)} ${y + 4} ${laneX(to)} ${next} `;
      active.delete(from);
      lanes.splice(lanes.indexOf(from), 1);
      lanes.push(to);
    }

    // Lanes that were alive at the top of this row carry straight through.
    [...active].forEach((lane) => {
      straights[lane % GROUPS] += `M${laneX(lane)} ${y} V${next} `;
    });

    // One or two commits on live lanes.
    const picks = rand() < 0.5 ? 2 : 1;
    for (let i = 0; i < picks; i += 1) {
      const live = [...active];
      commits.push({
        x: laneX(live[Math.floor(rand() * live.length)]),
        y: y + ROW / 2,
        merge: rand() < 0.2,
      });
    }

    // Keep the graph from dying out or filling every lane.
    if (active.size === 0) active.add(5);
  }

  return { straights, curves, commits };
};

const GRAPH = buildGraph();

/**
 * Decorative commit graph, drawn in currentColor. A faint dashed pulse rides
 * the lines so the history looks alive.
 */
const GitGraphArt = ({ className = "" }) => (
  <svg
    className={[classes.graph, className].filter(Boolean).join(" ")}
    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <g className={classes.lines}>
      {GRAPH.straights.map((d, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <path key={i} d={d} className={classes[`lane${i}`]} />
      ))}
      <path d={GRAPH.curves} />
    </g>
    <g className={classes.pulse}>
      {GRAPH.straights.map((d, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <path key={i} d={d} />
      ))}
      <path d={GRAPH.curves} />
    </g>
    <g className={classes.commits}>
      {GRAPH.commits.map((c) => (
        <circle
          key={`${c.x}-${c.y}`}
          cx={c.x}
          cy={c.y}
          r={c.merge ? 3.4 : 2.4}
          className={c.merge ? classes.merge : undefined}
        />
      ))}
    </g>
  </svg>
);

export default GitGraphArt;
