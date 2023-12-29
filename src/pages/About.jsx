import React, { useEffect } from "react";
import classes from "./About.module.css";
import { FaEnvelope, FaFile } from "react-icons/fa";
import { useLocation } from "react-router";
import cv from "../assets/pdf/endrit_bejtaCV.pdf";
const About = () => {
  const location = useLocation();
  const cameFromButtonClick = location.search === "?contact";
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);
  return (
    <section className={classes.About}>
      <h3 className={classes.name}>
        <strong>Name:</strong> Endrit
      </h3>
      <h3 className={classes.surname}>
        <strong>Surname:</strong> Bejta
      </h3>

      <a href="mailto:endrit.bejta@hotmail.com">
        <p className={classes.email}>
          <strong>
            Email <FaEnvelope style={{ marginLeft: "10px" }} />:
          </strong>{" "}
          <span className={`${cameFromButtonClick ? classes.fromButton : ""}`}>
            endrit.bejta@hotmail.com
          </span>
        </p>
      </a>

      <a href={cv} download={"Endrit Bejta CV"} className={classes.cvDownload}>
        <p className={classes.cvDownload}>
          <strong>
            CV <FaFile />:
          </strong>{" "}
          <span>Click to download my CV</span>
        </p>
      </a>

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

      <h3 style={{ marginBlock: "10px" }} className={classes.courses}>
        Courses
      </h3>
      <a
        href="https://www.udemy.com/course/react-the-complete-guide-incl-redux/"
        target="_blank"
        className={classes.course}
      >
        <strong>ReactJS: </strong>React - The Complete Guide 2023 (incl. React
        Router & Redux)
      </a>
      <a
        href="https://www.udemy.com/course/the-complete-javascript-course/"
        target="_blank"
        className={classes.course}
      >
        <strong>JavaScript: </strong>The Complete JavaScript Course 2024: From
        Zero to Expert!
      </a>
      <a
        href="https://www.udemy.com/course/the-complete-javascript-course/"
        target="_blank"
        className={classes.course}
      >
        <strong>CSS: </strong>CSS - The Complete Guide 2023 (incl. Flexbox, Grid
        & Sass)
      </a>
      <p className={classes.bio}>
        <strong>Bio</strong>: A motivated new front end developer. Adept at
        problem-solving and with a meticulous attention to detail. Committed to
        innovation and growth, I am eager to take on new challenges and make a
        valuable contribution to any programming team.
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
