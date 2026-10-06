/**
 * DEVELOPMENT ONLY, TEMPORARY. A small switch to preview the OS-dependent
 * bits — the live preview's window controls and the navbar's shortcut hint —
 * as macOS, Windows or any other system (or the detected one).
 *
 * It is loaded lazily behind `import.meta.env.DEV` in src/App.jsx, so it is not
 * part of a production build. To remove it: delete this file, the `OsSwitch`
 * lines in App.jsx, and the `dev-os` branch in src/utils/os.js.
 */
const OPTIONS = [
  ["auto", "Auto"],
  ["mac", "macOS"],
  ["windows", "Windows"],
  ["other", "Linux/other"],
];

const current = () => {
  try {
    return localStorage.getItem("dev-os") ?? "auto";
  } catch {
    return "auto";
  }
};

const choose = (value) => {
  try {
    if (value === "auto") localStorage.removeItem("dev-os");
    else localStorage.setItem("dev-os", value);
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event("dev-os-change"));
};

const OsSwitch = () => {
  const selected = current();

  return (
    <div
      role="group"
      aria-label="Development: operating system style"
      style={{
        position: "fixed",
        left: 12,
        bottom: 12,
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        gap: 2,
        padding: 3,
        borderRadius: 999,
        background: "rgba(20, 20, 24, 0.92)",
        color: "#fff",
        font: "600 11px/1 ui-monospace, monospace",
        boxShadow: "0 4px 18px rgba(0, 0, 0, 0.4)",
      }}
    >
      <span style={{ padding: "0 8px", opacity: 0.6 }}>DEV system</span>
      {OPTIONS.map(([value, label]) => (
        <button
          key={value}
          type="button"
          aria-pressed={selected === value}
          onClick={() => choose(value)}
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            background: selected === value ? "#f43f5e" : "transparent",
            color: "inherit",
            font: "inherit",
            cursor: "pointer",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default OsSwitch;
