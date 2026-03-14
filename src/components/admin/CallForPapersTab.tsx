// src/components/admin/CallForPapersTab.tsx
'use client';

import { useState } from 'react';
import { Send, Plus, Trash2 } from 'lucide-react';
import { apiUrl } from '@/utils/api';

export default function CallForPapersTab() {
  const [emails, setEmails] = useState<string[]>([]);
  const [inputEmail, setInputEmail] = useState('');
  const [subject, setSubject] = useState('Call for Papers');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleAddEmail = () => {
    if (inputEmail && !emails.includes(inputEmail)) {
      setEmails([...emails, inputEmail]);
      setInputEmail('');
    }
  };

  const handleRemoveEmail = (email: string) => {
    setEmails(emails.filter(e => e !== email));
  };

  const handleSend = async () => {
    setSending(true);
    setSuccess('');
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(apiUrl('admin/call-for-papers/'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails,
          subject,
          message,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess('Call for papers email sent successfully!');
      setEmails([]);
      setSubject('Call for Papers');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">Call for Papers</h3>
      <div className="mb-4 flex gap-2">
        <input
          type="email"
          value={inputEmail}
          onChange={e => setInputEmail(e.target.value)}
          placeholder="Add author email"
          className="px-4 py-2 border rounded-lg flex-1"
        />
        <button
          type="button"
          onClick={handleAddEmail}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={16} /> Add
        </button>
        <button
          type="button"
          onClick={() => setEmails([])}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg ml-2"
        >
          Clear
        </button>
      </div>
      <div className="mb-4">
        {emails.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {emails.map(email => (
              <span key={email} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2">
                {email}
                <button type="button" onClick={() => handleRemoveEmail(email)}>
                  <Trash2 size={14} className="text-red-500" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className="px-4 py-2 border rounded-lg w-full"
        />
      </div>
      <div className="mb-6">
        <label className="block font-medium mb-1">Message</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={6}
          className="px-4 py-2 border rounded-lg w-full"
        />
      </div>
      <div className="flex gap-4 items-center">
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || emails.length === 0 || !subject || !message}
          className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          <Send size={18} /> {sending ? 'Sending...' : 'Send'}
        </button>
        <button
          type="button"
          onClick={() => setEmails([])}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
        >
          Remove All
        </button>
      </div>
      {success && <div className="mt-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">{success}</div>}
      {error && <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}
    </div>
  );
}
