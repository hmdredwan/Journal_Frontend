'use client';

import { useState, useEffect } from 'react';
import { apiUrl } from '@/utils/api';
import { Calendar, Clock, Plus, Save, Trash2 } from 'lucide-react';

export default function ManageSubmissionDeadline() {
  const [deadline, setDeadline] = useState('');
  const [note, setNote] = useState('');
  const [current, setCurrent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetchCurrentDeadline();
  }, []);

  const fetchCurrentDeadline = async () => {
    try {
      const res = await fetch(apiUrl('submission-deadline/'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrent(data);
        if (data.has_deadline) {
          const dt = new Date(data.deadline);
          setDeadline(dt.toISOString().slice(0, 16)); // YYYY-MM-DDTHH:mm
          setNote(data.note || '');
        }
      }
    } catch (err) {
      setError('Failed to load current deadline');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDeadline = async () => {
    if (!deadline) return setError('Please select a date/time');

    try {
      const res = await fetch(apiUrl('admin/deadlines/'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deadline: new Date(deadline).toISOString(),
          note,
        }),
      });

      if (!res.ok) throw new Error('Failed to set deadline');
      setSuccess('Deadline set successfully!');
      setError('');
      fetchCurrentDeadline();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteDeadline = async () => {
    if (!current?.id) return;

    if (!confirm('Are you sure you want to remove the current deadline?')) return;

    try {
      const res = await fetch(apiUrl(`admin/deadlines/${current.id}/`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete');
      setSuccess('Deadline removed');
      setCurrent(null);
      setDeadline('');
      setNote('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <Calendar size={28} className="text-blue-600" />
        Manage Manuscript Submission Deadline
      </h2>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl mb-6">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {current?.has_deadline ? (
        <div className="bg-white p-6 rounded-xl shadow border mb-8">
          <h3 className="text-xl font-semibold mb-4">Current Deadline</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Deadline Date/Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Date(current.deadline).toLocaleString('en-US', {
                  dateStyle: 'long',
                  timeStyle: 'short',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className={`text-xl font-bold ${current.is_expired ? 'text-red-600' : 'text-green-600'}`}>
                {current.is_expired ? 'Expired' : 'Active'}
              </p>
            </div>
          </div>

          {current.note && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">Note/Reason:</p>
              <p className="text-gray-800">{current.note}</p>
            </div>
          )}

          <button
            onClick={handleDeleteDeadline}
            className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <Trash2 size={18} />
            Remove Current Deadline
          </button>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-6 rounded-xl mb-8">
          No submission deadline is currently set. Authors can submit freely.
        </div>
      )}

      {/* Set / Extend Form */}
      <div className="bg-white p-8 rounded-xl shadow border">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Clock size={22} />
          {current?.has_deadline ? 'Extend Deadline' : 'Set New Deadline'}
        </h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Deadline Date & Time <span className="text-red-600">*</span>
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason / Note (optional)
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. Extended due to high demand / special call for papers"
            />
          </div>

          <button
            onClick={handleSetDeadline}
            disabled={!deadline}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save size={18} />
            {current?.has_deadline ? 'Extend Deadline' : 'Set Deadline'}
          </button>
        </div>
      </div>
    </div>
  );
}