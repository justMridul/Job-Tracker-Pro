// src/components/RouteGuards.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';

export function ProtectedRoute({ children }) {
  const { user, booting } = useAuth();
  const location = useLocation();

  // Show loading while authentication is being checked
  if (booting) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Checking authentication...
      </div>
    );
  }

  // If user is not authenticated, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected component
  return children;
}

export function AuthOnlyRoute({ children }) {
  const { user, booting } = useAuth();

  // Show loading while authentication is being checked
  if (booting) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  // If user is already authenticated, redirect to home/dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  // User is not authenticated, show the auth page
  return children;
}
