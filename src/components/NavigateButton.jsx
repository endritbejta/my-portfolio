import React from "react";
import classes from "./NavigateButton.module.css";
import { NavLink } from "react-router-dom";
const Button = ({ to, context }) => {
  return (
    <NavLink to={to} className={classes.button}>
      <p>{context}</p>
    </NavLink>
  );
};

export default Button;
