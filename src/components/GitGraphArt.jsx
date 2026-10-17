import classes from "./GitGraphArt.module.css";

const WIDTH = 300;
const HEIGHT = 240;
const ROWS = 5;
const ROW_H = 30;
const MAIN_X = 24;
const CORNER = 8;

// Branch colours, top to bottom, cycling like an editor's git graph.
const COLORS = ["teal", "purple", "yellow", "pink", "brown"];

// Long-lived lanes that run the full height behind the merges.
const THROUGH = [
  { x: 34, color: "brown" },
  { x: 54, color: "pink" },
  { x: 74, color: "yellow" },
  { x: 94, color: "teal" },
];

const rows = Array.from({ length: ROWS }, (_, k) => {
  const mergeY = 20 + k * ROW_H; // the merge commit on the main lane
  const lane = 44 + k * 10; // where this branch peels away from the bundle
  const dotX = 120 + k * 28; // its tip, stepping right row by row
  const dotY = mergeY + ROW_H / 2;
  return {
    mergeY,
    lane,
    dotX,
    dotY,
    color: COLORS[k],
    // Down the lane, round the corner, along the merge row, round the next
    // corner and down into the tip.
    path:
      `M${lane} 0 V${mergeY - CORNER} Q${lane} ${mergeY} ${lane + CORNER} ${mergeY}` +
      ` H${dotX - CORNER} Q${dotX} ${mergeY} ${dotX} ${mergeY + CORNER} V${dotY}`,
    // Short link from the merge commit across to the lane.
    link: `M${MAIN_X + 7} ${mergeY} H${lane}`,
  };
});

/**
 * Decorative commit graph in the style of an editor's git history: an orange
 * main line of merge commits down the right edge, with coloured branches
 * stepping away to the left. Drawn left-to-right in a mirrored group. The
 * fade-out at the bottom is in the stylesheet.
 */
const GitGraphArt = ({ className = "" }) => (
  <svg
    className={[classes.graph, className].filter(Boolean).join(" ")}
    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
    preserveAspectRatio="xMaxYMin slice"
    aria-hidden="true"
  >
    <g transform={`translate(${WIDTH} 0) scale(-1 1)`}>
      <path className={classes.orange} d={`M${MAIN_X} 0 V${HEIGHT}`} />

      {THROUGH.map(({ x, color }) => (
        <path key={x} className={classes[color]} d={`M${x} 0 V${HEIGHT}`} />
      ))}

      {rows.map(({ mergeY, path, link, color }) => (
        <g key={mergeY} className={classes[color]}>
          <path d={path} />
          <path d={link} />
        </g>
      ))}

      {rows.map(({ dotX, dotY, color }) => (
        <circle
          key={dotX}
          className={`${classes.tip} ${classes[color]}`}
          cx={dotX}
          cy={dotY}
          r="5"
        />
      ))}

      {rows.map(({ mergeY }) => (
        <g key={mergeY} className={classes.merge}>
          <circle cx={MAIN_X} cy={mergeY} r="7" />
          <circle className={classes.core} cx={MAIN_X} cy={mergeY} r="2.4" />
        </g>
      ))}
    </g>
  </svg>
);

export default GitGraphArt;
