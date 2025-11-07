import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  console.log("🛡️ Protected Route Check:", {
    isAuthenticated,
    isLoading,
    path: location.pathname
  });

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-2">Checking authentication...</span>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log("🚫 Not authenticated, redirecting to login");
    return (
      <Navigate 
        to={`/auth/sign-in?redirectTo=${encodeURIComponent(location.pathname)}`} 
        replace 
      />
    );
  }

  console.log("✅ Access granted to protected route");
  return children;
};

export default ProtectedRoute;