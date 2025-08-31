'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserIcon, 
  Cog6ToothIcon, 
  HeartIcon, 
  HomeIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { AuthUser } from '@/types/user';

interface UserMenuProps {
  user: AuthUser | null;
  onLogout: () => void;
}

export default function UserMenu({ user, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const menuItems = [
    {
      icon: UserIcon,
      label: 'Profile',
      href: '/profile',
    },
    {
      icon: HeartIcon,
      label: 'Wishlist',
      href: '/wishlist',
    },
    {
      icon: HomeIcon,
      label: 'My Bookings',
      href: '/bookings',
    },
    {
      icon: Cog6ToothIcon,
      label: 'Settings',
      href: '/settings',
    },
  ];

  // Add owner-specific menu items
  if (user.user_type === 'owner') {
    menuItems.splice(2, 0, {
      icon: HomeIcon,
      label: 'My Properties',
      href: '/dashboard/properties',
    });
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg text-gray-300 hover:text-white hover:bg-dark-800 transition-all duration-200"
      >
        <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center">
          <UserIcon className="w-5 h-5 text-primary-500" />
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-white">
            {user.first_name} {user.last_name}
          </p>
          <p className="text-xs text-gray-400 capitalize">
            {user.user_type}
          </p>
        </div>
        <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 bg-dark-900 border border-dark-700 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {/* User Info Header */}
            <div className="p-4 border-b border-dark-700">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-primary-500" />
                </div>
                <div>
                  <p className="font-medium text-white">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                  <p className="text-xs text-primary-500 capitalize">
                    {user.user_type}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-dark-800 transition-colors duration-200"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Logout Button */}
            <div className="border-t border-dark-700 p-2">
              <button
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
