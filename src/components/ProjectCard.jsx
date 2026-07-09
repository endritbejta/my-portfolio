import { memo } from "react";
import { Link } from "react-router-dom";
import { FiCheck, FiCode, FiExternalLink, FiGithub } from "react-icons/fi";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import Card from "./ui/Card";
import classes from "./ProjectCard.module.css";

/**
 * Rich project card: cover, problem statement, stack, shipped features,
 * role, and actions (live / GitHub / case study).
 */
const ProjectCard = memo(function ProjectCard({ project }) {
  const { title, problem, role, year, tags, highlights, cover, links, slug, caseStudy } =
    project;

  return (
    <Card as="article" interactive className={classes.card}>
      <div className={classes.media}>
        {cover ? (
          <img
            src={cover}
            alt={`${title} screenshot`}
            loading="lazy"
            decoding="async"
            width="640"
            height="360"
          />
        ) : (
          <div className={classes.mediaFallback} aria-hidden="true">
            <FiCode />
          </div>
        )}
        <span className={classes.year}>{year}</span>
      </div>

      <div className={classes.body}>
        <h3 className={classes.title}>{title}</h3>
        <p className={classes.problem}>{problem}</p>

        <ul className={classes.tags} role="list" aria-label="Technologies used">
          {tags.map((tag) => (
            <li key={tag}>
              <Badge>{tag}</Badge>
            </li>
          ))}
        </ul>

        <ul className={classes.highlights} role="list" aria-label="Key features">
          {highlights.slice(0, 4).map((highlight) => (
            <li key={highlight}>
              <FiCheck aria-hidden="true" /> {highlight}
            </li>
          ))}
        </ul>

        <p className={classes.role}>{role}</p>

        <div className={classes.actions}>
          {links.live && (
            <Button href={links.live} size="sm" icon={<FiExternalLink />}>
              Live demo
            </Button>
          )}
          {links.github && (
            <Button href={links.github} size="sm" variant="secondary" icon={<FiGithub />}>
              GitHub
            </Button>
          )}
          {caseStudy && (
            <Link to={`/projects/${slug}`} className={classes.caseStudyLink}>
              Case study →
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
});

export default ProjectCard;
