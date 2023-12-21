import React, { useState } from "react";
import classes from "./Home.module.css";
import { letters } from "../assets/data";
import NavigateButton from "../components/NavigateButton";

const Home = () => {
  const [onMouseOverFired, setOnMouseOverFired] = useState(false);
  const onMouseOver = (event) => {
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
        <span>Hey, I'm</span>
        <span
          className={classes.nameSpan}
          onMouseOver={onMouseOver}
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
