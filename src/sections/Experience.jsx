import Reveal from "../components/ui/Reveal";
import Section from "../components/ui/Section";
import { timeline } from "../data/experience";
import classes from "./Experience.module.css";

const Experience = () => (
  <Section
    id="experience"
    eyebrow="Career"
    title="Experience"
    description="Where I've worked and what I shipped — from engineering project management to production Shopify storefronts."
  >
    <ol className={classes.timeline} role="list">
      {timeline.map((entry, index) => (
        <Reveal as="li" key={entry.period} delay={index * 90} className={classes.entry}>
          <div className={classes.marker} aria-hidden="true" />
          <p className={classes.period}>{entry.period}</p>
          <h3 className={classes.title}>{entry.title}</h3>
          {entry.meta && <p className={classes.meta}>{entry.meta}</p>}
          <ul className={classes.items} role="list">
            {entry.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Reveal>
      ))}
    </ol>
  </Section>
);

export default Experience;
