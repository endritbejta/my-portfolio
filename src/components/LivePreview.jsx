import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FiExternalLink, FiMonitor, FiPlay, FiRefreshCw, FiSmartphone } from "react-icons/fi";
import { isReducedMotion } from "../hooks/useMotionPreference";
import classes from "./LivePreview.module.css";

// The size the site is rendered at, then scaled down to fit. Rendering at a
// real viewport size is what makes the site's own breakpoints kick in.
const SIZES = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 390, height: 844 },
};

// Padding the stage adds around a phone (1.25rem each side) and the phone's
// own bezel (7px each side) — both eat into the room the screen can have.
const PHONE_STAGE_PADDING = 40;
const PHONE_BEZEL = 14;

// Slack left around the container so it never sits flush against the header
// or the bottom edge, and the smallest screen height worth drawing at all.
const BREATHING_ROOM = 16;
const MIN_SCREEN_HEIGHT = 150;

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
 * A deployed site in a browser/phone frame. The whole container is sized to
 * fit the visible window (below the sticky header), so it can always be seen
 * at once.
 *
 * With `embed`, it is a live, interactive iframe with a Desktop / Mobile
 * switch. It loads only on request: nothing is fetched from the third-party
 * site until the visitor presses play, which keeps case-study pages fast and
 * spares slow or sleeping back ends. That needs a site that allows framing —
 * see `preview` in src/data/projects.js and `npm run check:embed`.
 *
 * Without `embed` (the site blocks framing) it shows the cover image in the
 * same frame as a link to the live site.
 */
const LivePreview = ({ url, title, cover, coverMobile, embed }) => {
  const [device, setDevice] = useState(() =>
    embed && typeof window !== "undefined" && window.innerWidth < NARROW_PX
      ? "mobile"
      : "desktop"
  );
  const [loaded, setLoaded] = useState(false);
  const [reloads, setReloads] = useState(0);
  const [room, setRoom] = useState({ width: 0, height: 0 });
  const rootRef = useRef(null);
  const toolbarRef = useRef(null);
  const noteRef = useRef(null);
  const stageRef = useRef(null);

  // How much room the screen has: the stage's width, and the height left in
  // the window once the sticky header and this container's own toolbar and
  // caption are taken out — so the whole container fits on screen at once.
  const measure = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const header = document.querySelector("header")?.offsetHeight ?? 0;
    const chrome =
      (toolbarRef.current?.offsetHeight ?? 0) + (noteRef.current?.offsetHeight ?? 0) + 2;
    const height = window.innerHeight - header - chrome - BREATHING_ROOM;
    setRoom((previous) =>
      previous.width === stage.clientWidth && previous.height === height
        ? previous
        : { width: stage.clientWidth, height }
    );
  };

  // Before paint, so the first frame is already the right size.
  useLayoutEffect(measure, []);

  useEffect(() => {
    const observer = new ResizeObserver(measure);
    [rootRef, toolbarRef, noteRef].forEach((ref) => ref.current && observer.observe(ref.current));
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const size = SIZES[device];
  const isPhone = device === "mobile";
  const stageWidth = room.width;
  const phoneExtra = isPhone ? PHONE_BEZEL : 0;
  const widthForScreen = stageWidth - (isPhone ? PHONE_STAGE_PADDING + phoneExtra : 0);
  const heightForScreen = Math.max(
    MIN_SCREEN_HEIGHT,
    room.height - (isPhone ? PHONE_STAGE_PADDING + phoneExtra : 0)
  );
  const scale = stageWidth
    ? Math.min(1, widthForScreen / size.width, heightForScreen / size.height)
    : 1;

  // Pressing play should leave the whole container in view, not half of it.
  // Not scrollIntoView: that centres in the window, and the top of the window
  // is the sticky header, so the container's top edge would end up under it.
  const bringIntoView = () => {
    const root = rootRef.current;
    if (!root) return;
    const header = document.querySelector("header")?.offsetHeight ?? 0;
    const { top, height } = root.getBoundingClientRect();
    const visible = window.innerHeight - header;
    const wanted = header + Math.max(0, (visible - height) / 2);
    if (top < header || top + height > window.innerHeight) {
      window.scrollBy({ top: top - wanted, behavior: isReducedMotion() ? "auto" : "smooth" });
    }
  };

  const load = () => {
    setLoaded(true);
    bringIntoView();
  };

  const poster = isPhone ? coverMobile ?? cover : cover;

  const host = hostOf(url);

  return (
    <div className={classes.preview} ref={rootRef}>
      <div className={classes.toolbar} ref={toolbarRef}>
        <span className={classes.lights} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className={classes.url}>{host}</span>

        {embed && (
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
        )}

        {embed && (
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
        )}
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
          {embed && loaded ? (
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
          ) : embed ? (
            // Outside the scaled layer on purpose: the button stays a normal
            // size however far the site itself is scaled down.
            <button
              type="button"
              className={classes.poster}
              onClick={load}
              aria-label={`Load the live ${title} site`}
            >
              {poster && <img src={poster} alt="" decoding="async" />}
              <span className={classes.play}>
                <FiPlay aria-hidden="true" />
                Load live preview
              </span>
            </button>
          ) : (
            <a
              className={classes.poster}
              href={url}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open the live ${title} site in a new tab`}
            >
              {poster && <img src={poster} alt={`${title} home page`} decoding="async" />}
              <span className={classes.play}>
                <FiExternalLink aria-hidden="true" />
                Open live site
              </span>
            </a>
          )}
        </div>
      </div>

      <p className={classes.note} ref={noteRef}>
        {!embed
          ? "This site can't be shown embedded, so this is a snapshot of its home page."
          : loaded
            ? "Live and interactive. Some features may be limited when a site is embedded."
            : `Loads the real site from ${host} — nothing is fetched until you press play.`}
      </p>
    </div>
  );
};

export default LivePreview;
