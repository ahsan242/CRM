// import { deleteCookie, getCookie, hasCookie, setCookie } from 'cookies-next';
// import { createContext, useContext, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// const AuthContext = createContext(undefined);
// export function useAuthContext() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuthContext must be used within an AuthProvider');
//   }
//   return context;
// }
// const authSessionKey = '_REBACK_AUTH_KEY_';
// export function AuthProvider({
//   children
// }) {
//   const navigate = useNavigate();
//   const getSession = () => {
//     const fetchedCookie = getCookie(authSessionKey)?.toString();
//     if (!fetchedCookie) return;else return JSON.parse(fetchedCookie);
//   };
//   const [user, setUser] = useState(getSession());
//   const saveSession = user => {
//     setCookie(authSessionKey, JSON.stringify(user));
//     setUser(user);
//   };
//   const removeSession = () => {
//     deleteCookie(authSessionKey);
//     setUser(undefined);
//     navigate('/auth/sign-in');
//   };
//   return <AuthContext.Provider value={{
//     user,
//     isAuthenticated: hasCookie(authSessionKey),
//     saveSession,
//     removeSession
//   }}>
//       {children}
//     </AuthContext.Provider>;
// }

// src/context/useAuthContext.jsx
import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    try {
      const raw = localStorage.getItem("auth");
      return raw ? JSON.parse(raw) : { token: null, user: null };
    } catch {
      return { token: null, user: null };
    }
  });

  // session: { token, user } or { accessToken, user }
  const saveSession = (session = {}) => {
    const token = session?.token || session?.accessToken || null;
    const user = session?.user || session?.data || null;
    const newSession = { token, user };
    setAuth(newSession);
    localStorage.setItem("auth", JSON.stringify(newSession));
  };

  const clearSession = () => {
    setAuth({ token: null, user: null });
    localStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        user: auth.user,
        token: auth.token,
        isAuthenticated: !!auth.token,
        saveSession,
        clearSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
