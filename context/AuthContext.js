'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ROLES } from '../lib/constants';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const normalizeRole = (role) => (role || '').toLowerCase();

const normalizeUser = (rawUser) => {
  if (!rawUser) return null;
  const firstName = rawUser.firstName || (rawUser.fullName?.trim().split(/\s+/)[0] ?? '');
  const lastParts = rawUser.fullName?.trim().split(/\s+/).slice(1) ?? [];
  const lastName = rawUser.lastName || lastParts.join(' ');
  const fullName = rawUser.fullName || [firstName, lastName].filter(Boolean).join(' ').trim();
  return { ...rawUser, firstName, lastName, fullName };
};

/** Call Next.js API routes */
async function apiFetch(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('aai_token') : null;
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  return res.json();
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('aai_token');
      if (!token) return;

      const data = await apiFetch('/api/auth/me');
      if (data.success && data.user) {
        setUser(normalizeUser(data.user));
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('aai_token');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('aai_token');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Route guard
  useEffect(() => {
    if (!isLoading) {
      const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/'];
      const isPublicRoute = publicRoutes.some(
        (route) => pathname === route || pathname?.startsWith(route + '/')
      );

      if (!isAuthenticated && !isPublicRoute) {
        router.push('/login');
      }

      if (isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
        const role = normalizeRole(user?.role);
        const redirectPath =
          role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN
            ? '/admin/dashboard'
            : '/employee/dashboard';
        router.push(redirectPath);
      }
    }
  }, [isAuthenticated, isLoading, pathname, router, user]);

  const handleLogin = async (credentials) => {
    try {
      setIsLoading(true);
      const identifier = credentials?.identifier || credentials?.email || credentials?.employeeId || credentials;
      const password = credentials?.password;

      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });

      if (!data?.success) {
        throw new Error(data?.message || 'Login failed');
      }

      localStorage.setItem('aai_token', data.token);
      const normalizedUser = normalizeUser(data.user);
      setUser(normalizedUser);
      setIsAuthenticated(true);

      toast.success(`Welcome back, ${normalizedUser?.firstName || normalizedUser?.fullName || 'User'}!`);

      const role = normalizeRole(normalizedUser?.role);
      const redirectPath =
        role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN
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
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (!data?.success) {
        throw new Error(data?.message || 'Registration failed');
      }

      toast.success(data?.message || 'Registration successful! Please wait for approval.');
      router.push('/login');
      return { success: true, userId: data?.user?._id };
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (_) { }
    localStorage.removeItem('aai_token');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const handleForgotPassword = async (email) => {
    try {
      setIsLoading(true);
      const data = await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      if (!data?.success) throw new Error(data?.message);
      toast.success(data.message || 'OTP sent to your email');
      return { success: true, demoOtp: data.demoOtp };
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async ({ email, otp }) => {
    try {
      setIsLoading(true);
      const data = await apiFetch('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });
      if (!data?.success) throw new Error(data?.message);
      toast.success('OTP verified successfully!');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'OTP verification failed');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async ({ email, otp, newPassword }) => {
    try {
      setIsLoading(true);
      const data = await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, otp, newPassword }),
      });
      if (!data?.success) throw new Error(data?.message);
      toast.success('Password reset successful! Please login.');
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
    forgotPassword: handleForgotPassword,
    verifyOTP: handleVerifyOTP,
    resetPassword: handleResetPassword,
    hasPermission,
    refreshUser: checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
