import React, { createContext, useContext, useState, useEffect } from "react";

// Create the context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    console.log("🔍 Checking for existing authentication...");
    
    try {
      const authData = localStorage.getItem("auth");
      
      if (authData) {
        const parsed = JSON.parse(authData);
        console.log("📦 Found auth data:", parsed);
        
        if (parsed.token && parsed.user) {
          setToken(parsed.token);
          setUser(parsed.user);
          console.log("✅ User authenticated from localStorage");
        } else {
          console.log("❌ Invalid auth data in storage");
          clearAuth();
        }
      } else {
        console.log("ℹ️ No auth data found in localStorage");
      }
    } catch (error) {
      console.error("❌ Error loading auth data:", error);
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save session after login
  const saveSession = (sessionData) => {
    console.log("💾 Saving session:", sessionData);
    
    if (sessionData && sessionData.token && sessionData.user) {
      const authData = {
        token: sessionData.token,
        user: sessionData.user,
        timestamp: new Date().getTime()
      };
      
      // Save to localStorage
      localStorage.setItem("auth", JSON.stringify(authData));
      
      // Update state
      setToken(sessionData.token);
      setUser(sessionData.user);
      
      console.log("✅ Session saved successfully!");
      console.log("👤 User:", sessionData.user.email);
      console.log("🔑 Token exists:", !!sessionData.token);
      
      return true;
    } else {
      console.error("❌ Cannot save session - missing token or user");
      return false;
    }
  };

  // Clear session (logout)
  const clearAuth = () => {
    localStorage.removeItem("auth");
    setUser(null);
    setToken(null);
    console.log("🧹 Auth cleared");
  };

  // Check if user is authenticated
  const isAuthenticated = !!token && !!user;

  // Context value
  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    saveSession,
    clearAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};