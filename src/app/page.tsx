// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Menu, X, BookOpen, Search, FileText, Calendar, ChevronRight, Newspaper
} from 'lucide-react';

const heroImages = [
  '/hero/hero6.jpg',
  '/hero/hero2.jpg',
  '/hero/hero3.jpg',
  '/hero/hero4.jpg',
];

export default function Home() {
  const [currentHero, setCurrentHero] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auto slide hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isMobileMenuOpen) {
        const target = e.target as HTMLElement;
        if (!target.closest('.mobile-menu-container')) {
          setIsMobileMenuOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);
// Mock news data (replace with real API fetch later)
  const newsItems = [
    {
      id: 1,
      title: "Call for Papers: Special Issue on River Delta Sustainability",
      date: "January 15, 2026",
      excerpt: "We invite submissions for our upcoming special issue focusing on climate adaptation in delta regions...",
      link: "/news/call-for-papers-delta-2026",
    },
    {
      id: 2,
      title: "New Editorial Board Members Join RRI Journal",
      date: "December 20, 2025",
      excerpt: "We are pleased to welcome three distinguished international scholars to strengthen our peer-review process...",
      link: "/news/new-editorial-board-2025",
    },
    {
      id: 3,
      title: "Journal Indexed in Major Databases",
      date: "November 10, 2025",
      excerpt: "RRI Journal is now indexed in Google Scholar, Crossref, and ResearchGate...",
      link: "/news/indexing-update-2025",
    },
  ];
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      

      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden group">
        {heroImages.map((img, index) => (
          <div
            key={img}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentHero ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-[12000ms]"
              style={{
                backgroundImage: `url(${img})`,
                animation: index === currentHero ? 'kenburns 12s infinite' : 'none',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
          </div>
        ))}

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-3xl animate-fade-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6 drop-shadow-lg leading-tight">
              Advancing Knowledge Through Excellence
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-100 mb-10 drop-shadow-md max-w-2xl">
              A leading peer-reviewed open access journal committed to publishing high-quality research with global impact
            </p>

            <div className="flex flex-col sm:flex-row gap-5">
              <Link
                href="/submit"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-700 font-semibold rounded-lg shadow-lg hover:bg-gray-100 transform hover:-translate-y-1 transition-all duration-300 text-base lg:text-lg"
              >
                Submit Your Manuscript
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/issues/current"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/15 backdrop-blur-sm transition-all duration-300 transform hover:-translate-y-1 text-base lg:text-lg"
              >
                Explore Latest Issue
              </Link>
            </div>
          </div>
        </div>

        {/* Slider Controls */}
        <button
          onClick={() => setCurrentHero((prev) => (prev - 1 + heroImages.length) % heroImages.length)}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white opacity-0 group-hover:opacity-80 hover:opacity-100 hover:bg-black/50 transition-all duration-300 transform hover:scale-110 shadow-lg"
          aria-label="Previous slide"
        >
          <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={() => setCurrentHero((prev) => (prev + 1) % heroImages.length)}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white opacity-0 group-hover:opacity-80 hover:opacity-100 hover:bg-black/50 transition-all duration-300 transform hover:scale-110 shadow-lg"
          aria-label="Next slide"
        >
          <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-4 z-10">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentHero(index)}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                index === currentHero ? 'bg-white scale-125 shadow-lg' : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Quick Search Bar */}
      <section className="max-w-5xl mx-auto px-4 -mt-12 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
          <div className="flex items-center gap-4 mb-5">
            <Search className="h-7 w-7 text-blue-600" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Search Articles</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by title, author, keywords, DOI..."
              className="flex-1 px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
            />
            <button className="bg-blue-600 text-white px-10 py-4 rounded-xl font-medium hover:bg-blue-700 transition-all duration-300 text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              Search
            </button>
          </div>

          <div className="mt-5 text-sm text-gray-600 flex flex-wrap gap-6">
            <span className="hover:text-blue-600 cursor-pointer">Advanced Search</span>
            <span>•</span>
            <span className="hover:text-blue-600 cursor-pointer">Browse by Subject</span>
            <span>•</span>
            <span className="hover:text-blue-600 cursor-pointer">By Volume / Issue</span>
          </div>
        </div>
      </section>

      {/* Latest Issue + Featured Articles */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Current Issue Card */}
          <div className="md:col-span-1 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="h-6 w-6" />
                <h3 className="text-xl font-bold">Current Issue</h3>
              </div>
              <p className="text-lg opacity-90">Volume 12 • Issue 1 • January–March 2026</p>
            </div>

            <div className="p-6">
              <h4 className="font-semibold text-lg mb-3">Featured Articles</h4>
              <ul className="space-y-3">
                {[
                  "Climate Resilience Strategies in Coastal Bangladesh",
                  "AI Applications in Medical Diagnostics: A Review",
                  "Sustainable Urban Planning in South Asian Megacities"
                ].map((title, i) => (
                  <li key={i} className="text-gray-700 hover:text-blue-600 cursor-pointer transition">
                    • {title}
                  </li>
                ))}
              </ul>
              <Link href="/issues/current" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800">
                View All Articles →
              </Link>
            </div>
          </div>

          {/* Recent Articles + Important Dates */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                Recently Published
              </h2>

              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { title: "Digital Transformation in SMEs", date: "Jan 8, 2026" },
                  { title: "Post-Pandemic Mental Health Trends", date: "Dec 20, 2025" },
                  { title: "Renewable Energy Policy Analysis", date: "Dec 15, 2025" },
                  { title: "Blockchain in Supply Chain Management", date: "Nov 30, 2025" }
                ].map((item, i) => (
                  <div key={i} className="bg-white p-5 rounded-lg border border-gray-100 hover:shadow-md transition">
                    <h4 className="font-medium mb-2 line-clamp-2">{item.title}</h4>
                    <p className="text-sm text-gray-500">{item.date}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-indigo-50 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                Important Dates
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li>• Manuscript Submission Deadline: March 31, 2026</li>
                <li>• Special Issue Notification: April 15, 2026</li>
                <li>• Next Regular Issue Publication: June 2026</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────── */}
      {/*               N E W   N E W S   S E C T I O N     */}
      {/* ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-16 bg-white">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <Newspaper className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              News & Announcements
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest journal news, calls for papers, events, and achievements
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsItems.map((news) => (
            <div 
              key={news.id}
              className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                  <Calendar className="h-4 w-4" />
                  <span>{news.date}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {news.title}
                </h3>
                <p className="text-gray-700 mb-6 line-clamp-3">
                  {news.excerpt}
                </p>
                <Link
                  href={news.link}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  Read More →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/news"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg"
          >
            View All News & Announcements
            <ChevronRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
