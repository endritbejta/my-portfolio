import React from "react";
import Header from "./Header";
import classes from "./Layout.module.css";
const Layout = () => {
  return (
    <div className={classes.Layout}>
      <Header />
      <hr />
      <main style={{ flex: "6" }}></main>
    </div>
  );
};

export default Layout;
