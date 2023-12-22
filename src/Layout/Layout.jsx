import React, { useRef, useState } from "react";
import Header from "./Header";
import classes from "./Layout.module.css";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Home from "../pages/Home";
import { FaPause } from "react-icons/fa";

const Layout = () => {
  const [isRecording, setIsRecording] = useState(true);
  const blobRef = useRef();
  console.log(blobRef);
  document.body.onpointermove = (event) => {
    const { clientX, clientY } = event;
    blobRef.current.style.left = `${clientX}px`;
    blobRef.current.style.top = `${clientY}px`;

    blobRef.current.animate(
      {
        left: `${clientX}px`,
        top: `${clientY}px`,
      },
      {
        duration: 4000,
        fill: "forwards",
      }
    );
  };

  function pauseRecording() {
    console.log("isRecording: ", isRecording);
    setIsRecording((prev) => !prev);
  }

  return (
    <div className={classes.Layout}>
      <div onClick={pauseRecording} className={classes.live}>
        <p>{isRecording ? "REC" : "PAUSED"}</p>
        {isRecording ? (
          <span className={classes.pulse}></span>
        ) : (
          <FaPause style={{ color: "red", fontSize: "16px" }} />
        )}
      </div>
      <div className={classes.blob} ref={blobRef}></div>
      <div className={classes.blur}></div>
      <Header />
      <hr />
      <main className={classes.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
