import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "motion";
const QUERY = "(prefers-reduced-motion: reduce)";

const listeners = new Set();
const media = typeof window !== "undefined" ? window.matchMedia(QUERY) : null;

const readSystem = () => Boolean(media?.matches);

const readManual = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "reduced";
  } catch {
    return false; // storage blocked: behave as if no choice was saved
  }
};

/** The effective setting: the OS asked for it, or the visitor turned it on here. */
export const isReducedMotion = () => readSystem() || readManual();

/**
 * Mirrors the effective setting onto <html data-motion="reduced|full"> so
 * CSS can follow the manual switch as well as the OS media query. An inline
 * script in index.html sets it before first paint; this keeps it current.
 */
const apply = () => {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.motion = isReducedMotion() ? "reduced" : "full";
};

const emit = () => {
  apply();
  listeners.forEach((listener) => listener());
};

if (media) {
  apply();
  media.addEventListener("change", emit);
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) emit(); // changed in another tab
  });
}

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// One number so useSyncExternalStore can compare snapshots with ===.
const getSnapshot = () => (readSystem() ? 2 : 0) + (readManual() ? 1 : 0);

/**
 * Motion preference = OS `prefers-reduced-motion` OR a manual switch.
 *
 * The manual switch can only turn motion *off*: if the OS already asks for
 * reduced motion the site never overrides it, and `systemReduced` lets the UI
 * show that instead of offering a control that can't do anything.
 */
export function useMotionPreference() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => 0);
  const systemReduced = snapshot >= 2;
  const manual = snapshot % 2 === 1;

  const toggle = useCallback(() => {
    try {
      if (readManual()) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, "reduced");
    } catch {
      // Storage unavailable — the switch simply won't persist.
    }
    emit();
  }, []);

  return { reduced: systemReduced || manual, systemReduced, manual, toggle };
}

/** Just the boolean, for components that only need to react to it. */
export const useReducedMotion = () => useMotionPreference().reduced;
