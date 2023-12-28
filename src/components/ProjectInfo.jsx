import React, { useEffect, useState } from "react";
import classes from "./ProjectInfo.module.css";
import { useParams } from "react-router";
import { gitHubProjects as projectsData } from "../assets/data";
import Error from "../pages/Error";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
const ProjectInfo = () => {
  const params = useParams();
  const [activePhoto, setActivePhoto] = useState(0);
  let content;
  // useEffect(() => {
  //   setActivePhoto(0);
  // }, []);

  const projectData = projectsData.find(
    (projectData) =>
      projectData.route.trim("").toLocaleLowerCase() ===
      params.projectName.toLocaleLowerCase()
  );

  function increaseActivePhoto() {
    if (activePhoto < projectData.images.length - 1) {
      setActivePhoto((prev) => {
        return prev + 1;
      });
    } else {
      setActivePhoto(0);
    }
  }

  function decreaseActivePhoto() {
    if (activePhoto === 0) {
      setActivePhoto(projectData.images.length - 1);
    } else {
      setActivePhoto((prev) => prev - 1);
    }
  }

  useEffect(() => {
    const handleArrowPress = (e) => {
      if (e.key === "ArrowRight") {
        increaseActivePhoto();
      } else if (e.key === "ArrowLeft") {
        decreaseActivePhoto();
      } else {
        return;
      }
    };
    document.addEventListener("keydown", handleArrowPress);

    return () => document.removeEventListener("keydown", handleArrowPress);
  }, [activePhoto]);

  if (projectData) {
    content = (
      <section className={classes.ProjectInfo}>
        <div className={classes.projectGallery}>
          <div className={classes.gallery}>
            <button
              className={`${classes.arrow} ${classes.arrowLeft}`}
              onClick={decreaseActivePhoto}
            >
              <FaArrowLeft />
            </button>
            <button
              onClick={increaseActivePhoto}
              className={`${classes.arrow} ${classes.arrowRight}`}
            >
              <FaArrowRight />
            </button>
            <img src={projectData.images[activePhoto]} alt="photo of project" />
          </div>
          <div className={classes.smallPhotos}>
            {projectData.images.map((image, i) => {
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
    content = <Error />;
  }

  return content;
};

export default ProjectInfo;
