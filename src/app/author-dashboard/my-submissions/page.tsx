// src/app/author-dashboard/my-submissions/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import UserDashboardLayout from '@/components/user/UserDashboardLayout';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import { apiUrl } from '@/utils/api';

export default function MySubmissions() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);

  // Read token only on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('access_token');
      setToken(storedToken);
    }
  }, []);

  // Fetch submissions
  useEffect(() => {
    if (token === null) return; // wait for token

    if (!token) {
      setError('You need to be logged in to view your submissions.');
      setLoading(false);
      return;
    }

    const fetchMySubmissions = async () => {
      try {
        const res = await fetch(apiUrl('author-submissions/'), {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            setError('Session expired. Please log in again.');
            // Optional: auto-redirect to login
            // setTimeout(() => window.location.href = '/login', 2000);
          } else {
            const errText = await res.text().catch(() => 'Unknown server error');
            throw new Error(`Failed to load submissions (${res.status}): ${errText}`);
          }
        } else {
          const data = await res.json();
          setSubmissions(Array.isArray(data) ? data : data.results || []);
        }
      } catch (err: any) {
        setError(err.message || 'Could not load your submissions. Please try again later.');
        console.error('Submissions fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMySubmissions();
  }, [token]);

  const getStatusIcon = (status?: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('submitted'))    return <Clock className="text-blue-500" size={22} />;
    if (s.includes('review') || s.includes('desk')) return <AlertCircle className="text-yellow-500" size={22} />;
    if (s.includes('accepted'))     return <CheckCircle className="text-green-500" size={22} />;
    if (s.includes('rejected'))     return <XCircle className="text-red-500" size={22} />;
    return <FileText className="text-gray-500" size={22} />;
  };

  const getStatusStyles = (status?: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('submitted'))    return 'bg-blue-100 text-blue-800 border border-blue-200';
    if (s.includes('review') || s.includes('desk')) return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    if (s.includes('accepted'))     return 'bg-green-100 text-green-800 border border-green-200';
    if (s.includes('rejected'))     return 'bg-red-100 text-red-800 border border-red-200';
    return 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getFileUrl = (filePath?: string) => {
    if (!filePath) return '#';
    if (filePath.startsWith('http') || filePath.startsWith('//')) return filePath;
    // Assume backend returns relative path like /media/... or media/...
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    return apiUrl(cleanPath);
  };

  return (
    <UserDashboardLayout role="author">
      <div className="space-y-8">
        {/* Page Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          My Submissions
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
            <p className="text-gray-600 font-medium">Loading your submissions...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-xl text-center max-w-2xl mx-auto">
            <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
            <h3 className="text-xl font-semibold mb-3">Cannot Access Submissions</h3>
            <p className="text-lg mb-6">{error}</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-md"
              >
                Go to Login
              </Link>

              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center px-8 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition"
              >
                Retry
              </button>
            </div>
          </div>
        ) : submissions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border p-10 md:p-16 text-center">
            <FileText className="mx-auto text-gray-400 mb-6" size={80} />
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              No submissions found
            </h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              You haven't submitted any manuscripts yet (or none where you are listed as author/co-author).
            </p>
            <Link
              href="/author-dashboard/submit"
              className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white font-semibold text-lg rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
            >
              Submit Your First Manuscript
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {submissions.map((sub: any) => (
              <div
                key={sub.id}
                className="bg-white rounded-2xl shadow-md border overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="p-6 md:p-8 flex flex-col flex-grow">
                  {/* Title + Status */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 line-clamp-2">
                      {sub.title || 'Untitled Manuscript'}
                    </h3>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {getStatusIcon(sub.current_status || sub.status)}
                      <span
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border ${getStatusStyles(
                          sub.current_status || sub.status
                        )}`}
                      >
                        {(sub.current_status || sub.status || 'Unknown')
                          .replace('_', ' ')
                          .toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 mb-6 flex-grow">
                    <div className="space-y-1.5">
                      <p><strong>Submitted:</strong> {formatDate(sub.created_at)}</p>
                      {sub.manuscript_type && (
                        <p><strong>Type:</strong> {sub.manuscript_type.replace('-', ' ')}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      {sub.editor_assigned_name && (
                        <p><strong>Editor:</strong> {sub.editor_assigned_name}</p>
                      )}
                      {sub.keywords && (
                        <p><strong>Keywords:</strong> {sub.keywords}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-4 mt-auto pt-6 border-t">
                    {sub.files && (
                      <a
                        href={getFileUrl(sub.files)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm hover:shadow"
                      >
                        <FileText size={18} />
                        View Manuscript
                      </a>
                    )}

                    <Link
                      href={`/author-dashboard/submissions/${sub.id}`}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                    >
                      <Eye size={18} />
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserDashboardLayout>
  );
}