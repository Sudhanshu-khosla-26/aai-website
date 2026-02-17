'use client';

import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onMenuClick, className }) => {
  const { user } = useAuth();
    const displayName = user?.firstName || user?.lastName
      ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
      : user?.fullName || '';
    const initials = user?.firstName || user?.lastName
      ? `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`
      : (user?.fullName || '').split(/\s+/).map(part => part[0]).join('').slice(0, 2);

  return (
    <header
      className={cn(
        'sticky top-0 z-30 bg-white border-b border-gray-200 px-4 lg:px-6 py-3',
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {/* Search - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm w-48 lg:w-64 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User Avatar - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {displayName}
              </p>
              <p className="text-xs text-gray-500">{user?.department}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 font-semibold text-sm">
                  {initials}
              </span>
            </div>
          </div>

          {/* User Avatar - Mobile */}
          <div className="lg:hidden w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-700 font-semibold text-xs">
                {initials}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
