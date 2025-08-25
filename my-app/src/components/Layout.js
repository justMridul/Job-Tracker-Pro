// src/components/Layout.js
import React from "react";
import styled from "styled-components";
import Navbar from "./Navbar/Navbar";

const MainWrapper = styled.main`
  padding-top: 60px; /* offset for fixed navbar */
  min-height: calc(100vh - 60px);
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  transition: background 0.3s ease, color 0.3s ease;
  width: 100%;
  overflow-x: hidden; /* Prevent horizontal scroll issues */
`;

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const Layout = ({ children }) => {
  console.log("Layout component rendering"); // Debug log
  
  // Add error boundary protection for children
  if (!children) {
    console.warn("Layout: No children provided");
    return (
      <LayoutContainer>
        <Navbar />
        <MainWrapper>
          <div>No content provided to Layout component</div>
        </MainWrapper>
      </LayoutContainer>
    );
  }

  return (
    <LayoutContainer>
      <Navbar />
      <MainWrapper>
        {children}
      </MainWrapper>
    </LayoutContainer>
  );
};

export default Layout;
