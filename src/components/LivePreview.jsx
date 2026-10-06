import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FiExternalLink, FiMonitor, FiPlay, FiRefreshCw, FiSmartphone } from "react-icons/fi";
import classes from "./LivePreview.module.css";

// The size the site is rendered at, then scaled down to fit. Rendering at a
// real viewport size is what makes the site's own breakpoints kick in.
const SIZES = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 390, height: 844 },
};

// A phone taller than this stops being a preview and starts being a scroll.
const MAX_PHONE_HEIGHT = 700;

// Below this the desktop view would be scaled to an unreadable thumbnail.
const NARROW_PX = 700;

const hostOf = (url) => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};

/**
 * A live, interactive embed of a deployed site in a browser/phone frame, with
 * a Desktop / Mobile switch. Loads only on request: nothing is fetched from
 * the third-party site until the visitor presses the play button, which keeps
 * case-study pages fast and spares slow or sleeping back ends.
 *
 * Only usable for sites that allow framing — see `preview` in
 * src/data/projects.js and `npm run check:embed`.
 */
const LivePreview = ({ url, title, images }) => {
  const [device, setDevice] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < NARROW_PX ? "mobile" : "desktop"
  );
  const [loaded, setLoaded] = useState(false);
  const [reloads, setReloads] = useState(0);
  const [stageWidth, setStageWidth] = useState(0);
  const stageRef = useRef(null);

  // Measured before paint so the first frame is already the right size.
  useLayoutEffect(() => {
    if (stageRef.current) setStageWidth(stageRef.current.clientWidth);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const observer = new ResizeObserver(([entry]) => setStageWidth(entry.contentRect.width));
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const size = SIZES[device];
  const fit = stageWidth ? stageWidth / size.width : 1;
  const heightCap = device === "mobile" ? MAX_PHONE_HEIGHT / size.height : 1;
  const scale = Math.min(1, fit, heightCap);

  const poster =
    device === "mobile"
      ? images.find((image) => image.mobile) ?? images[0]
      : images.find((image) => !image.mobile) ?? images[0];

  const host = hostOf(url);

  return (
    <div className={classes.preview}>
      <div className={classes.toolbar}>
        <span className={classes.lights} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className={classes.url}>{host}</span>

        <div className={classes.devices} role="group" aria-label="Preview size">
          <button
            type="button"
            aria-pressed={device === "desktop"}
            onClick={() => setDevice("desktop")}
          >
            <FiMonitor aria-hidden="true" /> <span>Desktop</span>
          </button>
          <button
            type="button"
            aria-pressed={device === "mobile"}
            onClick={() => setDevice("mobile")}
          >
            <FiSmartphone aria-hidden="true" /> <span>Mobile</span>
          </button>
        </div>

        <button
          type="button"
          className={classes.iconButton}
          onClick={() => setReloads((count) => count + 1)}
          disabled={!loaded}
          aria-label="Reload preview"
          title="Reload preview"
        >
          <FiRefreshCw aria-hidden="true" />
        </button>
        <a
          className={classes.iconButton}
          href={url}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${host} in a new tab`}
          title="Open in a new tab"
        >
          <FiExternalLink aria-hidden="true" />
        </a>
      </div>

      <div className={classes.stage} ref={stageRef} data-device={device}>
        <div
          className={classes.viewport}
          style={{
            width: size.width * scale,
            height: size.height * scale,
            visibility: stageWidth ? "visible" : "hidden",
          }}
        >
          {loaded ? (
            <div
              className={classes.screen}
              style={{
                width: size.width,
                height: size.height,
                transform: `scale(${scale})`,
              }}
            >
              <iframe
                key={reloads}
                className={classes.frame}
                src={url}
                title={`${title} — live preview, ${device} view`}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          ) : (
            // Outside the scaled layer on purpose: the button stays a normal
            // size however far the site itself is scaled down.
            <button
              type="button"
              className={classes.poster}
              onClick={() => setLoaded(true)}
              aria-label={`Load the live ${title} site`}
            >
              {poster && <img src={poster.src} alt="" decoding="async" />}
              <span className={classes.play}>
                <FiPlay aria-hidden="true" />
                Load live preview
              </span>
            </button>
          )}
        </div>
      </div>

      <p className={classes.note}>
        {loaded
          ? "Live and interactive. Some features may be limited when a site is embedded."
          : `Loads the real site from ${host} — nothing is fetched until you press play.`}
      </p>
    </div>
  );
};

export default LivePreview;
