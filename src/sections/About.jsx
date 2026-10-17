import Reveal from "../components/ui/Reveal";
import Section from "../components/ui/Section";
import { profile } from "../data/profile";
import classes from "./About.module.css";

const About = () => (
  <Section
    id="about"
    eyebrow="About"
    title="From power grids to production software"
  >
    <div className={classes.bento}>
      <Reveal className={`${classes.tile} ${classes.story}`}>
        <span className={classes.label}>The short version</span>
        {profile.about.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </Reveal>

      <Reveal
        delay={80}
        className={`${classes.tile} ${classes.photo}`}
      >
        <img
          src={profile.portrait}
          alt={`Portrait of ${profile.name}`}
          width="320"
          height="320"
          loading="lazy"
          decoding="async"
        />
      </Reveal>

      <Reveal delay={160} className={`${classes.tile} ${classes.keds}`}>
        <span className={classes.label}>KEDS</span>
        <span className={classes.word}>Grids</span>
        <span className={classes.note}>Infrastructure projects</span>
      </Reveal>

      <Reveal delay={240} className={`${classes.tile} ${classes.grenion}`}>
        <span className={classes.label}>GRENION · 2022</span>
        <span className={classes.word}>Shops</span>
        <span className={classes.note}>Storefronts, end to end</span>
      </Reveal>

      <Reveal delay={320} className={classes.chips}>
        <span className={classes.chip}>{profile.education.degree}</span>
        <span className={classes.chip}>{profile.education.school}</span>
        <span className={classes.chip}>{profile.location}</span>
      </Reveal>
    </div>
  </Section>
);

export default About;
