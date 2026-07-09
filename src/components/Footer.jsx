import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
import { NAV_LINKS } from "../constants";
import { profile, site, socials } from "../data/profile";
import classes from "./Footer.module.css";

const Footer = () => (
  <footer className={classes.footer}>
    <div className={`container ${classes.inner}`}>
      <div className={classes.col}>
        <p className={classes.name}>{profile.name}</p>
        <p className={classes.tagline}>
          {profile.role} · {profile.location}
        </p>
        <div className={classes.socials}>
          <a href={socials.github} target="_blank" rel="noreferrer" aria-label="GitHub">
            <FiGithub aria-hidden="true" />
          </a>
          <a href={socials.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
            <FiLinkedin aria-hidden="true" />
          </a>
          <a href={`mailto:${profile.email}`} aria-label="Email">
            <FiMail aria-hidden="true" />
          </a>
        </div>
      </div>

      <nav className={classes.col} aria-label="Footer">
        <p className={classes.colTitle}>Quick links</p>
        <ul role="list">
          {NAV_LINKS.map(({ id, label }) => (
            <li key={id}>
              <a href={`/#${id}`}>{label}</a>
            </li>
          ))}
        </ul>
      </nav>

      <div className={classes.col}>
        <p className={classes.colTitle}>This site</p>
        <ul role="list">
          <li>Built with {site.builtWith.join(", ")}</li>
          <li>
            <a href={site.repo} target="_blank" rel="noreferrer">
              Source on GitHub
            </a>
          </li>
          <li>
            v{site.version} · Updated {site.lastUpdated}
          </li>
        </ul>
      </div>
    </div>
    <div className={`container ${classes.copyright}`}>
      <p>
        © {new Date().getFullYear()} {profile.name}. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
