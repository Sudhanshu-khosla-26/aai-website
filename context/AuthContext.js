'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { login, register, logout, verifyOTP, forgotPassword, resetPassword, getCurrentUser } from '../services/authService';
import { ROLES } from '../lib/constants';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const normalizeRole = (role) => (role || '').toLowerCase();

const normalizeUser = (rawUser) => {
  if (!rawUser) return null;
  if (rawUser.firstName || rawUser.lastName) {
    const fullName = rawUser.fullName || [rawUser.firstName, rawUser.lastName].filter(Boolean).join(' ').trim();
    return { ...rawUser, fullName };
  }
  if (rawUser.fullName) {
    const parts = rawUser.fullName.trim().split(/\s+/);
    const firstName = parts.shift() || '';
    const lastName = parts.join(' ');
    return { ...rawUser, firstName, lastName };
  }
  return rawUser;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Redirect unauthenticated users from protected routes
  useEffect(() => {
    if (!isLoading) {
      const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/'];
      const isPublicRoute = publicRoutes.some(route => pathname === route || pathname?.startsWith(route));
      
      if (!isAuthenticated && !isPublicRoute) {
        router.push('/login');
      }
      
      if (isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
        const redirectPath = normalizeRole(user?.role) === ROLES.ADMIN || normalizeRole(user?.role) === ROLES.SUPER_ADMIN
          ? '/admin/dashboard'
          : '/employee/dashboard';
        router.push(redirectPath);
      }
    }
  }, [isAuthenticated, isLoading, pathname, router, user]);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('aai_token');
      if (token) {
        const userData = await getCurrentUser();
        if (userData) {
          setUser(normalizeUser(userData));
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('aai_token');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('aai_token');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      setIsLoading(true);
      const identifier = credentials?.identifier || credentials?.email || credentials?.employeeId || credentials;
      const password = credentials?.password;
      const response = await login(identifier, password);

      if (!response?.success) {
        throw new Error(response?.error || 'Login failed');
      }

      localStorage.setItem('aai_token', response.token);
      const normalizedUser = normalizeUser(response.user);
      setUser(normalizedUser);
      setIsAuthenticated(true);

      toast.success(`Welcome back, ${normalizedUser?.firstName || normalizedUser?.fullName || 'User'}!`);

      // Redirect based on role
      const redirectPath = normalizeRole(normalizedUser?.role) === ROLES.ADMIN || normalizeRole(normalizedUser?.role) === ROLES.SUPER_ADMIN
        ? '/admin/dashboard'
        : '/employee/dashboard';
      
      router.push(redirectPath);
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Login failed');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (userData) => {
    try {
      setIsLoading(true);
      const response = await register(userData);

      if (!response?.success) {
        throw new Error(response?.error || 'Registration failed');
      }

      toast.success(response?.message || 'Registration successful! Please wait for approval.');
      router.push('/login');
      return { success: true, userId: response?.user?.id };
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('aai_token');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
      router.push('/login');
    }
  };

  const handleVerifyOTP = async (otpData) => {
    try {
      setIsLoading(true);
      await verifyOTP(otpData);
      toast.success('OTP verified successfully!');
      router.push('/login');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'OTP verification failed');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (email) => {
    try {
      setIsLoading(true);
      await forgotPassword(email);
      toast.success('Password reset instructions sent to your email');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Failed to send reset instructions');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (resetData) => {
    try {
      setIsLoading(true);
      await resetPassword(resetData);
      toast.success('Password reset successful! Please login with your new password.');
      router.push('/login');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Password reset failed');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (requiredRole) => {
    if (!user) return false;
    if (normalizeRole(user.role) === ROLES.SUPER_ADMIN) return true;
    if (Array.isArray(requiredRole)) {
      return requiredRole.map(normalizeRole).includes(normalizeRole(user.role));
    }
    return normalizeRole(user.role) === normalizeRole(requiredRole);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    verifyOTP: handleVerifyOTP,
    forgotPassword: handleForgotPassword,
    resetPassword: handleResetPassword,
    hasPermission,
    refreshUser: checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
