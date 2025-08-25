// src/themeDark.js

const darkTheme = {
  colors: {
    primary: '#2563eb',
    secondary: '#f43f5e',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#121214',          // Dark background
    surface: '#1e1e2f',
    textPrimary: '#e0e0f0',
    textSecondary: '#a0a0c0',
    border: '#2c2c4a',
    shadow: 'rgba(37, 99, 235, 0.50)',
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Arial', sans-serif",
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      md: "1rem",
      lg: "1.25rem",
      xl: "2rem",
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  spacing: {
    xs: "6px",
    sm: "12px",
    md: "20px",
    lg: "32px",
    xl: "48px",
    xxl: "72px",
  },
  radii: {
    sm: "6px",
    md: "12px",
    lg: "24px",
  },
  shadows: {
    sm: "0 2px 8px rgba(0, 0, 0, 0.08)",
    md: "0 6px 20px rgba(0, 0, 0, 0.15)",
    lg: "0 12px 40px rgba(37, 99, 235, 0.25)",
  },
  breakpoints: {
    xs: "400px",
    sm: "600px",
    md: "900px",
    lg: "1200px",
    xl: "1920px",
  },
};

export default darkTheme;
