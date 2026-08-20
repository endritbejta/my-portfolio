import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiExternalLink, FiGithub } from "react-icons/fi";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Reveal from "../components/ui/Reveal";
import { getProjectBySlug } from "../data/projects";
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

const CaseStudy = () => {
  const { slug } = useParams();
  const project = getProjectBySlug(slug);
  const study = project?.caseStudy;

  useEffect(() => {
    if (project) document.title = `${project.title} — Case Study | Endrit Bejta`;
    window.scrollTo({ top: 0, behavior: "instant" });
    return () => {
      document.title = "Endrit Bejta — Frontend Engineer";
    };
  }, [project]);

  if (!project || !study) return <Navigate to="/" replace />;

  return (
    <article className={`container ${classes.page}`}>
      <Reveal>
        <Link to="/#projects" className={classes.back}>
          <FiArrowLeft aria-hidden="true" /> All projects
        </Link>

        <header className={`scrim ${classes.header}`}>
          <p className={classes.eyebrow}>
            Case study · {project.year} · {project.role}
          </p>
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
      </Reveal>

      {project.cover && (
        <Reveal className={classes.cover}>
          <img
            src={project.cover}
            alt={`${project.title} main screenshot`}
            width="1200"
            height="675"
            decoding="async"
          />
        </Reveal>
      )}

      <div className={`scrim ${classes.content}`}>
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

        {project.images.length > 1 && (
          <Block title="Screenshots">
            <div className={classes.gallery}>
              {project.images.slice(1).map((image, index) => (
                <img
                  key={image}
                  src={image}
                  alt={`${project.title} screenshot ${index + 2}`}
                  loading="lazy"
                  decoding="async"
                  width="600"
                  height="338"
                />
              ))}
            </div>
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
    </article>
  );
};

export default CaseStudy;
