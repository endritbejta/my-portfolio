import React from "react";
import classes from "./Chip.module.css";
import { NavLink } from "react-router-dom";
const Chip = ({ type, to, context }) => {
  let content;
  if (to) {
    if (type === "LIVE") {
      content = (
        <NavLink target="blank" className={classes.Chip} to={to}>
          LIVE LINK
        </NavLink>
      );
    } else {
      content = (
        <NavLink target="blank" className={classes.Chip} to={to}>
          GITHUB REPOSITORY
        </NavLink>
      );
    }
  } else {
    content = (
      <button className={classes.Chip} type="button">
        {context}
      </button>
    );
  }
  return content;
};

export default Chip;
