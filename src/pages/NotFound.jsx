import Button from "../components/ui/Button";
import classes from "./NotFound.module.css";

const NotFound = () => (
  <div className={`container ${classes.page}`}>
    <p className={classes.code}>404</p>
    <h1>This page doesn't exist</h1>
    <p className={classes.hint}>
      The link may be old — everything lives on the home page now.
    </p>
    <Button href="/">Back to home</Button>
  </div>
);

export default NotFound;
