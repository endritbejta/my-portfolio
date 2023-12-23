import React from "react";
import classes from "./SingleProject.module.css";
import { NavLink } from "react-router-dom";
import Chip from "./Chip";
const SingleProject = ({ singleProject }) => {
  console.log(singleProject);
  return (
    <div className={classes.SingleProject}>
      <NavLink
        to={singleProject.name.trim(" ").toLowerCase()}
        className={classes.photoShower}
      >
        <img
          src={singleProject.images[0] ? singleProject.images[0] : ""}
          alt="project-photo"
        />
        <div className={classes.background}></div>
      </NavLink>
      <NavLink className={classes.title} to={singleProject.name}>
        {singleProject.name}
      </NavLink>
      <p className={classes.description}>{singleProject.description}</p>
      <div className={classes.chipHolder}>
        {singleProject.languagesUsed.map((language, i) => (
          <Chip key={i} context={language} />
        ))}
        {singleProject.live ? (
          <Chip type="LIVE" to={singleProject.liveURL} />
        ) : (
          <Chip type="GITHUB" to={singleProject.liveURL} />
        )}
      </div>
    </div>
  );
};

export default SingleProject;
