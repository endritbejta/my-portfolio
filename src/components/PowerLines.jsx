import classes from "./PowerLines.module.css";

const WIDTH = 300;
const HEIGHT = 180;

// Pylons receding towards the horizon: x, ground y and height in viewBox units.
const PYLONS = [
  { x: 246, base: 172, h: 118 },
  { x: 172, base: 150, h: 70 },
  { x: 124, base: 143, h: 44 },
  { x: 92, base: 140, h: 29 },
  { x: 70, base: 138, h: 19 },
].map((p) => {
  const top = p.base - p.h;
  return {
    ...p,
    leg: 0.16 * p.h,
    arm: 0.27 * p.h,
    top,
    lower: top + 0.22 * p.h,
    brace: top + 0.62 * p.h,
    stroke: Math.max(0.6, p.h / 70),
    opacity: 0.3 + 0.7 * (p.h / 118),
  };
});

// A wire hangs from an arm tip: [x, y] for the upper (0) or lower (1) arm.
const tip = (p, level, side) => [
  p.x + side * p.arm,
  level === 0 ? p.top : p.lower,
];

const sagging = ([x1, y1], [x2, y2]) => {
  const sag = Math.hypot(x2 - x1, y2 - y1) * 0.12;
  return `M${x1} ${y1} Q${(x1 + x2) / 2} ${(y1 + y2) / 2 + sag} ${x2} ${y2}`;
};

const buildWires = () => {
  const wires = [];
  for (let i = 0; i < PYLONS.length - 1; i += 1) {
    [0, 1].forEach((level) =>
      [-1, 1].forEach((side) =>
        wires.push(
          sagging(tip(PYLONS[i], level, side), tip(PYLONS[i + 1], level, side)),
        ),
      ),
    );
  }
  // Lines leaving the frame past the nearest pylon, and fading out beyond the last.
  const near = PYLONS[0];
  const far = PYLONS[PYLONS.length - 1];
  [0, 1].forEach((level) => {
    const [x, y] = tip(near, level, 1);
    wires.push(sagging([x, y], [WIDTH + 20, y - 10]));
    const [fx, fy] = tip(far, level, -1);
    wires.push(sagging([fx, fy], [-20, fy + 2]));
  });
  return wires;
};

const WIRES = buildWires();

const Pylon = ({ p }) => (
  <g strokeWidth={p.stroke} opacity={p.opacity}>
    <line x1={p.x - p.leg} y1={p.base} x2={p.x - p.leg} y2={p.top} />
    <line x1={p.x + p.leg} y1={p.base} x2={p.x + p.leg} y2={p.top} />
    <line x1={p.x - p.arm} y1={p.top} x2={p.x + p.arm} y2={p.top} />
    <line x1={p.x - p.arm} y1={p.lower} x2={p.x + p.arm} y2={p.lower} />
    <line x1={p.x - p.leg} y1={p.lower} x2={p.x + p.leg} y2={p.brace} />
    <line x1={p.x + p.leg} y1={p.lower} x2={p.x - p.leg} y2={p.brace} />
    <line x1={p.x - p.leg} y1={p.brace} x2={p.x + p.leg} y2={p.brace} />
  </g>
);

/**
 * Transmission pylons and sagging lines, drawn in currentColor so the parent
 * decides the tint. A faint dashed "current" runs along the wires.
 */
const PowerLines = ({ className = "" }) => (
  <svg
    className={[classes.lines, className].filter(Boolean).join(" ")}
    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
    preserveAspectRatio="xMaxYMax slice"
    aria-hidden="true"
  >
    <rect
      className={classes.ground}
      x="0"
      y="141"
      width={WIDTH}
      height={HEIGHT - 141}
    />
    <g className={classes.wires}>
      {WIRES.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>
    <g className={classes.current}>
      {WIRES.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>
    <g className={classes.pylons}>
      {PYLONS.map((p) => (
        <Pylon key={p.x} p={p} />
      ))}
    </g>
  </svg>
);

export default PowerLines;
