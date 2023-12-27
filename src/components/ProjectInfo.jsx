import React from "react";
import classes from "./ProjectInfo.module.css";
import { useParams } from "react-router";
import { gitHubProjects as projectsData } from "../assets/data";
import SingleProject from "./SingleProject";
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
      <section className={classes.ProjectInfo}>
        <div className={classes.projectGallery}>
          <div className={classes.gallery}>
            <img src={projectData.images[0]} alt="photo of project" />
          </div>
          <div className={classes.smallPhotos}>
            {projectData.images.map((image, i) => (
              <img
                className={classes.smallPhoto}
                src={image}
                alt={`${i + 1} photo of project`}
              />
            ))}
          </div>
        </div>
        <div className={classes.projectDescription}>
          <h1>{projectData.name}</h1>
          <p>{projectData.description}</p>
          <p>{projectData.largerDescription}</p>
        </div>
      </section>
    );
  } else {
    content = <h1>404 error page here...</h1>;
  }

  console.log("projectData", projectData);
  return content;
};

export default ProjectInfo;
