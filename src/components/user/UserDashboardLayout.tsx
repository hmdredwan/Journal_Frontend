// src/components/user/UserDashboardLayout.tsx
"use client";

import { useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut, User, FileText, Settings, LayoutDashboard, Menu, X, Upload } from 'lucide-react';

interface UserDashboardLayoutProps {
  children: ReactNode;
  role?: 'user' | 'reviewer' | 'editor' | string;
}

export default function UserDashboardLayout({ children, role }: UserDashboardLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const base = role ? `/${role}-dashboard` : '/user-dashboard';

  const menuItems = [
    { href: `${base}`, label: 'Dashboard', icon: LayoutDashboard },
    { href: `${base}/profile`, label: 'Edit Profile', icon: User },
    { href: `${base}/my-submissions`, label: 'My Submissions', icon: FileText },
    { href: `${base}/submit`, label: 'Submit Manuscript', icon: Upload },
    { href: `${base}/settings`, label: 'Settings', icon: Settings },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  if (!mounted || !role) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ==================== SIDEBAR ==================== */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-[100] w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:shadow-none lg:w-64 lg:flex-shrink-0 lg:h-screen
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-blue-700">
            RRI {role.charAt(0).toUpperCase() + role.slice(1)}
          </h2>
        </div>

        <nav className="mt-6 px-3 space-y-1">
          {menuItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                pathname === item.href
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <button
            onClick={() => {
              handleLogout();
              closeSidebar();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* ==================== MAIN CONTENT AREA ==================== */}
      <div className="flex-1 flex flex-col">
        {/* Mobile toggle button */}
        <button
          className="lg:hidden fixed top-4 left-4 z-[110] p-3 bg-white rounded-xl shadow-lg border border-gray-200"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}

        <main className={`flex-1 p-6 ${sidebarOpen ? 'blur-sm pointer-events-none lg:blur-none lg:pointer-events-auto' : ''}`}>
          <div className="flex items-center justify-between gap-3 mb-6">
            {/* Page Title */}
            {pathname === `/${role}-dashboard` || pathname === `/${role}-dashboard/` ? (
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
              </h1>
            ) : <div />}

            <div className="flex items-center gap-3">
              <Link
                href={`/${role ? role : 'user'}-dashboard/profile`}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
              >
                <User size={18} />
                <span className="hidden sm:inline text-sm text-gray-700">Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}