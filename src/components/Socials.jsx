import React from "react";
import classes from "./Socials.module.css";
import { FaFacebook, FaGithub, FaLinkedinIn } from "react-icons/fa";

const Socials = () => {
  return (
    <div className={classes.Socials}>
      <a target="blank" href="https://linkedin.com/in/endritbejta">
        <FaLinkedinIn />
      </a>
      <a target="blank" href="https://github.com/endritbejta">
        <FaGithub />
      </a>
      <a target="blank" href="https://facebook.com/endritbejta">
        <FaFacebook />
      </a>
    </div>
  );
};

export default Socials;
