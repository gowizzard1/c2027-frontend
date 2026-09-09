'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CandidateAvatar from '@/components/CandidateAvatar';

interface PollOption { id: string; name: string; party?: string | null; imageUrl?: string | null; votes: number; percentage: number; }
interface Poll { slug: string; title: string; race?: string; prompt: string; description?: string | null; status: 'published' | 'closed'; closesAt?: string | null; totalVotes: number; options: PollOption[]; }

export default function OpinionPollDirectoryPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/content/polls')
      .then(response => response.ok ? response.json() : [])
      .then(data => setPolls(data || []))
      .catch(() => setPolls([]))
      .finally(() => setLoading(false));
  }, []);

  return <div className="bg-white text-brand-black"><section className="bg-brand-black py-14 text-white"><div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8"><p className="text-xs font-extrabold uppercase tracking-widest text-brand-yellow">Community Voice</p><h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Candidate Opinion Polls</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-300">Choose an individual poll to review candidates, vote, or see ranked results.</p></div></section><main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">{loading ? <div className="py-16 text-center text-gray-400">Loading polls…</div> : polls.length === 0 ? <section className="rounded-2xl border border-dashed p-12 text-center"><div className="text-5xl">📊</div><h2 className="mt-4 text-xl font-extrabold">No public polls are open right now</h2><p className="mt-2 text-sm text-gray-500">Please check back for future campaign opinion polls.</p></section> : <div className="grid gap-5 md:grid-cols-2">{polls.map(poll => { const leader = poll.options[0]; return <Link key={poll.slug} href={`/polls/${encodeURIComponent(poll.slug)}`} className="group rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"><div className="flex items-start justify-between gap-3"><div><span className={`rounded-full px-3 py-1 text-xs font-bold ${poll.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{poll.status === 'published' ? 'Voting open' : 'Voting closed'}</span><h2 className="mt-3 text-xl font-extrabold group-hover:text-brand-green">{poll.title}</h2>{poll.race && poll.race !== 'Unassigned' && <p className="mt-1 text-xs font-bold text-brand-green">{poll.race}</p>}</div><span className="text-2xl">🗳️</span></div><p className="mt-2 text-sm text-gray-600">{poll.prompt}</p>{leader && <div className="mt-4 flex items-center gap-3 rounded-xl bg-amber-50 p-3"><span className="text-xl">🥇</span><CandidateAvatar candidate={{ name: leader.name, imageUrl: leader.imageUrl }} /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">Current leader: {leader.name}</span>{leader.party && <span className="block truncate text-xs text-gray-500">{leader.party}</span>}</span><span className="text-sm font-bold">{leader.votes}</span></div>}<div className="mt-4 flex items-center justify-between text-xs font-semibold text-gray-500"><span>{poll.totalVotes} response{poll.totalVotes === 1 ? '' : 's'}</span><span className="text-brand-green">Open poll →</span></div></Link>; })}</div>}</main></div>;
}
