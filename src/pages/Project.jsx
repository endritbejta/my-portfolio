import React, { useEffect } from "react";
import classes from "./Project.module.css";
import SingleProject from "../components/SingleProject";
import { gitHubProjects } from "../assets/data";

const Project = () => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);
  return (
    <section className={classes.Project}>
      <h3>My projects</h3>
      <div className={classes.projectsHolder}>
        {gitHubProjects.map((ghProject, i) => (
          <SingleProject key={i} orderNumber={i} singleProject={ghProject} />
        ))}
      </div>
    </section>
  );
};

export default Project;
