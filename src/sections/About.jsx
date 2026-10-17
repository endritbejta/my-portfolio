import { useEffect, useState } from "react";
import Reveal from "../components/ui/Reveal";
import Section from "../components/ui/Section";
import { profile } from "../data/profile";
import classes from "./About.module.css";

const clockFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Belgrade",
});

// Keeps the cursor position in CSS vars so a tile can paint a spotlight under it.
const trackPointer = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
};

const Tile = ({ area, delay, className = "", children }) => (
  <Reveal
    delay={delay}
    className={[classes.tile, classes[area], className].join(" ")}
    onPointerMove={trackPointer}
  >
    {children}
  </Reveal>
);

const useLocalTime = () => {
  const [time, setTime] = useState(() => clockFormat.format(new Date()));

  useEffect(() => {
    const id = setInterval(() => setTime(clockFormat.format(new Date())), 15000);
    return () => clearInterval(id);
  }, []);

  return time;
};

const About = () => {
  const time = useLocalTime();

  return (
    <Section
      id="about"
      eyebrow="About"
      title="From power grids to production software"
    >
      <div className={classes.bento}>
        <Tile area="story">
          <span className={classes.label}>The short version</span>
          {profile.about.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </Tile>

        <Tile area="photo" delay={80}>
          <img
            src={profile.portrait}
            alt={`Portrait of ${profile.name}`}
            width="320"
            height="320"
            loading="lazy"
            decoding="async"
          />
          <span className={classes.caption}>{profile.location}</span>
        </Tile>

        <Tile area="keds" delay={160}>
          <svg
            className={classes.wave}
            viewBox="0 0 400 40"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0 20 q25 -22 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" />
          </svg>
          <span className={classes.label}>KEDS · before</span>
          <span className={classes.word}>Grids</span>
          <span className={classes.note}>Infrastructure projects</span>
        </Tile>

        <Tile area="grenion" delay={240}>
          <span className={classes.label}>GRENION · since 2022</span>
          <span className={classes.word}>Shops</span>
          <ul className={classes.shops}>
            {profile.storefronts.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </Tile>

        <Tile area="years" delay={320}>
          <span className={classes.label}>In production</span>
          <span className={classes.stat}>{profile.yearsOfExperience}</span>
          <span className={classes.note}>years</span>
        </Tile>

        <Tile area="stores" delay={380}>
          <span className={classes.label}>Owned end to end</span>
          <span className={classes.stat}>{profile.storefronts.length}</span>
          <span className={classes.note}>storefronts</span>
        </Tile>

        <Tile area="clock" delay={440}>
          <span className={classes.label}>
            <span className={classes.live} aria-hidden="true" />
            Local time
          </span>
          <span className={`${classes.stat} ${classes.mono}`}>{time}</span>
          <span className={classes.note}>Fushë Kosovë</span>
        </Tile>

        <Tile area="edu" delay={500}>
          <span className={classes.label}>Education</span>
          <span className={classes.degree}>{profile.education.degree}</span>
          <span className={classes.note}>{profile.education.school}</span>
        </Tile>
      </div>
    </Section>
  );
};

export default About;
