'use client';

import { useState, useEffect } from 'react';
import { apiUrl } from '@/utils/api';
import Image from 'next/image';
import Link from 'next/link';
import { Download, FileText, Eye, ChevronRight, Calendar, BookOpen } from 'lucide-react';

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

interface Volume {
  id: number;
  number: number;
  year: number;
  title: string;
}

interface Issue {
  id: number;
  volume: Volume;
  number: number;
  period: string;
  publication_date: string | null;
  cover_image: string | null;
  introductory_file: string | null;
  papers: Paper[];
}

export default function CurrentIssuePage() {
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Per-paper download options (cover & intro)
  const [downloadOptions, setDownloadOptions] = useState<
    Record<number, { include_cover: boolean; include_intro: boolean }>
  >({});

  useEffect(() => {
    const fetchCurrentIssue = async () => {
      try {
        const res = await fetch(apiUrl('issues/current/'), {
          cache: 'no-store',
        });

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('No current issue published yet.');
          }
          throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();

        setIssue({
          id: data.id,
          volume: data.volume,
          number: data.number,
          period: data.period,
          publication_date: data.publication_date,
          cover_image: data.cover_image,
          introductory_file: data.introductory_file,
          papers: data.papers || [],
        });

        // Initialize options for each paper
        const initialOptions: Record<number, { include_cover: boolean; include_intro: boolean }> = {};
        (data.papers || []).forEach((paper: Paper) => {
          initialOptions[paper.id] = { include_cover: false, include_intro: false };
        });
        setDownloadOptions(initialOptions);
      } catch (err: any) {
        setError(err.message || 'Failed to load current issue');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentIssue();
  }, []);

  const handleIncrementDownload = (paperId: number) => {
    fetch(apiUrl(`papers/${paperId}/increment-download/`), {
      method: 'POST',
    }).catch((err) => console.error('Download increment failed:', err));
  };

  const handleCustomDownload = async (paper: Paper) => {
    const options = downloadOptions[paper.id] || { include_cover: false, include_intro: false };

    try {
      // Increment download count
      handleIncrementDownload(paper.id);

      // Optimistic UI update
      setIssue((prev) =>
        prev
          ? {
              ...prev,
              papers: prev.papers.map((p) =>
                p.id === paper.id ? { ...p, downloads: p.downloads + 1 } : p
              ),
            }
          : null
      );

      const res = await fetch(apiUrl(`papers/${paper.id}/custom-download/`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          include_cover: options.include_cover,
          include_intro: options.include_intro,
        }),
      });

      if (!res.ok) {
        throw new Error('Download failed');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${paper.title.replace(/[^a-zA-Z0-9]/g, '_')}_custom.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Custom download error:', err);
      alert('Failed to download custom PDF. Please try again.');
    }
  };

  const handleReadMore = (paper: Paper) => {
    fetch(apiUrl(`papers/${paper.id}/increment-view/`), {
      method: 'POST',
    }).catch((err) => console.error('View increment failed:', err));

    setIssue((prev) =>
      prev
        ? {
            ...prev,
            papers: prev.papers.map((p) =>
              p.id === paper.id ? { ...p, views: p.views + 1 } : p
            ),
          }
        : null
    );

    window.location.href = `/articles/${paper.id}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center max-w-md bg-white p-10 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">No Current Issue</h2>
          <p className="text-gray-600 text-lg mb-8">
            {error || 'The journal has not published any issue yet.'}
          </p>
          <Link
            href="/archives"
            className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
          >
            Browse Archives
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <section
        className="relative bg-cover bg-center bg-no-repeat py-28 md:py-40 text-white overflow-hidden"
        style={{
          backgroundImage: "url('/images/issues/issue_cover.png')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-5 drop-shadow-2xl">
            Current Issue
          </h1>
          <p className="text-xl md:text-2xl font-medium opacity-95">
            Volume {issue.volume.number} • Issue {issue.number} • {issue.period}
          </p>
          <p className="text-lg mt-3 opacity-90">
            {issue.publication_date &&
              new Date(issue.publication_date).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 sticky top-8">
              <div className="relative h-56 md:h-72">
                <Image
                  src={
                    issue.cover_image
                      ? issue.cover_image.startsWith('http') ||
                        issue.cover_image.startsWith('https://') ||
                        issue.cover_image.startsWith('//')
                        ? issue.cover_image
                        : apiUrl(issue.cover_image.startsWith('/') ? issue.cover_image.slice(1) : issue.cover_image)
                      : '/images/issues/default-cover.jpg'
                  }
                  alt={`Cover of Volume ${issue.volume.number} Issue ${issue.number}`}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <div className="p-6 md:p-7">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-5">
                  Vol. {issue.volume.number}, Issue {issue.number}
                </h2>

                <div className="space-y-4 text-gray-700 text-base">
                  <p className="flex items-center gap-3">
                    <Calendar className="text-blue-600" size={20} />
                    <span>{issue.period}</span>
                  </p>
                  {issue.publication_date && (
                    <p className="flex items-center gap-3">
                      <Calendar className="text-blue-600" size={20} />
                      Published: {new Date(issue.publication_date).toLocaleDateString()}
                    </p>
                  )}
                  <p className="flex items-center gap-3 pt-3 border-t">
                    <FileText className="text-blue-600" size={20} />
                    <span className="font-semibold text-blue-700">
                      {issue.papers.length} Articles
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => {
                    const url = apiUrl(`issues/${issue.id}/bulk-download/`);
                    window.open(url, '_blank');
                  }}
                  className="mt-8 w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition shadow-lg flex items-center justify-center gap-3 text-base"
                >
                  <Download size={20} />
                  Download Full Issue PDF
                </button>
              </div>
            </div>
          </div>

          {/* Articles */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <BookOpen size={28} className="text-blue-600" />
              Articles
            </h2>

            {issue.papers.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 p-8 rounded-2xl text-center text-gray-700">
                No articles published in this issue yet.
              </div>
            ) : (
              issue.papers.map((paper) => (
                <article
                  key={paper.id}
                  className="bg-white p-6 md:p-7 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300"
                >
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 leading-tight">
                    {paper.title}
                  </h3>

                  <p className="text-lg text-gray-700 mb-5">
                    <strong>Authors:</strong> {paper.authors}
                  </p>

                  <p className="text-gray-600 mb-6 line-clamp-4">
                    {paper.abstract}
                  </p>

                  <div className="flex flex-wrap gap-5 text-gray-600 text-sm mb-6">
                    <span className="flex items-center gap-2">
                      <FileText size={16} /> Pages: {paper.pages}
                    </span>
                    {paper.doi && (
                      <span className="flex items-center gap-2">
                        <Link
                          href={`https://doi.org/${paper.doi}`}
                          target="_blank"
                          className="text-blue-600 hover:underline"
                        >
                          DOI: {paper.doi}
                        </Link>
                      </span>
                    )}
                    <span className="flex items-center gap-2">
                      <Eye size={16} /> {paper.views.toLocaleString()} views
                    </span>
                    <span className="flex items-center gap-2">
                      <Download size={16} /> {paper.downloads.toLocaleString()} downloads
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    {/* Download options */}
                    <div className="flex items-center gap-4">
                      {/* Paper always included */}
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked disabled className="h-4 w-4" />
                        <span className="text-sm text-gray-700">Paper</span>
                      </div>

                      {issue.cover_image && (
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`cover-${paper.id}`}
                            checked={downloadOptions[paper.id]?.include_cover ?? false}
                            onChange={(e) => {
                              setDownloadOptions((prev) => ({
                                ...prev,
                                [paper.id]: {
                                  ...prev[paper.id],
                                  include_cover: e.target.checked,
                                },
                              }));
                            }}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`cover-${paper.id}`}
                            className="text-sm text-gray-700 cursor-pointer"
                          >
                            Cover
                          </label>
                        </div>
                      )}

                      {issue.introductory_file && (
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`intro-${paper.id}`}
                            checked={downloadOptions[paper.id]?.include_intro ?? false}
                            onChange={(e) => {
                              setDownloadOptions((prev) => ({
                                ...prev,
                                [paper.id]: {
                                  ...prev[paper.id],
                                  include_intro: e.target.checked,
                                },
                              }));
                            }}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`intro-${paper.id}`}
                            className="text-sm text-gray-700 cursor-pointer"
                          >
                            Intro File
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Download button */}
                    <button
                      onClick={() => handleCustomDownload(paper)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md flex items-center gap-2 text-sm font-medium whitespace-nowrap"
                    >
                      <Download size={18} />
                      Download PDF
                    </button>

                    {/* Read More */}
                    <button
                      onClick={() => handleReadMore(paper)}
                      className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition flex items-center gap-2 text-sm font-medium"
                    >
                      <Eye size={18} />
                      Read More
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}