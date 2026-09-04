'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Settings {
  siteName: string; tagline: string;
  heroTitle: string; heroSubtitle: string;
  whatsappLink: string; candidatePhoto?: string;
}
interface ManifestoItem { id: string; pillar: string; title: string; description: string; icon: string; }
interface NewsItem { id: string; title: string; content: string; category: string; emoji?: string; date: string; }

export default function HomePage() {
  const [settings, setSettings]   = useState<Settings | null>(null);
  const [manifesto, setManifesto] = useState<ManifestoItem[]>([]);
  const [news, setNews]           = useState<NewsItem[]>([]);

  useEffect(() => {
    fetch('/api/content/settings').then(r => r.ok ? r.json() : null).then(d => { if (d) setSettings(d); }).catch(() => {});
    fetch('/api/content/manifesto').then(r => r.ok ? r.json() : []).then(setManifesto).catch(() => {});
    fetch('/api/content/news').then(r => r.ok ? r.json() : []).then(d => setNews(d.slice(0, 3))).catch(() => {});
  }, []);

  const name         = settings?.siteName     || 'Hon. Candidate';
  const tagline      = settings?.tagline      || 'Together We Rise';
  const heroTitle    = settings?.heroTitle    || 'Your Voice in Parliament';
  const heroSubtitle = settings?.heroSubtitle || 'A dedicated representative committed to development, accountability, and prosperity for every resident.';
  const waLink       = settings?.whatsappLink || '#';
  const photoUrl     = settings?.candidatePhoto;
  const preview      = manifesto.slice(0, 6);

  return (
    <div className="bg-white text-brand-black">

      {/* ══════════════════════════
          HERO
      ══════════════════════════ */}
      <section className="relative bg-brand-black overflow-hidden flex items-stretch md:items-center min-h-[600px] md:min-h-[520px]">
        {/* Yellow top stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-brand-yellow z-20" />
        {/* Green bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-green z-20" />

        {/* Candidate photo — MOBILE: full-width, bottom-anchored, faded up into the black */}
        {photoUrl && (
          <div className="absolute inset-x-0 bottom-0 top-0 md:hidden pointer-events-none select-none">
            <div className="relative h-full w-full">
              <Image
                src={photoUrl}
                alt={name}
                fill
                sizes="100vw"
                className="object-contain object-bottom"
                style={{ maskImage: 'linear-gradient(to top, transparent 0%, black 40%)', WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 40%)' }}
                priority
              />
              {/* Darken the top so headline text stays readable over the image */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-brand-black via-brand-black/80 to-transparent" />
            </div>
          </div>
        )}

        {/* Candidate photo — DESKTOP/TABLET: transparent, faded into the right half */}
        {photoUrl && (
          <div className="absolute right-0 bottom-0 h-full w-1/2 hidden md:block pointer-events-none select-none">
            <div className="relative h-full w-full">
              <Image
                src={photoUrl}
                alt={name}
                fill
                sizes="50vw"
                className="object-contain object-bottom"
                style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 35%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 35%)' }}
                priority
              />
              {/* Fade left edge */}
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-brand-black to-transparent" />
            </div>
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-40 sm:pt-14 sm:pb-48 md:py-24 w-full">
          <div className={`${photoUrl ? 'md:w-1/2' : 'max-w-3xl'}`}>
            <span className="inline-flex items-center gap-2 bg-brand-yellow text-brand-black text-xs font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
              🗳️ Parliamentary Campaign 2027
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white mb-2 drop-shadow">
              {heroTitle}
            </h1>
            <p className="text-brand-yellow font-bold text-lg sm:text-xl mb-4 italic">— {name}</p>
            <p className="text-gray-200 md:text-gray-300 text-base md:text-lg leading-relaxed mb-8 max-w-lg drop-shadow">
              {heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              <Link href="/manifesto"
                className="bg-brand-yellow hover:bg-brand-yellowlt text-brand-black font-extrabold py-3 px-7 rounded-lg transition-all shadow-lg text-base">
                📋 Read the Manifesto
              </Link>
              <Link href="/about"
                className="bg-brand-green hover:bg-brand-greenlt text-white font-bold py-3 px-7 rounded-lg transition-all text-base">
                About the Candidate
              </Link>
            </div>
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold py-2.5 px-6 rounded-lg transition-colors text-sm">
              💬 Join Campaign WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════
          TAGLINE BAND
      ══════════════════════════ */}
      <div className="bg-brand-yellow py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-brand-black font-extrabold text-lg md:text-xl text-center sm:text-left">
            🇰🇪 "{tagline}"
          </p>
          <div className="flex gap-3 shrink-0">
            <Link href="/volunteer"
              className="bg-brand-black hover:bg-gray-900 text-brand-yellow font-bold py-2 px-5 rounded-lg text-sm transition-colors">
              Join as Volunteer
            </Link>
            <Link href="/donate"
              className="bg-brand-green hover:bg-brand-greenlt text-white font-bold py-2 px-5 rounded-lg text-sm transition-colors">
              💚 Donate
            </Link>
          </div>
        </div>
      </div>

      {/* ══════════════════════════
          MANIFESTO PREVIEW
      ══════════════════════════ */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <p className="section-label mb-2">Development Agenda</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-brand-black">Our Manifesto</h2>
              <p className="text-gray-500 mt-2 max-w-xl text-sm">A clear, deliverable plan for every ward — built with the community.</p>
            </div>
            <Link href="/manifesto"
              className="shrink-0 bg-brand-yellow hover:bg-brand-yellowlt text-brand-black font-extrabold py-2.5 px-6 rounded-lg text-sm transition-all">
              View Full Manifesto →
            </Link>
          </div>

          {preview.length === 0 ? (
            <div className="border-2 border-dashed border-brand-yellow rounded-2xl p-12 text-center bg-brand-yellow/5">
              <p className="text-4xl mb-3">📋</p>
              <p className="font-bold text-brand-black">Manifesto coming soon</p>
              <p className="text-gray-500 text-sm mt-1">Policy items will appear here soon.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {preview.map(item => (
                <div key={item.id}
                  className="bg-white border border-gray-200 border-t-4 border-t-brand-yellow rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl shrink-0">{item.icon}</span>
                    <div>
                      <p className="text-xs font-extrabold text-brand-green uppercase tracking-wide mb-1">{item.pillar}</p>
                      <h3 className="font-bold text-brand-black text-base leading-snug mb-1">{item.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════
          VALUES — Green
      ══════════════════════════ */}
      <section className="bg-brand-green py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 text-center">
            {[
              { icon: '🤝', title: 'Accountability',    sub: 'Transparent use of public resources' },
              { icon: '📣', title: 'Representation',    sub: 'Every voice heard in Parliament' },
              { icon: '🚀', title: 'Development',       sub: 'Real projects, real impact' },
              { icon: '🎓', title: 'Youth Empowerment', sub: 'Jobs, bursaries and opportunity' },
            ].map((v, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-5 hover:bg-white/20 transition-colors">
                <div className="text-4xl mb-2">{v.icon}</div>
                <h3 className="font-extrabold text-brand-yellow text-base mb-1">{v.title}</h3>
                <p className="text-green-100 text-xs leading-relaxed">{v.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════
          LATEST NEWS
      ══════════════════════════ */}
      {news.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2 justify-between items-end mb-8">
              <div>
                <p className="section-label mb-1">Stay Informed</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-black">Latest Updates</h2>
              </div>
              <Link href="/news" className="text-brand-green hover:underline font-bold text-sm shrink-0">View all →</Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map(item => (
                <article key={item.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <div className="bg-brand-black h-32 flex items-center justify-center relative">
                    <span className="text-5xl">{item.emoji || '📰'}</span>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-yellow" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-extrabold text-brand-green uppercase">{item.category}</span>
                      <span className="text-xs text-gray-400">· {new Date(item.date).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-bold text-brand-black leading-snug mb-1">{item.title}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2">{item.content}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════
          GET INVOLVED
      ══════════════════════════ */}
      <section className="py-16 bg-brand-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-extrabold uppercase tracking-widest text-brand-yellow mb-2">Take Action</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Be Part of the Movement</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/volunteer"
              className="bg-white/5 border border-brand-yellow/30 hover:border-brand-yellow hover:bg-brand-yellow/10 rounded-xl p-6 text-center transition-all block group">
              <div className="text-4xl mb-3">🙋</div>
              <h3 className="font-extrabold text-brand-yellow text-lg mb-1">Volunteer</h3>
              <p className="text-gray-400 text-sm group-hover:text-white">Polling agent, mobilizer, social media</p>
            </Link>
            <button
              onClick={() => navigator.share?.({ title: heroTitle, text: heroSubtitle, url: window.location.origin })}
              className="bg-white/5 border border-white/10 hover:border-brand-yellow/50 hover:bg-brand-yellow/5 rounded-xl p-6 text-center transition-all w-full group">
              <div className="text-4xl mb-3">📤</div>
              <h3 className="font-extrabold text-white text-lg mb-1">Share</h3>
              <p className="text-gray-400 text-sm">Spread the campaign to your network</p>
            </button>
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              className="bg-[#128C7E]/80 hover:bg-[#075E54] border border-[#25D366]/30 rounded-xl p-6 text-center transition-all block">
              <div className="text-4xl mb-3">💬</div>
              <h3 className="font-extrabold text-white text-lg mb-1">WhatsApp</h3>
              <p className="text-green-200 text-sm">Join the campaign group for daily updates</p>
            </a>
            <Link href="/donate"
              className="bg-brand-green hover:bg-brand-greenlt border border-brand-green rounded-xl p-6 text-center transition-all block">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="font-extrabold text-white text-lg mb-1">Donate</h3>
              <p className="text-green-100 text-sm">Fund campaign via M-Pesa or card</p>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════
          MERCH BANNER
      ══════════════════════════ */}
      <section className="bg-brand-yellow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-extrabold text-brand-black">Show Your Support</h3>
            <p className="text-brand-black/60 text-sm">T-shirts, caps, stickers and more.</p>
          </div>
          <Link href="/merchandise"
            className="bg-brand-black hover:bg-gray-900 text-brand-yellow font-bold py-2.5 px-7 rounded-lg shrink-0 transition-colors">
            🛍️ Shop Merchandise
          </Link>
        </div>
      </section>

    </div>
  );
}
