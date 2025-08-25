// src/pages/Login.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import styled from "styled-components";

// Google Sign-In Component using renderButton method
const GoogleSignInButton = ({ onSuccess, onError }) => {
  const googleButtonRef = useRef(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  useEffect(() => {
    // Load Google script dynamically
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google script loaded successfully');
      initializeGoogleSignIn();
    };
    
    script.onerror = () => {
      console.error('Failed to load Google script');
      onError(new Error('Failed to load Google Sign-In'));
    };

    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, []);

  const initializeGoogleSignIn = () => {
    if (window.google?.accounts?.id && googleButtonRef.current) {
      // Initialize Google Sign-In
      window.google.accounts.id.initialize({
        client_id: "599632381493-k1bppjphbkua4lcg34fugrpcd504g3se.apps.googleusercontent.com",
        callback: handleCredentialResponse,
      });

      // Render the Google Sign-In button
      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'continue_with',
          shape: 'rectangular',
          width: 350,
        }
      );

      setIsGoogleLoaded(true);
      console.log('Google Sign-In initialized and button rendered');
    }
  };

  const handleCredentialResponse = async (response) => {
    try {
      console.log('Google credential received:', response);
      await onSuccess(response.credential);
    } catch (error) {
      console.error('Error handling Google credential:', error);
      onError(error);
    }
  };

  return (
    <GoogleButtonContainer>
      {!isGoogleLoaded && (
        <LoadingButton disabled>
          Loading Google Sign-In...
        </LoadingButton>
      )}
      <div ref={googleButtonRef} style={{ display: isGoogleLoaded ? 'block' : 'none' }}></div>
    </GoogleButtonContainer>
  );
};

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
`;

const LoginCard = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 2rem;
`;

const GoogleButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50px;
`;

const LoadingButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  max-width: 350px;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  background: #f8f9fa;
  color: #9aa0a6;
  font-size: 16px;
  font-weight: 500;
  cursor: not-allowed;
  opacity: 0.6;
`;

const ErrorMessage = styled.div`
  background: #fee2e2;
  color: #dc2626;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
`;

const LoadingMessage = styled.div`
  margin-top: 1rem;
  color: #666;
  font-size: 14px;
`;

export default function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { googleLogin } = useAuth();

  const handleGoogleSuccess = async (credential) => {
    setError("");
    setLoading(true);

    try {
      console.log('Attempting to login with credential');
      const result = await googleLogin(credential);
      if (result.success) {
        console.log('Login successful, navigating to dashboard');
        navigate("/");
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (error) => {
    console.error("Google Sign-In error:", error);
    setError(error.message || "Google Sign-In failed. Please try again.");
    setLoading(false);
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Title>Welcome Back</Title>
        <Subtitle>Sign in to access your job tracker</Subtitle>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <GoogleSignInButton
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />
        
        {loading && (
          <LoadingMessage>
            Signing you in...
          </LoadingMessage>
        )}
      </LoginCard>
    </LoginContainer>
  );
}
