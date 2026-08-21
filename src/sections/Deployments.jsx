import { FiExternalLink, FiGithub, FiGlobe } from "react-icons/fi";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Reveal from "../components/ui/Reveal";
import Section from "../components/ui/Section";
import { mapSitesToDeployments } from "../data/deployments";
import { featuredSiteIds } from "../data/projects";
import { useNetlifySites } from "../hooks/useNetlifySites";
import { formatMonth } from "../utils/date";
import classes from "./Deployments.module.css";

const Deployments = () => {
  const { sites } = useNetlifySites();
  const data = mapSitesToDeployments(sites);

  /** Everything live on Netlify that isn't already a featured project. */
  const moreDeployments = data.filter(
    (deployment) => !featuredSiteIds.has(deployment.id)
  );

  return (
    <Section
      id="deployments"
      eyebrow="Live"
      title="More deployments"
      description={`${moreDeployments.length} more production deployments, dynamically pulled from my Netlify account — dead sites are filtered out automatically.`}
    >
      <div className={classes.grid}>
        {moreDeployments.map((deployment, index) => (
        <Reveal key={deployment.id} delay={(index % 4) * 80}>
          <Card as="article" interactive className={`stretch-host ${classes.card}`}>
            <a
              href={deployment.live}
              target="_blank"
              rel="noreferrer"
              className={classes.mediaLink}
              aria-label={`Open ${deployment.name} live site`}
              data-cursor-size="lg"
            >
              {deployment.screenshot ? (
                <img
                  src={deployment.screenshot}
                  alt={`${deployment.name} screenshot`}
                  loading="lazy"
                  decoding="async"
                  width="480"
                  height="270"
                />
              ) : (
                <span className={classes.mediaFallback} aria-hidden="true">
                  <FiGlobe />
                </span>
              )}
            </a>
            <div className={classes.body}>
              <h3>{deployment.name}</h3>
              {deployment.description && <p>{deployment.description}</p>}
              {deployment.stack.length > 0 && (
                <ul className={classes.stack} role="list" aria-label="Tech stack">
                  {deployment.stack.map((tech) => (
                    <li key={tech}>
                      <Badge>{tech}</Badge>
                    </li>
                  ))}
                </ul>
              )}
              <div className={classes.footer}>
                <div className={classes.links}>
                  <a
                    href={deployment.live}
                    target="_blank"
                    rel="noreferrer"
                    className="stretch"
                    data-cursor-size="lg"
                    aria-label={`Live site — ${deployment.name}`}
                  >
                    <FiExternalLink aria-hidden="true" /> Live site
                  </a>
                  {deployment.github && (
                    <a href={deployment.github} target="_blank" rel="noreferrer">
                      <FiGithub aria-hidden="true" /> Repo
                    </a>
                  )}
                </div>
                <span className={classes.updated}>
                  {formatMonth(deployment.updated)}
                </span>
              </div>
            </div>
          </Card>
        </Reveal>
      ))}
    </div>
  </Section>
  );
};

export default Deployments;
