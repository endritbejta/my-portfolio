import PowerLines from "../components/PowerLines";
import GitGraphArt from "../components/GitGraphArt";
import Reveal from "../components/ui/Reveal";
import Section from "../components/ui/Section";
import { profile } from "../data/profile";
import classes from "./About.module.css";

// `cursor` names the icon the trailing cursor swells into while over the tile.
const Tile = ({ area, delay, cursor, className = "", children }) => (
  <Reveal
    delay={delay}
    className={[classes.tile, classes[area], className].join(" ")}
    data-cursor={cursor}
    data-cursor-size={cursor ? "lg" : undefined}
  >
    {children}
  </Reveal>
);

const About = () => (
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
        <p className={classes.education}>
          {profile.education.degree} — {profile.education.school}
        </p>
      </Tile>

      <Tile area="photo" delay={80} cursor="photo">
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

      <Tile area="keds" delay={160} cursor="bolt">
        <PowerLines />
        <span className={classes.label}>KEDS · before</span>
        <span className={classes.word}>Grids</span>
        <span className={classes.note}>Infrastructure projects</span>
      </Tile>

      <Tile area="grenion" delay={240} cursor="code">
        <GitGraphArt />
        <span className={classes.label}>GRENION · since 2022</span>
        <span className={classes.word}>Shops</span>
        <ul className={classes.shops}>
          {profile.storefronts.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </Tile>
    </div>
  </Section>
);

export default About;
