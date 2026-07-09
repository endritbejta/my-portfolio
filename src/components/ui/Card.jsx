import classes from "./Card.module.css";

/** Surface container. `interactive` adds hover lift + border highlight. */
const Card = ({ as: Tag = "div", interactive = false, className = "", children, ...rest }) => (
  <Tag
    className={[classes.card, interactive ? classes.interactive : "", className]
      .filter(Boolean)
      .join(" ")}
    {...rest}
  >
    {children}
  </Tag>
);

export default Card;
