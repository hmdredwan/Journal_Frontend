// src/components/admin/ManageReviewAssignments.tsx
'use client';

import { useState, useEffect } from 'react';
import { apiUrl } from '@/utils/api';
import { Plus, Edit, Trash2, Eye, X, Download } from 'lucide-react';

// Interface for review assignment (expand with more fields if your API returns them)
interface ReviewAssignment {
  id: number;
  submission_title?: string;
  submission?: number;               // submission ID
  assigned_to?: number;              // user/reviewer ID
  assigned_to_name?: string;
  assigned_to_email?: string;
  due_date?: string;
  admin_remarks?: string;
  status?: string;
  status_display?: string;
  assigned_at?: string;
  submitted_at?: string;
  reviewer_remarks?: string;
  review_report?: string;
  // Add any other fields your API returns and you use
}

export default function ManageReviewAssignments() {
  const [assignments, setAssignments] = useState<ReviewAssignment[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]); // can be typed later if needed
  const [assignableUsers, setAssignableUsers] = useState<any[]>([]); // same
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ReviewAssignment | null>(null);
  const [viewItem, setViewItem] = useState<ReviewAssignment | null>(null);

  const [formData, setFormData] = useState({
    submission: '',
    is_new_submission: false,
    new_title: '',
    new_abstract: '',
    new_keywords: '',
    new_file: null as File | null,
    assigned_to: '',
    due_date: '',
    admin_remarks: '',
  });

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetchAssignments();
    fetchSubmissions();
    fetchAssignableUsers();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await fetch(apiUrl('review-assignments/'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        let errMsg = 'Failed to load assignments';
        try {
          const errData = await res.json();
          errMsg = errData.detail || errData.message || (Object.values(errData)[0] as string[] | undefined)?.[0] || errMsg;
        } catch {}
        throw new Error(errMsg);
      }
      setAssignments(await res.json());
    } catch (err: any) {
      setError(err.message || 'Failed to load assignments');
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await fetch(apiUrl('submissions/'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load submissions');
      setSubmissions(await res.json());
    } catch {}
  };

  const fetchAssignableUsers = async () => {
    try {
      const res = await fetch(apiUrl('users/?role=reviewer,editorial_board'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load users');
      setAssignableUsers(await res.json());
    } catch {}
  };

  const handleCreateOrUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const data = new FormData();

    if (formData.is_new_submission) {
      if (!formData.new_title || !formData.new_file) {
        setError('New manuscript needs title and file');
        return;
      }
      data.append('title', formData.new_title);
      data.append('abstract', formData.new_abstract || '');
      data.append('keywords', formData.new_keywords || '');
      data.append('files', formData.new_file);
      data.append('manuscript_type', 'admin_upload'); // optional
    } else {
      if (!formData.submission) {
        setError('Select existing submission or create new');
        return;
      }
      data.append('submission', formData.submission);
    }

    data.append('assigned_to', formData.assigned_to);
    data.append('due_date', formData.due_date);
    data.append('admin_remarks', formData.admin_remarks);

    const url = editing ?
      apiUrl(`review-assignments/${editing.id}/`) :
      apiUrl('review-assignments/');
    const method = editing ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      if (!res.ok) {
        let errMsg = 'Failed to save assignment';
        try {
          const errData = await res.json();
          errMsg = errData.detail || errData.message || (Object.values(errData)[0] as string[] | undefined)?.[0] || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      setShowForm(false);
      setEditing(null);
      setFormData({
        submission: '', is_new_submission: false, new_title: '', new_abstract: '', new_keywords: '', new_file: null,
        assigned_to: '', due_date: '', admin_remarks: '',
      });
      fetchAssignments();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  const handleEdit = (item: ReviewAssignment) => {
    setEditing(item);
    setFormData({
      submission: item.submission?.toString() || '',
      is_new_submission: false,
      new_title: '',
      new_abstract: '',
      new_keywords: '',
      new_file: null,
      assigned_to: item.assigned_to?.toString() || '',
      due_date: item.due_date || '',
      admin_remarks: item.admin_remarks || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this assignment?')) return;
    try {
      const res = await fetch(apiUrl(`review-assignments/${id}/`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        let errMsg = 'Failed to delete assignment';
        try {
          const errData = await res.json();
          errMsg = errData.detail || errData.message || (Object.values(errData)[0] as string[] | undefined)?.[0] || errMsg;
        } catch {}
        throw new Error(errMsg);
      }
      setAssignments(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete');
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditing(null);
    setFormData({
      submission: '', is_new_submission: false, new_title: '', new_abstract: '', new_keywords: '', new_file: null,
      assigned_to: '', due_date: '', admin_remarks: '',
    });
    setError('');
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">
        {showForm ? (editing ? 'Edit Assignment' : 'Assign Manuscript for Review') : 'Review Assignments'}
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Assign New Button */}
      {!showForm && (
        <div className="flex justify-end mb-8">
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 font-medium shadow-sm"
          >
            <Plus size={18} />
            Assign New Manuscript
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreateOrUpdate} className="space-y-6 mb-12 bg-white p-8 rounded-xl border shadow-sm">
          {/* Toggle new/existing */}
          <div className="flex items-center gap-8 mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                checked={!formData.is_new_submission}
                onChange={() => setFormData(p => ({ ...p, is_new_submission: false }))}
                className="h-5 w-5 text-blue-600"
              />
              <span className="text-gray-700 font-medium">Use existing submission</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                checked={formData.is_new_submission}
                onChange={() => setFormData(p => ({ ...p, is_new_submission: true }))}
                className="h-5 w-5 text-blue-600"
              />
              <span className="text-gray-700 font-medium">Upload new manuscript</span>
            </label>
          </div>

          {!formData.is_new_submission ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Manuscript *</label>
              <select
                value={formData.submission}
                onChange={e => setFormData(p => ({ ...p, submission: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
              >
                <option value="">-- Choose Submission --</option>
                {submissions.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.title} (by {s.submitted_by?.full_name || 'Unknown'})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Manuscript Title *</label>
                <input
                  type="text"
                  value={formData.new_title}
                  onChange={e => setFormData(p => ({ ...p, new_title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                  placeholder="Enter manuscript title"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Abstract</label>
                <textarea
                  value={formData.new_abstract}
                  onChange={e => setFormData(p => ({ ...p, new_abstract: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Enter abstract..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
                <input
                  type="text"
                  value={formData.new_keywords}
                  onChange={e => setFormData(p => ({ ...p, new_keywords: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="e.g., climate change, renewable energy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Manuscript File *</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={e => setFormData(p => ({ ...p, new_file: e.target.files?.[0] || null }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign To (Reviewer / Editorial Board) *</label>
            <select
              value={formData.assigned_to}
              onChange={e => setFormData(p => ({ ...p, assigned_to: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              required
            >
              <option value="">-- Select Reviewer / EBM --</option>
              {assignableUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.full_name} ({u.role?.name || 'User'}) - {u.email}
                </option>
              ))}
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={e => setFormData(p => ({ ...p, due_date: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin Remarks (optional)</label>
              <textarea
                value={formData.admin_remarks}
                onChange={e => setFormData(p => ({ ...p, admin_remarks: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Instructions or notes for the reviewer/EBM..."
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
            >
              {editing ? 'Update Assignment' : 'Assign for Review'}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              className="px-8 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium shadow-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!showForm && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-xl shadow-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Manuscript</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Assigned To</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Due Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assignments.map(a => (
                <tr key={a.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">{a.submission_title}</td>
                  <td className="px-6 py-4">{a.assigned_to_name} ({a.assigned_to_email})</td>
                  <td className="px-6 py-4">{a.due_date || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      a.status === 'completed' ? 'bg-green-100 text-green-800' :
                      a.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {a.status_display}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-4">
                    <button onClick={() => setViewItem(a)} title="View Details">
                      <Eye size={18} className="text-blue-600 hover:text-blue-800 transition" />
                    </button>
                    <button onClick={() => handleEdit(a)} title="Edit">
                      <Edit size={18} className="text-blue-600 hover:text-blue-800 transition" />
                    </button>
                    <button onClick={() => handleDelete(a.id)} title="Delete">
                      <Trash2 size={18} className="text-red-600 hover:text-red-800 transition" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center z-10">
              <h3 className="text-2xl font-bold">Review Assignment Details</h3>
              <button onClick={() => setViewItem(null)} className="text-gray-600 hover:text-gray-800">
                <X size={28} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <strong className="block text-gray-700 mb-1">Manuscript</strong>
                  <p className="text-gray-900">{viewItem.submission_title}</p>
                </div>
                <div>
                  <strong className="block text-gray-700 mb-1">Assigned To</strong>
                  <p className="text-gray-900">{viewItem.assigned_to_name} ({viewItem.assigned_to_email})</p>
                </div>
                <div>
                  <strong className="block text-gray-700 mb-1">Assigned Date</strong>
                  <p className="text-gray-900">{new Date(viewItem.assigned_at || Date.now()).toLocaleString()}</p>
                </div>
                <div>
                  <strong className="block text-gray-700 mb-1">Due Date</strong>
                  <p className="text-gray-900">
                    {viewItem.due_date ? new Date(viewItem.due_date).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
              </div>

              <div>
                <strong className="block text-gray-700 mb-1">Status</strong>
                <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium mt-1 ${
                  viewItem.status === 'completed' ? 'bg-green-100 text-green-800' :
                  viewItem.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {viewItem.status_display || viewItem.status}
                </span>
              </div>

              {viewItem.admin_remarks && (
                <div>
                  <strong className="block text-gray-700 mb-1">Admin Remarks</strong>
                  <p className="text-gray-900 whitespace-pre-wrap mt-1">{viewItem.admin_remarks}</p>
                </div>
              )}

              {viewItem.reviewer_remarks && (
                <div>
                  <strong className="block text-gray-700 mb-1">Reviewer Remarks</strong>
                  <p className="text-gray-900 whitespace-pre-wrap mt-1">{viewItem.reviewer_remarks}</p>
                </div>
              )}

              {viewItem.submitted_at && (
                <div>
                  <strong className="block text-gray-700 mb-1">Submitted On</strong>
                  <p className="text-gray-900 mt-1">{new Date(viewItem.submitted_at).toLocaleString()}</p>
                </div>
              )}

              {viewItem.review_report ? (
                <div>
                  <strong className="block text-gray-700 mb-1">Review Report</strong>
                  <a
                    href={viewItem.review_report}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:underline mt-1"
                  >
                    <Download size={16} />
                    Download Report
                  </a>
                </div>
              ) : (
                <div>
                  <strong className="block text-gray-700 mb-1">Review Report</strong>
                  <p className="text-gray-500 mt-1">Not uploaded yet</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white p-6 border-t flex justify-end">
              <button
                onClick={() => setViewItem(null)}
                className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}