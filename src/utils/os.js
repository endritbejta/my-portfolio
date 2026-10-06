/**
 * Which kind of machine the visitor is on, for anything that should speak
 * their system's language — keyboard shortcut hints, window controls:
 *
 *   "mac"     macOS, and iPadOS / iOS (which share its conventions)
 *   "windows" Windows
 *   "other"   Linux, ChromeOS, Android and anything unrecognised — these get
 *             general, system-neutral treatments rather than a guess
 *
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
      if (forced === "mac" || forced === "windows" || forced === "other") return forced;
    } catch {
      // storage unavailable: fall through to detection
    }
  }

  if (typeof navigator === "undefined") return "mac";
  const platform = (navigator.userAgentData?.platform ?? navigator.platform ?? "").toLowerCase();
  const agent = navigator.userAgent ?? "";

  if (/mac|iphone|ipad|ipod/.test(platform) || /Macintosh|iPhone|iPad/.test(agent)) return "mac";
  if (/^win/.test(platform) || /Windows/.test(agent)) return "windows";
  return "other";
};
