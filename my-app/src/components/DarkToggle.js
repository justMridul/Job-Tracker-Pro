import React from "react";
import styled from "styled-components";

const ToggleWrapper = styled.button`
  position: relative;
  width: 56px;
  height: 30px;
  background-color: ${({ theme, isDark }) => (isDark ? theme.colors.primary : "#b0bec5")};
  border-radius: 30px;
  border: none;
  cursor: pointer;
  outline: none;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  display: flex;
  align-items: center;
  padding: 3px;
  transition: background-color 0.3s ease;

  &:focus-visible {
    box-shadow: 0 0 5px 3px #64b5f6;
  }
`;

const ToggleCircle = styled.span`
  position: absolute;
  left: ${({ isDark }) => (isDark ? "26px" : "3px")};
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  transition: left 0.3s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,0.25);
`;

const Icon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.surface};
  font-size: 16px;
  position: relative;
  z-index: 1;
`;

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 0111.21 3 7 7 0 1012 21a9 9 0 009-8.21z"/>
  </svg>
);

const DarkToggle = ({ isDarkMode, toggleDarkMode }) => {
  return (
    <ToggleWrapper
      onClick={toggleDarkMode}
      isDark={isDarkMode}
      aria-pressed={isDarkMode}
      aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isDarkMode ? "Light Mode" : "Dark Mode"}
    >
      <Icon style={{ left: "8px" }}>
        <SunIcon />
      </Icon>
      <Icon style={{ right: "8px" }}>
        <MoonIcon />
      </Icon>
      <ToggleCircle isDark={isDarkMode} />
    </ToggleWrapper>
  );
};

export default DarkToggle;
