import classes from "./DataFlowArt.module.css";

// A request goes out from the shop through the API to the database,
// and the rows come back the other way. Coordinates are viewBox units.
const RESPONSE = ["M72 50 H126", "M174 50 H206"];
const REQUEST = ["M206 66 H174", "M126 66 H72"];

/**
 * Line-art "database -> API -> storefront" diagram drawn in currentColor, with
 * dashes travelling along the wires like packets.
 */
const DataFlowArt = ({ className = "" }) => (
  <svg
    className={[classes.art, className].filter(Boolean).join(" ")}
    viewBox="14 20 284 240"
    preserveAspectRatio="xMidYMin meet"
    aria-hidden="true"
  >
    <g className={classes.wires}>
      {[...RESPONSE, ...REQUEST].map((d) => (
        <path key={d} d={d} />
      ))}
      <path d="M120 46 L126 50 L120 54" />
      <path d="M200 46 L206 50 L200 54" />
      <path d="M78 62 L72 66 L78 70" />
      <path d="M180 62 L174 66 L180 70" />
    </g>
    <g className={`${classes.packets} ${classes.forward}`}>
      {RESPONSE.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>
    <g className={`${classes.packets} ${classes.backward}`}>
      {REQUEST.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>

    <g className={classes.db}>
      <rect className={classes.body} x="26" y="34" width="44" height="44" stroke="none" />
      <ellipse cx="48" cy="34" rx="22" ry="7" />
      <path d="M26 34 V78 M70 34 V78" />
      <path d="M26 50 a22 7 0 0 0 44 0" />
      <path d="M26 64 a22 7 0 0 0 44 0" />
      <path d="M26 78 a22 7 0 0 0 44 0" />
    </g>

    <g className={classes.api}>
      <rect x="126" y="34" width="48" height="44" rx="9" />
      <text x="150" y="62" textAnchor="middle">
        {"{ }"}
      </text>
    </g>

    <g className={classes.client}>
      <rect x="206" y="28" width="78" height="56" rx="6" />
      <path d="M206 40 H284" />
      <circle cx="215" cy="34" r="1.6" />
      <circle cx="222" cy="34" r="1.6" />
      <circle cx="229" cy="34" r="1.6" />
      <rect x="214" y="48" width="26" height="28" rx="3" />
      <path d="M248 52 H276 M248 60 H270 M248 68 H274" />
    </g>
  </svg>
);

export default DataFlowArt;
