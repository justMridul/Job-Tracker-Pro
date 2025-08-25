// src/context/authContext.js

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import API, { refreshAccessToken } from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Google OAuth Login
  const googleLogin = async (credential) => {
    try {
      const res = await API.post("/auth/google", { credential });
      const { accessToken, refreshToken, user } = res.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      return { success: true, message: "Google login successful!" };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Google login failed",
      };
    }
  };

  const logout = async () => {
    try {
      await API.post("/auth/logout", { refreshToken: localStorage.getItem("refreshToken") });
    } catch (_) {}

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  const refresh = useCallback(async () => {
    try {
      const newAccessToken = await refreshAccessToken();
      return newAccessToken;
    } catch (err) {
      console.error("Token refresh failed:", err);
      await logout();
      return null;
    }
  }, []);

  useEffect(() => {
    const interceptor = API.interceptors.response.use(
      (res) => res,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const newAccessToken = await refresh();
          if (newAccessToken) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return API(originalRequest);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => API.interceptors.response.eject(interceptor);
  }, [refresh]);

  return (
    <AuthContext.Provider
      value={{
        user,
        googleLogin,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
