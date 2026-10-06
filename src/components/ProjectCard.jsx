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

  // Where a click anywhere on the card goes. The live site wins — it's what a
  // visitor most wants from a project card — then the case study, then the
  // repo. The repo is the last resort so a card with no homepage and no case
  // study still goes somewhere. A project with none of the three stays inert.
  const cardLink = links.live
    ? { href: links.live }
    : caseStudy
      ? { to: `/projects/${slug}` }
      : links.github
        ? { href: links.github }
        : null;

  return (
    <Card as="article" interactive className={`stretch-host ${classes.card}`}>
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
        {problem && <p className={classes.problem}>{problem}</p>}

        <ul className={classes.tags} role="list" aria-label="Technologies used">
          {tags.map((tag) => (
            <li key={tag}>
              <Badge>{tag}</Badge>
            </li>
          ))}
        </ul>

        {highlights.length > 0 && (
          <ul className={classes.highlights} role="list" aria-label="Key features">
            {highlights.slice(0, 4).map((highlight) => (
              <li key={highlight}>
                <FiCheck aria-hidden="true" /> {highlight}
              </li>
            ))}
          </ul>
        )}

        {role && <p className={classes.role}>{role}</p>}

        <div className={classes.actions}>
          {links.live && (
            <Button
              href={links.live}
              size="sm"
              icon={<FiExternalLink />}
              /* Names it uniquely among the page's many "Live demo" links,
                 while still starting with the visible text so the accessible
                 name contains it (WCAG 2.5.3). */
              aria-label={`Live demo — ${title}`}
            >
              Live demo
            </Button>
          )}
          {links.github && (
            <Button
              href={links.github}
              size="sm"
              variant="secondary"
              icon={<FiGithub />}
              aria-label={`GitHub — ${title}`}
            >
              GitHub
            </Button>
          )}
          {caseStudy && (
            <Link
              to={`/projects/${slug}`}
              className={classes.caseStudyLink}
              aria-label={`Case study — ${title}`}
            >
              Case study →
            </Link>
          )}
        </div>
      </div>

      {cardLink &&
        (cardLink.to ? (
          <Link
            to={cardLink.to}
            className="stretch-link"
            data-cursor-size="lg"
            aria-hidden="true"
            tabIndex={-1}
          />
        ) : (
          <a
            href={cardLink.href}
            target="_blank"
            rel="noreferrer"
            className="stretch-link"
            data-cursor-size="lg"
            aria-hidden="true"
            tabIndex={-1}
          />
        ))}
    </Card>
  );
});

export default ProjectCard;
