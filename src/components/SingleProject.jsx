import React, { useEffect, useRef } from "react";
import classes from "./SingleProject.module.css";
import { NavLink } from "react-router-dom";
import Chip from "./Chip";
const SingleProject = ({ orderNumber, singleProject }) => {
  const singleProjectRef = useRef();
  console.log("single project ref", singleProjectRef.current);
  useEffect(() => {
    singleProjectRef.current?.animate(
      [
        {
          transform: "translateX(40px)",
          opacity: "0",
        },
        {
          opacity: "0.7",
          transform: "translateX(-10px)",
        },
        {
          opacity: "1",
          transform: "translateX(0)",
        },
      ],
      {
        duration: (orderNumber + 1) * 500,
        easing: "ease",
        fill: "forwards",
      }
    );
  }, []);
  return (
    <div
      ref={singleProjectRef}
      style={{ animationDelay: `${orderNumber}s` }}
      className={classes.SingleProject}
    >
      <NavLink
        to={singleProject.name.trim(" ").toLowerCase()}
        className={classes.photoShower}
      >
        <img
          src={singleProject.images[0] ? singleProject.images[0] : ""}
          alt="project-photo"
        />
        <div
          style={{ animationDelay: `${orderNumber * 50}ms` }}
          className={classes.background}
        ></div>
      </NavLink>
      <NavLink className={classes.title} to={singleProject.name}>
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
