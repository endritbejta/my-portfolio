import React from "react";
import classes from "./SingleProject.module.css";
import { NavLink } from "react-router-dom";
const SingleProject = ({ singleProject }) => {
  console.log(singleProject);
  return (
    <div className={classes.SingleProject}>
      <NavLink
        to={singleProject.name.toLowerCase()}
        className={classes.photoShower}
      >
        <div className={classes.background}></div>
      </NavLink>
      <NavLink to={`project/${singleProject.name}`}>
        {singleProject.name}
      </NavLink>
      <p>{singleProject.description}</p>
    </div>
  );
};

export default SingleProject;
