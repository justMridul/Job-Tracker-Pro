import React from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../context/authContext";
import IconButton from "../buttons/IconButton";
import { FaSun, FaMoon, FaSignOutAlt } from "react-icons/fa";

const HeaderWrapper = styled.header`
  background-color: ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  box-shadow: 0 4px 24px rgba(37, 99, 235, 0.25);
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: saturate(1.2) blur(6px);

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

const Logo = styled.button`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: white;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  user-select: none;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: color 0.25s;

  &:hover,
  &:focus {
    color: ${({ theme }) => theme.colors.secondary};
    outline: none;
  }
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const StyledNavLink = styled(NavLink)`
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  text-decoration: none;
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;

  &.active {
    border-bottom-color: white;
    font-weight: 700;
  }

  &:hover,
  &:focus {
    color: ${({ theme }) => theme.colors.secondary};
    outline: none;
  }
`;

const UserChip = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255 255 255 / 0.12);
  color: white;
  border: 1px solid rgba(255 255 255 / 0.22);
  padding: 6px 14px;
  border-radius: 9999px;
  font-weight: 600;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
  user-select: none;
`;

const Avatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.secondary};
  display: grid;
  place-items: center;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 0 5px rgba(255 255 255 / 0.7);
  user-select: none;
`;

function getInitials(name = "") {
  const parts = name.trim().split(" ");
  const firstInitial = parts[0]?.charAt(0) || "";
  const secondInitial = parts[1]?.charAt(0) || "";
  return (firstInitial + secondInitial).toUpperCase();
}

const Header = ({ isDarkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const goHome = () => {
    if (pathname !== "/") navigate("/");
  };

  return (
    <HeaderWrapper role="banner">
      <Logo onClick={goHome} aria-label="Go to Home">
        MyApp
      </Logo>
      <Navigation role="navigation" aria-label="Primary Navigation">
        <StyledNavLink to="/" end>
          Home
        </StyledNavLink>
        <StyledNavLink to="/dashboard">Dashboard</StyledNavLink>
        <StyledNavLink to="/about">About</StyledNavLink>
        <StyledNavLink to="/settings">Settings</StyledNavLink>
        <IconButton
          icon={isDarkMode ? <FaSun /> : <FaMoon />}
          onClick={toggleDarkMode}
          aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          variant="outline"
          size="md"
        />
        {user ? (
          <>
            <UserChip title={user.name || "Account"}>
              <Avatar>{getInitials(user.name)}</Avatar>
              {user.name}
            </UserChip>
            <IconButton
              icon={<FaSignOutAlt />}
              onClick={logout}
              aria-label="Logout"
              variant="outline"
              size="md"
            />
          </>
        ) : (
          <StyledNavLink to="/auth">Login</StyledNavLink>
        )}
      </Navigation>
    </HeaderWrapper>
  );
};

export default Header;
