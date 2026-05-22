/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

const STORAGE_KEY = "pregnancy_tracker_theme";

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEY) || "system");
  const [resolvedTheme, setResolvedTheme] = useState(() =>
    (localStorage.getItem(STORAGE_KEY) || "system") === "system"
      ? getSystemTheme()
      : localStorage.getItem(STORAGE_KEY) || "light"
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const updateResolved = () => {
      const next = theme === "system" ? getSystemTheme() : theme;
      setResolvedTheme(next);
      document.documentElement.setAttribute("data-theme", next);
    };

    updateResolved();

    const handleSystemChange = () => {
      if (theme === "system") updateResolved();
    };

    media.addEventListener("change", handleSystemChange);
    localStorage.setItem(STORAGE_KEY, theme);

    return () => media.removeEventListener("change", handleSystemChange);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme: () => setTheme((prev) => (prev === "dark" ? "light" : "dark")),
    }),
    [theme, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
