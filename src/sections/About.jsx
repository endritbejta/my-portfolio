import Reveal from "../components/ui/Reveal";
import Section from "../components/ui/Section";
import StatCounter from "../components/StatCounter";
import { profile, stats } from "../data/profile";
import classes from "./About.module.css";

const About = () => (
  <Section
    id="about"
    eyebrow="About"
    title="From power grids to production software"
  >
    <div className={classes.grid}>
      <Reveal className={`scrim ${classes.text}`}>
        {profile.about.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
        <p className={classes.education}>
          {profile.education.degree} — {profile.education.school}
        </p>
      </Reveal>

      <Reveal delay={120} className={classes.portraitWrap}>
        <img
          src={profile.portrait}
          alt={`Portrait of ${profile.name}`}
          className={classes.portrait}
          width="320"
          height="320"
          loading="lazy"
          decoding="async"
        />
      </Reveal>
    </div>

    <dl className={classes.stats}>
      {stats.map((stat, index) => (
        <Reveal key={stat.label} delay={index * 90} as="div" className={classes.stat}>
          <StatCounter value={stat.value} suffix={stat.suffix} />
          <dd>{stat.label}</dd>
        </Reveal>
      ))}
    </dl>
  </Section>
);

export default About;
