import React from "react";
import classes from "./Chip.module.css";
import { NavLink } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
const Chip = ({ type, to, context }) => {
  let content;
  if (to) {
    if (type === "LIVE") {
      content = (
        <NavLink
          target="_blank"
          className={`${classes.Chip} ${classes.activeLink}`}
          to={to}
        >
          GO LIVE
        </NavLink>
      );
    } else if ((type = "GITHUB")) {
      content = (
        <NavLink target="_blank" className={classes.Chip} to={to}>
          GITHUB REPOSITORY <FaArrowRight style={{ fontSize: "12px" }} />
        </NavLink>
      );
    }
  } else {
    content = <button className={classes.Chip}>{context}</button>;
  }

  return content;
};

export default Chip;
