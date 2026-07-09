import classes from "./Badge.module.css";

/** Small label chip. `tone`: neutral | accent | success */
const Badge = ({ tone = "neutral", children, className = "", ...rest }) => (
  <span
    className={[classes.badge, classes[tone] ?? "", className]
      .filter(Boolean)
      .join(" ")}
    {...rest}
  >
    {children}
  </span>
);

export default Badge;
