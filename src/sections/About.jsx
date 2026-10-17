import Crossword from "../components/Crossword";
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
    <div className={classes.grid}>
      <Reveal className={classes.text}>
        {profile.about.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
        <p className={classes.education}>
          {profile.education.degree} — {profile.education.school}
        </p>
      </Reveal>

      <Reveal delay={120} className={classes.visual}>
        <Crossword
          portrait={profile.portrait}
          portraitAlt={`Portrait of ${profile.name}`}
        />
      </Reveal>
    </div>
  </Section>
);

export default About;
