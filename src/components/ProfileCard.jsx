import React from "react";
import classes from "./ProfileCard.module.css";
import endrit from "../assets/images/coolPhotoOfMe.jpg";
import { NavLink } from "react-router-dom";
const ProfileCard = ({
  profileCardRef,
  setIsMouseOverProfileCard,
  setTimeOutToHideProfileCard,
  hideFromView,
}) => {
  function onMouseEnter() {
    setIsMouseOverProfileCard(true);
    clearTimeout(setTimeOutToHideProfileCard);
    profileCardRef.current.animate(
      {
        opacity: "1",
        pointerEvents: "unset",
        top: "-100px",
        transform: "scale(1) rotate(-30deg)",
      },
      {
        duration: 0,
        fill: "forwards",
      }
    );
  }

  function onMouseLeave() {
    setIsMouseOverProfileCard(false);
    hideFromView();
  }
  return (
    <NavLink
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      ref={profileCardRef}
      to="about"
      className={classes.ProfileCard}
    >
      <img src={endrit} alt="endrit_Bejta_cool_photo" />
    </NavLink>
  );
};

export default ProfileCard;
