import { useCallback, useSyncExternalStore } from "react";

const THEME_KEY = "theme";
const listeners = new Set();

function getTheme() {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Theme state lives on <html data-theme> (set pre-paint by an inline
 * script in index.html). This hook mirrors it into React and persists
 * changes to localStorage.
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme);

  const toggleTheme = useCallback(() => {
    const next = getTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem(THEME_KEY, next);
    listeners.forEach((listener) => listener());
  }, []);

  return { theme, toggleTheme };
}
