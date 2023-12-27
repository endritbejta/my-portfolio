import React, { useRef } from "react";
import classes from "./About.module.css";
import { letters } from "../assets/data";
const About = () => {
  return (
    <section className={classes.About}>
      <h3 className={classes.name}>
        <span>Name:</span> Endrit
      </h3>
      <h3 className={classes.surname}>
        <span>Surname:</span> Bejta
      </h3>
      <p className={classes.bio}>
        <strong>Bio</strong>: A motivated new front end developer. Adept at
        problem-solving and with a meticulous attention to detail. Committed to
        innovation and growth, I am eager to take on new challenges and make a
        valuable contribution to any programming team.
      </p>
      <h3 className={classes.skills}>
        <span>Skills</span>
      </h3>
      <p style={{ "--skills-rating": "120%" }} className={classes.skill}>
        ReactJS
      </p>
      <p style={{ "--skills-rating": "100%" }} className={classes.skill}>
        JavaScript
      </p>
      <p style={{ "--skills-rating": "50%" }} className={classes.skill}>
        TypeScript
      </p>
      <p style={{ "--skills-rating": "100%" }} className={classes.skill}>
        CSS, SASS
      </p>
      <p style={{ "--skills-rating": "80%" }} className={classes.skill}>
        Tailwind
      </p>
      <p style={{ "--skills-rating": "100%" }} className={classes.skill}>
        Redux
      </p>
      <p className={classes.uni}>
        <strong>Univerisity:</strong> University of Pristina
      </p>
      <p className={classes.degree}>
        <strong>Degree:</strong> Bachelor of Electrical Engineering
      </p>
    </section>
  );
};

export default About;

//  const letterRef = useRef();
//  let firstLetter = [];
//  letters
//    .split("")
//    .forEach((letter, i) => firstLetter.push(<span key={i}>{letter}</span>));
//  console.log(letters.split(""));
//  const myProject = "MY PROJECTS";

//  return (
//    <div style={{ height: "100%", display: "grid", placeContent: "center" }}>
//      <div ref={letterRef} className={classes.letterHolder}>
//        {myProject.split("").map((letter, i) => {
//          const indexOfLetter = letters.indexOf(letter);
//          let transformValue;
//          if (indexOfLetter !== -1) {
//            transformValue = -indexOfLetter * 40;
//          } else {
//            transformValue = 40;
//          }

//          return (
//            <div
//              key={i}
//              style={{
//                "--transformValue": `${transformValue}px`,
//                "--letterOrderNumber": i,
//              }}
//              className={classes.letter}
//            >
//              {letters.split("").map((alphabetLetter, j) => (
//                <span key={j}>{alphabetLetter}</span>
//              ))}
//            </div>
//          );
//        })}
//      </div>
//    </div>
//  );
