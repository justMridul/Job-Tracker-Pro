// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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

// ✅ Simple ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// ✅ AuthOnlyRoute - redirects logged-in users away from login
const AuthOnlyRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// ✅ Homepage Wrapper with AddJobForm
const HomePageWrapper = () => {
  return (
    <AppProvider>
      <JobProvider>
        <Layout>
          <Home />
        </Layout>
      </JobProvider>
    </AppProvider>
  );
};

// ✅ Dashboard Wrapper (separate from Homepage)
const DashboardWrapper = () => {
  return (
    <AppProvider>
      <JobProvider>
        <Layout>
          <Dashboard />
        </Layout>
      </JobProvider>
    </AppProvider>
  );
};

// ✅ App Routes Component
const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <AuthOnlyRoute>
            <Login />
          </AuthOnlyRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePageWrapper />
          </ProtectedRoute>
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
        path="/home"
        element={
          <ProtectedRoute>
            <HomePageWrapper />
          </ProtectedRoute>
        }
      />
      <Route
        path="/about"
        element={
          <ProtectedRoute>
            <Layout>
              <About />
            </Layout>
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// ✅ Main App Component
function App() {
  return (
    <ThemeProvider>
      <SnackbarProvider>
        <Router>
          <AuthProvider>
            <ThemedAppWrapper>
              <AppRoutes />
            </ThemedAppWrapper>
          </AuthProvider>
        </Router>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
