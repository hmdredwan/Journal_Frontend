// src/components/admin/DecisionLogsTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { apiUrl } from '@/utils/api';
import { Clock, User, FileText } from 'lucide-react';

// Define shape of each decision log entry
interface DecisionLog {
  id: number;
  submission_title?: string;
  user_name?: string;
  action: string;
  remarks?: string;
  timestamp: string;
}

export default function DecisionLogsTab() {
  const [logs, setLogs] = useState<DecisionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetchDecisionLogs();
  }, []);

  const fetchDecisionLogs = async () => {
    if (!token) {
      setError('Authentication token missing. Please log in.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await fetch(apiUrl('decision-logs/'), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        let errMsg = `Failed to load decision logs (${res.status})`;

        try {
          const errData = await res.json();

          if (errData.detail) {
            errMsg = errData.detail;
          } else if (errData.message) {
            errMsg = errData.message;
          } else if (typeof errData === 'object' && errData !== null) {
            const values = Object.values(errData);
            if (values.length > 0) {
              const firstValue = values[0];
              if (Array.isArray(firstValue) && firstValue.length > 0) {
                errMsg = String(firstValue[0]);
              } else if (typeof firstValue === 'string') {
                errMsg = firstValue;
              }
            }
          }
        } catch {
          // silent fallback — keep default message
        }

        throw new Error(errMsg);
      }

      const data = await res.json();
      setLogs(Array.isArray(data) ? data : data.results || []);
    } catch (err: any) {
      setError(err.message || 'Error loading decision logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-600 text-center py-10">{error}</p>;
  }

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Decision Logs</h3>

      {logs.length === 0 ? (
        <p className="text-gray-600 text-center py-10">No decision logs found yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText size={16} className="text-gray-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {log.submission_title || 'Untitled'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User size={16} className="text-gray-500 mr-2" />
                      <span className="text-sm text-gray-900">{log.user_name || 'System'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                    {log.remarks || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-sm text-gray-500 mt-4">
        Showing all editorial and review decisions made by editors and admins.
      </p>
    </div>
  );
}