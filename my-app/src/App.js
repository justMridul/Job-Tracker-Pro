// src/App.js

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import styled from "styled-components";
import Layout from "./components/Layout";
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Settings from "./pages/Settings/settings";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { AuthProvider, useAuth } from "./context/authContext";
import { AppProvider } from "./context/AppContext";
import { JobProvider } from "./context/JobContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SnackbarProvider } from "./components/Snackbar/Snackbar";

// ✅ Global themed container
const ThemedAppWrapper = styled.div`
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

// ✅ Fixed ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// ✅ Fixed AuthOnlyRoute - redirects logged-in users away from login
const AuthOnlyRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// ✅ Homepage Wrapper with proper JSX
const HomePageWrapper = () => {
  return (
    <Layout>
      <Home />
    </Layout>
  );
};

// ✅ Dashboard Wrapper with proper JSX
const DashboardWrapper = () => {
  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
};

// ✅ App Routes Component with complete JSX
const AppRoutes = () => {
  return (
    <Routes>
      <Route 
        path="/" 
        element={<HomePageWrapper />} 
      />
      <Route 
        path="/about" 
        element={
          <Layout>
            <About />
          </Layout>
        } 
      />
      <Route 
        path="/login" 
        element={
          <AuthOnlyRoute>
            <Login />
          </AuthOnlyRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardWrapper />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="*" 
        element={<Navigate to="/" replace />} 
      />
    </Routes>
  );
};

// ✅ Complete Main App Component with Google OAuth Provider
function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <JobProvider>
              <SnackbarProvider>
                <ThemedAppWrapper>
                  <Router>
                    <AppRoutes />
                  </Router>
                </ThemedAppWrapper>
              </SnackbarProvider>
            </JobProvider>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
