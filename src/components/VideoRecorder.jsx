import React, { useEffect, useState } from "react";
import classes from "./VideoRecorder.module.css";
import { FaPlay, FaPause } from "react-icons/fa";
import { MdReplay } from "react-icons/md";

const VideoRecorder = ({ isRecording, setIsRecording }) => {
  const [counter, setCounter] = useState(0);
  const [counterInterval, setCounterInterval] = useState(null);
  const [formattedTime, setFormattedTime] = useState("00:00");

  const increaseCounter = () => {
    console.log("running");
    setCounter((prev) => prev + 1);
  };

  const startTimer = () => {
    console.log("counter:", counter);
    setCounterInterval(setInterval(() => increaseCounter(), 1000));
    setIsRecording(true);
  };

  const resetTimer = () => {
    setCounter(0);
    clearInterval(counterInterval);
    setIsRecording(false);
  };

  const stopTimer = () => {
    clearInterval(counterInterval);
    setIsRecording(false);
  };
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
    console.log(formattedMinutes, formattedSeconds);
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  useEffect(() => {
    setFormattedTime(formatTime(counter));
  }, [counter]);

  return (
    <div className={classes.VideoRecorder}>
      {/* <p onClick={startTimer}>
        <FaPlay />
      </p>
      <p onClick={stopTimer}>
        <FaPause />
      </p>
      <p onClick={resetTimer}>
        <MdReplay />
      </p>
      <p>{formattedTime}</p> */}
      <span>REC</span>
      <span className={classes.pulse}></span>
    </div>
  );
};

export default VideoRecorder;
