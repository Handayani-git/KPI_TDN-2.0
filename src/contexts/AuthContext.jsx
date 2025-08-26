import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (email, password) => {
    // Login untuk Manager
    if (email === 'manager@app.com' && password === 'password') {
      const userData = { id: 'mgr01', email: 'manager@app.com', role: 'manager' };
      setUser(userData);
      return userData;
    }
    // Login untuk CS
    if (email === 'cs@app.com' && password === 'password') {
      const userData = { id: 'cs01', email: 'cs@app.com', role: 'cs' };
      setUser(userData);
      return userData;
    }
    // Login untuk Advertiser (ADV)
    if (email === 'adv@app.com' && password === 'password') {
      const userData = { id: 'adv01', email: 'adv@app.com', role: 'advertiser' };
      setUser(userData);
      return userData;
    }
    return null;
  };

  const logout = () => {
    setUser(null);
  };

  const value = { user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}