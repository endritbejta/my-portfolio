import { FiGithub, FiStar } from "react-icons/fi";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Reveal from "../components/ui/Reveal";
import Section from "../components/ui/Section";
import { socials } from "../data/profile";
import { repos } from "../data/repos";
import { formatMonth } from "../utils/date";
import classes from "./OpenSource.module.css";

const LANGUAGE_COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Liquid: "#67b8de",
  SCSS: "#c6538c",
  CSS: "#563d7c",
  "C#": "#178600",
};

const OpenSource = () => (
  <Section
    id="open-source"
    eyebrow="Code"
    title="Open source & public repos"
    description="A selection of public repositories — the code behind the projects above."
  >
    <div className={classes.grid}>
      {repos.map((repo, index) => (
        <Reveal key={repo.name} delay={(index % 3) * 80}>
          <Card as="article" interactive className={classes.card}>
            <div className={classes.header}>
              <h3 className={classes.name}>
                <a href={repo.url} target="_blank" rel="noreferrer">
                  {repo.name}
                </a>
              </h3>
              {repo.stars > 0 && (
                <span className={classes.stars}>
                  <FiStar aria-hidden="true" /> {repo.stars}
                </span>
              )}
            </div>
            <p className={classes.description}>{repo.description}</p>
            <ul className={classes.stack} role="list" aria-label="Tech stack">
              {repo.stack.map((tech) => (
                <li key={tech}>
                  <Badge>{tech}</Badge>
                </li>
              ))}
            </ul>
            <div className={classes.footer}>
              <span className={classes.language}>
                <span
                  className={classes.dot}
                  style={{ background: LANGUAGE_COLORS[repo.language] ?? "var(--text-faint)" }}
                  aria-hidden="true"
                />
                {repo.language}
              </span>
              <span className={classes.updated}>Updated {formatMonth(repo.updated)}</span>
            </div>
          </Card>
        </Reveal>
      ))}
    </div>
    <Reveal className={classes.more}>
      <a href={socials.github} target="_blank" rel="noreferrer">
        <FiGithub aria-hidden="true" /> See all repositories on GitHub →
      </a>
    </Reveal>
  </Section>
);

export default OpenSource;
