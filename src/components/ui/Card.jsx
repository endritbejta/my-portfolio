import classes from "./Card.module.css";

/**
 * Surface container. `interactive` adds the hover fill/border highlight.
 *
 * Deliberately not tagged for CursorTrailer: a card is not a link, and most
 * of these have no single destination — the actions live on the buttons
 * inside them. Promising a navigation on the card itself was a false
 * affordance.
 */
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
