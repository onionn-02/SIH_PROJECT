"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const listeners = new Set<() => void>();

/**
 * The `.dark` class on <html> is the single source of truth — the blocking
 * script in the root layout (src/app/layout.tsx) already applies it before
 * hydration, so useSyncExternalStore's server/client snapshot split lets
 * this hook read that DOM state directly without a hydration mismatch
 * warning or a setState-in-effect anti-pattern.
 */
function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

function applyTheme(next: Theme): void {
  document.documentElement.classList.toggle("dark", next === "dark");
  try {
    localStorage.setItem("theme", next);
  } catch {
    // localStorage can throw in private browsing / disabled storage — theme still applies for this page view.
  }
  listeners.forEach((listener) => listener());
}

export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = useCallback(() => {
    applyTheme(theme === "dark" ? "light" : "dark");
  }, [theme]);

  return { theme, toggleTheme };
}
