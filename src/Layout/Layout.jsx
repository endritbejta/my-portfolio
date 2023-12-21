import React, { useRef } from "react";
import Header from "./Header";
import classes from "./Layout.module.css";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Home from "../pages/Home";

const Layout = () => {
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

  return (
    <div className={classes.Layout}>
      <span className={classes.pulse}></span>
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
