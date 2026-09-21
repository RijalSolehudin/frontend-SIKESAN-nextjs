'use client';

import React, { createContext, useContext, useSyncExternalStore, useMemo, ReactNode } from 'react';

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

const authListeners = new Set<() => void>();
function notifyAuthChange() {
  authListeners.forEach((listener) => listener());
}

function subscribe(callback: () => void) {
  authListeners.add(callback);
  window.addEventListener('storage', callback);
  return () => {
    authListeners.delete(callback);
    window.removeEventListener('storage', callback);
  };
}

function getSnapshot(): string | null {
  try {
    return localStorage.getItem('sikesan_user');
  } catch {
    return null;
  }
}

function getServerSnapshot(): string | null {
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const storedUserJson = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const user = useMemo<User | null>(() => {
    if (!storedUserJson) return null;
    try {
      return JSON.parse(storedUserJson);
    } catch (e) {
      console.error('Failed to parse stored user', e);
      return null;
    }
  }, [storedUserJson]);

  const login = (userData: User) => {
    try {
      localStorage.setItem('sikesan_user', JSON.stringify(userData));
      notifyAuthChange();
    } catch (e) {
      console.error('Failed to save user to localStorage', e);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('sikesan_user');
      notifyAuthChange();
    } catch (e) {
      console.error('Failed to remove user from localStorage', e);
    }
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
