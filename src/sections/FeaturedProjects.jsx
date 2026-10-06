import ProjectCard from "../components/ProjectCard";
import Reveal from "../components/ui/Reveal";
import Section from "../components/ui/Section";
import { useProjects } from "../hooks/useProjects";
import classes from "./FeaturedProjects.module.css";

const FeaturedProjects = () => {
  const { projects } = useProjects();

  return (
    <Section
      id="projects"
      eyebrow="Work"
      title="Featured projects"
      description="My pinned work — real applications with real constraints. Each card links to the code, the live site and a case study."
    >
      <div className={classes.grid}>
        {projects.map((project, index) => (
          <Reveal key={project.slug} delay={(index % 2) * 100}>
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
};

export default FeaturedProjects;
