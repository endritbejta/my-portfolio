import { useInView } from "../hooks/useInView";
import { useCountUp } from "../hooks/useCountUp";
import classes from "./StatCounter.module.css";

/** Animated number that counts up when scrolled into view. */
const StatCounter = ({ value, suffix = "" }) => {
  const { ref, inView } = useInView({ threshold: 0.5 });
  const count = useCountUp(value, inView);

  return (
    <dt ref={ref} className={classes.value}>
      {count}
      {suffix}
    </dt>
  );
};

export default StatCounter;
