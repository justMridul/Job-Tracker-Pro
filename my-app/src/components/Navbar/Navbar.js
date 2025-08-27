import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import {
  FaBars, FaTimes, FaCode, FaHome, FaTachometerAlt,
  FaInfoCircle, FaCog, FaSignInAlt
} from "react-icons/fa";
import styled, { css, createGlobalStyle } from "styled-components";
import { useAuth } from "../../context/authContext";

// Global styles for body when menu is open (prevent scroll)
const GlobalStyle = createGlobalStyle`
  body {
    overflow: ${props => props.menuOpen ? 'hidden' : 'auto'};
  }
`;

// Navbar container
const NavbarContainer = styled.nav`
  position: sticky;
  top: 0;
  width: 100%;
  height: 70px;
  background: ${({ theme }) => theme.colors?.surface || '#ffffff'};
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || 'rgba(0, 0, 0, 0.1)'};
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  z-index: 1000;
  transition: all 0.3s ease;

  @supports (backdrop-filter: blur(10px)) {
    background: ${({ theme }) => theme.colors?.surface || 'rgba(255, 255, 255, 0.9)'};
  }
  
  /* Mobile optimization */
  @media (max-width: 480px) {
    height: 60px;
  }
`;

const NavbarInner = styled.div`
  max-width: 1200px;
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 768px) {
    padding: 0 20px;
  }
  
  @media (max-width: 480px) {
    padding: 0 16px;
  }
`;

// Brand/Logo
const Brand = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.primary || '#2563eb'};
  transition: all 0.3s ease;

  &:hover {
    color: ${({ theme }) => theme.colors?.secondary || '#1d4ed8'};
    transform: scale(1.05);
  }

  svg {
    font-size: 28px;
  }
  
  /* Mobile adjustments */
  @media (max-width: 480px) {
    font-size: 20px;
    gap: 8px;
    
    svg {
      font-size: 24px;
    }
  }
`;

// Desktop menu
const DesktopMenu = styled.ul`
  display: flex;
  align-items: center;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavItem = styled.li`
  position: relative;
`;

const NavItemLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  color: ${({ theme }) => theme.colors?.textPrimary || '#374151'};
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: ${({ theme }) => theme.colors?.background || '#f3f4f6'};
    color: ${({ theme }) => theme.colors?.primary || '#2563eb'};
    transform: translateY(-1px);
  }

  &.active {
    color: ${({ theme }) => theme.colors?.primary || '#2563eb'};
    background: ${({ theme }) => theme.colors?.primary || '#2563eb'}15;

    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 3px;
      background: ${({ theme }) => theme.colors?.primary || '#2563eb'};
      border-radius: 2px;
    }
  }

  svg {
    font-size: 16px;
  }
`;

// Hamburger button
const HamburgerButton = styled.button`
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: ${({ theme }) => theme.colors?.textPrimary || '#374151'};
  cursor: pointer;
  transition: all 0.3s ease;
  /* Touch-friendly */
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: ${({ theme }) => theme.colors?.background || '#f3f4f6'};
    color: ${({ theme }) => theme.colors?.primary || '#2563eb'};
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    font-size: 20px;
    transition: all 0.3s ease;
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

// Mobile overlay & drawer
const MobileMenuOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  z-index: 1001;
`;

const MobileMenu = styled.aside`
  position: fixed;
  top: 0;
  right: 0;
  width: 300px;
  height: 100%;
  background: ${({ theme }) => theme.colors?.surface || '#ffffff'};
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.15);
  transform: translateX(${props => props.isOpen ? '0' : '100%'});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1002;
  overflow-y: auto;
  /* Smooth scrolling on mobile */
  -webkit-overflow-scrolling: touch;

  @media (max-width: 400px) {
    width: 280px;
  }
  
  @media (max-width: 320px) {
    width: 100vw;
  }
`;

const MobileMenuHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || 'rgba(0, 0, 0, 0.1)'};
  
  @media (max-width: 480px) {
    padding: 16px 20px;
  }
`;

const MobileMenuTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.textPrimary || '#374151'};
  
  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
  cursor: pointer;
  transition: all 0.3s ease;
  /* Touch-friendly */
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: ${({ theme }) => theme.colors?.background || '#f3f4f6'};
    color: ${({ theme }) => theme.colors?.textPrimary || '#374151'};
  }

  &:active {
    transform: scale(0.9);
  }

  svg {
    font-size: 18px;
  }
`;

// Mobile nav
const MobileNav = styled.nav`
  padding: 20px 0;
  
  @media (max-width: 480px) {
    padding: 16px 0;
  }
`;

const MobileNavList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const MobileNavItem = styled.li``;

const MobileNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  text-decoration: none;
  font-weight: 500;
  color: ${({ theme }) => theme.colors?.textPrimary || '#374151'};
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
  /* Touch-friendly */
  -webkit-tap-highlight-color: transparent;
  min-height: 48px; /* Better touch target */

  &:hover {
    background: ${({ theme }) => theme.colors?.background || '#f3f4f6'};
    color: ${({ theme }) => theme.colors?.primary || '#2563eb'};
    border-left-color: ${({ theme }) => theme.colors?.primary || '#2563eb'};
  }

  &:active {
    background: ${({ theme }) => theme.colors?.primary || '#2563eb'}20;
  }

  &.active {
    background: ${({ theme }) => theme.colors?.primary || '#2563eb'}10;
    color: ${({ theme }) => theme.colors?.primary || '#2563eb'};
    border-left-color: ${({ theme }) => theme.colors?.primary || '#2563eb'};
  }

  svg {
    font-size: 18px;
    opacity: 0.8;
  }
  
  @media (max-width: 480px) {
    padding: 14px 20px;
    gap: 14px;
  }
`;

// ✅ Navbar Component
const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const overlayRef = useRef(null);
  const { user } = useAuth(); // ✅ auth state

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        overlayRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // ✅ Dynamic nav items - FIXED: Changed /auth to /login
  const navItems = [
    { to: "/", label: "Home", icon: FaHome, always: true },
    { to: "/about", label: "About", icon: FaInfoCircle, always: true },
    ...(user
      ? [
        { to: "/dashboard", label: "Dashboard", icon: FaTachometerAlt },
        { to: "/settings", label: "Settings", icon: FaCog },
      ]
      : [
        { to: "/login", label: "Login / Register", icon: FaSignInAlt }, // ✅ FIXED: Changed from /auth to /login
      ]),
  ];

  return (
    <>
      <GlobalStyle menuOpen={isMobileMenuOpen} />
      <NavbarContainer>
        <NavbarInner>
          {/* Brand */}
          <Brand to="/">
            <FaCode />
            Job Tracker Pro
          </Brand>

          {/* Desktop menu */}
          <DesktopMenu>
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavItem key={to}>
                <NavItemLink
                  to={to}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <Icon />
                  {label}
                </NavItemLink>
              </NavItem>
            ))}
          </DesktopMenu>

          {/* Hamburger */}
          <HamburgerButton onClick={toggleMobileMenu} aria-label="Toggle menu">
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </HamburgerButton>
        </NavbarInner>
      </NavbarContainer>

      {/* Overlay */}
      <MobileMenuOverlay
        ref={overlayRef}
        isOpen={isMobileMenuOpen}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Drawer */}
      <MobileMenu ref={mobileMenuRef} isOpen={isMobileMenuOpen}>
        <MobileMenuHeader>
          <MobileMenuTitle>Navigation</MobileMenuTitle>
          <CloseButton onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
            <FaTimes />
          </CloseButton>
        </MobileMenuHeader>
        <MobileNav>
          <MobileNavList>
            {navItems.map(({ to, label, icon: Icon }) => (
              <MobileNavItem key={to}>
                <MobileNavLink
                  to={to}
                  onClick={closeMobileMenu}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <Icon />
                  {label}
                </MobileNavLink>
              </MobileNavItem>
            ))}
          </MobileNavList>
        </MobileNav>
      </MobileMenu>
    </>
  );
};

export default Navbar;
