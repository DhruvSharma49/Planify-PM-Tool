// import React, { createContext, useContext, useState, useEffect } from 'react';
// import api from "../utils/API";
// import { getSocket, disconnectSocket } from '../utils/socket';

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     checkAuth();
//   }, []);

//   const checkAuth = async () => {
//     try {
//       const res = await api.get('/auth/me');
//       setUser(res.data.user);
//     } catch {
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const login = async (email, password) => {
//     const res = await api.post('/auth/login', { email, password });
//     setUser(res.data.user);
//     return res.data;
//   };

//   const register = async (name, email, password) => {
//     const res = await api.post('/auth/register', { name, email, password });
//     setUser(res.data.user);
//     return res.data;
//   };

//   const logout = async () => {
//     try {
//       await api.post('/auth/logout');
//     } finally {
//       disconnectSocket();
//       setUser(null);
//     }
//   };

//   const updateUser = (updatedUser) => {
//     setUser(prev => ({ ...prev, ...updatedUser }));
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, checkAuth }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error('useAuth must be used within AuthProvider');
//   return ctx;
// };


import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/API";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password });
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
