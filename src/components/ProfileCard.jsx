import React from "react";
import classes from "./ProfileCard.module.css";
import endrit from "../assets/images/coolPhotoOfMe.jpg";
import { NavLink } from "react-router-dom";
const ProfileCard = ({ profileCardRef }) => {
  return (
    <NavLink ref={profileCardRef} to="about" className={classes.ProfileCard}>
      <img src={endrit} alt="endrit_Bejta_cool_photo" />
      <p>Read about me</p>
    </NavLink>
  );
};

export default ProfileCard;
