'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();

  // Hide footer on login and register pages
  const hideFooterPrefixes = ['/login', '/register'];
  if (pathname && hideFooterPrefixes.some((p) => pathname === p)) {
    return null;
  }

  const footerShiftPrefixes = [
    '/author-dashboard',
    '/user-dashboard',
    '/editor-dashboard',
    '/editorial-dashboard',
    '/reviewer-dashboard',
    '/dashboard',
  ];

  let shiftForSidebar = '';
  if (pathname) {
    if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
      shiftForSidebar = 'lg:ml-72';
    } else if (footerShiftPrefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
      shiftForSidebar = 'lg:ml-64';
    }
  }

  // When shifted, add left padding equal to the sidebar width so
  // the inner content (max-w-7xl mx-auto) is centered within the
  // main content column that sits beside the sidebar.
  const sidebarPaddingClass = shiftForSidebar === 'lg:ml-72' ? 'lg:pl-72' : shiftForSidebar === 'lg:ml-64' ? 'lg:pl-64' : '';

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className={`${sidebarPaddingClass} w-full py-12`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          
          {/* Journal Info */}
          <div>
            {/* Logo + Title */}
            <div className="group flex items-center gap-3 mb-4">
              <Image
                src="/images/journal_logo_1.jpeg"
                alt="Technical Journal Logo"
                width={42}
                height={42}
                className="
                  object-contain
                  transition-transform duration-300 ease-out
                  group-hover:scale-110
                "
              />
              <h3 className="text-white text-base font-serif  font-bold tracking-wide">
                TECHNICAL JOURNAL
              </h3>
            </div>

            <p className="text-sm leading-relaxed">
              ISSN 1234-5678 (Print)<br />
              ISSN 9876-5432 (Online)<br />
              Dhaka, Bangladesh
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/submit" className="hover:text-white transition-colors">
                  Submit Manuscript
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="hover:text-white transition-colors">
                  Author Guidelines
                </Link>
              </li>
              <li>
                <Link href="/reviewers" className="hover:text-white transition-colors">
                  Become a Reviewer
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Extra columns can be added here */}
        </div>

        {/* Footer Bottom */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
          © {new Date().getFullYear()} Technical Journal. All rights reserved.
        </div>

        <div className="mt-1 text-center text-sm flex items-center justify-center gap-2">
          Developed by{' '}
          <a
            href="https://www.websoftbd.net"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WEB SOFT BD website"
          >
            <Image
              src="/images/websoftbd_logo.jpg"
              alt="WEB SOFT BD Logo"
              width={80}
              height={24}
              className="object-contain inline-block align-middle"
            />
          </a>
        </div>
      </div>
      </div>
    </footer>
  );
}
