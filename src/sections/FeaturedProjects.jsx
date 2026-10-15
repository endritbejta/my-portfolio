import ProjectCard from "../components/ProjectCard";
import Reveal from "../components/ui/Reveal";
import Section from "../components/ui/Section";
import { projects } from "../data/projects";
import classes from "./FeaturedProjects.module.css";

const FeaturedProjects = () => {
  return (
    <Section
      id="projects"
      eyebrow="Work"
      title="Featured projects"
      description="Selected work — real applications with real constraints. Each card links to a case study, with the live site and the code where they are public."
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
