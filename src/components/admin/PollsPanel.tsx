'use client';

import { FormEvent, useEffect, useState } from 'react';

interface Props {
  headers: Record<string, string>;
  onLogout: () => void;
}

const EMPTY_FORM = { title: '', slug: '', prompt: '', description: '', options: ['', ''] };

export default function PollsPanel({ headers, onLogout }: Props) {
  const [polls, setPolls] = useState<any[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const load = () => fetch(`/api/admin/opinion-polls?includeArchived=${showArchived}`, { headers })
    .then(async res => {
      if (res.status === 401) { onLogout(); return []; }
      if (!res.ok) throw new Error('Could not load opinion polls.');
      return res.json();
    })
    .then(data => setPolls(data || []))
    .catch((err: Error) => setError(err.message));

  useEffect(() => { load(); }, [showArchived]);

  const setField = (field: 'title' | 'slug' | 'prompt' | 'description', value: string) => setForm(current => ({ ...current, [field]: value }));
  const setOption = (index: number, value: string) => setForm(current => ({ ...current, options: current.options.map((option, optionIndex) => optionIndex === index ? value : option) }));
  const addOption = () => setForm(current => current.options.length < 10 ? { ...current, options: [...current.options, ''] } : current);
  const removeOption = (index: number) => setForm(current => current.options.length > 2 ? { ...current, options: current.options.filter((_, optionIndex) => optionIndex !== index) } : current);
  const resetForm = () => { setForm(EMPTY_FORM); setEditingId(null); setError(''); };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setError('');
    try {
      const payload = { ...form, options: form.options.map(option => option.trim()).filter(Boolean) };
      const res = await fetch(editingId ? `/api/admin/opinion-polls/${editingId}` : '/api/admin/opinion-polls', {
        method: editingId ? 'PUT' : 'POST', headers, body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) { onLogout(); return; }
      if (!res.ok) throw new Error(data.message || 'Could not save this poll.');
      resetForm(); load();
    } catch (err: any) {
      setError(err?.message || 'Could not save this poll.');
    } finally { setSaving(false); }
  };

  const edit = (poll: any) => {
    if (poll.status !== 'draft') return;
    setEditingId(poll.id);
    setForm({ title: poll.title, slug: poll.slug, prompt: poll.prompt, description: poll.description || '', options: poll.options.sort((a: any, b: any) => a.sortOrder - b.sortOrder).map((option: any) => option.label) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const action = async (poll: any, actionName: 'publish' | 'close' | 'archive' | 'reset') => {
    let note = '';
    if (actionName === 'publish' && !confirm(`Publish “${poll.title}”? Public visitors will be able to vote.`)) return;
    if (actionName === 'close' && !confirm(`Close “${poll.title}”? No new votes will be accepted.`)) return;
    if (actionName === 'archive' && !confirm(`Archive “${poll.title}”? It will no longer be visible publicly.`)) return;
    if (actionName === 'reset') {
      note = prompt('Why is this closed poll being reset? This note will be retained in the audit history and visible to admins.', '')?.trim() || '';
      if (note.length < 10) { alert('A reset needs an audit note of at least 10 characters.'); return; }
    }
    const res = await fetch(`/api/admin/opinion-polls/${poll.id}/${actionName}`, { method: 'POST', headers, body: actionName === 'reset' ? JSON.stringify({ note }) : undefined });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) { onLogout(); return; }
    if (!res.ok) { alert(data.message || `Could not ${actionName} this poll.`); return; }
    load();
  };

  const badge = (status: string) => status === 'published' ? 'bg-green-100 text-green-700' : status === 'closed' ? 'bg-blue-100 text-blue-700' : status === 'archived' ? 'bg-gray-200 text-gray-600' : 'bg-yellow-100 text-yellow-700';

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-2xl font-bold text-gray-900">Public Opinion Polls</h2><p className="mt-1 text-sm text-gray-500">Anonymous, browser-limited campaign opinion polls. They are not scientific surveys or official election results.</p></div><label className="flex items-center gap-2 text-sm font-semibold text-gray-600"><input type="checkbox" checked={showArchived} onChange={event => setShowArchived(event.target.checked)} /> Show archived</label></div>

    <section className="rounded-xl border border-brand-yellow/40 bg-brand-yellow/10 p-5"><h3 className="font-extrabold text-brand-black">{editingId ? 'Edit draft poll' : 'Create opinion poll'}</h3><p className="mt-1 text-xs text-gray-700">Only draft polls can be edited. Once published, close the poll before resetting it into a new audited round.</p>
      <form onSubmit={save} className="mt-4 grid gap-3 sm:grid-cols-2"><input required value={form.title} onChange={event => setField('title', event.target.value)} placeholder="Internal/display title" className="rounded-lg border px-3 py-2 text-sm" /><input required value={form.slug} onChange={event => setField('slug', event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} placeholder="URL slug, e.g. youth-priorities" className="rounded-lg border px-3 py-2 text-sm" /><input required value={form.prompt} onChange={event => setField('prompt', event.target.value)} placeholder="Public question" className="rounded-lg border px-3 py-2 text-sm sm:col-span-2" /><textarea value={form.description} onChange={event => setField('description', event.target.value)} placeholder="Optional context for participants" className="min-h-20 rounded-lg border px-3 py-2 text-sm sm:col-span-2" />
        <div className="sm:col-span-2"><p className="mb-2 text-sm font-bold text-gray-700">Response options</p><div className="space-y-2">{form.options.map((option, index) => <div key={index} className="flex gap-2"><input required value={option} onChange={event => setOption(index, event.target.value)} placeholder={`Option ${index + 1}`} className="flex-1 rounded-lg border px-3 py-2 text-sm" />{form.options.length > 2 && <button type="button" onClick={() => removeOption(index)} className="rounded-lg border px-3 text-sm text-red-600">Remove</button>}</div>)}</div>{form.options.length < 10 && <button type="button" onClick={addOption} className="mt-2 text-sm font-bold text-brand-green hover:underline">+ Add option</button>}</div>
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 sm:col-span-2">{error}</p>}<div className="flex gap-3 sm:col-span-2"><button disabled={saving} className="rounded-lg bg-brand-green px-5 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : editingId ? 'Save draft' : 'Create draft'}</button>{editingId && <button type="button" onClick={resetForm} className="rounded-lg border px-5 py-2 text-sm font-bold text-gray-700">Cancel edit</button>}</div>
      </form>
    </section>

    {polls.length === 0 ? <div className="rounded-xl border border-dashed p-10 text-center text-gray-500">No opinion polls yet. Create a draft above, then publish it when ready.</div> : <div className="space-y-4">{polls.map(poll => <details key={poll.id} className="rounded-xl border bg-white" open={poll.status === 'draft'}><summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-5"><div><p className="font-extrabold text-gray-900">{poll.title}</p><p className="mt-1 text-sm text-gray-500">{poll.prompt}</p></div><div className="flex items-center gap-3"><span className={`rounded px-2 py-1 text-xs font-bold ${badge(poll.status)}`}>{poll.status}</span><span className="text-xs text-gray-500">Round {poll.currentVersion} · {poll.currentTotals?.totalVotes || 0} responses</span></div></summary><div className="border-t p-5"><div className="grid gap-4 md:grid-cols-2"><div><p className="text-xs font-bold uppercase text-gray-500">Options</p><ul className="mt-2 space-y-2">{poll.currentTotals?.options.map((option: any) => <li key={option.id} className="text-sm"><div className="flex justify-between gap-3"><span>{option.label}</span><strong>{option.votes} · {option.percentage}%</strong></div><div className="mt-1 h-2 overflow-hidden rounded bg-gray-100"><div className="h-full bg-brand-green" style={{ width: `${option.percentage}%` }} /></div></li>)}</ul></div><div><p className="text-xs font-bold uppercase text-gray-500">Lifecycle & audit</p><p className="mt-2 text-sm text-gray-600">Published: {poll.publishedAt ? new Date(poll.publishedAt).toLocaleString() : '—'}<br />Closed: {poll.closedAt ? new Date(poll.closedAt).toLocaleString() : '—'}</p>{poll.resets?.length ? <ul className="mt-3 space-y-2 text-xs text-gray-600">{poll.resets.map((reset: any) => <li key={reset.id} className="rounded bg-gray-50 p-2">Round {reset.fromVersion} → {reset.toVersion} by {reset.resetBy}: {reset.note} ({reset.voteCountBefore} prior responses)</li>)}</ul> : <p className="mt-3 text-xs text-gray-400">No reset history.</p>}</div></div><div className="mt-5 flex flex-wrap gap-3 text-sm">{poll.status === 'draft' && <><button onClick={() => edit(poll)} className="font-bold text-brand-green hover:underline">Edit draft</button><button onClick={() => action(poll, 'publish')} className="font-bold text-green-700 hover:underline">Publish</button></>}{poll.status === 'published' && <button onClick={() => action(poll, 'close')} className="font-bold text-blue-700 hover:underline">Close voting</button>}{poll.status === 'closed' && <button onClick={() => action(poll, 'reset')} className="font-bold text-brand-green hover:underline">Reset into new round</button>}{poll.status !== 'archived' && <button onClick={() => action(poll, 'archive')} className="font-bold text-gray-600 hover:underline">Archive</button>}</div></div></details>)}</div>}
  </div>;
}
