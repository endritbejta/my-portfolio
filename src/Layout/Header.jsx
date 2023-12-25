import { useState } from "react";
import Logo from "../components/Logo";
import Navigation from "../components/Navigation";
import Socials from "../components/Socials";
import classes from "./Header.module.css";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Header = () => {
  const [headerHidden, setHeaderHidden] = useState(false);

  function toggleHeader() {
    setHeaderHidden((prev) => !prev);
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
      <Navigation />
      <Socials />
    </header>
  );
};

export default Header;
