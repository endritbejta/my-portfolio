import { NavLink } from "react-router-dom";
import classes from "./Logo.module.css";

const Logo = () => {
  return (
    <NavLink to={''} className={classes.Logo}>
      <p className={classes.letterE}>E</p>
      <p className={classes.name}>Endrit</p>
      <p className={classes.profession}>Web development</p>
    </NavLink>
  );
};

export default Logo;
