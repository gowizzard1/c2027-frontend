'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import PageHeader from '@/components/PageHeader';

interface Release {
  version: string;
  buildNumber?: string | null;
  fileUrl?: string | null;
  externalUrl?: string | null;
  releaseNotes?: string | null;
  updatedAt: string;
}

export default function CampaignAppPage() {
  const [android, setAndroid] = useState<Release | null>(null);
  const [ios, setIos] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/content/mobile-app')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) { setAndroid(data.android); setIos(data.ios); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

  return (
    <div className="bg-white text-brand-black">
      <PageHeader label="Campaign Team Mobile" title="Take the Campaign Team With You" subtitle="A secure mobile workspace for Campaign Team members across social media, mobilization, and polling operations." />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <section className="relative overflow-hidden rounded-2xl bg-brand-black px-6 py-8 text-white sm:px-10 sm:py-10">
          <div className="absolute -right-14 -top-14 h-52 w-52 rounded-full bg-brand-yellow/10 blur-3xl" />
          <div className="relative flex flex-col items-center gap-7 text-center sm:flex-row sm:text-left">
            <Image src="/logo.png" alt="IKM Campaign Team app" width={220} height={220} className="h-40 w-40 shrink-0 object-contain" />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-brand-yellow">IKM Campaign Team</p>
              <h2 className="mt-2 text-3xl font-extrabold">One secure workspace. Every campaign role.</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-300">Sign in with your Campaign Team account to access role assignments, team resources, field reports, approved sharing tools, mobile-data support, and private polling operations.</p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <Feature icon="📱" title="Social Media Team" text="Share approved campaign content and coordinate with the digital team." />
          <Feature icon="📣" title="Mobilizer Team" text="Submit aggregate field reports and coordinate activity by ward." />
          <Feature icon="🗳️" title="Polling Agent Team" text="Access station assignments and submit private counted-result evidence." />
        </section>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="section-label mb-1">Download</p><h2 className="text-2xl font-extrabold">Campaign Team App</h2></div>{isAndroid && <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">Android device detected</span>}</div>
          {loading ? <div className="py-10 text-center text-gray-400">Checking for the latest app release…</div> : (
            <div className="mt-5 space-y-5">
              {android?.fileUrl ? <div className="rounded-xl border border-green-200 bg-green-50 p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="font-extrabold text-green-900">Android APK</h3><p className="mt-1 text-sm text-green-800">Version {android.version}{android.buildNumber ? ` · Build ${android.buildNumber}` : ''}</p>{android.releaseNotes && <p className="mt-3 max-w-2xl text-sm text-green-900">{android.releaseNotes}</p>}</div><a href={android.fileUrl} download className="rounded-lg bg-brand-green px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-brand-greenlt">⬇ Download Android APK</a></div><p className="mt-4 text-xs text-green-800">Android may ask you to allow installation from this browser. Only install the APK downloaded from this official site.</p></div> : <div className="rounded-xl border border-dashed p-5 text-sm text-gray-500">The Android app is being prepared. Check back soon.</div>}
              {ios?.externalUrl && <div className="rounded-xl border border-blue-200 bg-blue-50 p-5"><h3 className="font-extrabold text-blue-900">iPhone / iPad</h3><p className="mt-1 text-sm text-blue-800">Version {ios.version}{ios.releaseNotes ? ` · ${ios.releaseNotes}` : ''}</p><a href={ios.externalUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-lg bg-blue-700 px-5 py-3 text-sm font-extrabold text-white">Open TestFlight / App Store</a></div>}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-brand-yellow bg-brand-yellow/10 p-5 text-sm text-gray-700"><strong>Account access:</strong> Team members activate their account from the campaign invitation email, then use the same email and password in the mobile app. The app does not replace official electoral systems or public result declarations.</section>
      </main>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: string; title: string; text: string }) {
  return <div className="rounded-xl border bg-white p-5 shadow-sm"><div className="text-3xl">{icon}</div><h3 className="mt-3 font-extrabold text-brand-black">{title}</h3><p className="mt-1 text-sm leading-relaxed text-gray-600">{text}</p></div>;
}
