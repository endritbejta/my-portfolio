import classes from "./Card.module.css";

/**
 * Surface container. `interactive` adds hover lift + border highlight, and
 * tags the card for CursorTrailer: a card is not itself a link, so the
 * trailing cursor can't infer that it's worth swelling over.
 */
const Card = ({ as: Tag = "div", interactive = false, className = "", children, ...rest }) => (
  <Tag
    className={[classes.card, interactive ? classes.interactive : "", className]
      .filter(Boolean)
      .join(" ")}
    data-cursor={interactive ? "internal" : undefined}
    {...rest}
  >
    {children}
  </Tag>
);

export default Card;
