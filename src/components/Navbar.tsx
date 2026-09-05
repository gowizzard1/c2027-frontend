'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [siteName, setSiteName] = useState('MP Campaign 2027');
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/content/settings')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.siteName) setSiteName(d.siteName); })
      .catch(() => {});
  }, []);

  const links = [
    { href: '/',            label: 'Home' },
    { href: '/about',       label: 'About' },
    { href: '/manifesto',   label: 'Manifesto' },
    { href: '/news',        label: 'News & Events' },
    { href: '/results',     label: 'Results' },
    { href: '/volunteer',   label: 'Volunteer' },
    { href: '/merchandise', label: 'Merch' },
  ];

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav className="bg-brand-yellow sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🇰🇪</span>
            <span className="font-extrabold text-brand-black text-base hidden sm:inline">
              {siteName}
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            {links.map(link => (
              <Link key={link.href} href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-bold transition-colors ${
                  isActive(link.href)
                    ? 'bg-brand-black text-brand-yellow'
                    : 'text-brand-black hover:bg-black/10'
                }`}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/donate"
              className="bg-brand-green hover:bg-brand-greenlt text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors shadow-sm">
              💚 Donate
            </Link>
          </div>

          {/* Mobile burger */}
          <button onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-brand-black rounded-md"
            aria-label="Toggle menu">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="lg:hidden border-t-2 border-black/10 py-3 space-y-1">
            {links.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}
                className={`block px-3 py-2.5 rounded-md text-sm font-bold ${
                  isActive(link.href)
                    ? 'bg-brand-black text-brand-yellow'
                    : 'text-brand-black hover:bg-black/10'
                }`}>
                {link.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-2 border-t-2 border-black/10 mt-1">
              <Link href="/donate" onClick={() => setIsOpen(false)}
                className="flex-1 text-center bg-brand-green text-white font-bold py-2.5 rounded-lg text-sm">
                💚 Donate
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
