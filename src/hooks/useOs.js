import { useSyncExternalStore } from "react";
import { detectOs } from "../utils/os";

// Only the development switch ever changes the answer after load.
const subscribe = (listener) => {
  if (!import.meta.env.DEV) return () => {};
  window.addEventListener("dev-os-change", listener);
  return () => window.removeEventListener("dev-os-change", listener);
};

/** "mac" | "windows": the window-control style for this visitor's machine. */
export const useOs = () => useSyncExternalStore(subscribe, detectOs, () => "mac");
