import classes from "./StorefrontArt.module.css";

const WIDTH = 300;
const HEIGHT = 240;

// Awning: seven stripes across x 150-290, scalloped along the bottom edge.
const AWNING = { x: 150, y: 22, stripe: 20, count: 7, bar: 22 };
const STRIPES = Array.from({ length: AWNING.count }, (_, i) => AWNING.x + i * AWNING.stripe);
const SCALLOPS = STRIPES.map(
  (x) => `M${x} ${AWNING.y + AWNING.bar} a10 10 0 0 0 ${AWNING.stripe} 0`,
).join(" ");

// Platforms behind the shop, each wired to the shopfront wall.
const NODES = [
  { x: 96, y: 78 },
  { x: 78, y: 136 },
  { x: 108, y: 188 },
];
const WALL = { x: 156, ys: [96, 130, 164] };

const links = NODES.map(
  (n, i) => `M${n.x} ${n.y} C${n.x + 30} ${n.y} ${WALL.x - 30} ${WALL.ys[i]} ${WALL.x} ${WALL.ys[i]}`,
);

/**
 * Line-art shopfront with platform nodes wired to it, drawn in currentColor.
 * Echoes the About copy: storefronts and the architecture behind them.
 */
const StorefrontArt = ({ className = "" }) => (
  <svg
    className={[classes.art, className].filter(Boolean).join(" ")}
    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
    preserveAspectRatio="xMaxYMax slice"
    aria-hidden="true"
  >
    <g className={classes.links}>
      {links.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>
    <g className={classes.current}>
      {links.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>

    <g className={classes.nodes}>
      {NODES.map((n) => (
        <rect key={n.y} x={n.x - 6} y={n.y - 6} width="12" height="12" rx="3" />
      ))}
    </g>

    <g className={classes.shop}>
      <rect x="156" y="44" width="128" height="166" />
      <rect x="166" y="82" width="62" height="88" />
      <line x1="166" y1="126" x2="228" y2="126" />
      <rect x="174" y="96" width="14" height="30" />
      <circle cx="206" cy="115" r="9" />
      <rect x="176" y="140" width="22" height="30" />
      <rect x="208" y="148" width="14" height="22" />
      <rect x="240" y="104" width="34" height="106" />
      <circle cx="268" cy="158" r="2" />
      <line x1="120" y1="210" x2="300" y2="210" />
    </g>

    <g className={classes.awning}>
      {STRIPES.map((x, i) => (
        <rect
          key={x}
          className={i % 2 ? classes.stripe : undefined}
          x={x}
          y={AWNING.y}
          width={AWNING.stripe}
          height={AWNING.bar}
        />
      ))}
      <path d={SCALLOPS} />
    </g>
  </svg>
);

export default StorefrontArt;
