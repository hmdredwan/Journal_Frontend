// src/components/admin/ManageReviewerApplications.tsx
'use client';

import { useState, useEffect } from 'react';
import { apiUrl } from '@/utils/api';
import { 
  UserCheck, CheckCircle, XCircle, AlertCircle, Eye, Loader2, 
  Download, Mail, User, Building, Calendar, FileText 
} from 'lucide-react';

export default function ManageReviewerApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(apiUrl('reviewer-applications/'), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`Failed to load: ${res.status}`);
      }

      const data = await res.json();
      setApplications(data);
    } catch (err) {
      console.error(err);
      setError('Could not load reviewer applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    if (actionLoading[id]) return;

    if (status === 'rejected' && !remarks.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    setActionLoading(prev => ({ ...prev, [id]: true }));

    try {
      const res = await fetch(apiUrl(`reviewer-applications/${id}/`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          review_remarks: remarks.trim(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to update application');
      }

      // Refresh list
      fetchApplications();
      setSelectedApp(null);
      setRemarks('');
      alert(`Application ${status === 'approved' ? 'approved' : 'rejected'} successfully!`);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const viewDetails = (app) => {
    setSelectedApp(app);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <span className="ml-4 text-lg text-gray-600">Loading applications...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-xl text-center max-w-3xl mx-auto">
        <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
        <h3 className="text-xl font-semibold mb-3">Error</h3>
        <p>{error}</p>
        <button 
          onClick={fetchApplications}
          className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <UserCheck className="text-green-600" size={32} />
          Reviewer Applications
        </h2>
        <button
          onClick={fetchApplications}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
        >
          <Loader2 size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {applications.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
          <UserCheck className="mx-auto mb-4 text-gray-400" size={64} />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No applications yet</h3>
          <p className="text-gray-500">New reviewer applications will appear here once submitted.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name / Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Expertise</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Affiliation</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Submitted</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {applications.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {app.full_name || app.applicant_name || 'Guest Applicant'}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Mail size={14} />
                        {app.email || app.applicant_email || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                      {app.expertise?.substring(0, 80)}{app.expertise?.length > 80 ? '...' : ''}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {app.affiliation}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(app.submitted_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => viewDetails(app)}
                        className="text-indigo-600 hover:text-indigo-800 mr-4"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>

                      {app.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAction(app.id, 'approved')}
                            disabled={actionLoading[app.id]}
                            className="text-green-600 hover:text-green-800 mr-4"
                            title="Approve"
                          >
                            {actionLoading[app.id] ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <CheckCircle size={18} />
                            )}
                          </button>
                          <button
                            onClick={() => handleAction(app.id, 'rejected')}
                            disabled={actionLoading[app.id]}
                            className="text-red-600 hover:text-red-800"
                            title="Reject"
                          >
                            {actionLoading[app.id] ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <XCircle size={18} />
                            )}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <UserCheck size={28} className="text-green-600" />
                Reviewer Application Details
              </h3>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X size={28} className="text-gray-600" />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              {/* Applicant Info */}
              <section className="bg-gray-50 p-6 rounded-xl border">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User size={20} className="text-gray-700" />
                  Applicant Information
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-medium">{selectedApp.full_name || selectedApp.applicant_name || 'Guest'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium break-all">
                      {selectedApp.email || selectedApp.applicant_email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Affiliation</p>
                    <p className="font-medium">{selectedApp.affiliation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ORCID iD</p>
                    <p className="font-medium">{selectedApp.orcid || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Google Scholar</p>
                    {selectedApp.google_scholar ? (
                      <a
                        href={selectedApp.google_scholar}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {selectedApp.google_scholar}
                      </a>
                    ) : (
                      <p className="text-gray-500">N/A</p>
                    )}
                  </div>
                </div>
              </section>

              {/* Expertise & Availability */}
              <section>
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-gray-700" />
                  Expertise & Availability
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Expertise</p>
                    <p className="whitespace-pre-line">{selectedApp.expertise}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Availability</p>
                    <p>{selectedApp.availability} reviews per year</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Research Interests</p>
                    <p className="whitespace-pre-line">{selectedApp.interests || 'Not provided'}</p>
                  </div>
                </div>
              </section>

              {/* Motivation */}
              <section>
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare size={20} className="text-gray-700" />
                  Motivation Statement
                </h4>
                <p className="whitespace-pre-line text-gray-700 border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r">
                  {selectedApp.motivation}
                </p>
              </section>

              {/* Publications */}
              {selectedApp.publications && (
                <section>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BookOpen size={20} className="text-gray-700" />
                    Key Publications
                  </h4>
                  <p className="whitespace-pre-line text-gray-700">{selectedApp.publications}</p>
                </section>
              )}

              {/* CV Download */}
              {selectedApp.cv && (
                <section>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Download size={20} className="text-gray-700" />
                    Curriculum Vitae
                  </h4>
                  <a
                    href={apiUrl(selectedApp.cv)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow"
                  >
                    <Download size={18} />
                    Download CV
                  </a>
                </section>
              )}

              {/* Admin Actions - only show if pending */}
              {selectedApp.status === 'pending' && (
                <section className="border-t pt-8">
                  <h4 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Gavel size={24} className="text-indigo-600" />
                    Review & Decide
                  </h4>

                  <div className="bg-gray-50 p-6 rounded-xl border">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Remarks / Feedback (required for rejection)
                    </label>
                    <textarea
                      value={remarks}
                      onChange={e => setRemarks(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., Strong background in river ecology. Welcome to the reviewer team! OR Please provide more recent publications..."
                    />

                    <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-end">
                      <button
                        onClick={() => handleAction(selectedApp.id, 'approved')}
                        disabled={actionLoading[selectedApp.id]}
                        className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center justify-center gap-2 min-w-[160px] disabled:opacity-50"
                      >
                        <CheckCircle size={18} />
                        Approve Application
                      </button>

                      <button
                        onClick={() => handleAction(selectedApp.id, 'rejected')}
                        disabled={actionLoading[selectedApp.id] || !remarks.trim()}
                        className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center justify-center gap-2 min-w-[160px] disabled:opacity-50"
                      >
                        <XCircle size={18} />
                        Reject Application
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* Review Info */}
              {(selectedApp.reviewed_at || selectedApp.review_remarks) && (
                <section className="border-t pt-8">
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calendar size={20} className="text-gray-700" />
                    Review Information
                  </h4>
                  <div className="bg-gray-50 p-6 rounded-xl border">
                    {selectedApp.reviewed_by_name && (
                      <p className="mb-2">
                        <strong>Reviewed by:</strong> {selectedApp.reviewed_by_name}
                      </p>
                    )}
                    {selectedApp.reviewed_at && (
                      <p className="mb-4">
                        <strong>Reviewed on:</strong> {new Date(selectedApp.reviewed_at).toLocaleString()}
                      </p>
                    )}
                    {selectedApp.review_remarks && (
                      <div>
                        <strong>Remarks:</strong>
                        <p className="mt-2 whitespace-pre-line text-gray-700 border-l-4 border-gray-400 pl-4 py-2 bg-gray-100 rounded-r">
                          {selectedApp.review_remarks}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}