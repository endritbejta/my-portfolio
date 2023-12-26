import React from "react";
import classes from "./Navigation.module.css";
import { NavLink } from "react-router-dom";
const Navigation = ({ showNavigation, toggleNavigation }) => {
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
    <nav
      className={`${classes.Navigation}  ${
        showNavigation ? classes.showNavigation : ""
      }`}
    >
      <ul>
        <li>
          <NavLink onClick={toggleNavigation} to="">
            {homeLink}
            <div className={classes.line}></div>
            <div className={classes.lineAqua}></div>
          </NavLink>
        </li>
        <li>
          <NavLink onClick={toggleNavigation} to="projects">
            {projectsLink}
            <div className={classes.line}></div>
            <div className={classes.lineAqua}></div>
          </NavLink>
        </li>
        <li>
          <NavLink onClick={toggleNavigation} to="about">
            {aboutLink}
            <div className={classes.line}></div>
            <div className={classes.lineAqua}></div>
          </NavLink>
        </li>
        {/* <li>
          <NavLink onClick={toggleNavigation} to="contact">
            {contactLink}
            <div className={classes.line}></div>
            <div className={classes.lineAqua}></div>
          </NavLink>
        </li> */}
      </ul>
    </nav>
  );
};

export default Navigation;
