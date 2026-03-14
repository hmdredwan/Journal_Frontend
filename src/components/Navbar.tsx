"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Hide the navbar (including announcement bar) on all dashboard routes and login/register pages
  const hidePrefixes = [
    '/author-dashboard',
    '/user-dashboard',
    '/editor-dashboard',
    '/reviewer-dashboard',
    '/editorial-dashboard',
    '/dashboard',
    '/login',
    '/register',
  ];

  if (
    pathname &&
    hidePrefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))
  )
    return null;

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white overflow-hidden py-2.5 shadow-sm">
        <div className="whitespace-nowrap animate-marquee text-sm font-medium tracking-wide">
          <span className="mx-12 inline-block">
            📢 New Call for Papers: Special Issue on "Sustainable Development Goals in South Asia" — Deadline: March 31, 2026
          </span>
          <span className="mx-12 inline-block">
            • Early View Articles now available • Volume 12 Issue 1 – January 2026 •
          </span>
          <span className="mx-12 inline-block">
            Join our reviewer community — Applications welcome! •
          </span>
          <span className="mx-12 inline-block">
            New submission guidelines updated — Check now!
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link href="/" className="group flex items-center gap-3 select-none">
              <Image
                src="/images/journal_logo_1.jpeg"
                alt="RRI Logo"
                width={44}
                height={44}
                priority
                className="
                  object-contain
                  transition-transform duration-300 ease-out
                  group-hover:scale-110
                  group-hover:rotate-[2deg]
                "
              />
              <div className="hidden sm:flex flex-col justify-center leading-tight">
                <span className="text-lg font-serif font-bold text-gray-800 tracking-wide">
                  TECHNICAL JOURNAL
                </span>
                <span className="text-xs font-medium text-gray-500">
                  RIVER RESEARCH INSTITUTE
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {[
                'About',
                'Current Issue',
                'Archives',
                'Editorial Board',
                'Guidelines',
                'Submit',
                'Contact',
              ].map((item) => (
                <Link
                  key={item}
                  href={item === 'Current Issue' ? '/issues/current' : `/${item.toLowerCase().replace(' ', '-')}`}
                  className="relative px-4 py-2 text-gray-700 hover:text-blue-600 font-medium group transition-colors"
                >
                  {item}
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300 ease-out" />
                </Link>
              ))}
                
              <Link
                href="/login"
                className="ml-6 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                Login
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-800"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        {/* Slide-in Panel */}
        <div
          className={`absolute top-0 left-0 h-full w-4/5 max-w-sm bg-white shadow-2xl transform transition-transform duration-500 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">

            {/* Mobile Header */}
            <div className="p-6 border-b flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/journal_logo_1.jpeg"
                  alt="RRI Logo"
                  width={36}
                  height={36}
                  className="object-contain"
                />
                <span className="text-lg font-semibold text-blue-700">
                  RRI Journal
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="h-8 w-8" />
              </button>
            </div>

            {/* Mobile Menu Items */}
            <nav className="flex-1 px-5 py-8 space-y-2">
              {[
                { name: 'About', href: '/about' },
                { name: 'Current Issue', href: '/issues/current' },
                { name: 'Archives', href: '/archives' },
                { name: 'Editorial Board', href: '/editorial-board' },
                { name: 'Guidelines', href: '/guidelines' },
                { name: 'Submit Manuscript', href: '/submit' },
                { name: 'Contact', href: '/contact' },
                { name: 'Login', href: '/login', highlight: true },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block py-3.5 px-5 rounded-lg text-lg font-medium transition-colors ${
                    item.highlight
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Footer */}
            <div className="p-6 border-t text-sm text-gray-600 bg-gray-50">
              ISSN 1234-5678 (Print) • Dhaka, Bangladesh
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
