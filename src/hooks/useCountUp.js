import { useEffect, useState } from "react";
import { prefersReducedMotion } from "../utils/motion";

/**
 * Animates 0 → target once `start` becomes true.
 * Respects prefers-reduced-motion by jumping straight to the target.
 */
export function useCountUp(target, start, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return undefined;
    if (prefersReducedMotion()) {
      setValue(target);
      return undefined;
    }

    let frame;
    const startTime = performance.now();

    const tick = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, start, duration]);

  return value;
}
