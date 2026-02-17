'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../lib/constants';
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  MapPin,
  Settings,
  UserCircle,
  LogOut,
  Shield,
  Building2,
  BarChart3,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { user, logout, hasPermission } = useAuth();

  const adminNavItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/employees', label: 'Employees', icon: Users },
    { href: '/admin/attendance', label: 'Attendance', icon: Clock },
    { href: '/admin/leaves', label: 'Leave Management', icon: Calendar },
    { href: '/admin/locations', label: 'Locations', icon: MapPin },
    { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const employeeNavItems = [
    { href: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/employee/attendance', label: 'My Attendance', icon: Clock },
    { href: '/employee/leaves', label: 'My Leaves', icon: Calendar },
    { href: '/employee/profile', label: 'Profile', icon: UserCircle },
  ];

  const navItems = hasPermission([ROLES.ADMIN, ROLES.SUPER_ADMIN]) ? adminNavItems : employeeNavItems;

  const isActive = (href) => {
    if (href === '/admin/dashboard' || href === '/employee/dashboard') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-primary-900 text-white transition-transform duration-300 ease-in-out',
          'flex flex-col',
          !isOpen && '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-primary-800">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <span className="text-primary-900 font-bold text-lg">AAI</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">AAI Attendance</h1>
            <p className="text-xs text-primary-300">Government of India</p>
          </div>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-primary-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary-500 flex items-center justify-center">
              <span className="font-semibold text-sm">
                {/* {user?.firstName?.[0]}{user?.lastName?.[0]} */}
                SK
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {/* {user?.firstName} {user?.lastName} */}
                  Sudhanshu Khosla
              </p>
              <p className="text-xs text-primary-300 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className={cn(
              'px-2 py-0.5 text-xs rounded-full font-medium',
              user?.role === ROLES.SUPER_ADMIN && 'bg-purple-500/20 text-purple-300',
              user?.role === ROLES.ADMIN && 'bg-secondary-500/20 text-secondary-300',
              user?.role === ROLES.EMPLOYEE && 'bg-green-500/20 text-green-300'
            )}>
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => onClose?.()}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      active
                        ? 'bg-secondary-500 text-white'
                        : 'text-primary-100 hover:bg-primary-800 hover:text-white'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-primary-800">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-primary-100 hover:bg-primary-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
