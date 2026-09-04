'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Settings {
  siteName: string; tagline: string;
  contactEmail: string; contactPhone: string;
  address: string; whatsappLink: string;
}

export default function Footer() {
  const [s, setS] = useState<Settings | null>(null);

  useEffect(() => {
    fetch('/api/content/settings')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setS(d); })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-brand-black text-gray-400">
      {/* Yellow top bar */}
      <div className="bg-brand-yellow h-2 w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🇰🇪</span>
              <span className="text-brand-yellow font-extrabold text-lg">{s?.siteName || 'MP Campaign 2027'}</span>
            </div>
            <p className="text-sm leading-relaxed">
              {s?.tagline || 'Together We Rise'} — a parliamentary campaign built on community, accountability, and development.
            </p>
            {s?.whatsappLink && (
              <a href={s.whatsappLink} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 bg-[#25D366] text-white text-xs font-bold px-4 py-2 rounded-lg">
                💬 Join WhatsApp
              </a>
            )}
          </div>

          {/* Pages */}
          <div>
            <h4 className="text-brand-yellow font-extrabold mb-4 text-sm uppercase tracking-wide">Pages</h4>
            <ul className="space-y-2 text-sm">
              {[['/', 'Home'], ['/about', 'About'], ['/manifesto', 'Manifesto'],
                ['/news', 'News & Events'], ['/volunteer', 'Volunteer'],
                ['/merchandise', 'Merchandise'], ['/donate', 'Donate']].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-brand-yellow transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get Involved */}
          <div>
            <h4 className="text-brand-yellow font-extrabold mb-4 text-sm uppercase tracking-wide">Get Involved</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/volunteer" className="hover:text-brand-yellow transition-colors">🗳️ Polling Agent</Link></li>
              <li><Link href="/volunteer" className="hover:text-brand-yellow transition-colors">📢 Mobilizer</Link></li>
              <li><Link href="/volunteer" className="hover:text-brand-yellow transition-colors">📱 Social Media Volunteer</Link></li>
              <li><Link href="/donate"    className="hover:text-brand-yellow transition-colors">💚 Donate to Campaign</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-brand-yellow font-extrabold mb-4 text-sm uppercase tracking-wide">Contact</h4>
            <ul className="space-y-2 text-sm">
              {s?.contactPhone && <li>📞 {s.contactPhone}</li>}
              {s?.contactEmail && <li>📧 {s.contactEmail}</li>}
              {s?.address      && <li>📍 {s.address}</li>}
              {!s?.contactPhone && !s?.contactEmail && (
                <li className="text-gray-600 italic text-xs">Contact us for more info</li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} {s?.siteName || 'MP Campaign 2027'}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
