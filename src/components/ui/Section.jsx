import Reveal from "./Reveal";
import classes from "./Section.module.css";

/**
 * Page section with a consistent header. `id` is the anchor target used
 * by the navbar, scroll-spy and command palette.
 */
const Section = ({ id, eyebrow, title, description, children }) => (
  <section id={id} className={classes.section} aria-labelledby={`${id}-title`}>
    <div className="container">
      <Reveal>
        <header className={`scrim ${classes.header}`}>
          {eyebrow && <p className={classes.eyebrow}>{eyebrow}</p>}
          <h2 id={`${id}-title`} className={classes.title}>
            {title}
          </h2>
          {description && <p className={classes.description}>{description}</p>}
        </header>
      </Reveal>
      {children}
    </div>
  </section>
);

export default Section;
