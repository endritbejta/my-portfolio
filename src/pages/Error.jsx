import React from "react";
import classes from "./Error.module.css";
import { NavLink } from "react-router-dom";
import { IoReturnDownBackOutline } from "react-icons/io5";
import Button from "../components/NavigateButton";

const Error = () => {
  return (
    <div className={classes.Error}>
      <p>Uaaaaaa... diçka shkoi keq</p>
      <p className={classes.code}>
        <span>404</span> NOT_FOUND
      </p>
      <NavLink to="/">
        Go Back <IoReturnDownBackOutline />
      </NavLink>
    </div>
  );
};

export default Error;
