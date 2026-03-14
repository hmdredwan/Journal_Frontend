'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Menu, X, FileSearch, Users, Eye, Gavel, LogOut, User, 
  LayoutDashboard, FileText, CheckCircle, AlertCircle, Settings, Clock, 
  UserCheck
} from 'lucide-react';

// Import tab contents
import OverviewContent from './overview/page';
import DeskReviewContent from './desk-review/page';
import AssignReviewersContent from './assign-reviewers/page';
import MonitorReviewsContent from './monitor-reviews/page';
import FinalDecisionContent from './final-decision/page';
import SettingsContent from './settings/page';
import ManageSubmissionDeadline from '@/components/admin/ManageSubmissionDeadline';  // ← Reuse admin component
import ManageReviewerApplications from '@/components/admin/ManageReviewerApplications'; // reuse same component

export default function EditorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role')?.toLowerCase();

    if (!token || role !== 'editor') {
      router.push('/login');
      return;
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'desk-review', label: 'Initial Screening', icon: FileSearch },
    { id: 'assign-reviewers', label: 'Assign Reviewers', icon: Users },
    { id: 'monitor-reviews', label: 'Monitor Reviews', icon: Eye },
    { id: 'final-decision', label: 'Make Decisions', icon: Gavel },
    { id: 'deadline', label: 'Submission Deadline', icon: Clock },  // ← New tab
    { id: 'reviewer-applications', label: 'Reviewer Applications', icon: UserCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

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
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-2xl transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:fixed lg:translate-x-0 lg:h-screen lg:z-50 flex flex-col`}>
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-700">Editor</h1>
          <p className="text-xs text-gray-500 mt-1">Editor Panel</p>
        </div>

        <nav className="mt-6 px-3 space-y-2 flex-1 overflow-y-auto">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition ${
                activeTab === item.id ? 'bg-blue-50 text-blue-700 font-medium' : ''
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition text-sm font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 lg:ml-64 min-h-screen pt-6 px-6 lg:px-10 ${sidebarOpen ? 'blur-sm lg:blur-none' : ''}`}>
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            {sidebarItems.find(item => item.id === activeTab)?.label || 'Editor Dashboard'}
          </h2>

          <div className="flex items-center gap-3">
            <Link href="/editor-dashboard/profile" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100">
              <User size={18} />
              <span className="hidden md:inline text-sm text-gray-700">Profile</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut size={18} />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </header>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 min-h-[70vh]">
          {activeTab === 'overview' && <OverviewContent />}
          {activeTab === 'desk-review' && <DeskReviewContent />}
          {activeTab === 'assign-reviewers' && <AssignReviewersContent />}
          {activeTab === 'monitor-reviews' && <MonitorReviewsContent />}
          {activeTab === 'final-decision' && <FinalDecisionContent />}
          {activeTab === 'deadline' && <ManageSubmissionDeadline />}  {/* ← New tab render */}
          {activeTab === 'reviewer-applications' && <ManageReviewerApplications />}
          {activeTab === 'settings' && <SettingsContent />}
        </div>
      </main>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 lg:hidden z-30" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}