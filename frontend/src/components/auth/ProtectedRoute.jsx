// src/components/auth/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthContext } from "@/context/useAuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthContext();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`/auth/sign-in?redirectTo=${location.pathname}`} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
