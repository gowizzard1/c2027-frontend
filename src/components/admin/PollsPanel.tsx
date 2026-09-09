'use client';

import { FormEvent, useEffect, useState } from 'react';
import CandidateAvatar from '@/components/CandidateAvatar';

interface Props { headers: Record<string, string>; onLogout: () => void; }
const EMPTY_FORM = { title: '', slug: '', prompt: '', description: '', closesAt: '', candidateIds: [] as string[] };

export default function PollsPanel({ headers, onLogout }: Props) {
  const [polls, setPolls] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [managedRaces, setManagedRaces] = useState<any[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedRace, setSelectedRace] = useState('');

  const load = () => Promise.all([
    fetch(`/api/admin/opinion-polls?includeArchived=${showArchived}`, { headers }),
    fetch('/api/admin/election-candidates', { headers }),
    fetch('/api/admin/candidate-races', { headers }),
  ]).then(async ([pollResponse, candidateResponse, raceResponse]) => {
    if (pollResponse.status === 401 || candidateResponse.status === 401 || raceResponse.status === 401) { onLogout(); return; }
    if (!pollResponse.ok || !candidateResponse.ok || !raceResponse.ok) throw new Error('Could not load polls, candidates, or races.');
    setPolls(await pollResponse.json());
    setCandidates(await candidateResponse.json());
    setManagedRaces(await raceResponse.json());
  }).catch((err: Error) => setError(err.message));

  useEffect(() => { load(); }, [showArchived]);

  const setField = (field: 'title' | 'slug' | 'prompt' | 'description' | 'closesAt', value: string) => setForm(current => ({ ...current, [field]: value }));
  const toggleCandidate = (candidateId: string) => setForm(current => {
    if (current.candidateIds.includes(candidateId)) return { ...current, candidateIds: current.candidateIds.filter(id => id !== candidateId) };
    if (current.candidateIds.length >= 10) { alert('A poll can include up to 10 candidates.'); return current; }
    return { ...current, candidateIds: [...current.candidateIds, candidateId] };
  });
  const resetForm = () => { setForm(EMPTY_FORM); setSelectedRace(''); setEditingId(null); setError(''); };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;
    if (form.candidateIds.length < 2) { setError('Select at least two active candidates.'); return; }
    setSaving(true); setError('');
    try {
      const payload = { ...form, closesAt: form.closesAt ? new Date(form.closesAt).toISOString() : '' };
      const res = await fetch(editingId ? `/api/admin/opinion-polls/${editingId}` : '/api/admin/opinion-polls', { method: editingId ? 'PUT' : 'POST', headers, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) { onLogout(); return; }
      if (!res.ok) throw new Error(data.message || 'Could not save this poll.');
      resetForm(); load();
    } catch (err: any) { setError(err?.message || 'Could not save this poll.'); }
    finally { setSaving(false); }
  };

  const edit = (poll: any) => {
    if (poll.status !== 'draft') return;
    const selected = poll.options.filter((option: any) => option.candidateId).sort((a: any, b: any) => a.sortOrder - b.sortOrder).map((option: any) => option.candidateId);
    if (selected.length !== poll.options.length) setError('This legacy draft has non-candidate options. Select the current candidates again before saving it.');
    setEditingId(poll.id);
    setSelectedRace(poll.race || '');
    setForm({ title: poll.title, slug: poll.slug, prompt: poll.prompt, description: poll.description || '', closesAt: poll.closesAt ? new Date(poll.closesAt).toISOString().slice(0, 16) : '', candidateIds: selected });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const action = async (poll: any, actionName: 'publish' | 'close' | 'archive' | 'reset' | 'default' | 'refreshImages') => {
    let note = '';
    if (actionName === 'publish' && !confirm(`Publish “${poll.title}”? Public visitors will be able to vote for the selected candidates.`)) return;
    if (actionName === 'close' && !confirm(`Close “${poll.title}”? No new votes will be accepted.`)) return;
    if (actionName === 'default' && !confirm(`Set “${poll.title}” as the default poll at /polls?`)) return;
    if (actionName === 'refreshImages' && !confirm(`Refresh candidate image snapshots for “${poll.title}”? Vote totals and candidate names will not change.`)) return;
    if (actionName === 'archive' && !confirm(`Archive “${poll.title}”? It will no longer be visible publicly.`)) return;
    if (actionName === 'reset') { note = prompt('Why is this poll being reset? This audit note is retained.', '')?.trim() || ''; if (note.length < 10) { alert('A reset needs an audit note of at least 10 characters.'); return; } }
    const actionPath = actionName === 'refreshImages' ? 'refresh-candidate-images' : actionName;
    const res = await fetch(`/api/admin/opinion-polls/${poll.id}/${actionPath}`, { method: 'POST', headers, body: actionName === 'reset' ? JSON.stringify({ note }) : undefined });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) { onLogout(); return; }
    if (!res.ok) { alert(data.message || `Could not ${actionName} this poll.`); return; }
    if (actionName === 'refreshImages') alert(`${data.updatedImages || 0} candidate image snapshot(s) refreshed.`);
    load();
  };

  const badge = (status: string) => status === 'published' ? 'bg-green-100 text-green-700' : status === 'closed' ? 'bg-blue-100 text-blue-700' : status === 'archived' ? 'bg-gray-200 text-gray-600' : 'bg-yellow-100 text-yellow-700';
  const races = managedRaces.filter(race => race.active && !race.archivedAt && race.name !== 'Unassigned').map(race => race.name) as string[];
  const raceCandidates = candidates.filter(candidate => candidate.race === selectedRace);

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-2xl font-bold text-gray-900">Candidate Opinion Polls</h2><p className="mt-1 text-sm text-gray-500">Poll choices reuse active candidate profiles. Each poll keeps a snapshot of the selected candidate details for historical transparency.</p></div><label className="flex items-center gap-2 text-sm font-semibold text-gray-600"><input type="checkbox" checked={showArchived} onChange={event => setShowArchived(event.target.checked)} /> Show archived</label></div>
    <section className="rounded-xl border border-brand-yellow/40 bg-brand-yellow/10 p-5"><h3 className="font-extrabold text-brand-black">{editingId ? 'Edit draft candidate poll' : 'Create candidate poll'}</h3><p className="mt-1 text-xs text-gray-700">Choose 2–10 active candidates from the existing registry. Published polls cannot be edited.</p><form onSubmit={save} className="mt-4 grid gap-3 sm:grid-cols-2"><input required value={form.title} onChange={event => setField('title', event.target.value)} placeholder="Poll title" className="rounded-lg border px-3 py-2 text-sm" /><input required value={form.slug} onChange={event => setField('slug', event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} placeholder="URL slug, e.g. preferred-candidate" className="rounded-lg border px-3 py-2 text-sm" /><input required value={form.prompt} onChange={event => setField('prompt', event.target.value)} placeholder="Public question" className="rounded-lg border px-3 py-2 text-sm sm:col-span-2" /><textarea value={form.description} onChange={event => setField('description', event.target.value)} placeholder="Optional context for participants" className="min-h-20 rounded-lg border px-3 py-2 text-sm sm:col-span-2" />
      <label className="text-sm font-bold text-gray-700 sm:col-span-2">Close automatically at (optional)<input type="datetime-local" value={form.closesAt} onChange={event => setField('closesAt', event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm font-normal" /><span className="mt-1 block text-xs font-normal text-gray-500">Leave blank for manual close only. Scheduled closure creates a final results News statement.</span></label>
      <select required value={selectedRace} onChange={event => { setSelectedRace(event.target.value); setForm(current => ({ ...current, candidateIds: [] })); }} className="rounded-lg border px-3 py-2 text-sm sm:col-span-2"><option value="">Select election race first</option>{races.map(race => <option key={race} value={race}>{race}</option>)}</select>
      <fieldset className="sm:col-span-2"><legend className="mb-2 text-sm font-bold text-gray-700">Candidates selected: {form.candidateIds.length} / 10</legend>{!selectedRace ? <p className="rounded-lg border border-dashed p-4 text-sm text-gray-500">Select a race to load its active candidates.</p> : raceCandidates.length === 0 ? <p className="rounded-lg border border-dashed p-4 text-sm text-gray-500">No active candidates are assigned to {selectedRace}. Classify candidates in the Candidates tab first.</p> : <div className="grid gap-2 sm:grid-cols-2">{raceCandidates.map(candidate => <label key={candidate.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${form.candidateIds.includes(candidate.id) ? 'border-brand-green bg-green-50' : 'bg-white hover:border-brand-yellow'}`}><input type="checkbox" checked={form.candidateIds.includes(candidate.id)} onChange={() => toggleCandidate(candidate.id)} /><CandidateAvatar candidate={candidate} /><span className="min-w-0"><span className="block truncate text-sm font-bold">{candidate.name}</span><span className="block truncate text-xs text-gray-500">{candidate.party || 'No affiliation'}</span></span></label>)}</div>}</fieldset>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 sm:col-span-2">{error}</p>}<div className="flex gap-3 sm:col-span-2"><button disabled={saving || !selectedRace || raceCandidates.length < 2} className="rounded-lg bg-brand-green px-5 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : editingId ? 'Save draft' : 'Create draft'}</button>{editingId && <button type="button" onClick={resetForm} className="rounded-lg border px-5 py-2 text-sm font-bold text-gray-700">Cancel edit</button>}</div>
    </form></section>
    {polls.length === 0 ? <div className="rounded-xl border border-dashed p-10 text-center text-gray-500">No candidate polls yet. Create a draft above, then publish it when ready.</div> : <div className="space-y-4">{polls.map(poll => <details key={poll.id} className="rounded-xl border bg-white" open={poll.status === 'draft'}><summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-5"><div><p className="font-extrabold text-gray-900">{poll.title}</p><p className="mt-1 text-sm text-gray-500">{poll.prompt}</p></div><div className="flex items-center gap-3"><span className={`rounded px-2 py-1 text-xs font-bold ${badge(poll.status)}`}>{poll.status}</span>{poll.isDefault && <span className="rounded bg-brand-yellow px-2 py-1 text-xs font-bold text-brand-black">default /polls</span>}<span className="text-xs text-gray-500">Round {poll.currentVersion} · {poll.currentTotals?.totalVotes || 0} responses</span></div></summary><div className="border-t p-5"><div className="grid gap-4 md:grid-cols-2"><div><p className="text-xs font-bold uppercase text-gray-500">Candidate results</p><ul className="mt-2 space-y-3">{poll.currentTotals?.options.map((option: any) => <li key={option.id}><div className="flex items-center gap-2"><CandidateAvatar candidate={{ name: option.name, imageUrl: option.imageUrl }} /><div className="min-w-0 flex-1"><div className="flex justify-between gap-3 text-sm"><span className="truncate font-semibold">{option.name}<span className="ml-1 font-normal text-gray-500">{option.party || ''}</span></span><strong>{option.votes} · {option.percentage}%</strong></div><div className="mt-1 h-2 overflow-hidden rounded bg-gray-100"><div className="h-full bg-brand-green" style={{ width: `${option.percentage}%` }} /></div></div></div></li>)}</ul></div><div><p className="text-xs font-bold uppercase text-gray-500">Lifecycle & audit</p><p className="mt-2 text-sm text-gray-600">Published: {poll.publishedAt ? new Date(poll.publishedAt).toLocaleString() : '—'}<br />Scheduled close: {poll.closesAt ? new Date(poll.closesAt).toLocaleString() : 'Manual close'}<br />Closed: {poll.closedAt ? new Date(poll.closedAt).toLocaleString() : '—'}{poll.resultsNewsId && <><br />Results statement: published</>}</p>{poll.resets?.length ? <ul className="mt-3 space-y-2 text-xs text-gray-600">{poll.resets.map((reset: any) => <li key={reset.id} className="rounded bg-gray-50 p-2">Round {reset.fromVersion} → {reset.toVersion} by {reset.resetBy}: {reset.note} ({reset.voteCountBefore} prior responses)</li>)}</ul> : <p className="mt-3 text-xs text-gray-400">No reset history.</p>}</div></div><div className="mt-5 flex flex-wrap gap-3 text-sm">{poll.status === 'draft' && <><button onClick={() => edit(poll)} className="font-bold text-brand-green hover:underline">Edit draft</button><button onClick={() => action(poll, 'publish')} className="font-bold text-green-700 hover:underline">Publish</button></>}{poll.status === 'published' && <><button onClick={() => action(poll, 'close')} className="font-bold text-blue-700 hover:underline">Close voting</button>{!poll.isDefault && <button onClick={() => action(poll, 'default')} className="font-bold text-brand-green hover:underline">Set default</button>}</>}{poll.status === 'closed' && <><button onClick={() => action(poll, 'reset')} className="font-bold text-brand-green hover:underline">Reset into new round</button>{!poll.isDefault && <button onClick={() => action(poll, 'default')} className="font-bold text-brand-green hover:underline">Set default</button>}</>}{poll.status !== 'archived' && <><button onClick={() => action(poll, 'refreshImages')} className="font-bold text-brand-green hover:underline">Refresh candidate images</button><button onClick={() => action(poll, 'archive')} className="font-bold text-gray-600 hover:underline">Archive</button></>}</div></div></details>)}</div>}
  </div>;
}
