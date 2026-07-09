import { useInView } from "../../hooks/useInView";

/**
 * Scroll-triggered reveal wrapper. Styling lives in global.css (.reveal);
 * prefers-reduced-motion disables it entirely there.
 */
const Reveal = ({ as: Tag = "div", delay = 0, className = "", children, ...rest }) => {
  const { ref, inView } = useInView();

  return (
    <Tag
      ref={ref}
      style={delay ? { "--reveal-delay": `${delay}ms` } : undefined}
      className={["reveal", inView ? "is-visible" : "", className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
