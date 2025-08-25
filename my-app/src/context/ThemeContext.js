import React, { createContext, useState, useContext, useEffect, useMemo } from "react";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { getTheme } from "../theme"; 

const ThemeContext = createContext();

// Custom hook to use theme context
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  // Initialize mode from localStorage or default to 'light'
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem("theme-mode");
    return saved === "light" || saved === "dark" ? saved : "light";
  });

  // Apply theme mode class to <html> and persist choice
  useEffect(() => {
    localStorage.setItem("theme-mode", mode);

    const html = document.documentElement;
    if (mode === "dark") {
      html.classList.add("dark");
      html.classList.remove("light");
    } else {
      html.classList.add("light");
      html.classList.remove("dark");
    }
  }, [mode]);

  // Toggle between 'light' and 'dark' mode
  const toggle = () => setMode((prev) => (prev === "light" ? "dark" : "light"));

  // Create theme object using getTheme from theme.js
  const theme = useMemo(() => getTheme(mode), [mode]);

  // Memoize context value to avoid unnecessary renders
  const contextValue = useMemo(
    () => ({
      mode,
      toggle,
      setMode,
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <StyledThemeProvider theme={theme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
}

