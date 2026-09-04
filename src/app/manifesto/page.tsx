'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';

interface ManifestoItem { id: string; pillar: string; title: string; description: string; details?: string; icon: string; }

export default function ManifestoPage() {
  const [items, setItems]           = useState<ManifestoItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [activePillar, setActive]   = useState('All');
  const [expanded, setExpanded]     = useState<string | null>(null);

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
        </div>
      </PageHeader>

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
    </div>
  );
}
