"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "bangladeshist-theme";
const ThemeContext = createContext({ theme: "dark", setTheme: () => {}, toggleTheme: () => {} });

function applyTheme(theme) {
  if (typeof document === "undefined") return;
  const safeTheme = theme === "light" ? "light" : "dark";
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(safeTheme);
  root.style.colorScheme = safeTheme;
  root.setAttribute("data-theme", safeTheme);
  window.dispatchEvent(new CustomEvent("bangladeshist-theme-change", { detail: safeTheme }));
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("dark");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const initial = saved === "light" || saved === "dark" ? saved : "dark";
    setThemeState(initial);
    applyTheme(initial);
  }, []);

  const setTheme = (nextTheme) => {
    const safeTheme = nextTheme === "light" ? "light" : "dark";
    setThemeState(safeTheme);
    window.localStorage.setItem(STORAGE_KEY, safeTheme);
    applyTheme(safeTheme);
  };

  const value = useMemo(() => ({
    theme,
    setTheme,
    toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
