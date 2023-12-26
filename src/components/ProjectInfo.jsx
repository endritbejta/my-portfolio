import React from "react";
import classes from "./ProjectInfo.module.css";
import { useParams } from "react-router";
import { gitHubProjects as projectsData } from "../assets/data";
const ProjectInfo = () => {
  const params = useParams();
  console.log(projectsData);
  let content;

  const projectData = projectsData.find(
    (projectData) =>
      projectData.name.trim("").toLocaleLowerCase() ===
      params.projectName.toLocaleLowerCase()
  );

  if (projectData) {
    console.log("success");
    content = (
      <div className={classes.ProjectInfo}>
        <h1>{projectData.name}</h1>
        <p>{projectData.description}</p>
        <p>{projectData.largerDescription}</p>
      </div>
    );
  } else {
    content = <h1>404 error page here...</h1>;
  }

  console.log("projectData", projectData);
  return content;
};

export default ProjectInfo;
