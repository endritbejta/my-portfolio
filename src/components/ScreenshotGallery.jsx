import { useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import classes from "./ScreenshotGallery.module.css";

const hostOf = (url) => {
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
};

/** A screenshot in a minimal browser frame (desktop) or phone frame (mobile). */
const Shot = ({ image, title, host, featured, onOpen }) => (
  <figure
    className={`${classes.figure} ${image.mobile ? classes.phone : classes.browser} ${
      featured ? classes.featured : ""
    }`}
  >
    <button
      type="button"
      className={classes.frame}
      onClick={onOpen}
      aria-label={`Enlarge: ${image.caption}`}
    >
      {!image.mobile && (
        <span className={classes.chrome} aria-hidden="true">
          <i />
          <i />
          <i />
          {host && <span className={classes.url}>{host}</span>}
        </span>
      )}
      <img
        src={image.src}
        alt={`${title} — ${image.caption}`}
        loading="lazy"
        decoding="async"
        width={image.mobile ? 390 : 1440}
        height={image.mobile ? 844 : 900}
      />
    </button>
    <figcaption>{image.caption}</figcaption>
  </figure>
);

/**
 * Screenshot walkthrough for a case study: the first desktop shot large,
 * the rest in a grid, mobile shots in a row — all open in one lightbox.
 */
const ScreenshotGallery = ({ images, title, liveUrl }) => {
  const [active, setActive] = useState(null);
  const dialogRef = useRef(null);
  const host = hostOf(liveUrl);

  const desktop = images.filter((image) => !image.mobile);
  const mobile = images.filter((image) => image.mobile);
  const ordered = [...desktop, ...mobile];

  const open = (image) => setActive(ordered.indexOf(image));
  const step = (direction) =>
    setActive((index) => (index + direction + ordered.length) % ordered.length);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (active !== null && !dialog.open) dialog.showModal();
    if (active === null && dialog.open) dialog.close();
  }, [active]);

  const onKeyDown = (event) => {
    if (event.key === "ArrowRight") step(1);
    if (event.key === "ArrowLeft") step(-1);
  };

  // Clicking the dimmed backdrop (the dialog element itself) closes it.
  const onDialogClick = (event) => {
    if (event.target === dialogRef.current) setActive(null);
  };

  const current = active !== null ? ordered[active] : null;

  return (
    <>
      <div className={classes.gallery}>
        {desktop.map((image, index) => (
          <Shot
            key={image.src}
            image={image}
            title={title}
            host={host}
            featured={index === 0}
            onOpen={() => open(image)}
          />
        ))}
      </div>

      {mobile.length > 0 && (
        <div className={classes.phones}>
          {mobile.map((image) => (
            <Shot key={image.src} image={image} title={title} onOpen={() => open(image)} />
          ))}
        </div>
      )}

      <dialog
        ref={dialogRef}
        className={classes.lightbox}
        aria-label={`${title} screenshots`}
        onClose={() => setActive(null)}
        onClick={onDialogClick}
        onKeyDown={onKeyDown}
      >
        {current && (
          <div className={classes.lightboxInner}>
            <img src={current.src} alt={`${title} — ${current.caption}`} />
            <p>
              {current.caption}{" "}
              <span className={classes.count}>
                {active + 1} / {ordered.length}
              </span>
            </p>
            <button
              type="button"
              className={`${classes.nav} ${classes.close}`}
              onClick={() => setActive(null)}
              aria-label="Close"
            >
              <FiX />
            </button>
            {ordered.length > 1 && (
              <>
                <button
                  type="button"
                  className={`${classes.nav} ${classes.prev}`}
                  onClick={() => step(-1)}
                  aria-label="Previous screenshot"
                >
                  <FiChevronLeft />
                </button>
                <button
                  type="button"
                  className={`${classes.nav} ${classes.next}`}
                  onClick={() => step(1)}
                  aria-label="Next screenshot"
                >
                  <FiChevronRight />
                </button>
              </>
            )}
          </div>
        )}
      </dialog>
    </>
  );
};

export default ScreenshotGallery;
