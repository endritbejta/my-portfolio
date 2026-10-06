import { useDeferredValue, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import ProjectCard from "../components/ProjectCard";
import Reveal from "../components/ui/Reveal";
import Section from "../components/ui/Section";
import { useProjects } from "../hooks/useProjects";
import classes from "./FeaturedProjects.module.css";

/** More chips than this stop being a filter and start being a tag cloud. */
const MAX_FILTERS = 8;

const FeaturedProjects = () => {
  const [activeTag, setActiveTag] = useState("All");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const { projects } = useProjects();

  const tags = useMemo(
    () =>
      [
        ...projects
          .flatMap((project) => project.tags)
          .reduce(
            (map, tag) => map.set(tag, (map.get(tag) || 0) + 1),
            new Map()
          )
          .entries(),
      ]
        .sort((a, b) => b[1] - a[1])
        .slice(0, MAX_FILTERS)
        .map(([tag]) => tag),
    [projects]
  );

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
  }, [activeTag, deferredQuery, projects]);

  return (
    <Section
      id="projects"
      eyebrow="Work"
      title="Featured projects"
      description="My pinned work — real applications with real constraints. Each card links to the code, the live site and a case study."
    >
      <Reveal className={classes.controls}>
        <div className={classes.filters} role="group" aria-label="Filter projects by technology">
          {["All", ...tags].map((tag) => (
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
