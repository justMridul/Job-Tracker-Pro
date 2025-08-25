// src/theme.js

const baseColors = {
  primary: "#2563eb",          // Bold vibrant blue
  secondary: "#f43f5e",        // Vibrant pink for accent
  success: "#22c55e",          // Emerald green
  warning: "#f59e0b",          // Amber/yellow
  error: "#ef4444",            // Genuine red
  info: "#3b82f6",             // Lighter blue for info messages
};

const lightColors = {
  ...baseColors,
  background: "#f3f4f6",            // Softer, less bright off-white
  surface: "#ffffff",               // White surface color
  textPrimary: "#1e293b",           // Dark grayish-blue for text
  textSecondary: "#64748b",         // Medium gray-blue for secondary text
  border: "#e0e7ff",                // Light pastel blue for borders
  shadow: "rgba(37, 99, 235, 0.10)", // Primary color shadow for subtle glows
};

const darkColors = {
  ...baseColors,
  background: "#121214",            // Dark nearly black background
  surface: "#1e1e2f",               // Slightly bluish dark surface
  textPrimary: "#e0e0f0",           // Light bluish text for contrast
  textSecondary: "#a0a0c0",         // Muted lighter secondary text
  border: "#2c2c4a",                // Darker bluish border
  shadow: "rgba(37, 99, 235, 0.50)", // More visible glow in dark mode
};

const typography = {
  fontFamily: "'Inter', 'Roboto', 'Arial', sans-serif",
  fontSize: {
    xs: "0.75rem",   // 12px
    sm: "0.875rem",  // 14px
    md: "1rem",      // 16px
    lg: "1.25rem",   // 20px
    xl: "2rem",      // 32px
  },
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 600,     // increased medium weight for better readability
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

const spacing = {
  xs: "6px",          // Slightly larger for better touch targets
  sm: "12px",
  md: "20px",
  lg: "32px",
  xl: "48px",
  xxl: "72px",
};

const radii = {
  sm: "6px",
  md: "12px",
  lg: "24px",
};

const shadows = {
  sm: "0 2px 8px rgba(0, 0, 0, 0.08)",
  md: "0 6px 20px rgba(0, 0, 0, 0.15)",
  lg: "0 12px 40px rgba(37, 99, 235, 0.25)",  // Blue tinted shadow for emphasis
};

const breakpoints = {
  xs: "400px",
  sm: "600px",
  md: "900px",
  lg: "1200px",
  xl: "1920px",
};

// ✅ Helper function to get theme object by mode ('light' or 'dark')
const getTheme = (mode = "light") => ({
  mode, // keep track of current mode
  colors: mode === "dark" ? darkColors : lightColors,
  typography,
  spacing,
  radii,
  shadows,
  breakpoints,
});

export {
  getTheme,
  lightColors,
  darkColors,
  typography,
  spacing,
  radii,
  shadows,
  breakpoints,
};
