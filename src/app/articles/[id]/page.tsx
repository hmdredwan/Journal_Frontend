// src/app/articles/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Download, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams } from 'next/navigation';

interface Paper {
  id: number;
  title: string;
  authors: string;
  abstract: string;
  keywords: string;
  pages: string;
  doi: string;
  file: string;
  views: number;
  downloads: number;
}

export default function ArticleDetailPage() {
  const { id } = useParams();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/public/papers/${id}/`, {
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error(`Failed to load paper: ${res.status}`);
        }

        const data = await res.json();
        setPaper(data);
      } catch (err: any) {
        setError(err.message || 'Paper not found');
      } finally {
        setLoading(false);
      }
    };

    fetchPaper();
  }, [id]);

  const handleDownload = () => {
    if (!paper) return;

    // Optional: increment download count again if needed
    fetch(`http://127.0.0.1:8000/api/papers/${paper.id}/increment-download/`, {
      method: 'POST',
    }).catch(err => console.error('Download increment failed:', err));

    const link = document.createElement('a');
    link.href = paper.file.startsWith('http') ? paper.file : `http://127.0.0.1:8000${paper.file}`;
    link.download = `${paper.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center max-w-md bg-white p-10 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Paper Not Found</h2>
          <p className="text-gray-600 mb-8">{error || 'This article could not be loaded.'}</p>
          <Link
            href="/issues/current"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            <ChevronLeft size={20} className="mr-2" />
            Back to Current Issue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight size={16} className="mx-2" />
          <Link href="/issues/current" className="hover:text-blue-600">Current Issue</Link>
          <ChevronRight size={16} className="mx-2" />
          <span className="text-gray-900 font-medium truncate max-w-xs">
            {paper.title}
          </span>
        </nav>

        <article className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {paper.title}
          </h1>

          <p className="text-xl text-gray-700 mb-6">
            <strong>Authors:</strong> {paper.authors}
          </p>

          <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-10">
            <span className="flex items-center gap-2">
              <Eye size={16} /> {paper.views.toLocaleString()} views
            </span>
            <span className="flex items-center gap-2">
              <Download size={16} /> {paper.downloads.toLocaleString()} downloads
            </span>
            {paper.doi && (
              <span>
                DOI: <Link href={`https://doi.org/${paper.doi}`} target="_blank" className="text-blue-600 hover:underline">
                  {paper.doi}
                </Link>
              </span>
            )}
          </div>

          {/* Download Button */}
          <div className="mb-12">
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition shadow-md"
            >
              <Download size={20} className="mr-2" />
              Download PDF
            </button>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none text-gray-800">
            <h2 className="text-2xl font-bold mb-4">Abstract</h2>
            <p className="mb-8">{paper.abstract}</p>

            {/* If you have full text or more sections, add here */}
            <h2 className="text-2xl font-bold mb-4">Full Paper</h2>
            <p className="text-gray-600 italic">
              Full content would be displayed here (PDF viewer or rendered text). 
              Currently showing abstract only. Download the PDF for complete reading.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}