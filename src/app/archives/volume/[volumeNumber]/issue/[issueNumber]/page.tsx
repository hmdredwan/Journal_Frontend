'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Download, FileText, Eye, Calendar, BookOpen } from 'lucide-react';
import { useParams } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import { apiUrl } from '@/utils/api';

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

export default function IssueDetailPage() {
  const params = useParams();
  const volumeNumber = params.volumeNumber as string;
  const issueNumber = params.issueNumber as string;

  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Per-paper download options
  const [downloadOptions, setDownloadOptions] = useState<
    Record<number, { include_cover: boolean; include_intro: boolean }>
  >({});

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch the specific issue by volume number + issue number
        const issueRes = await fetch(
          apiUrl(`public/issues/?volume__number=${volumeNumber}&number=${issueNumber}`),
          { cache: 'no-store' }
        );

        if (!issueRes.ok) {
          throw new Error(`Failed to load issue: ${issueRes.status}`);
        }

        const issueData = await issueRes.json();
        const matchingIssues = Array.isArray(issueData) ? issueData : issueData.results || [];

        if (matchingIssues.length === 0) {
          throw new Error('Issue not found');
        }

        const foundIssue = matchingIssues[0];

        // Fetch papers for this exact issue
        const papersRes = await fetch(
          apiUrl(`public/papers/?issue=${foundIssue.id}`),
          { cache: 'no-store' }
        );

        let papers: Paper[] = [];
        if (papersRes.ok) {
          const papersData = await papersRes.json();
          papers = Array.isArray(papersData) ? papersData : papersData.results || [];
        }

        setIssue({
          ...foundIssue,
          papers,
        });

        // Initialize download options
        const initialOptions: Record<number, { include_cover: boolean; include_intro: boolean }> = {};
        papers.forEach((p) => {
          initialOptions[p.id] = { include_cover: false, include_intro: false };
        });
        setDownloadOptions(initialOptions);
      } catch (err: any) {
        setError(err.message || 'Failed to load this issue');
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [volumeNumber, issueNumber]);

  const handleIncrementDownload = (paperId: number) => {
    fetch(apiUrl(`papers/${paperId}/increment-download/`), {
      method: 'POST',
    }).catch((err) => console.error('Download increment failed:', err));
  };

  const handleCustomDownload = async (paper: Paper) => {
    const options = downloadOptions[paper.id] || { include_cover: false, include_intro: false };

    try {
      handleIncrementDownload(paper.id);

      const res = await fetch(
        apiUrl(`papers/${paper.id}/custom-download/`),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            include_cover: options.include_cover,
            include_intro: options.include_intro,
          }),
        }
      );

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

  const handleDownload = (fileUrl: string, filename: string) => {
    const fullUrl = fileUrl.startsWith('http') || fileUrl.startsWith('//')
      ? fileUrl
      : apiUrl(fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl);

    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = filename;
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

  if (error || !issue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center max-w-md bg-white p-10 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Issue Not Found</h2>
          <p className="text-gray-600 text-lg mb-8">{error || 'This issue could not be loaded.'}</p>
          <Link
            href="/archives"
            className="inline-block px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-lg"
          >
            Back to Archives
          </Link>
        </div>
      </div>
    );
  }

  // Compute cover image URL for hero & sidebar
  const coverImageSrc = issue.cover_image
    ? issue.cover_image.startsWith('http') ||
      issue.cover_image.startsWith('https://') ||
      issue.cover_image.startsWith('//')
      ? issue.cover_image
      : apiUrl(issue.cover_image.startsWith('/') ? issue.cover_image.slice(1) : issue.cover_image)
    : '/images/issues/default-cover.jpg';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero with Cover */}
      <section
        className="relative bg-cover bg-center py-32 md:py-48 text-white"
        style={{
          backgroundImage: `url(${coverImageSrc})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 drop-shadow-2xl">
            Volume {issue.volume?.number ?? volumeNumber} • Issue {issue.number}
          </h1>
          <p className="text-2xl md:text-3xl font-medium opacity-95">{issue.period}</p>
          <p className="text-xl mt-4 opacity-90">
            {issue.publication_date &&
              new Date(issue.publication_date).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
          </p>
        </div>
      </section>

      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Archives', href: '/archives' },
          { label: `Volume ${issue.volume?.number ?? volumeNumber}` },
          { label: `Issue ${issue.number}` },
        ]}
      />

      {/* Content */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 sticky top-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Vol. {issue.volume?.number ?? volumeNumber}, Issue {issue.number}
              </h2>

              <div className="space-y-5 text-gray-700">
                <p className="flex items-center gap-3 text-lg">
                  <Calendar className="text-blue-600" size={24} />
                  <span>{issue.period}</span>
                </p>
                {issue.publication_date && (
                  <p className="flex items-center gap-3 text-lg">
                    <Calendar className="text-blue-600" size={24} />
                    Published: {new Date(issue.publication_date).toLocaleDateString()}
                  </p>
                )}
                <p className="flex items-center gap-3 text-lg pt-4 border-t">
                  <FileText className="text-blue-600" size={24} />
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
                className="mt-10 w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition shadow-lg flex items-center justify-center gap-3 text-lg"
              >
                <Download size={22} />
                Download Full Issue PDF
              </button>
            </div>
          </div>

          {/* Articles */}
          <div className="lg:col-span-2 space-y-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-8 flex items-center gap-4">
              <BookOpen size={36} className="text-blue-600" />
              Articles
            </h2>

            {issue.papers.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 p-10 rounded-2xl text-center text-gray-700">
                No articles published in this issue yet.
              </div>
            ) : (
              issue.papers.map((paper) => (
                <article
                  key={paper.id}
                  className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300"
                >
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                    {paper.title}
                  </h3>

                  <p className="text-xl text-gray-700 mb-6">
                    <strong>Authors:</strong> {paper.authors}
                  </p>

                  <p className="text-gray-600 mb-8 line-clamp-4">{paper.abstract}</p>

                  <div className="flex flex-wrap gap-6 text-gray-600 mb-8">
                    <span className="flex items-center gap-2">
                      <FileText size={18} /> Pages: {paper.pages}
                    </span>
                    {paper.doi && (
                      <span className="flex items-center gap-2">
                        <Link href={`https://doi.org/${paper.doi}`} target="_blank" className="text-blue-600 hover:underline">
                          DOI: {paper.doi}
                        </Link>
                      </span>
                    )}
                    <span className="flex items-center gap-2">
                      <Eye size={18} /> {paper.views.toLocaleString()} views
                    </span>
                    <span className="flex items-center gap-2">
                      <Download size={18} /> {paper.downloads.toLocaleString()} downloads
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    {/* Download customization */}
                    <div className="flex items-center gap-4">
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

                    <button
                      onClick={() => handleCustomDownload(paper)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md flex items-center gap-2 font-medium"
                    >
                      <Download size={20} />
                      Download PDF
                    </button>

                    <Link
                      href={`/articles/${paper.id}`}
                      className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition flex items-center gap-2 font-medium"
                    >
                      <Eye size={20} />
                      Read More
                    </Link>
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