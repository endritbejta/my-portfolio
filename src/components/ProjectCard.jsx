import { memo } from "react";
import { Link } from "react-router-dom";
import { FiCheck, FiCode, FiExternalLink, FiGithub } from "react-icons/fi";
import Badge from "./ui/Badge";
import Card from "./ui/Card";
import classes from "./ProjectCard.module.css";

/**
 * Rich project card: cover, problem statement, stack, shipped features,
 * role, and actions (live / GitHub / case study).
 */
/** A card is a teaser: the full story lives on the case-study page. */
const MAX_TAGS = 4;
const MAX_HIGHLIGHTS = 2;

const ProjectCard = memo(function ProjectCard({ project }) {
  const { title, problem, role, year, tags, highlights, cover, links, slug, caseStudy } =
    project;

  // Where a click anywhere on the card goes: the case study when there is one
  // (the card is a summary, the page is the full story), then the live site,
  // then the repo. A project with none of the three stays inert.
  const cardLink = caseStudy
    ? { to: `/projects/${slug}` }
    : links.live
      ? { href: links.live }
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
          {tags.slice(0, MAX_TAGS).map((tag) => (
            <li key={tag}>
              <Badge>{tag}</Badge>
            </li>
          ))}
        </ul>

        {highlights.length > 0 && (
          <ul className={classes.highlights} role="list" aria-label="Key features">
            {highlights.slice(0, MAX_HIGHLIGHTS).map((highlight) => (
              <li key={highlight}>
                <FiCheck aria-hidden="true" /> <span>{highlight}</span>
              </li>
            ))}
          </ul>
        )}

        {role && <p className={classes.role}>{role}</p>}

        <div className={classes.actions}>
          {caseStudy && (
            <Link
              to={`/projects/${slug}`}
              className={classes.caseStudyLink}
              aria-label={`Case study — ${title}`}
            >
              Case study →
            </Link>
          )}

          <div className={classes.iconLinks}>
            {links.live && (
              <a
                href={links.live}
                target="_blank"
                rel="noreferrer"
                aria-label={`Live demo — ${title}`}
                title="Live demo"
              >
                <FiExternalLink aria-hidden="true" />
              </a>
            )}
            {links.github && (
              <a
                href={links.github}
                target="_blank"
                rel="noreferrer"
                aria-label={`GitHub — ${title}`}
                title="GitHub"
              >
                <FiGithub aria-hidden="true" />
              </a>
            )}
          </div>
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
