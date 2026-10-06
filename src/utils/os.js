/**
 * Which window-control style suits the visitor's machine: macOS, iPadOS and
 * iOS get the traffic lights, everything else the Windows caption buttons.
 * `userAgentData` is the modern source; `platform` and the UA string cover
 * browsers without it (Safari, Firefox).
 */
export const detectOs = () => {
  // Development only: the temporary switch (src/dev/OsSwitch.jsx) can force a
  // style. `import.meta.env.DEV` is false in a production build, so this whole
  // branch is removed from it.
  if (import.meta.env.DEV) {
    try {
      const forced = localStorage.getItem("dev-os");
      if (forced === "mac" || forced === "windows") return forced;
    } catch {
      // storage unavailable: fall through to detection
    }
  }
  if (typeof navigator === "undefined") return "mac";
  const platform = (navigator.userAgentData?.platform ?? navigator.platform ?? "").toLowerCase();
  return /mac|iphone|ipad|ipod/.test(platform) || /Macintosh|iPhone|iPad/.test(navigator.userAgent)
    ? "mac"
    : "windows";
};

