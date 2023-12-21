import classes from "./Logo.module.css";

const Logo = () => {
  return (
    <div className={classes.Logo}>
      <p className={classes.letterE}>E</p>
      <p className={classes.name}>Endrit</p>
      <p className={classes.profession}>Web development</p>
    </div>
  );
};

export default Logo;
