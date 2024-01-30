import React, { useRef, useState } from "react";
import classes from "./Home.module.css";
import { letters } from "../assets/data";
import NavigateButton from "../components/NavigateButton";
import ProfileCard from "../components/ProfileCard";
import { useNameRevealedContext } from "../hoc/useContext";

const Home = () => {
  const [onMouseOverFired, setOnMouseOverFired] = useState(false);
  const profileCardRef = useRef();
  const { isNameRevealed, setIsNameRevealed } = useNameRevealedContext();
  function comeIntoView() {
    profileCardRef.current?.animate(
      {
        opacity: "1",
        pointerEvents: "unset",
        top: "-100px",
        transform: "scale(1) rotate(-30deg)",
      },
      {
        duration: 1000,
        fill: "forwards",
        easing: "ease",
      }
    );
  }

  function hideFromView() {
    profileCardRef.current?.animate(
      {
        opacity: "0",
        top: "-150px",
        pointerEvents: "none",
        transform: "scale(0.5) rotate(-60deg)",
      },
      {
        duration: 1000,
        fill: "forwards",
        easing: "ease",
      }
    );
  }

  function onMouseLeave() {
    setTimeout(hideFromView, 700);
  }

  const onMouseOver = (event) => {
    comeIntoView();
    if (!onMouseOverFired && !isNameRevealed) {
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
        iterations += 1 / 3;
      }, 30);
      setIsNameRevealed(true);
    }
    setOnMouseOverFired(true);
  };

  return (
    <section className={classes.Home}>
      <h1
        className={classes.title}
        onMouseEnter={(e) => onMouseOver(e)}
        onMouseLeave={(e) => onMouseLeave(e)}
      >
        <ProfileCard profileCardRef={profileCardRef} />
        <span>Hey, I'm</span>
        <span
          className={classes.nameSpan}
          data-value="endrit bejta"
          onClick={onMouseOver}
        >
          {isNameRevealed ? "endrit bejta" : "xxxxxx xxxxx"}
        </span>
        ,<span> web developer</span>
      </h1>
      <p className={classes.profession}>Frontend developer / ReactJS</p>
      <div className={classes.actions}>
        <NavigateButton to="about?contact" context="Contact me!" />
        <p>||</p>
        <NavigateButton to="projects" context="See my projects!" />
      </div>
    </section>
  );
};

export default Home;
