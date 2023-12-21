import React from "react";
import classes from "./Navigation.module.css";
import { NavLink } from "react-router-dom";
const Navigation = () => {
  const home = "home";
  const about = "about";
  const projects = "projects";
  const contact = "contact";

  let homeLink = home.split("").map((letter, i) => {
    return <span key={i}>{letter}</span>;
  });
  let aboutLink = about.split("").map((letter, i) => {
    return <span key={i}>{letter}</span>;
  });
  let projectsLink = projects.split("").map((letter, i) => {
    return <span key={i}>{letter}</span>;
  });
  let contactLink = contact.split("").map((letter, i) => {
    return <span key={i}>{letter}</span>;
  });
  console.log(homeLink);

  return (
    <nav className={classes.Navigation}>
      <ul>
        <li>
          <NavLink to="">
            {homeLink}
            <span className={classes.line}></span>
            {/* <span className={classes.lineAqua}></span> */}
          </NavLink>
        </li>
        <li>
          <NavLink to="about">
            {aboutLink}
            <span className={classes.line}></span>
            {/* <span className={classes.lineAqua}></span> */}
          </NavLink>
        </li>
        <li>
          <NavLink to="projects">
            {projectsLink}
            <span className={classes.line}></span>
            {/* <span className={classes.lineAqua}></span> */}
          </NavLink>
        </li>
        <li>
          <NavLink to="contact">
            {contactLink}
            <span className={classes.line}></span>
            {/* <span className={classes.lineAqua}></span> */}
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
