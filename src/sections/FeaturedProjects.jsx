import { useDeferredValue, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import ProjectCard from "../components/ProjectCard";
import Reveal from "../components/ui/Reveal";
import Section from "../components/ui/Section";
import { allTags, projects } from "../data/projects";
import classes from "./FeaturedProjects.module.css";

const FeaturedProjects = () => {
  const [activeTag, setActiveTag] = useState("All");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const visible = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesTag = activeTag === "All" || project.tags.includes(activeTag);
      const matchesQuery =
        !q ||
        `${project.title} ${project.problem} ${project.tags.join(" ")}`
          .toLowerCase()
          .includes(q);
      return matchesTag && matchesQuery;
    });
  }, [activeTag, deferredQuery]);

  return (
    <Section
      id="projects"
      eyebrow="Work"
      title="Featured projects"
      description="Real applications with real constraints — each card links to code, a live deployment, or a full case study."
    >
      <Reveal className={classes.controls}>
        <div className={classes.filters} role="group" aria-label="Filter projects by technology">
          {["All", ...allTags].map((tag) => (
            <button
              key={tag}
              type="button"
              className={`${classes.filter} ${activeTag === tag ? classes.filterActive : ""}`}
              aria-pressed={activeTag === tag}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
        <label className={classes.search}>
          <FiSearch aria-hidden="true" />
          <span className="visually-hidden">Search projects</span>
          <input
            type="search"
            placeholder="Search projects…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </Reveal>

      {visible.length === 0 ? (
        <p className={classes.empty} role="status">
          No projects match “{deferredQuery}” — try a different search.
        </p>
      ) : (
        <div className={classes.grid}>
          {visible.map((project, index) => (
            <Reveal key={project.slug} delay={(index % 2) * 100}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  );
};

export default FeaturedProjects;
