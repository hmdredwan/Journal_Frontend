// src/app/archives/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Calendar, 
  BookOpen 
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { apiUrl } from '@/utils/api';

interface Paper {
  id: number;
  title: string;
  authors: string;
  abstract: string;
  pages: string;
  doi: string;
  file: string;
  views: number;
  downloads: number;
}

interface Issue {
  id: number;
  number: number;
  period: string;
  publication_date: string | null;
  cover_image: string | null;
  introductory_file: string | null;
  papers: Paper[];
}

interface Volume {
  id: number;
  number: number;
  year: number;
  title: string;
  issues: Issue[];
}

interface YearGroup {
  year: number;
  volumes: Volume[];
}

export default function ArchivesPage() {
  const [archives, setArchives] = useState<YearGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedVolumes, setExpandedVolumes] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchArchives = async () => {
      try {
        // Fetch volumes (newest first) - adjust endpoint if needed
        const volumesRes = await fetch(apiUrl('public/volumes/'), {
          cache: 'no-store',
        });
        if (!volumesRes.ok) throw new Error('Failed to load volumes');
        const volumesData = await volumesRes.json();
        const volumes = Array.isArray(volumesData) ? volumesData : volumesData.results || [];

        // Fetch issues
        const issuesRes = await fetch(apiUrl('public/issues/'), {
          cache: 'no-store',
        });
        if (!issuesRes.ok) throw new Error('Failed to load issues');
        const issuesData = await issuesRes.json();
        const issues = Array.isArray(issuesData) ? issuesData : issuesData.results || [];

        // Fetch papers
        const papersRes = await fetch(apiUrl('public/papers/'), {
          cache: 'no-store',
        });
        let papersByIssue: { [key: number]: Paper[] } = {};
        if (papersRes.ok) {
          const papersData = await papersRes.json();
          const papersList = Array.isArray(papersData) ? papersData : papersData.results || [];
          papersList.forEach((paper: Paper & { issue: number }) => {
            if (!papersByIssue[paper.issue]) papersByIssue[paper.issue] = [];
            papersByIssue[paper.issue].push(paper);
          });
        }

        // Build hierarchy: volumes → issues → papers
        const volumeMap: { [key: number]: Volume } = {};
        volumes.forEach((vol: Volume) => {
          volumeMap[vol.id] = { ...vol, issues: [] };
        });

        issues.forEach((issue: Issue & { volume: number }) => {
          if (volumeMap[issue.volume]) {
            volumeMap[issue.volume].issues.push({
              ...issue,
              papers: papersByIssue[issue.id] || [],
            });
          }
        });

        // Group by year
        const yearMap: { [key: number]: YearGroup } = {};
        Object.values(volumeMap).forEach((volume) => {
          if (!yearMap[volume.year]) {
            yearMap[volume.year] = { year: volume.year, volumes: [] };
          }
          yearMap[volume.year].volumes.push(volume);
        });

        const sortedArchives = Object.values(yearMap)
          .sort((a, b) => b.year - a.year)
          .map((group) => ({
            ...group,
            volumes: group.volumes.sort((a, b) => b.number - a.number),
          }));

        setArchives(sortedArchives);
      } catch (err: any) {
        setError(err.message || 'Failed to load archives');
      } finally {
        setLoading(false);
      }
    };

    fetchArchives();
  }, []);

  const toggleVolume = (volumeId: number) => {
    setExpandedVolumes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(volumeId)) newSet.delete(volumeId);
      else newSet.add(volumeId);
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-700 font-medium">Loading journal archives...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 p-8 rounded-2xl max-w-2xl text-center shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Error Loading Archives</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center bg-no-repeat py-32 md:py-44 text-white overflow-hidden"
        style={{
          backgroundImage: "url('/images/archives.png')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 drop-shadow-2xl">
            Journal Archives
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-95 leading-relaxed">
            Explore every volume and issue of <span className="font-semibold">River Research & Innovation Journal</span>
          </p>
        </div>
      </section>

      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Archives' },
        ]}
      />

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        {/* Search/Filter Bar (placeholder - implement logic later if needed) */}
        <div className="mb-16 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Find Past Publications</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by title, author, keyword, DOI..."
              className="flex-1 px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg shadow-sm"
            />
            <select className="px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg shadow-sm">
              <option>All Years</option>
              {/* Dynamically populate from archives if you want */}
              <option>2026</option>
              <option>2025</option>
              <option>2024</option>
            </select>
            <button className="bg-blue-600 text-white px-10 py-4 rounded-xl font-semibold hover:bg-blue-700 transition shadow-md hover:shadow-lg text-lg">
              Search Archives
            </button>
          </div>
        </div>

        {/* Archives by Year */}
        {archives.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
            <BookOpen size={64} className="mx-auto text-gray-400 mb-6" />
            <h3 className="text-2xl font-bold text-gray-800 mb-4">No Archives Available Yet</h3>
            <p className="text-gray-600 text-lg">Check back soon for published volumes and issues.</p>
          </div>
        ) : (
          <div className="space-y-20">
            {archives.map((yearGroup) => (
              <div key={yearGroup.year} className="space-y-8">
                <h2 className="text-4xl font-extrabold text-gray-900 flex items-center gap-4">
                  <Calendar size={36} className="text-blue-600" />
                  {yearGroup.year}
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {yearGroup.volumes.map((volume) => (
                    <div
                      key={volume.id}
                      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                    >
                      {/* Volume Header */}
                      <button
                        onClick={() => toggleVolume(volume.id)}
                        className="w-full px-8 py-6 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 transition"
                      >
                        <div className="text-left">
                          <h3 className="text-2xl font-bold text-gray-900">
                            Volume {volume.number}
                          </h3>
                          {volume.title && (
                            <p className="text-gray-600 mt-1">{volume.title}</p>
                          )}
                          <p className="text-sm text-gray-500 mt-2">
                            {volume.issues.length} Issue{volume.issues.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        {expandedVolumes.has(volume.id) ? (
                          <ChevronUp size={28} className="text-blue-600" />
                        ) : (
                          <ChevronDown size={28} className="text-blue-600" />
                        )}
                      </button>

                      {/* Expanded Issues */}
                      {expandedVolumes.has(volume.id) && (
                        <div className="px-8 py-6 border-t bg-gray-50">
                          {volume.issues.length === 0 ? (
                            <p className="text-gray-500 py-6 text-center italic">
                              No issues published in this volume yet.
                            </p>
                          ) : (
                            <div className="grid md:grid-cols-2 gap-6">
                              {volume.issues.map((issue) => (
                                <Link
                                  key={issue.id}
                                  href={`/archives/volume/${volume.number}/issue/${issue.number}`}
                                  className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300"
                                >
                                  <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100">
                                    {issue.cover_image ? (
                                      <Image
                                        src={
                                          issue.cover_image.startsWith('http') ||
                                          issue.cover_image.startsWith('https://') ||
                                          issue.cover_image.startsWith('//')
                                            ? issue.cover_image
                                            : apiUrl(
                                                issue.cover_image.startsWith('/')
                                                  ? issue.cover_image.slice(1)
                                                  : issue.cover_image
                                              )
                                        }
                                        alt={`Cover of Issue ${issue.number}`}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                      />
                                    ) : (
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <FileText size={64} className="text-blue-400 opacity-50" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="p-5">
                                    <h4 className="font-bold text-lg text-gray-900 mb-2">
                                      Issue {issue.number}
                                    </h4>
                                    {issue.period && (
                                      <p className="text-sm text-gray-600 mb-3">{issue.period}</p>
                                    )}
                                    {issue.publication_date && (
                                      <p className="text-xs text-gray-500 mb-4">
                                        {new Date(issue.publication_date).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                        })}
                                      </p>
                                    )}
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-blue-600">
                                        {issue.papers.length} Article{issue.papers.length !== 1 ? 's' : ''}
                                      </span>
                                      <span className="text-blue-600 group-hover:translate-x-1 transition-transform">
                                        View →
                                      </span>
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-20 text-center text-gray-600">
          <p className="text-lg">
            Looking for older issues or special editions?
          </p>
          <Link href="/contact" className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-800 font-medium">
            Contact the Editorial Office <span className="ml-1">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
} 