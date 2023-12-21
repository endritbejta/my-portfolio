import React, { useRef, useState } from "react";
import classes from "./Home.module.css";
import { letters } from "../assets/data";
import NavigateButton from "../components/NavigateButton";
import ProfileCard from "../components/ProfileCard";

const Home = () => {
  const [onMouseOverFired, setOnMouseOverFired] = useState(false);
  const profileCardRef = useRef();

  function comeIntoView() {
    console.log("firingEvent", profileCardRef);
    profileCardRef.current.animate(
      {
        opacity: "1",
        top: "-100px",
        transform: "rotate(-45deg)",
      },
      {
        duration: 1000,
        fill: "forwards",
        easing: "ease",
      }
    );
  }

  function hideFromView() {
    profileCardRef.current.animate(
      {
        opacity: "0",
        top: "-150px",
        pointerEvents: "unset",
        transform: "rotate(-60deg)",
      },
      {
        duration: 1000,
        fill: "forwards",
        easing: "ease",
      }
    );
  }

  const onMouseOver = (event) => {
    comeIntoView();
    if (!onMouseOverFired) {
      let iterations = 0;
      const interval = setInterval(() => {
        event.target.innerText = event.target.innerText
          .split("")
          .map((letter, i) => {
            if (i < iterations + 1) {
              return event.target.dataset.value[i];
            }

            return letters[Math.floor(Math.random() * 26)];
          })
          .join("");
        if (iterations >= event.target.dataset.value.length)
          clearInterval(interval);
        iterations += 1 / 4;
      }, 30);
    }
    setOnMouseOverFired(true);
  };
  return (
    <section className={classes.Home}>
      <h1 className={classes.title}>
        <ProfileCard profileCardRef={profileCardRef} />
        <span>Hey, I'm</span>
        <span
          className={classes.nameSpan}
          onMouseOver={onMouseOver}
          onMouseLeave={hideFromView}
          data-value="Endrit Bejta"
        >
          E***** B****
        </span>
        ,<span> web developer</span>
      </h1>
      <p className={classes.profession}>Frontend developer / ReactJS</p>
      <NavigateButton to="contact" context="Contact me!" />
    </section>
  );
};

export default Home;
