import React from "react";
import classes from "./Navigation.module.css";
const Navigation = () => {
  return (
    <nav className={classes.Navigation}>
      <ul>
        <li>
          <a>Home</a>
        </li>
        <li>
          <a>About</a>
        </li>
        <li>
          <a>Projects</a>
        </li>
        <li>
          <a>Contact</a>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
