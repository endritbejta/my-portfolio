import { FiArrowRight, FiDownload, FiGithub, FiMapPin } from "react-icons/fi";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Reveal from "../components/ui/Reveal";
import { profile, socials } from "../data/profile";
import classes from "./Hero.module.css";

const Hero = () => (
  <section id="hero" className={classes.hero} aria-label="Introduction">
    <div className={classes.glow} aria-hidden="true" />
    <div className={`container ${classes.inner}`}>
      <Reveal>
        <div className={classes.meta}>
          <Badge tone="success">{profile.availability}</Badge>
          <span className={classes.location}>
            <FiMapPin aria-hidden="true" /> {profile.location}
          </span>
          <span className={classes.experience}>
            {profile.yearsOfExperience} years experience
          </span>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <h1 className={classes.title}>
          Hi, I'm {profile.name.split(" ")[0]}.
          <br />
          <span className={classes.titleAccent}>
            I engineer commerce platforms where performance is revenue.
          </span>
        </h1>
      </Reveal>

      <Reveal delay={160}>
        <p className={classes.summary}>{profile.summary}</p>
      </Reveal>

      <Reveal delay={240}>
        <div className={classes.stack} aria-label="Current tech stack">
          <span className={classes.stackLabel}>Currently working with</span>
          {profile.currentStack.map((tech) => (
            <Badge key={tech}>{tech}</Badge>
          ))}
        </div>
      </Reveal>

      <Reveal delay={320}>
        <div className={classes.actions}>
          <Button href="/#projects" icon={<FiArrowRight />}>
            View projects
          </Button>
          <Button href={socials.github} variant="secondary" icon={<FiGithub />}>
            GitHub
          </Button>
          <Button href={profile.resume} variant="secondary" icon={<FiDownload />} download="Endrit-Bejta-Resume.pdf">
            Resume
          </Button>
          <Button href="/#contact" variant="ghost">
            Contact
          </Button>
        </div>
      </Reveal>
    </div>
  </section>
);

export default Hero;
