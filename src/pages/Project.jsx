import React from "react";
import classes from "./Project.module.css";
import SingleProject from "../components/SingleProject";
import { gitHubProjects } from "../assets/data";

const Project = () => {
  return (
    <section className={classes.Project}>
      <h3>My projects</h3>
      <div className={classes.projectsHolder}>
        {gitHubProjects.map((ghProject, i) => (
          <SingleProject singleProject={ghProject} />
        ))}
      </div>
    </section>
  );
};

export default Project;
