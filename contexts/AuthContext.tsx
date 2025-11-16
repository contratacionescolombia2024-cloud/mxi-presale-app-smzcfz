
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User>, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Mock authentication - replace with Supabase
  const login = async (email: string, password: string) => {
    console.log('Login attempt:', email);
    
    // Check if admin
    if (email === 'admin@mxi.com' && password === 'admin123') {
      setIsAdmin(true);
      setUser({
        id: 'admin-1',
        email: 'admin@mxi.com',
        name: 'Administrator',
        identification: 'ADMIN',
        address: 'Admin Office',
        createdAt: new Date().toISOString(),
        emailVerified: true,
        kycStatus: 'approved',
        referralCode: 'ADMIN000',
      });
      return;
    }

    // Mock user login
    setUser({
      id: '1',
      email,
      name: 'Demo User',
      identification: 'ID123456',
      address: '123 Main St',
      createdAt: new Date().toISOString(),
      emailVerified: true,
      kycStatus: 'pending',
      referralCode: 'MXI' + Math.random().toString(36).substr(2, 6).toUpperCase(),
    });
  };

  const register = async (userData: Partial<User>, password: string) => {
    console.log('Register attempt:', userData);
    
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: userData.email || '',
      name: userData.name || '',
      identification: userData.identification || '',
      address: userData.address || '',
      createdAt: new Date().toISOString(),
      emailVerified: false,
      kycStatus: 'pending',
      referralCode: 'MXI' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      referredBy: userData.referredBy,
    };
    
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
  };

  const updateUser = async (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isAdmin, login, register, logout, updateUser }}>
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
