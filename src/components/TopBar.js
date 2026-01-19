'use client';

import { useState } from 'react';
import { FaBell, FaSearch } from 'react-icons/fa';
import LanguageSwitcher from './LanguageSwitcher';

export default function TopBar({ title, subtitle, breadcrumbs }) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6 -mx-6 -mt-6">
      <div className="flex items-center justify-between">
        {/* Left: Title and Breadcrumbs */}
        <div>
          {breadcrumbs && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              {breadcrumbs.map((crumb, index) => (
                <span key={index} className="flex items-center gap-2">
                  {crumb}
                  {index < breadcrumbs.length - 1 && <span>/</span>}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FaSearch size={18} color="#6b7280" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
            >
              <FaBell size={18} color="#6b7280" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
}
