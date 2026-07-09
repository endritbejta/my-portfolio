import { useEffect, useRef, useState } from "react";

/**
 * Observes an element and flips to true once it enters the viewport.
 * One-shot by design: reveal animations shouldn't replay on scroll-up.
 */
export function useInView({ threshold = 0.15, rootMargin = "0px 0px -40px" } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || inView) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, inView]);

  return { ref, inView };
}
