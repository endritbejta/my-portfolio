import { useEffect, useId, useRef } from "react";
import { FiInfo } from "react-icons/fi";
import classes from "./PreviewDialog.module.css";

/**
 * A small alert in the visitor's own OS style, shown *inside* the preview
 * container (the preview's way of saying "I can't be closed"). It is modal for
 * the container: everything else in it is made inert by the parent while this
 * is open, focus lands on OK, and Escape or Enter dismisses it.
 */
const PreviewDialog = ({ os, title, message, windowTitle, onClose }) => {
  const titleId = useId();
  const messageId = useId();
  const okRef = useRef(null);

  useEffect(() => {
    okRef.current?.focus();

    // Escape closes it wherever focus has wandered to, not only from inside.
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Clicking the dimmed area, or the alert's own text, shouldn't let focus
  // fall out of the dialog (Enter would then do nothing): any click that isn't
  // on OK itself keeps focus on OK.
  const keepFocus = (event) => {
    if (!okRef.current?.contains(event.target)) {
      event.preventDefault();
      okRef.current?.focus();
    }
  };

  const ok = (
    <button type="button" className={classes.ok} ref={okRef} onClick={onClose}>
      OK
    </button>
  );

  return (
    <div className={classes.scrim} onMouseDown={keepFocus}>
      <div
        className={`${classes.dialog} ${classes[os]}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
      >
        {os === "windows" ? (
          <>
            <div className={classes.titleBar}>
              <span>{windowTitle}</span>
            </div>
            <div className={classes.body}>
              <span className={classes.winIcon} aria-hidden="true">
                <FiInfo />
              </span>
              <div>
                <h2 id={titleId}>{title}</h2>
                <p id={messageId}>{message}</p>
              </div>
            </div>
            <div className={classes.footer}>{ok}</div>
          </>
        ) : (
          <>
            {os === "mac" ? (
              <span className={classes.appIcon} aria-hidden="true">
                EB
              </span>
            ) : (
              <span className={classes.genericIcon} aria-hidden="true">
                <FiInfo />
              </span>
            )}
            <h2 id={titleId}>{title}</h2>
            <p id={messageId}>{message}</p>
            {ok}
          </>
        )}
      </div>
    </div>
  );
};

export default PreviewDialog;
