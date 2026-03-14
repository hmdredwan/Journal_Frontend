'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Menu, X, Users, Shield, FileText, Upload, Settings, LogOut, 
  LayoutDashboard, UserCog, User, BarChart3, BookOpen, UserCheck, Bell, Clock, History
} from 'lucide-react';

// Import tab components
import ManageEditorialBoard from '@/components/admin/ManageEditorialBoard';
import ManageUsers from '@/components/admin/ManageUsers';
import ManageRoles from '@/components/admin/ManageRoles'; 
import ManageSubmissions from '@/components/admin/ManageSubmissions';
import CreateUserForm from '@/components/admin/CreateUserForm';
import SettingsTab from '@/components/admin/SettingsTab';
import ManageIssues from '@/components/admin/ManageIssues';
import ManageReviewAssignments from '@/components/admin/ManageReviewAssignments';
import DecisionLogsTab from '@/components/admin/DecisionLogsTab';
import CallForPapersTab from '@/components/admin/CallForPapersTab';
import ManageSubmissionDeadline from '@/components/admin/ManageSubmissionDeadline';
import ManageReviewerApplications from '@/components/admin/ManageReviewerApplications';

import { apiUrl } from '@/utils/api';

export default function DashboardPage() {
  const router = useRouter();

  // Token + mount state (prevents server-side crash during build)
  const [token, setToken] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRoles: 0,
    totalSubmissions: 0,
    totalBoardMembers: 0,
    totalPapers: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState('');

  // Safely read token + role on client only
  useEffect(() => {
    setIsMounted(true);

    if (typeof window !== 'undefined') {
      const t = localStorage.getItem('access_token');
      const userRole = localStorage.getItem('user_role');

      setToken(t);

      // Redirect if no token or not admin
      if (!t || userRole !== 'admin') {
        router.replace('/login');
      }
    }
  }, [router]);

  // Fetch stats only after client is ready and token exists
  useEffect(() => {
    if (!isMounted || !token) return;
    fetchDashboardStats();
  }, [isMounted, token]);

  const fetchDashboardStats = async () => {
    if (!token) return;

    setLoadingStats(true);
    setStatsError('');

    try {
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const [usersRes, rolesRes, subsRes, boardRes, papersRes] = await Promise.all([
        fetch(apiUrl('users/'), { headers }),
        fetch(apiUrl('roles/'), { headers }),
        fetch(apiUrl('submissions/'), { headers }),
        fetch(apiUrl('editorial-board/'), { headers }),
        fetch(apiUrl('papers/'), { headers }),
      ]);

      if (!usersRes.ok || !rolesRes.ok || !subsRes.ok || !boardRes.ok || !papersRes.ok) {
        throw new Error('One or more stats requests failed');
      }

      const [users, roles, submissions, board, papers] = await Promise.all([
        usersRes.json(),
        rolesRes.json(),
        subsRes.json(),
        boardRes.json(),
        papersRes.json(),
      ]);

      setStats({
        totalUsers: Array.isArray(users) ? users.length : users.count || users.results?.length || 0,
        totalRoles: Array.isArray(roles) ? roles.length : roles.count || roles.results?.length || 0,
        totalSubmissions: Array.isArray(submissions) ? submissions.length : submissions.count || submissions.results?.length || 0,
        totalBoardMembers: Array.isArray(board) ? board.length : board.count || board.results?.length || 0,
        totalPapers: Array.isArray(papers) ? papers.length : papers.count || papers.results?.length || 0,
      });
    } catch (err: any) {
      setStatsError('Failed to load dashboard statistics. Please try again.');
      console.error('Stats fetch error:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'create-user', label: 'Create User', icon: User },
    { id: 'users', label: 'Manage Users', icon: Users },
    { id: 'roles', label: 'Manage Roles', icon: UserCog },
    { id: 'editorial-board', label: 'Manage Editorial Board', icon: Users },
    { id: 'submissions', label: 'Submissions', icon: FileText },
    { id: 'manage-issues', label: 'Manage Issues & Volumes', icon: BookOpen },
    { id: 'review-assignments', label: 'Review Assignments', icon: FileText },
    { id: 'call-for-papers', label: 'Call for Papers', icon: Bell },
    { id: 'submission-deadline', label: 'Submission Deadline', icon: Clock },
    { id: 'reviewer-applications', label: 'Reviewer Applications', icon: UserCheck },
    { id: 'decision-logs', label: 'Decision Logs', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Show loading until client is fully mounted and stats are ready
  if (!isMounted || loadingStats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex lg:items-stretch">
      {/* Mobile Sidebar Toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white shadow-2xl transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:fixed lg:translate-x-0 lg:self-stretch lg:h-screen lg:z-50 flex flex-col overflow-hidden`}
      >
        <div className="p-6 border-b shrink-0">
          <h1 className="text-3xl font-extrabold text-blue-700">Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Superadmin Panel</p>
        </div>

        <nav className="mt-4 px-3 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 ${
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

        <div className="mt-auto p-6 border-t shrink-0">
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
      <main className={`flex-1 lg:ml-72 min-h-screen pt-6 px-4 sm:px-6 lg:px-10 ${sidebarOpen ? 'blur-sm lg:blur-none' : ''}`}>
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            {sidebarItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
          </h2>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/profile" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100">
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
        </header>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 min-h-[70vh]">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
                Dashboard Overview
              </h3>

              {statsError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-8">
                  {statsError}
                </div>
              )}

              {loadingStats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-2xl p-6 animate-pulse h-40"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                  <div className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Total Users</p>
                        <h4 className="text-3xl sm:text-4xl font-bold mt-2">{stats.totalUsers}</h4>
                      </div>
                      <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                        <Users size={32} />
                      </div>
                    </div>
                    <p className="text-blue-100 text-sm opacity-90">Registered accounts</p>
                  </div>

                  <div className="group bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">Total Roles</p>
                        <h4 className="text-3xl sm:text-4xl font-bold mt-2">{stats.totalRoles}</h4>
                      </div>
                      <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                        <Shield size={32} />
                      </div>
                    </div>
                    <p className="text-purple-100 text-sm opacity-90">Defined permissions</p>
                  </div>

                  <div className="group bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-orange-100 text-sm font-medium">Total Submissions</p>
                        <h4 className="text-3xl sm:text-4xl font-bold mt-2">{stats.totalSubmissions}</h4>
                      </div>
                      <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                        <Upload size={32} />
                      </div>
                    </div>
                    <p className="text-orange-100 text-sm opacity-90">Manuscripts received</p>
                  </div>

                  <div className="group bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-green-100 text-sm font-medium">Board Members</p>
                        <h4 className="text-3xl sm:text-4xl font-bold mt-2">{stats.totalBoardMembers}</h4>
                      </div>
                      <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                        <UserCheck size={32} />
                      </div>
                    </div>
                    <p className="text-green-100 text-sm opacity-90">Editorial team</p>
                  </div>

                  <div className="group bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-red-100 text-sm font-medium">Published Papers</p>
                        <h4 className="text-3xl sm:text-4xl font-bold mt-2">{stats.totalPapers}</h4>
                      </div>
                      <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                        <BookOpen size={32} />
                      </div>
                    </div>
                    <p className="text-red-100 text-sm opacity-90">Articles in journal</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'editorial-board' && <ManageEditorialBoard />}
          {activeTab === 'users' && <ManageUsers />}
          {activeTab === 'roles' && <ManageRoles />}
          {activeTab === 'submissions' && <ManageSubmissions />}
          {activeTab === 'manage-issues' && <ManageIssues />}
          {activeTab === 'create-user' && <CreateUserForm />}
          {activeTab === 'settings' && <SettingsTab />}
          {activeTab === 'review-assignments' && <ManageReviewAssignments />}
          {activeTab === 'call-for-papers' && <CallForPapersTab />}
          {activeTab === 'submission-deadline' && <ManageSubmissionDeadline />}
          {activeTab === 'decision-logs' && <DecisionLogsTab />}
          {activeTab === 'reviewer-applications' && <ManageReviewerApplications />}

          {/* Fallback for unimplemented tabs */}
          {!['overview', 'editorial-board', 'users', 'roles', 'submissions', 'manage-issues', 'create-user', 'settings', 'review-assignments', 'call-for-papers', 'decision-logs'].includes(activeTab) && (
            <div className="text-center py-20">
              <h3 className="text-3xl font-bold text-gray-700">
                {sidebarItems.find(item => item.id === activeTab)?.label || 'Section'}
              </h3>
              <p className="mt-6 text-lg text-gray-500">
                This section is under development.
              </p>
            </div>
          )}
        </div>
      </main>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 lg:hidden z-30" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}