
// // src/routes/router.jsx
// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import AuthLayout from "@/layouts/AuthLayout";
// import AdminLayout from "@/layouts/AdminLayout";
// import ProtectedRoute from "@/components/auth/ProtectedRoute";
// import { appRoutes, authRoutes } from "@/routes/index";

// const AppRouter = (props) => {
//   return (
//     <Routes>
//       {/* Public auth routes */}
//       {(authRoutes || []).map((route, idx) => (
//         <Route
//           key={`auth-${idx}-${route.path}`}
//           path={route.path}
//           element={<AuthLayout {...props}>{route.element}</AuthLayout>}
//         />
//       ))}

//       {/* Protected app routes: each appRoute is wrapped with ProtectedRoute + AdminLayout */}
//       {(appRoutes || []).map((route, idx) => (
//         <Route
//           key={`app-${idx}-${route.path}`}
//           path={route.path}
//           element={
//             <ProtectedRoute>
//               <AdminLayout {...props}>{route.element}</AdminLayout>
//             </ProtectedRoute>
//           }
//         />
//       ))}

//       {/* fallback routes */}
//       <Route path="/" element={<Navigate to="/dashboard/analytics" replace />} />
//       <Route path="*" element={<Navigate to="/auth/sign-in" replace />} />
//     </Routes>
//   );
// };

// export default AppRouter;

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout";
import AdminLayout from "@/layouts/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute"; // 👈 USE NEW COMPONENT
import { appRoutes, authRoutes } from "@/routes/index";

const AppRouter = (props) => {
  console.log("🚀 AppRouter rendering...");

  return (
    <Routes>
      {/* Public Auth Routes (Login, Signup, etc.) */}
      {(authRoutes || []).map((route, idx) => (
        <Route
          key={`auth-${idx}-${route.path}`}
          path={route.path}
          element={<AuthLayout {...props}>{route.element}</AuthLayout>}
        />
      ))}

      {/* Protected App Routes (Dashboard, etc.) */}
      {(appRoutes || []).map((route, idx) => {
        // Skip auth routes
        if (authRoutes.some(authRoute => authRoute.path === route.path)) {
          return null;
        }
        
        return (
          <Route
            key={`app-${idx}-${route.path}`}
            path={route.path}
            element={
              <ProtectedRoute> {/* 👈 WRAP WITH PROTECTED ROUTE */}
                <AdminLayout {...props}>{route.element}</AdminLayout>
              </ProtectedRoute>
            }
          />
        );
      })}

      {/* Default Routes */}
      <Route path="/" element={<Navigate to="/dashboard/analytics" replace />} />
      <Route path="*" element={<Navigate to="/auth/sign-in" replace />} />
    </Routes>
  );
};

export default AppRouter;