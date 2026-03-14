// src/app/author-dashboard/submit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import UserDashboardLayout from '@/components/user/UserDashboardLayout';
import { ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react';
import { apiUrl } from '@/utils/api';

function ManuscriptSubmitForm() {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    keywords: '',
    manuscriptType: 'original-research',
    files: null as FileList | null,
    manualAuthors: '',              // new: comma-separated text
    conflictOfInterest: '',         // new
    acknowledgement: '',            // new
  });

  const [allUsers, setAllUsers] = useState<{ id: number; full_name: string; email: string }[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<{ id: number; full_name: string }[]>([]);
  const [correspondingAuthorId, setCorrespondingAuthorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get token
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      setToken(accessToken);
    }
  }, []);

  // Fetch registered authors
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const res = await fetch(apiUrl('authors/'), {
          cache: 'no-store',
        });

        if (!res.ok) throw new Error(`Failed to load authors (${res.status})`);

        const data = await res.json();
        setAllUsers(Array.isArray(data) ? data : data.results || []);
      } catch (err: any) {
        setError('Failed to load author list.');
        console.error('Authors fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthors();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({ ...prev, files: e.target.files }));
    }
  };

  const addRegisteredAuthor = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = Number(e.target.value);
    if (!userId) return;

    const user = allUsers.find(u => u.id === userId);
    if (user && !selectedAuthors.some(a => a.id === userId)) {
      setSelectedAuthors([...selectedAuthors, { id: user.id, full_name: user.full_name }]);
      if (!correspondingAuthorId) setCorrespondingAuthorId(user.id);
    }
    e.target.value = '';
  };

  const removeAuthor = (id: number) => {
    setSelectedAuthors(prev => prev.filter(a => a.id !== id));
    if (correspondingAuthorId === id) setCorrespondingAuthorId(null);
  };

  const moveAuthorUp = (index: number) => {
    if (index === 0) return;
    const items = [...selectedAuthors];
    [items[index], items[index - 1]] = [items[index - 1], items[index]];
    setSelectedAuthors(items);
  };

  const moveAuthorDown = (index: number) => {
    if (index === selectedAuthors.length - 1) return;
    const items = [...selectedAuthors];
    [items[index], items[index + 1]] = [items[index + 1], items[index]];
    setSelectedAuthors(items);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSubmitted(false);

    if (!token) {
      setError('Please login first.');
      setSubmitting(false);
      return;
    }

    if (!formData.files || formData.files.length === 0) {
      setError('Please upload the main manuscript file.');
      setSubmitting(false);
      return;
    }

    if (selectedAuthors.length === 0 && !formData.manualAuthors.trim()) {
      setError('Please add at least one author (registered or manual).');
      setSubmitting(false);
      return;
    }

    if (!correspondingAuthorId && selectedAuthors.length > 0) {
      setError('Please select a corresponding author from registered authors.');
      setSubmitting(false);
      return;
    }

    const data = new FormData();
    data.append('title', formData.title.trim());
    data.append('abstract', formData.abstract.trim());
    data.append('keywords', formData.keywords.trim());
    data.append('manuscript_type', formData.manuscriptType);
    
    // Registered authors
    selectedAuthors.forEach(author => {
      data.append('authors', author.id.toString());
    });

    // Manual authors (new)
    data.append('manual_authors', formData.manualAuthors.trim());

    // New fields
    data.append('conflict_of_interest', formData.conflictOfInterest.trim());
    data.append('acknowledgement', formData.acknowledgement.trim());

    // Corresponding author (only if selected from registered)
    if (correspondingAuthorId) {
      data.append('corresponding_author', correspondingAuthorId.toString());
    }

    // Files
    if (formData.files) {
      Array.from(formData.files).forEach(file => {
        data.append('files', file);
      });
    }

try {
  const res = await fetch(apiUrl('submissions/'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: data,
  });

  if (!res.ok) {
    // Make TypeScript happy with dynamic object
    const errData: any = await res.json().catch(() => ({}));
    let msg = 'Submission failed';

    if (errData?.detail) {
      msg = errData.detail;
    } else if (errData?.non_field_errors) {
      msg = errData.non_field_errors[0];
    } else {
      const values = Object.values(errData);
      if (values.length > 0) {
        const firstValue: any = values[0];
        if (Array.isArray(firstValue)) {
          msg = firstValue[0];
        }
      }
    }

    throw new Error(msg);
  }

  setSubmitted(true);
  setError('');

  // Reset form
  setFormData({
    title: '',
    abstract: '',
    keywords: '',
    manuscriptType: 'original-research',
    files: null,
    manualAuthors: '',
    conflictOfInterest: '',
    acknowledgement: '',
  });
  setSelectedAuthors([]);
  setCorrespondingAuthorId(null);

  setTimeout(() => setSubmitted(false), 10000);
} catch (err: any) {
  setError(err.message || 'Failed to submit. Please try again.');
  console.error('Submission error:', err);
} finally {
  setSubmitting(false);
}


  if (!mounted || loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading author list...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit New Manuscript</h2>

      {submitted && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-xl mb-8 text-center font-medium">
          Manuscript submitted successfully!<br />
          <small>Our editorial team will review it shortly.</small>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl mb-8 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Manuscript Title <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Full title of your manuscript"
          />
        </div>

        {/* Manuscript Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Manuscript Type <span className="text-red-600">*</span>
          </label>
          <select
            name="manuscriptType"
            value={formData.manuscriptType}
            onChange={handleChange}
            required
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="original-research">Original Research Article</option>
            <option value="review">Review Article</option>
            <option value="short-communication">Short Communication</option>
            <option value="case-study">Case Study</option>
          </select>
        </div>

        {/* Abstract */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Abstract <span className="text-red-600">*</span>
          </label>
          <textarea
            name="abstract"
            value={formData.abstract}
            onChange={handleChange}
            required
            rows={6}
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Concise summary (200-300 words)"
          />
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Keywords (comma separated) <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="keywords"
            value={formData.keywords}
            onChange={handleChange}
            required
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="e.g. river hydrology, climate change, Bangladesh"
          />
        </div>

        {/* Authors Section */}
        <div className="border-t pt-8">
          <h3 className="text-xl font-semibold mb-6">Authors Information</h3>

          {/* Registered Authors Dropdown */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Registered Author (optional)
            </label>
            <select
              onChange={addRegisteredAuthor}
              className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Select registered author...</option>
              {allUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.full_name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {/* Manual Authors Text Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Additional Authors (type names, comma separated)
            </label>
            <textarea
              name="manualAuthors"
              value={formData.manualAuthors}
              onChange={handleChange}
              rows={2}
              className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="e.g. John Doe, Jane Smith, Md. Redwan"
            />
            <p className="mt-1 text-sm text-gray-500">
              Use this for co-authors who are not registered in the system.
            </p>
          </div>

          {/* Selected Registered Authors List */}
          {selectedAuthors.length > 0 && (
            <div className="space-y-4 mb-6">
              <h4 className="font-medium text-gray-700">Selected Registered Authors:</h4>
              {selectedAuthors.map((author, index) => (
                <div
                  key={author.id}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="font-bold text-blue-700 w-8 text-center">
                      {index + 1}.
                    </span>
                    <div>
                      <p className="font-medium">{author.full_name}</p>
                      <p className="text-sm text-gray-600">
                        {allUsers.find(u => u.id === author.id)?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => moveAuthorUp(index)}
                      disabled={index === 0}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
                      title="Move up"
                    >
                      <ArrowUp size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveAuthorDown(index)}
                      disabled={index === selectedAuthors.length - 1}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
                      title="Move down"
                    >
                      <ArrowDown size={18} />
                    </button>

                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="corresponding"
                        checked={correspondingAuthorId === author.id}
                        onChange={() => setCorrespondingAuthorId(author.id)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="text-sm whitespace-nowrap">Corresponding</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => removeAuthor(author.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                      title="Remove"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-sm text-gray-500">
            Order authors using arrows. First author is primary. Select corresponding author.
          </p>
        </div>

        {/* Conflict of Interest */}
        <div className="border-t pt-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conflict of Interest
          </label>
          <textarea
            name="conflictOfInterest"
            value={formData.conflictOfInterest}
            onChange={handleChange}
            rows={3}
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Declare any potential conflicts of interest (e.g., financial, personal, institutional). Write 'None' if no conflict exists."
          />
        </div>

        {/* Acknowledgement */}
        <div className="border-t pt-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Acknowledgements
          </label>
          <textarea
            name="acknowledgement"
            value={formData.acknowledgement}
            onChange={handleChange}
            rows={3}
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Acknowledge funding sources, contributors, institutions, etc. Leave blank if none."
          />
        </div>

        {/* File Upload */}
        <div className="border-t pt-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Manuscript Files <span className="text-red-600">*</span>
          </label>
          <input
            type="file"
            name="files"
            multiple
            accept=".doc,.docx,.pdf,.tex,.zip"
            onChange={handleFileChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="mt-2 text-sm text-gray-500">
            Main manuscript required. Supplementary files optional (max 25MB total recommended).
          </p>
        </div>

        {/* Submit */}
        <div className="pt-8 flex justify-center">
          <button
            type="submit"
            disabled={submitting || (!selectedAuthors.length && !formData.manualAuthors.trim()) || !token}
            className={`px-12 py-5 bg-blue-600 text-white font-bold text-xl rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 ${
              submitting ? 'animate-pulse' : ''
            }`}
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                </svg>
                Submitting...
              </>
            ) : (
              'Submit Manuscript'
            )}
          </button>
        </div>

        <p className="text-sm text-gray-600 mt-6 text-center">
          By submitting, you agree to our{' '}
          <Link href="/guidelines" className="text-blue-600 hover:underline">
            Author Guidelines
          </Link>{' '}
          and journal policies.
        </p>
      </form>
    </div>
  );
}

export default function SubmitPage() {
  return (
    <UserDashboardLayout role="author">
      <ManuscriptSubmitForm />
    </UserDashboardLayout>
  );
}
