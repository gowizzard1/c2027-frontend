'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';

interface ManifestoItem { id: string; pillar: string; title: string; description: string; details?: string; icon: string; }

export default function ManifestoPage() {
  const [items, setItems]           = useState<ManifestoItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [activePillar, setActive]   = useState('All');
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [view, setView]             = useState<'browse' | 'document'>('browse');

  useEffect(() => {
    fetch('/api/content/manifesto').then(r => r.ok ? r.json() : []).then(setItems).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const pillars  = ['All', ...Array.from(new Set(items.map(i => i.pillar)))];
  const filtered = activePillar === 'All' ? items : items.filter(i => i.pillar === activePillar);

  return (
    <div className="bg-white text-brand-black">
      <PageHeader
        label="Development Agenda"
        title="Our Manifesto"
        subtitle="A concrete, deliverable plan for every sector — built with community input and grounded in real needs."
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/volunteer" className="bg-brand-yellow hover:bg-brand-yellowlt text-brand-black font-extrabold py-2 px-6 rounded-lg text-sm transition-colors">Join as Volunteer</Link>
          <Link href="/donate" className="bg-brand-green hover:bg-brand-greenlt text-white font-bold py-2 px-6 rounded-lg text-sm transition-colors">💚 Support Campaign</Link>
          <button onClick={() => setView(view === 'browse' ? 'document' : 'browse')} className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-2 px-6 rounded-lg text-sm transition-colors">
            {view === 'browse' ? '📄 Read as Document' : '↩ Browse Manifesto'}
          </button>
          {view === 'document' && (
            <button onClick={() => window.print()} className="bg-white text-brand-black hover:bg-gray-100 font-extrabold py-2 px-6 rounded-lg text-sm transition-colors">
              🖨️ Print / Save PDF
            </button>
          )}
        </div>
      </PageHeader>

      {view === 'document' ? (
        <ManifestoDocument items={items} loading={loading} />
      ) : (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Pillar Filters */}
        {pillars.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {pillars.map(p => (
              <button key={p} onClick={() => setActive(p)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  activePillar === p
                    ? 'bg-brand-black text-brand-yellow shadow'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-yellow hover:text-brand-black'
                }`}>{p}</button>
            ))}
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-gray-50 rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
                <div className="h-5 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-brand-yellow rounded-2xl">
            <p className="text-5xl mb-4">📋</p>
            <h3 className="text-xl font-extrabold text-brand-black mb-2">Manifesto Coming Soon</h3>
            <p className="text-gray-500">The full agenda will be published here. Check back soon.</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map(item => (
              <div key={item.id}
                className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-brand-yellow overflow-hidden hover:shadow-md transition-shadow">
                <button className="w-full text-left p-5 flex items-start gap-4"
                  onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
                  <span className="text-3xl shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-extrabold text-brand-green uppercase tracking-wide bg-green-50 px-2 py-0.5 rounded mr-2">{item.pillar}</span>
                    <h3 className="text-base font-extrabold text-brand-black mt-1">{item.title}</h3>
                    <p className="text-gray-500 text-sm mt-1 leading-relaxed">{item.description}</p>
                  </div>
                  {item.details && (
                    <span className={`text-gray-400 shrink-0 text-lg transition-transform duration-200 ${expanded === item.id ? 'rotate-180' : ''}`}>▾</span>
                  )}
                </button>
                {item.details && expanded === item.id && (
                  <div className="px-5 pb-5 pt-0 border-t border-gray-100 bg-gray-50">
                    <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line pl-12">
                      {item.details}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="mt-12 bg-brand-black rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-extrabold text-white mb-2">Ready to help deliver this agenda?</h3>
            <p className="text-gray-400 mb-6">Volunteer, share, or support the campaign financially.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/volunteer" className="bg-brand-yellow hover:bg-brand-yellowlt text-brand-black font-extrabold py-2.5 px-7 rounded-lg transition-colors">🙋 Volunteer</Link>
              <button onClick={() => navigator.share?.({ title: 'Our Manifesto', url: window.location.href })}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-2.5 px-7 rounded-lg transition-colors">📤 Share</button>
              <Link href="/donate" className="bg-brand-green hover:bg-brand-greenlt text-white font-bold py-2.5 px-7 rounded-lg transition-colors">💚 Donate</Link>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}

function ManifestoDocument({ items, loading }: { items: ManifestoItem[]; loading: boolean }) {
  return (
    <section className="manifesto-document max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
      <article className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-xl print:shadow-none print:border-0">
        <header className="relative overflow-hidden bg-brand-black px-6 py-10 text-center text-white sm:px-12 sm:py-14 print:py-10">
          <div className="absolute inset-x-0 top-0 h-1 bg-brand-yellow" />
          <Image src="/logo.png" alt="IKM — Kirgit, Kipkeleny Tulwo, The Voice of Turbo" width={220} height={220} className="mx-auto h-36 w-36 object-contain sm:h-44 sm:w-44" />
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.25em] text-brand-yellow">Development Agenda</p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">A Practical Agenda for Turbo</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-gray-300 sm:text-base">A development platform focused on education, opportunity, infrastructure, agriculture, healthcare and accountable representation.</p>
          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-gray-400">Manifesto document · Turbo Constituency</p>
        </header>

        <div className="px-6 py-8 sm:px-12 sm:py-12 print:px-10 print:py-8">
          <section className="border-b border-gray-200 pb-8">
            <p className="text-sm leading-relaxed text-gray-700">This manifesto sets out practical priorities for a more connected, accountable and empowered Turbo. It is a public commitment to listen, report progress, and work with residents, institutions and partners to deliver measurable results.</p>
          </section>

          {loading ? (
            <div className="space-y-5 py-10"><div className="h-8 w-1/2 animate-pulse rounded bg-gray-100" /><div className="h-24 animate-pulse rounded bg-gray-100" /><div className="h-24 animate-pulse rounded bg-gray-100" /></div>
          ) : items.length === 0 ? (
            <div className="py-14 text-center text-gray-500">The manifesto document is being prepared.</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {items.map((item, index) => {
                const points = (item.details || '').split('\n').map(point => point.trim()).filter(Boolean);
                return (
                  <section key={item.id} className="py-8 break-inside-avoid print:py-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-yellow font-extrabold text-brand-black">{index + 1}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2"><span className="text-2xl" aria-hidden="true">{item.icon}</span><span className="text-xs font-extrabold uppercase tracking-widest text-brand-green">{item.pillar}</span></div>
                        <h2 className="mt-2 text-xl font-extrabold leading-tight text-brand-black sm:text-2xl">{item.title}</h2>
                        <p className="mt-3 text-sm leading-relaxed text-gray-700 sm:text-base">{item.description}</p>
                        {points.length > 0 && (
                          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-gray-700 sm:text-base">
                            {points.map((point, pointIndex) => <li key={pointIndex} className="flex gap-3"><span className="mt-1 font-bold text-brand-green">•</span><span>{point}</span></li>)}
                          </ul>
                        )}
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          <footer className="mt-10 border-t border-gray-200 pt-7 text-center print:mt-6">
            <p className="font-extrabold text-brand-black">Kirgit, Kipkeleny Tulwo</p>
            <p className="mt-1 text-sm text-gray-500">The Voice of Turbo</p>
            <p className="mt-4 text-xs text-gray-400">Published by the IKM Campaign · www.maiywa.site</p>
          </footer>
        </div>
      </article>
    </section>
  );
}
