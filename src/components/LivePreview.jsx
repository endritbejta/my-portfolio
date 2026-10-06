import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  FiExternalLink,
  FiMaximize,
  FiMinimize,
  FiMonitor,
  FiPlay,
  FiRefreshCw,
  FiSmartphone,
} from "react-icons/fi";
import { isReducedMotion } from "../hooks/useMotionPreference";
import { useOs } from "../hooks/useOs";
import WindowControls from "./WindowControls";
import classes from "./LivePreview.module.css";

// The size the site is rendered at, then scaled down to fit. Rendering at a
// real viewport size is what makes the site's own breakpoints kick in.
const SIZES = {
  desktop: { width: 1280, height: 800 },
  // 375 x 780: a common phone size, a touch shorter than the tallest models so
  // the screen can be drawn larger in the room a window leaves.
  mobile: { width: 375, height: 780 },
};

// Slack left around the container so it never sits flush against the header
// or the bottom edge, and the smallest screen height worth drawing at all.
const BREATHING_ROOM = 12;
const MIN_SCREEN_HEIGHT = 150;

// Below this the desktop view would be scaled to an unreadable thumbnail.
const NARROW_PX = 700;

// If a site never reports that it has loaded, stop covering it with the
// cover image after this long and show whatever is there.
const GIVE_UP_MS = 15000;

// Loading a whole third-party site unasked is wrong for someone who has asked
// the browser to save data, or is on a very slow connection.
const mayAutoload = () => {
  const connection = typeof navigator !== "undefined" ? navigator.connection : undefined;
  if (!connection) return true;
  return !connection.saveData && !/(^|-)2g$/.test(connection.effectiveType ?? "");
};

// Element fullscreen, with Safari's prefixed names. iPhones implement none of
// it for ordinary elements, which is why there is a fallback (see `enterFull`).
const canUseNativeFullscreen = () =>
  typeof document !== "undefined" &&
  Boolean(document.fullscreenEnabled || document.webkitFullscreenEnabled);
const fullscreenElement = () =>
  document.fullscreenElement ?? document.webkitFullscreenElement ?? null;

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
 * switch. Nothing is fetched from the third-party site until the preview
 * scrolls into view, so visitors who never get that far cost it nothing; it
 * then loads by itself. Where the browser asks to save data (or the connection
 * is very slow) it waits for the visitor to press play instead. The cover
 * image stays on screen until the site has loaded, so a slow site shows a
 * picture rather than an empty frame. All of that needs a site that allows
 * framing — see `preview` in src/data/projects.js and `npm run check:embed`.
 *
 * Without `embed` (the site blocks framing) it shows the cover image in the
 * same frame as a link to the live site.
 *
 * A fullscreen button fills the screen with the frame — the browser's own
 * fullscreen where it exists, otherwise a full-window overlay (iPhones).
 */
const LivePreview = ({ url, title, cover, coverMobile, embed }) => {
  const [device, setDevice] = useState(() =>
    embed && typeof window !== "undefined" && window.innerWidth < NARROW_PX
      ? "mobile"
      : "desktop"
  );
  const [loaded, setLoaded] = useState(false); // iframe requested
  const [ready, setReady] = useState(false); // iframe finished loading
  const [reloads, setReloads] = useState(0);
  const [nativeFull, setNativeFull] = useState(false); // browser fullscreen
  const [fakeFull, setFakeFull] = useState(false); // full-window overlay fallback
  const [slotHeight, setSlotHeight] = useState(0); // space held open while fullscreen
  const [minimized, setMinimized] = useState(false); // folded down to the title bar
  const [dismissed, setDismissed] = useState(false); // closed: don't autoload again
  const os = useOs();
  const [room, setRoom] = useState({ width: 0, height: 0, padX: 0, padY: 0, bezel: 0 });
  const rootRef = useRef(null);
  const viewportRef = useRef(null);
  const toolbarRef = useRef(null);
  const noteRef = useRef(null);
  const stageRef = useRef(null);

  const full = nativeFull || fakeFull;
  // Read by `measure`, which the observers below hold on to from first render.
  const fullRef = useRef(false);
  fullRef.current = full;

  // How much room the screen has: the stage's width, and the height left in
  // the window once the sticky header and this container's own toolbar and
  // caption are taken out — so the whole container fits on screen at once.
  // The stage's padding and the phone's bezel are read from the rendered
  // styles rather than hard-coded, because the CSS shrinks both on small
  // screens.
  const measure = () => {
    const stage = stageRef.current;
    // No width means the stage is hidden (minimized): keep the last size so
    // it comes back right.
    if (!stage || !stage.clientWidth) return;
    // Fullscreen covers the page header, and has no page around it to leave
    // room for.
    const header = fullRef.current ? 0 : document.querySelector("header")?.offsetHeight ?? 0;
    const chrome =
      (toolbarRef.current?.offsetHeight ?? 0) + (noteRef.current?.offsetHeight ?? 0) + 2;
    const height =
      window.innerHeight - header - chrome - (fullRef.current ? 0 : BREATHING_ROOM);

    const stageStyle = getComputedStyle(stage);
    const padX = parseFloat(stageStyle.paddingLeft) + parseFloat(stageStyle.paddingRight);
    const padY = parseFloat(stageStyle.paddingTop) + parseFloat(stageStyle.paddingBottom);
    const bezel = viewportRef.current
      ? parseFloat(getComputedStyle(viewportRef.current).borderTopWidth) * 2
      : 0;

    const next = { width: stage.clientWidth, height, padX, padY, bezel };
    setRoom((previous) =>
      Object.keys(next).every((key) => previous[key] === next[key]) ? previous : next
    );
  };

  // Before paint, so the first frame is already the right size. Re-run when
  // the device flips: the stage's padding and the bezel differ between them.
  useLayoutEffect(measure, [device, full]);

  useEffect(() => {
    const observer = new ResizeObserver(measure);
    [rootRef, toolbarRef, noteRef].forEach((ref) => ref.current && observer.observe(ref.current));
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Follow the browser's own fullscreen, including leaving it with Escape.
  useEffect(() => {
    const sync = () => setNativeFull(fullscreenElement() === rootRef.current);
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, []);

  // The overlay fallback has to do what native fullscreen does for free:
  // stop the page scrolling behind it, and close on Escape.
  useEffect(() => {
    if (!fakeFull) return undefined;
    const onKeyDown = (event) => event.key === "Escape" && setFakeFull(false);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [fakeFull]);

  const enterFull = async () => {
    if (embed) setLoaded(true);
    const root = rootRef.current;
    // Fullscreen takes the container out of the page flow. Without something
    // holding its place the page would shrink by its height and scroll out
    // from under the visitor, who'd come back to the wrong place.
    if (root) setSlotHeight(root.offsetHeight);
    if (canUseNativeFullscreen() && root) {
      try {
        await (root.requestFullscreen ?? root.webkitRequestFullscreen).call(root);
        return;
      } catch {
        // Refused (permissions policy, no user gesture): use the overlay.
      }
    }
    setFakeFull(true);
  };

  const exitFull = () => {
    if (fullscreenElement()) (document.exitFullscreen ?? document.webkitExitFullscreen).call(document);
    setFakeFull(false);
  };

  // Load when the container comes into view — not on page load.
  useEffect(() => {
    const root = rootRef.current;
    if (!embed || loaded || dismissed || !root || !mayAutoload()) return undefined;
    if (typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoaded(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [embed, loaded, dismissed]);

  // A site that never fires `load` shouldn't be hidden behind a picture forever.
  useEffect(() => {
    if (!loaded || ready) return undefined;
    const timer = setTimeout(() => setReady(true), GIVE_UP_MS);
    return () => clearTimeout(timer);
  }, [loaded, ready, reloads]);

  const size = SIZES[device];
  const stageWidth = room.width;
  const widthForScreen = stageWidth - room.padX - room.bezel;
  const heightForScreen = Math.max(MIN_SCREEN_HEIGHT, room.height - room.padY - room.bezel);
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

  const reload = () => {
    setReady(false);
    setReloads((count) => count + 1);
  };

  // Keyboard shortcuts, deliberately unadvertised (they're a convenience, not
  // the interface): F fullscreen, M minimize, R reload, Esc restore. They only
  // act while the preview is in use — pointer over it, focus inside it, or
  // fullscreen — never while typing, and never with Ctrl/Cmd/Alt, so they
  // can't collide with the browser's or the page's own shortcuts. Keys typed
  // *into* the embedded site go to that site and never reach this page.
  const shortcuts = useRef({});
  shortcuts.current = {
    toggleFull: () => (fullRef.current ? exitFull() : enterFull()),
    toggleMinimize: () => setMinimized((value) => !value),
    restore: () => setMinimized(false),
    reload: () => loaded && reload(),
    minimized,
  };

  useEffect(() => {
    if (!embed) return undefined;

    const onKeyDown = (event) => {
      if (event.defaultPrevented || event.repeat) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target;
      const typing =
        target instanceof HTMLElement &&
        (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      if (typing) return;

      const root = rootRef.current;
      const inUse =
        fullRef.current || root?.matches(":hover") || root?.contains(document.activeElement);
      if (!root || !inUse) return;

      const actions = shortcuts.current;
      const key = event.key.toLowerCase();
      if (key === "f") actions.toggleFull();
      else if (key === "m") actions.toggleMinimize();
      else if (key === "r") actions.reload();
      else if (key === "escape" && actions.minimized) actions.restore();
      else return;
      event.preventDefault();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [embed]);

  const load = () => {
    setDismissed(false);
    setMinimized(false);
    setLoaded(true);
    bringIntoView();
  };

  // Close: unload the site and go back to the poster. `dismissed` stops the
  // autoload from immediately loading it again — only pressing play does.
  const closeWindow = () => {
    exitFull();
    setLoaded(false);
    setReady(false);
    setDismissed(true);
    setMinimized(false);
  };

  const controls = embed ? (
    <WindowControls
      os={os}
      minimized={minimized}
      fullscreen={full}
      onClose={closeWindow}
      onMinimize={() => setMinimized((value) => !value)}
      onToggleFullscreen={full ? exitFull : enterFull}
    />
  ) : null;

  const poster = device === "mobile" ? coverMobile ?? cover : cover;

  const host = hostOf(url);

  return (
    <div className={classes.slot} style={full ? { height: slotHeight } : undefined}>
      <div
        className={classes.preview}
        ref={rootRef}
        data-full={nativeFull ? "native" : fakeFull ? "fake" : undefined}
        data-minimized={minimized ? "" : undefined}
      >
        <div className={classes.toolbar} ref={toolbarRef} data-os={embed ? os : undefined}>
          {controls && os === "mac" ? (
            controls
          ) : (
            <span className={classes.lights} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          )}
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
              onClick={reload}
              disabled={!loaded}
              aria-keyshortcuts="R"
              aria-label="Reload preview"
              title="Reload preview"
            >
              <FiRefreshCw aria-hidden="true" />
            </button>
          )}
          {embed && (
            <button
              type="button"
              className={`${classes.iconButton} ${classes.fullscreenButton}`}
              onClick={full ? exitFull : enterFull}
              aria-keyshortcuts="F"
              aria-label={full ? "Exit fullscreen" : "View fullscreen"}
              title={full ? "Exit fullscreen" : "Fullscreen"}
            >
              {full ? <FiMinimize aria-hidden="true" /> : <FiMaximize aria-hidden="true" />}
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
          {controls && os === "windows" && controls}
        </div>

        <div className={classes.stage} ref={stageRef} data-device={device}>
          <div
            className={classes.viewport}
            ref={viewportRef}
            style={{
              width: size.width * scale,
              height: size.height * scale,
              visibility: stageWidth ? "visible" : "hidden",
            }}
          >
            {embed && loaded && (
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
                  onLoad={() => setReady(true)}
                />
              </div>
            )}

            {embed ? (
              // Outside the scaled layer on purpose: the label stays a normal
              // size however far the site itself is scaled down. It covers the
              // iframe until the site has loaded, then fades out.
              <div
                className={classes.poster}
                data-state={ready ? "done" : loaded ? "loading" : "idle"}
                onClick={loaded ? undefined : load}
                aria-hidden={ready ? "true" : undefined}
              >
                {poster && <img src={poster} alt="" decoding="async" />}
                {loaded ? (
                  <span className={classes.status} role="status">
                    Loading the live site…
                  </span>
                ) : (
                  <button
                    type="button"
                    className={classes.play}
                    onClick={(event) => {
                      event.stopPropagation();
                      load();
                    }}
                    aria-label={`Load the live ${title} site`}
                  >
                    <FiPlay aria-hidden="true" />
                    Load live preview
                  </button>
                )}
              </div>
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
            : !loaded
              ? `Press play to load the real site from ${host}.`
              : ready
                ? "Live and interactive. Some features may be limited when a site is embedded."
                : `Loading ${host}…`}
        </p>
      </div>
    </div>
  );
};

export default LivePreview;
