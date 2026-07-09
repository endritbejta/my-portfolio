import classes from "./Button.module.css";

const VARIANTS = {
  primary: classes.primary,
  secondary: classes.secondary,
  ghost: classes.ghost,
};

/**
 * Renders an <a> when `href` is given, a router-agnostic <button> otherwise.
 * External links get rel/target handled automatically.
 */
const Button = ({
  href,
  variant = "primary",
  size = "md",
  icon,
  children,
  className = "",
  ...rest
}) => {
  const isExternal = href && /^https?:\/\//.test(href);
  const cls = [
    classes.button,
    VARIANTS[variant] ?? VARIANTS.primary,
    size === "sm" ? classes.sm : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {icon && (
        <span className={classes.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={cls}
        {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
        {...rest}
      >
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={cls} {...rest}>
      {content}
    </button>
  );
};

export default Button;
