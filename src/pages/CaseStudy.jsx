import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiExternalLink, FiGithub } from "react-icons/fi";
import LivePreview from "../components/LivePreview";
import ScreenshotGallery from "../components/ScreenshotGallery";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Reveal from "../components/ui/Reveal";
import { getProjectBySlug } from "../data/projects";
import { useProjects } from "../hooks/useProjects";
import classes from "./CaseStudy.module.css";

const Block = ({ title, children }) => (
  <Reveal as="section" className={classes.block} aria-label={title}>
    <h2>{title}</h2>
    {children}
  </Reveal>
);

const List = ({ items }) => (
  <ul role="list" className={classes.list}>
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);

const Fact = ({ label, children }) => (
  <div className={classes.fact}>
    <dt>{label}</dt>
    <dd>{children}</dd>
  </div>
);

const hostOf = (url) => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};

const repoLabel = (url) => url.replace(/^https?:\/\/(www\.)?/, "");

const CaseStudy = () => {
  const { slug } = useParams();
  const { projects } = useProjects();
  const project = getProjectBySlug(projects, slug);
  const study = project?.caseStudy;

  useEffect(() => {
    if (!project) return undefined;
    const previousTitle = document.title;
    document.title = `${project.title} — Case Study | Endrit Bejta`;
    return () => {
      document.title = previousTitle;
    };
  }, [project]);

  if (!project || !study) return <Navigate to="/" replace />;

  // Neighbours among the projects that have a case study, in pin order.
  const studies = projects.filter((item) => item.caseStudy);
  const index = studies.findIndex((item) => item.slug === project.slug);
  const previous = studies[(index - 1 + studies.length) % studies.length];
  const next = studies[(index + 1) % studies.length];

  return (
    <article className={`container ${classes.page}`}>
      <Reveal>
        <Link to="/#projects" className={classes.back}>
          <FiArrowLeft aria-hidden="true" /> All projects
        </Link>

        <header className={classes.header}>
          <p className={classes.eyebrow}>Case study</p>
          <h1>{project.title}</h1>
          <p className={classes.problem}>{project.problem}</p>

          <ul className={classes.tags} role="list" aria-label="Tech stack">
            {project.tags.map((tag) => (
              <li key={tag}>
                <Badge>{tag}</Badge>
              </li>
            ))}
          </ul>

          <div className={classes.actions}>
            {project.links.live && (
              <Button href={project.links.live} icon={<FiExternalLink />}>
                Live demo
              </Button>
            )}
            {project.links.github && (
              <Button href={project.links.github} variant="secondary" icon={<FiGithub />}>
                View code
              </Button>
            )}
          </div>
        </header>

        <dl className={classes.facts}>
          {project.role && <Fact label="Role">{project.role}</Fact>}
          <Fact label="Year">{project.year}</Fact>
          {project.links.live && <Fact label="Live">{hostOf(project.links.live)}</Fact>}
          {project.links.github && <Fact label="Source">{repoLabel(project.links.github)}</Fact>}
        </dl>
      </Reveal>

      {project.preview && (
        <Reveal as="section" className={classes.walkthrough} aria-label="Live preview">
          <h2>Live preview</h2>
          <p className={classes.walkthroughNote}>
            The deployed site, running here. Switch between a desktop and a phone-sized view.
          </p>
          <LivePreview
            url={project.links.live}
            title={project.title}
            images={project.images}
          />
        </Reveal>
      )}

      {project.images.length > 0 && (
        <Reveal as="section" className={classes.walkthrough} aria-label="Screenshots">
          <h2>{project.preview ? "Screenshots" : "Walkthrough"}</h2>
          <p className={classes.walkthroughNote}>
            {project.preview
              ? "Key screens captured from the live site. Select one to enlarge it."
              : "Captured from the live site. Select any screenshot to enlarge it."}
          </p>
          <ScreenshotGallery
            images={project.images}
            title={project.title}
            liveUrl={project.links.live}
          />
        </Reveal>
      )}

      <div className={classes.content}>
        <Block title="Overview">
          <p>{study.overview}</p>
        </Block>

        <Block title="The problem">
          <p>{study.problem}</p>
        </Block>

        <Block title="Architecture">
          <p>{study.architecture}</p>
        </Block>

        {study.decisions?.length > 0 && (
          <Block title="Technical decisions">
            <List items={study.decisions} />
          </Block>
        )}

        {study.challenges?.length > 0 && (
          <Block title="Challenges">
            <List items={study.challenges} />
          </Block>
        )}

        {study.lessons?.length > 0 && (
          <Block title="Lessons learned">
            <List items={study.lessons} />
          </Block>
        )}

        {study.future?.length > 0 && (
          <Block title="Future improvements">
            <List items={study.future} />
          </Block>
        )}
      </div>

      {studies.length > 1 && (
        <nav className={classes.pager} aria-label="More case studies">
          <Link to={`/projects/${previous.slug}`} className={classes.pagerLink}>
            <span>
              <FiArrowLeft aria-hidden="true" /> Previous
            </span>
            <strong>{previous.title}</strong>
          </Link>
          <Link
            to={`/projects/${next.slug}`}
            className={`${classes.pagerLink} ${classes.pagerNext}`}
          >
            <span>
              Next <FiArrowRight aria-hidden="true" />
            </span>
            <strong>{next.title}</strong>
          </Link>
        </nav>
      )}
    </article>
  );
};

export default CaseStudy;
