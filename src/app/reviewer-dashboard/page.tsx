'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Menu, X, Clock, History, User, LogOut 
} from 'lucide-react';

import ReviewerProfilePage from './profile/page';
import AssignedReviewsContent from './assigned/page';
import ReviewLogsContent from './logs/page';

import { apiUrl } from '@/utils/api';

export default function ReviewerDashboard() {
  const router = useRouter();

  // Token + mount state (prevents server crash during build)
  const [token, setToken] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('assigned');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Safely read token + role on client only
  useEffect(() => {
    setIsMounted(true);

    if (typeof window !== 'undefined') {
      const t = localStorage.getItem('access_token');
      const role = localStorage.getItem('user_role');

      setToken(t);

      // Redirect if no token or not reviewer
      if (!t || role !== 'reviewer') {
        router.replace('/login');
      }
    }
  }, [router]);

  // Fetch assignments only after client is ready and token exists
  useEffect(() => {
    if (!isMounted || !token) return;
    fetchAssignments();
  }, [isMounted, token]);

  const fetchAssignments = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch(apiUrl('review-assignments/'), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to load assignments');
      const data = await res.json();
      setAssignments(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const sidebarItems = [
    { id: 'assigned', label: 'Assigned Reviews', icon: Clock },
    { id: 'logs',     label: 'My Review Logs',   icon: History },
    { id: 'profile',  label: 'Update Profile',   icon: User },
  ];

  // Show loading until client is mounted and data is ready
  if (!isMounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reviewer dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-white shadow-2xl transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:fixed lg:translate-x-0 lg:h-screen flex flex-col`}>

        <div className="p-6 border-b">
          <h1 className="text-3xl font-extrabold text-blue-700">Reviewer</h1>
          <p className="text-sm text-gray-500 mt-1">Reviewer Panel Portal</p>
        </div>

        <nav className="mt-6 px-3 flex-1 overflow-y-auto">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon size={22} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto p-6 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 lg:ml-72 min-h-screen pt-6 px-6 lg:px-10 ${sidebarOpen ? 'blur-sm lg:blur-none' : ''}`}>
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            {sidebarItems.find(i => i.id === activeTab)?.label || 'Reviewer Dashboard'}
          </h2>
        </header>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 min-h-[70vh]">
          {error ? (
            <p className="text-red-600 text-center py-10">{error}</p>
          ) : (
            <>
              {activeTab === 'assigned' && (
                <AssignedReviewsContent 
                  assignments={assignments} 
                  onRefresh={fetchAssignments}
                />
              )}

              {activeTab === 'logs' && (
                <ReviewLogsContent assignments={assignments} />
              )}

              {activeTab === 'profile' && (
                <ReviewerProfilePage />
              )}
            </>
          )}
        </div>
      </main>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 lg:hidden z-30" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}