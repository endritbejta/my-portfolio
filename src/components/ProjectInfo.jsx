import React, { useEffect, useState } from "react";
import classes from "./ProjectInfo.module.css";
import { useParams } from "react-router";
import { gitHubProjects as projectsData } from "../assets/data";
const ProjectInfo = () => {
  const params = useParams();
  const [activePhoto, setActivePhoto] = useState(0);
  console.log(activePhoto);
  console.log(projectsData);
  let content;
  useEffect(() => {
    setActivePhoto(0);
  }, []);

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
            <img src={projectData.images[activePhoto]} alt="photo of project" />
          </div>
          <div className={classes.smallPhotos}>
            {projectData.images.map((image, i) => {
              console.log("asdlasjdaslkdjsa", i === activePhoto);
              return (
                <img
                  key={i}
                  className={`${classes.smallPhoto} ${
                    i === activePhoto ? classes.opacity : ""
                  }`}
                  src={image}
                  onClick={() => setActivePhoto(i)}
                  alt={`${i + 1} photo of project`}
                />
              );
            })}
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
