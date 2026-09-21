'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Role {
  id: number;
  name: string;
  permissions?: string[];
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  roles: Role[];
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const storedUser = localStorage.getItem('sikesan_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error('Failed to parse stored user', e);
      return null;
    }
  });

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('sikesan_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sikesan_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
