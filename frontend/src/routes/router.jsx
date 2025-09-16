// import { Navigate, Route, Routes } from 'react-router-dom';
// import AuthLayout from '@/layouts/AuthLayout';
// import { useAuthContext } from '@/context/useAuthContext';
// import { appRoutes, authRoutes } from '@/routes/index';
// import AdminLayout from '@/layouts/AdminLayout';
// const AppRouter = props => {
//   const {
//     isAuthenticated
//   } = useAuthContext();
//   return <Routes>
//       {(authRoutes || []).map((route, idx) => <Route key={idx + route.name} path={route.path} element={<AuthLayout {...props}>{route.element}</AuthLayout>} />)}

//       {(appRoutes || []).map((route, idx) => <Route key={idx + route.name} path={route.path} element={isAuthenticated ? <AdminLayout {...props}>{route.element}</AdminLayout> : <Navigate to={{
//       pathname: '/auth/sign-in',
//       search: 'redirectTo=' + route.path
//     }} />} />)}
//     </Routes>;
// };
// export default AppRouter;
// src/routes/router.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout";
import AdminLayout from "@/layouts/AdminLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { appRoutes, authRoutes } from "@/routes/index";

const AppRouter = (props) => {
  return (
    <Routes>
      {/* Public auth routes */}
      {(authRoutes || []).map((route, idx) => (
        <Route
          key={`auth-${idx}-${route.path}`}
          path={route.path}
          element={<AuthLayout {...props}>{route.element}</AuthLayout>}
        />
      ))}

      {/* Protected app routes: each appRoute is wrapped with ProtectedRoute + AdminLayout */}
      {(appRoutes || []).map((route, idx) => (
        <Route
          key={`app-${idx}-${route.path}`}
          path={route.path}
          element={
            <ProtectedRoute>
              <AdminLayout {...props}>{route.element}</AdminLayout>
            </ProtectedRoute>
          }
        />
      ))}

      {/* fallback routes */}
      <Route path="/" element={<Navigate to="/dashboard/analytics" replace />} />
      <Route path="*" element={<Navigate to="/auth/sign-in" replace />} />
    </Routes>
  );
};

export default AppRouter;
