'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import CandidateAvatar from '@/components/CandidateAvatar';

interface CandidateTotal { id: string; name: string; party: string | null; imageUrl: string | null; votes: number; }
interface StationResult { station: string; ward: string; validVotes: number; rejectedVotes: number; verifiedAt: string; }
interface VerifiedResults {
  verifiedStations: number;
  totalValidVotes: number;
  totalRejectedVotes: number;
  lastUpdated: string | null;
  candidates: CandidateTotal[];
  stations: StationResult[];
}

export default function ResultsPage() {
  const [results, setResults] = useState<VerifiedResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/content/verified-results')
      .then(res => res.ok ? res.json() : null)
      .then(data => setResults(data))
      .catch(() => setResults(null))
      .finally(() => setLoading(false));
  }, []);

  const maxVotes = Math.max(1, ...(results?.candidates.map(candidate => candidate.votes) || [0]));

  return (
    <div className="bg-white text-brand-black">
      <PageHeader label="Polling Station Updates" title="Verified Result Updates" subtitle="Private agent reports reviewed and verified by the campaign team." />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <section className="rounded-2xl border border-brand-yellow bg-brand-yellow/10 p-5">
          <div className="flex gap-3"><span className="text-2xl">⚖️</span><div><h2 className="font-extrabold">Important verification notice</h2><p className="mt-1 text-sm leading-relaxed text-gray-700">These are campaign-verified, agent-reported polling-station updates. They are not an official electoral declaration. Official results are declared only by the authorized electoral body.</p></div></div>
        </section>

        {loading ? <div className="py-16 text-center text-gray-400">Loading verified updates…</div> : !results || results.verifiedStations === 0 ? (
          <section className="rounded-2xl border border-dashed border-gray-300 p-12 text-center"><div className="text-5xl">📋</div><h2 className="mt-4 text-xl font-extrabold">No verified polling-station updates yet</h2><p className="mt-2 text-sm text-gray-500">Updates will appear here only after a polling-agent report has been reviewed and verified by the campaign team.</p></section>
        ) : (
          <>
            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Metric label="Verified stations" value={results.verifiedStations} icon="🗳️" />
              <Metric label="Valid votes reported" value={results.totalValidVotes.toLocaleString()} icon="🧾" />
              <Metric label="Rejected votes reported" value={results.totalRejectedVotes.toLocaleString()} icon="📌" />
              <Metric label="Last updated" value={results.lastUpdated ? new Date(results.lastUpdated).toLocaleString() : '—'} icon="🕒" compact />
            </section>

            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-5"><p className="section-label mb-1">Aggregate from verified stations</p><h2 className="text-2xl font-extrabold">Candidate vote totals</h2><p className="mt-1 text-xs text-gray-500">Only currently active candidates are shown in this breakdown.</p></div>
              <div className="space-y-4">
                {results.candidates.map(candidate => <div key={candidate.id}><div className="mb-1 flex justify-between gap-3 text-sm"><div className="flex items-center gap-2"><CandidateAvatar candidate={candidate} /><span className="font-bold">{candidate.name}{candidate.party && <span className="ml-2 font-normal text-gray-500">{candidate.party}</span>}</span></div><span className="font-extrabold">{candidate.votes.toLocaleString()}</span></div><div className="h-3 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-brand-green" style={{ width: `${(candidate.votes / maxVotes) * 100}%` }} /></div></div>)}
              </div>
            </section>

            <section className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
              <div className="border-b p-6"><p className="section-label mb-1">Verified station coverage</p><h2 className="text-xl font-extrabold">Polling-station updates</h2></div>
              <table className="w-full text-sm"><thead className="bg-gray-50"><tr><th className="px-5 py-3 text-left">Station</th><th className="px-5 py-3 text-left">Ward</th><th className="px-5 py-3 text-right">Valid votes</th><th className="px-5 py-3 text-right">Rejected votes</th><th className="px-5 py-3 text-left">Verified</th></tr></thead><tbody>{results.stations.map(station => <tr key={`${station.station}-${station.verifiedAt}`} className="border-t"><td className="px-5 py-3 font-semibold">{station.station}</td><td className="px-5 py-3">{station.ward}</td><td className="px-5 py-3 text-right">{station.validVotes.toLocaleString()}</td><td className="px-5 py-3 text-right">{station.rejectedVotes.toLocaleString()}</td><td className="px-5 py-3 text-xs text-gray-500">{new Date(station.verifiedAt).toLocaleString()}</td></tr>)}</tbody></table>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function Metric({ label, value, icon, compact = false }: { label: string; value: string | number; icon: string; compact?: boolean }) {
  return <div className="rounded-xl border bg-white p-5 shadow-sm"><div className="text-2xl">{icon}</div><p className={`mt-2 font-extrabold text-brand-black ${compact ? 'text-sm' : 'text-2xl'}`}>{value}</p><p className="mt-1 text-xs font-semibold text-gray-500">{label}</p></div>;
}
