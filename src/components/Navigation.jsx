import React, { useEffect } from "react";
import classes from "./Navigation.module.css";
import { NavLink } from "react-router-dom";
import { FaFacebook, FaGithub, FaLinkedin } from "react-icons/fa";
const Navigation = ({ showNavigation, toggleNavigation }) => {
  const home = "home";
  const about = "about";
  const projects = "projects";

  let homeLink = home.split("").map((letter, i) => {
    return (
      <span id="homeLetter" key={i}>
        {letter}
      </span>
    );
  });
  let aboutLink = about.split("").map((letter, i) => {
    return (
      <span id="aboutLetter" key={i}>
        {letter}
      </span>
    );
  });
  let projectsLink = projects.split("").map((letter, i) => {
    return (
      <span id="projectsLetter" key={i}>
        {letter}
      </span>
    );
  });
  // let contactLink = contact.split("").map((letter, i) => {
  //   return (
  //     <span id="contactLetter" key={i}>
  //       {letter}
  //     </span>
  //   );
  // });

  return (
    <nav
      className={`${classes.Navigation}  ${
        showNavigation ? classes.showNavigation : ""
      }`}
    >
      <ul>
        <li>
          <NavLink
            style={{ "--link-delay": "100ms" }}
            onClick={toggleNavigation}
            to=""
          >
            {homeLink}
            <div className={classes.line}></div>
            <div className={classes.lineAqua}></div>
          </NavLink>
        </li>
        <li>
          <NavLink
            style={{ "--link-delay": "200ms" }}
            onClick={toggleNavigation}
            to="projects"
          >
            {projectsLink}
            <div className={classes.line}></div>
            <div className={classes.lineAqua}></div>
          </NavLink>
        </li>
        <li>
          <NavLink
            style={{ "--link-delay": "300ms" }}
            onClick={toggleNavigation}
            to="about"
          >
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
      <ul className={classes.navigationSocials}>
        <NavLink to={"https://linkedin.com/in/endritbejta"}>
          <FaLinkedin />
        </NavLink>
        <NavLink
          style={{ fontSize: "38px" }}
          to={"https://github.com/endritbejta"}
        >
          <FaGithub />
        </NavLink>
        <NavLink to={"https://facebook.com/endritbejta"}>
          <FaFacebook />
        </NavLink>
      </ul>
    </nav>
  );
};

export default Navigation;
