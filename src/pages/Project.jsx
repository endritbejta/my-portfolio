import React from "react";
import classes from "./Project.module.css";

const Project = () => {
  return (
    <div className={classes.Project}>
      <h3>My projects</h3>
      <div className={classes.singleProject}></div>
    </div>
  );
};

export default Project;
