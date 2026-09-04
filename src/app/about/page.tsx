'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Settings { siteName: string; tagline: string; heroSubtitle: string; whatsappLink: string; candidatePhoto?: string; }
interface BioSection { section: string; content: string; }

export default function AboutPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [bio, setBio] = useState<BioSection[]>([]);

  useEffect(() => {
    fetch('/api/content/settings').then(r => r.ok ? r.json() : null).then(d => { if (d) setSettings(d); }).catch(() => {});
    fetch('/api/content/biography').then(r => r.ok ? r.json() : []).then(setBio).catch(() => {});
  }, []);

  const name = settings?.siteName || 'Hon. Candidate';
  const tagline = settings?.tagline || 'Together We Rise';
  const waLink = settings?.whatsappLink || '#';
  const photoUrl = settings?.candidatePhoto;
  const get = (key: string) => bio.find(b => b.section === key)?.content || '';

  return (
    <div className="bg-white text-brand-black">

      {/* Header */}
      <section className="bg-brand-black text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-brand-yellow" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            {/* Photo */}
            <div className="relative shrink-0">
              {photoUrl ? (
                <div className="w-36 h-36 md:w-48 md:h-48 rounded-2xl overflow-hidden border-4 border-brand-yellow shadow-2xl">
                  <Image src={photoUrl} alt={name} width={192} height={192} className="object-cover w-full h-full" />
                </div>
              ) : (
                <div className="w-36 h-36 md:w-48 md:h-48 rounded-2xl bg-brand-yellow/10 border-4 border-brand-yellow flex items-center justify-center text-7xl shadow-2xl">
                  👤
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 bg-brand-green text-white text-xs font-bold px-3 py-1 rounded-full">
                Candidate 2027
              </div>
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-brand-yellow mb-2">Parliamentary Candidate</p>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">{name}</h1>
              <p className="text-brand-yellow font-bold text-lg italic mt-1">"{tagline}"</p>
              <p className="text-gray-400 mt-3 max-w-xl leading-relaxed text-sm">
                {get('summary') || settings?.heroSubtitle || 'A dedicated community leader committed to transformative parliamentary representation.'}
              </p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-green" />
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">

        {/* Background */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-7">
          <h2 className="flex items-center gap-2 text-xl font-extrabold text-brand-black mb-4">
            <span className="bg-brand-yellow rounded-lg w-8 h-8 flex items-center justify-center text-base">🧭</span>
            Background & Experience
          </h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">
            {get('background') || 'Born and raised in the constituency, with years of public service spanning community development, governance, and grassroots advocacy.'}
          </p>
        </div>

        {/* Why Running */}
        <div className="bg-brand-yellow/10 border-l-4 border-brand-yellow rounded-xl p-7">
          <h2 className="flex items-center gap-2 text-xl font-extrabold text-brand-black mb-4">
            <span className="bg-brand-yellow rounded-lg w-8 h-8 flex items-center justify-center text-base">🎯</span>
            Why I'm Running
          </h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {get('why') || 'I am running because the constituency deserves better — better roads, schools, hospitals, and a true voice in Parliament that fights for our people every single day.'}
          </p>
        </div>

        {/* Vision */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-7">
          <h2 className="flex items-center gap-2 text-xl font-extrabold text-brand-black mb-4">
            <span className="bg-brand-green rounded-lg w-8 h-8 flex items-center justify-center text-base">🔭</span>
            My Vision
          </h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">
            {get('vision') || 'A constituency where every child has quality education, every family has affordable healthcare, every youth has a path to employment, and every community is proud, prosperous, and progressive.'}
          </p>
        </div>

        {/* Values */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: '🤝', title: 'Accountability', desc: 'Regular public reports on CDF and all public resources.' },
            { icon: '📣', title: 'Representation',  desc: 'Raising constituency issues in every parliamentary session.' },
            { icon: '⚖️', title: 'Integrity',       desc: 'Zero tolerance for corruption and misuse of public funds.' },
          ].map((v, i) => (
            <div key={i} className="bg-brand-black rounded-xl p-5 text-center">
              <div className="text-4xl mb-2">{v.icon}</div>
              <h3 className="font-extrabold text-brand-yellow mb-1">{v.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-brand-green rounded-xl p-8 text-center">
          <h3 className="text-xl font-extrabold text-white mb-2">Join the Movement</h3>
          <p className="text-green-100 mb-6 text-sm">Read the manifesto, volunteer, or support the campaign.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/manifesto" className="bg-brand-yellow hover:bg-brand-yellowlt text-brand-black font-extrabold py-2.5 px-6 rounded-lg transition-colors text-sm">📋 Read Manifesto</Link>
            <Link href="/volunteer" className="bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-6 rounded-lg border border-white/20 transition-colors text-sm">🙋 Volunteer</Link>
            {waLink !== '#' && (
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold py-2.5 px-6 rounded-lg transition-colors text-sm">💬 WhatsApp</a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
