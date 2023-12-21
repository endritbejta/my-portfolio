import Logo from "../components/Logo";
import Navigation from "../components/Navigation";
import Socials from "../components/Socials";
import classes from "./Header.module.css";
const Header = () => {
  return (
    <header className={classes.Header}>
      <Logo />
      <Navigation />
      <Socials />
    </header>
  );
};

export default Header;
