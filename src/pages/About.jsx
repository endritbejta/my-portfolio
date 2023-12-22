import React, { useRef } from "react";
import classes from "./About.module.css";
import { letters } from "../assets/data";
const About = () => {
  const letterRef = useRef();
  let firstLetter = [];
  letters
    .split("")
    .forEach((letter, i) => firstLetter.push(<span key={i}>{letter}</span>));
  console.log(letters.split(""));
  const myProject = "MY PROJECTS";

  return (
    <div style={{ height: "100%", display: "grid", placeContent: "center" }}>
      <div ref={letterRef} className={classes.letterHolder}>
        {myProject.split("").map((letter, i) => {
          const indexOfLetter = letters.indexOf(letter);
          let transformValue;
          if (indexOfLetter !== -1) {
            transformValue = -indexOfLetter * 40;
          } else {
            transformValue = 40;
          }

          return (
            <div
              key={i}
              style={{
                "--transformValue": `${transformValue}px`,
                "--letterOrderNumber": i,
              }}
              className={classes.letter}
            >
              {letters.split("").map((alphabetLetter, j) => (
                <span key={j}>{alphabetLetter}</span>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default About;
