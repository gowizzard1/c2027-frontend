'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import CandidateAvatar from '@/components/CandidateAvatar';

const BROWSER_TOKEN_KEY = 'maiywa_opinion_poll_browser_token';

interface Option { id: string; candidateId?: string | null; name: string; party?: string | null; imageUrl?: string | null; votes: number; percentage: number; }
interface Poll { slug: string; title: string; prompt: string; description?: string | null; disclosure: string; status: 'published' | 'closed'; version: number; publishedAt?: string | null; closedAt?: string | null; totalVotes: number; options: Option[]; }

function browserToken() {
  const existing = localStorage.getItem(BROWSER_TOKEN_KEY);
  if (existing) return existing;
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const token = btoa(String.fromCharCode(...Array.from(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  localStorage.setItem(BROWSER_TOKEN_KEY, token);
  return token;
}

function votedKey(poll: Poll) { return `maiywa_opinion_poll_voted:${poll.slug}:v${poll.version}`; }

export default function OpinionPollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState<Record<string, string>>({});
  const [voted, setVoted] = useState<Record<string, boolean>>({});
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [error, setError] = useState('');

  const refreshVoteStatus = async (poll: Poll) => {
    try {
      const response = await fetch(`/api/polls/${encodeURIComponent(poll.slug)}/vote-status`, {
        headers: { 'X-Poll-Browser-Token': browserToken() },
      });
      if (!response.ok) return;
      const data = await response.json();
      if (data.poll) {
        setPolls(current => current.map(item => item.slug === poll.slug ? data.poll : item));
        const alreadyVoted = Boolean(data.hasVoted) || localStorage.getItem(votedKey(data.poll)) === 'true';
        setVoted(current => ({ ...current, [poll.slug]: alreadyVoted }));
      }
    } catch {
      // The public content response remains usable if a status check times out.
    }
  };

  useEffect(() => {
    fetch('/api/content/polls')
      .then(response => response.ok ? response.json() : [])
      .then((data: Poll[]) => {
        setPolls(data || []);
        setVoted(Object.fromEntries((data || []).map(poll => [poll.slug, localStorage.getItem(votedKey(poll)) === 'true'])));
        (data || []).filter(poll => poll.status === 'published').forEach(poll => { void refreshVoteStatus(poll); });
      })
      .catch(() => setError('Could not load opinion polls. Please try again later.'))
      .finally(() => setLoading(false));
  }, []);

  const vote = async (poll: Poll) => {
    const optionId = selection[poll.slug];
    if (!optionId || busySlug) return;
    setBusySlug(poll.slug); setError('');
    try {
      const response = await fetch(`/api/polls/${encodeURIComponent(poll.slug)}/votes`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId, browserToken: browserToken() }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 201 || response.status === 409) {
        if (data.poll) {
          setPolls(current => current.map(item => item.slug === poll.slug ? data.poll : item));
          localStorage.setItem(votedKey(data.poll), 'true');
          setVoted(current => ({ ...current, [poll.slug]: true }));
        }
        if (response.status === 409) setError('This browser has already voted in this poll round. Current results are shown below.');
        return;
      }
      if (response.status === 429) {
        await refreshVoteStatus(poll);
        setError('Voting is temporarily limited for this network. Current results are shown if this browser or network has already voted.');
        return;
      }
      setError(data.message || 'Could not record your vote. Please try again.');
    } catch {
      setError('Could not record your vote. Please check your connection and try again.');
    } finally { setBusySlug(null); }
  };

  return <div className="bg-white text-brand-black"><PageHeader label="Community Voice" title="Candidate Opinion Polls" subtitle="Share your view in informal campaign candidate polls." />
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      {error && <p aria-live="polite" className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-700">{error}</p>}
      {loading ? <div className="py-16 text-center text-gray-400">Loading opinion polls…</div> : polls.length === 0 ? <section className="rounded-2xl border border-dashed p-12 text-center"><div className="text-5xl">📊</div><h2 className="mt-4 text-xl font-extrabold">No public polls are open right now</h2><p className="mt-2 text-sm text-gray-500">Please check back for future campaign opinion polls.</p></section> : polls.map(poll => <PollCard key={`${poll.slug}-${poll.version}`} poll={poll} selectedOption={selection[poll.slug] || ''} hasVoted={!!voted[poll.slug]} busy={busySlug === poll.slug} onSelect={optionId => setSelection(current => ({ ...current, [poll.slug]: optionId }))} onVote={() => vote(poll)} />)}
    </main>
  </div>;
}

function CandidateChoice({ option, showResult }: { option: Option; showResult?: boolean }) {
  return <div className="flex min-w-0 items-center gap-3"><CandidateAvatar candidate={{ name: option.name, imageUrl: option.imageUrl }} size="large" /><span className="min-w-0 flex-1"><span className="block truncate font-bold">{option.name}</span>{option.party && <span className="block truncate text-xs font-normal text-gray-500">{option.party}</span>}{showResult && <span className="mt-1 block text-sm"><strong>{option.votes}</strong> · {option.percentage}%</span>}</span></div>;
}

function PollCard({ poll, selectedOption, hasVoted, busy, onSelect, onVote }: { poll: Poll; selectedOption: string; hasVoted: boolean; busy: boolean; onSelect: (id: string) => void; onVote: () => void }) {
  const showResults = poll.status === 'closed' || hasVoted;
  const rankedOptions = [...poll.options].map((option, index) => ({ option, index })).sort((a, b) => b.option.votes - a.option.votes || a.index - b.index);
  const medal = (rank: number) => rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
  const rankStyle = (rank: number) => rank === 1 ? 'border-amber-300 bg-amber-50' : rank === 2 ? 'border-slate-300 bg-slate-50' : rank === 3 ? 'border-orange-300 bg-orange-50' : 'border-gray-100';

  return <article className="rounded-2xl border bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="section-label mb-1">{poll.status === 'published' ? 'Voting open' : 'Voting closed'} · {poll.totalVotes} response{poll.totalVotes === 1 ? '' : 's'}</p><h2 className="text-2xl font-extrabold">{poll.title}</h2></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${poll.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{poll.status === 'published' ? 'Open' : 'Closed'}</span></div>{poll.description && <p className="mt-3 text-sm leading-relaxed text-gray-600">{poll.description}</p>}<h3 className="mt-6 text-lg font-extrabold">{poll.prompt}</h3>
    {!showResults && poll.status === 'published' ? <fieldset className="mt-4 space-y-3"><legend className="sr-only">Choose one candidate</legend>{poll.options.map(option => <label key={option.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${selectedOption === option.id ? 'border-brand-green bg-green-50' : 'hover:border-brand-yellow'}`}><input type="radio" name={poll.slug} value={option.id} checked={selectedOption === option.id} onChange={() => onSelect(option.id)} /><CandidateChoice option={option} /></label>)}<button disabled={!selectedOption || busy} onClick={onVote} className="mt-2 rounded-lg bg-brand-green px-5 py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Submitting vote…' : 'Submit anonymous vote'}</button></fieldset> : <div className="mt-5 space-y-4">{hasVoted && poll.status === 'published' && <p className="rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-800">Thank you. Your anonymous browser-limited vote has been recorded.</p>}<div className="space-y-3">{rankedOptions.map(({ option, index }) => { const rank = index + 1; const badge = poll.totalVotes > 0 ? medal(rank) : null; return <div key={option.id} className={`rounded-xl border p-3 ${badge ? rankStyle(rank) : 'border-gray-100'}`}><div className="flex items-center gap-3"><span className="w-7 text-center text-xl" aria-label={badge ? `Rank ${rank}` : undefined}>{badge || <span className="text-sm font-bold text-gray-400">{rank}</span>}</span><CandidateChoice option={option} showResult /></div><div className="ml-10 mt-2 h-3 overflow-hidden rounded-full bg-white/80"><div className="h-full rounded-full bg-brand-green" style={{ width: `${option.percentage}%` }} /></div></div>; })}</div></div>}
    <p className="mt-6 border-t pt-4 text-xs leading-relaxed text-gray-500">{poll.disclosure}</p>
  </article>;
}
