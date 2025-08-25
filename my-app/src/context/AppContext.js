import React, { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [applicationsCache, setApplicationsCache] = useState({}); // Cache user-page application data

  const updateApplicationsCache = (userId, page, data) => {
    setApplicationsCache((prev) => ({
      ...prev,
      [`${userId}-${page}`]: data,
    }));
  };

  return (
    <AppContext.Provider
      value={{ currentUser, setCurrentUser, applicationsCache, updateApplicationsCache }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
