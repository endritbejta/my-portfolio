import { useEffect, useState } from "react";
import Logo from "../components/Logo";
import Navigation from "../components/Navigation";
import Socials from "../components/Socials";
import classes from "./Header.module.css";
import { TbMenuDeep } from "react-icons/tb";

const Header = () => {
  const [showNavigation, setShowNavigation] = useState(false);

  useEffect(() => {
    if (showNavigation) {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "auto";
    }
  }, [showNavigation]);

  function toggleNavigation() {
    setShowNavigation((prev) => !prev);
  }

  return (
    <header className={`${classes.Header}`}>
      {/* <span
        onClick={toggleHeader}
        className={`${classes.action} ${classes.left} ${
          headerHidden ? classes.leftClicked : ""
        }`}
      >
        <FiChevronLeft />
      </span>
      <span
        onClick={toggleHeader}
        className={`${classes.action} ${classes.right} ${
          !headerHidden ? classes.rightClicked : ""
        }`}
      >
        <FiChevronRight />
      </span> */}
      <Logo />
      <span onClick={toggleNavigation} className={classes.toggleNav}>
        <TbMenuDeep />
      </span>
      <Navigation
        showNavigation={showNavigation}
        toggleNavigation={toggleNavigation}
      />
      <Socials />
    </header>
  );
};

export default Header;
