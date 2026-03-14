// src/app/author-dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UserDashboardLayout from '@/components/user/UserDashboardLayout';
import { Menu, X, LogOut, User, Clock, AlertCircle,FileText } from 'lucide-react';
import { apiUrl } from '@/utils/api';

export default function AuthorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');

    if (!token || role !== 'author') {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  // ──────────────────────────────────────────────
  // Deadline Countdown Component
  // ──────────────────────────────────────────────
  function DeadlineCountdown() {
    const [deadlineInfo, setDeadlineInfo] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');

    useEffect(() => {
      const fetchDeadline = async () => {
        try {
          const res = await fetch(apiUrl('submission-deadline/'));
          if (!res.ok) throw new Error('Failed to fetch deadline');

          const data = await res.json();
          setDeadlineInfo(data);

          if (data.has_deadline && !data.is_expired) {
            const deadlineDate = new Date(data.deadline);
            const updateTimer = () => {
              const now = new Date();
              const diff = deadlineDate.getTime() - now.getTime();

              if (diff <= 0) {
                setTimeLeft(null);
                return;
              }

              setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000),
              });
            };

            updateTimer();
            const interval = setInterval(updateTimer, 1000);
            return () => clearInterval(interval);
          }
        } catch (err: any) {
          console.error('Deadline fetch failed:', err);
          setFetchError('Could not load submission deadline.');
        } finally {
          setLoading(false);
        }
      };

      fetchDeadline();
    }, []);

    if (loading) {
      return (
        <div className="bg-white rounded-xl shadow p-6 text-center animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-4"></div>
          <div className="flex justify-center gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 w-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      );
    }

    if (fetchError || !deadlineInfo?.has_deadline) {
      return null; // silently hide if no deadline set
    }

    if (deadlineInfo.is_expired) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl mb-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-3 text-red-600" size={40} />
          <h3 className="text-xl font-bold">Submission Deadline Has Passed</h3>
          <p className="mt-2 text-lg">
            Closed on {new Date(deadlineInfo.deadline).toLocaleString('en-US', {
              dateStyle: 'long',
              timeStyle: 'short',
            })}
          </p>
          <p className="mt-3 text-sm opacity-90">
            Contact the editorial office for late submissions or extensions.
          </p>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-6 md:p-8 rounded-2xl shadow-2xl mb-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-bold flex items-center justify-center md:justify-start gap-3 mb-2">
              <Clock size={32} className="opacity-90" />
              Submission Deadline
            </h3>
            <p className="text-indigo-100 opacity-90 text-lg">
              Closes on{' '}
              <span className="font-semibold">
                {new Date(deadlineInfo.deadline).toLocaleString('en-US', {
                  dateStyle: 'long',
                  timeStyle: 'short',
                })}
              </span>
            </p>
          </div>

          {timeLeft && (
            <div className="grid grid-cols-4 gap-3 md:gap-5 text-center">
              {Object.entries(timeLeft).map(([unit, value]: [string, any]) => (
                <div
                  key={unit}
                  className="bg-white/15 backdrop-blur-md px-5 py-4 rounded-xl border border-white/20 min-w-[80px]"
                >
                  <div className="text-3xl md:text-4xl font-extrabold">
                    {String(value).padStart(2, '0')}
                  </div>
                  <div className="text-xs md:text-sm uppercase opacity-90 mt-1 tracking-wide">
                    {unit}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {deadlineInfo.note && (
          <div className="mt-6 pt-4 border-t border-white/20 text-center md:text-left">
            <p className="text-sm opacity-90 italic">
              <strong>Note:</strong> {deadlineInfo.note}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <UserDashboardLayout role="author">
      <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
        {/* Countdown – now correctly placed at the top */}
        <DeadlineCountdown />

        {/* Mobile Sidebar Toggle */}
        <button
          className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Stats Cards – replace with real API data later */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700">Submitted</h3>
            <p className="text-4xl font-bold text-blue-600 mt-2">8</p>
            <p className="text-sm text-gray-500 mt-1">Total manuscripts</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700">Under Review</h3>
            <p className="text-4xl font-bold text-yellow-600 mt-2">3</p>
            <p className="text-sm text-gray-500 mt-1">In peer review</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700">Accepted</h3>
            <p className="text-4xl font-bold text-green-600 mt-2">2</p>
            <p className="text-sm text-gray-500 mt-1">Published/accepted</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700">Rejected</h3>
            <p className="text-4xl font-bold text-red-600 mt-2">1</p>
            <p className="text-sm text-gray-500 mt-1">Total rejections</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-10">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              href="/author-dashboard/submit"
              className="bg-blue-600 text-white py-6 px-8 rounded-xl hover:bg-blue-700 transition text-center font-medium shadow-md flex items-center justify-center gap-2"
            >
              <FileText size={20} />
              Submit New Manuscript
            </Link>
            <Link
              href="/author-dashboard/my-submissions"
              className="bg-gray-100 text-gray-800 py-6 px-8 rounded-xl hover:bg-gray-200 transition text-center font-medium shadow-md flex items-center justify-center gap-2"
            >
              <Clock size={20} />
              Track My Submissions
            </Link>
            <button className="bg-gray-100 text-gray-800 py-6 px-8 rounded-xl hover:bg-gray-200 transition text-center font-medium shadow-md flex items-center justify-center gap-2">
              <AlertCircle size={20} />
              View Review Feedback
            </button>
          </div>
        </div>

        {/* Recent Submissions Placeholder */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
          <p className="text-gray-600">
            You have no recent submissions yet. Start by submitting your first manuscript!
          </p>
        </div>
      </div>
    </UserDashboardLayout>
  );
}