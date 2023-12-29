import React, { useEffect, useRef, useState } from "react";
import classes from "./SingleProject.module.css";
import { NavLink } from "react-router-dom";
import Chip from "./Chip";
import { FaSpinner } from "react-icons/fa";
const SingleProject = ({ orderNumber, singleProject }) => {
  const singleProjectRef = useRef();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  useEffect(() => {
    singleProjectRef.current?.animate(
      [
        {
          transform: "translateX(25%)",
          opacity: "0",
        },
        // {
        //   opacity: "0.7",
        //   transform: "translateX(-10px)",
        // },
        {
          opacity: "1",
          transform: "translateX(0)",
        },
      ],
      {
        duration: 500,
        easing: "ease",
        fill: "forwards",
        delay: orderNumber * 100,
      }
    );
  }, []);
  return (
    <div
      ref={singleProjectRef}
      style={{ animationDelay: `${orderNumber}s` }}
      className={classes.SingleProject}
    >
      <NavLink to={singleProject.route} className={classes.photoShower}>
        <img
          src={singleProject.images[0]}
          // onLoad={() => setIsImageLoaded(true)}
          alt="project-photo"
        />
        <span
          style={{ animationDelay: `${orderNumber * 50}ms` }}
          className={classes.background}
        ></span>
        {/* <div
          className={`${classes.spinner} ${
            isImageLoaded ? classes.fadeAway : ""
          }`}
        >
          <FaSpinner />
        </div> */}
      </NavLink>
      <NavLink className={classes.title} to={singleProject.route}>
        {singleProject.name}
      </NavLink>
      <p className={classes.description}>{singleProject.description}</p>
      <div className={classes.chipHolder}>
        {singleProject.languagesUsed.map((language, i) => (
          <Chip key={i} context={language} />
        ))}
        {singleProject.live && <Chip type="LIVE" to={singleProject.liveURL} />}
        {singleProject.githubURL.length > 0 && (
          <Chip type="GITHUB" to={singleProject.githubURL} />
        )}
      </div>
    </div>
  );
};

export default SingleProject;
