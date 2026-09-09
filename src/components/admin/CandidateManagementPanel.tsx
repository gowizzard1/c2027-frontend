'use client';

import { useEffect, useState } from 'react';
import CandidateAvatar from '@/components/CandidateAvatar';

interface Props {
  headers: Record<string, string>;
  onLogout: () => void;
}

export default function CandidateManagementPanel({ headers, onLogout }: Props) {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [races, setRaces] = useState<any[]>([]);
  const [newRaceName, setNewRaceName] = useState('');
  const [raceSaving, setRaceSaving] = useState(false);
  const [newCandidate, setNewCandidate] = useState({ name: '', party: '', race: '', imageUrl: '' });
  const [newImage, setNewImage] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCandidate, setEditCandidate] = useState({ name: '', party: '', race: '', imageUrl: '' });
  const [editImage, setEditImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const loadCandidates = () => {
    Promise.all([
      fetch('/api/admin/election-candidates?includeInactive=true', { headers }),
      fetch('/api/admin/candidate-races?includeInactive=true', { headers }),
    ]).then(async ([candidateResponse, raceResponse]) => {
      if (candidateResponse.status === 401 || raceResponse.status === 401) { onLogout(); return; }
      if (!candidateResponse.ok || !raceResponse.ok) throw new Error('Could not load candidates or race management.');
      setCandidates(await candidateResponse.json());
      setRaces(await raceResponse.json());
    }).catch(() => { setCandidates([]); setRaces([]); });
  };

  useEffect(() => { loadCandidates(); }, []);

  const uploadImage = async (file: File | null, fallbackUrl: string) => {
    if (!file) return fallbackUrl.trim();
    const form = new FormData();
    form.append('image', file);
    const res = await fetch('/api/upload/candidate-image', {
      method: 'POST',
      headers: { Authorization: headers.Authorization },
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) throw new Error(data.message || 'Could not upload candidate image.');
    return data.url as string;
  };

  const createRace = async () => {
    const name = newRaceName.trim();
    if (!name || raceSaving) return;
    setRaceSaving(true);
    try {
      const response = await fetch('/api/admin/candidate-races', { method: 'POST', headers, body: JSON.stringify({ name }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { alert(data.message || 'Could not create race.'); return; }
      setRaces(current => [...current, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewRaceName('');
    } finally { setRaceSaving(false); }
  };

  const archiveRace = async (race: any) => {
    if (!confirm(`Archive ${race.name}? New candidates and polls will no longer be able to select it.`)) return;
    const response = await fetch(`/api/admin/candidate-races/${race.id}/archive`, { method: 'POST', headers });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { alert(data.message || 'Could not archive this race.'); return; }
    setRaces(current => current.map(item => item.id === race.id ? data : item));
  };

  const addCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandidate.name.trim() || !newCandidate.race.trim() || saving) return;
    setSaving(true);
    try {
      const imageUrl = await uploadImage(newImage, newCandidate.imageUrl);
      const res = await fetch('/api/admin/election-candidates', {
        method: 'POST', headers,
        body: JSON.stringify({ name: newCandidate.name.trim(), party: newCandidate.party.trim(), race: newCandidate.race.trim(), imageUrl }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { alert(data.message || 'Could not add candidate.'); return; }
      setCandidates(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCandidate({ name: '', party: '', race: '', imageUrl: '' });
      setNewImage(null);
    } catch (err: any) {
      alert(err?.message || 'Could not upload candidate image.');
    } finally {
      setSaving(false);
    }
  };

  const beginEdit = (candidate: any) => {
    setEditingId(candidate.id);
    setEditCandidate({ name: candidate.name, party: candidate.party || '', race: candidate.race || 'Unassigned', imageUrl: candidate.imageUrl || '' });
    setEditImage(null);
  };

  const saveEdit = async (candidate: any) => {
    if (!editCandidate.name.trim() || !editCandidate.race.trim() || saving) return;
    setSaving(true);
    try {
      const imageUrl = await uploadImage(editImage, editCandidate.imageUrl);
      const res = await fetch(`/api/admin/election-candidates/${candidate.id}`, {
        method: 'PUT', headers,
        body: JSON.stringify({ name: editCandidate.name.trim(), party: editCandidate.party.trim(), race: editCandidate.race.trim(), imageUrl }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { alert(data.message || 'Could not update candidate.'); return; }
      setCandidates(prev => prev.map(item => item.id === candidate.id ? data : item));
      setEditingId(null);
    } catch (err: any) {
      alert(err?.message || 'Could not upload candidate image.');
    } finally {
      setSaving(false);
    }
  };

  const setActive = async (candidate: any, active: boolean) => {
    const res = await fetch(`/api/admin/election-candidates/${candidate.id}`, { method: 'PATCH', headers, body: JSON.stringify({ active }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { alert(data.message || 'Could not update candidate.'); return; }
    setCandidates(prev => prev.map(item => item.id === candidate.id ? data : item));
  };

  const archive = async (candidate: any) => {
    if (!confirm(`Archive ${candidate.name}? They will disappear from future result forms but remain in historical result snapshots.`)) return;
    const res = await fetch(`/api/admin/election-candidates/${candidate.id}/archive`, { method: 'POST', headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { alert(data.message || 'Could not archive candidate.'); return; }
    setCandidates(prev => prev.map(item => item.id === candidate.id ? data : item));
  };

  const restore = async (candidate: any) => {
    const res = await fetch(`/api/admin/election-candidates/${candidate.id}/restore`, { method: 'POST', headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { alert(data.message || 'Could not restore candidate.'); return; }
    setCandidates(prev => prev.map(item => item.id === candidate.id ? data : item));
  };

  const remove = async (candidate: any) => {
    if (!confirm(`Permanently delete ${candidate.name}? Historical result snapshots keep their name/votes, but the candidate profile and image are removed.`)) return;
    const res = await fetch(`/api/admin/election-candidates/${candidate.id}`, { method: 'DELETE', headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { alert(data.message || 'Could not delete candidate. Archive instead if you want to keep the profile.'); return; }
    setCandidates(prev => prev.filter(item => item.id !== candidate.id));
  };

  const raceGroups = candidates.reduce<Record<string, any[]>>((groups, candidate) => {
    const race = candidate.race || 'Unassigned';
    (groups[race] ||= []).push(candidate);
    return groups;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Candidate Management</h2>
        <p className="mt-1 text-sm text-gray-500">Manage names, affiliations, images, and election availability. Missing images show a neutral avatar placeholder.</p>
      </div>

      <section className="rounded-xl border border-brand-yellow/40 bg-brand-yellow/10 p-5">
        <h3 className="font-extrabold text-brand-black">Race Management</h3>
        <p className="mt-1 text-xs text-gray-700">Create each election race once, then assign candidates from the controlled list.</p>
        <div className="mt-4 flex flex-wrap gap-3"><input value={newRaceName} onChange={e => setNewRaceName(e.target.value)} placeholder="Race, e.g. Governor — Uasin Gishu" className="min-w-60 flex-1 rounded-lg border px-3 py-2 text-sm" /><button disabled={raceSaving || !newRaceName.trim()} onClick={createRace} className="rounded-lg bg-brand-black px-5 py-2 text-sm font-bold text-brand-yellow disabled:opacity-50">{raceSaving ? 'Creating…' : 'Create race'}</button></div>
        <div className="mt-4 flex flex-wrap gap-2">{races.map(race => <span key={race.id} className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${race.active && !race.archivedAt ? 'bg-white text-brand-black' : 'bg-gray-200 text-gray-500'}`}>{race.name}{race.name !== 'Unassigned' && race.active && !race.archivedAt && <button onClick={() => archiveRace(race)} className="text-red-600 hover:underline">Archive</button>}</span>)}</div>
      </section>

      <section className="rounded-xl border border-blue-200 bg-blue-50 p-5">
        <h3 className="font-extrabold text-brand-black">Add candidate</h3>
        <form onSubmit={addCandidate} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input value={newCandidate.name} onChange={e => setNewCandidate({ ...newCandidate, name: e.target.value })} placeholder="Candidate name" className="rounded-lg border px-3 py-2 text-sm" />
          <input value={newCandidate.party} onChange={e => setNewCandidate({ ...newCandidate, party: e.target.value })} placeholder="Party / affiliation (optional)" className="rounded-lg border px-3 py-2 text-sm" />
          <select required value={newCandidate.race} onChange={e => setNewCandidate({ ...newCandidate, race: e.target.value })} className="rounded-lg border px-3 py-2 text-sm"><option value="">Select managed race</option>{races.filter(race => race.active && !race.archivedAt).map(race => <option key={race.id} value={race.name}>{race.name}</option>)}</select>
          <input value={newCandidate.imageUrl} onChange={e => { setNewCandidate({ ...newCandidate, imageUrl: e.target.value }); setNewImage(null); }} placeholder="Image URL (optional)" className="rounded-lg border px-3 py-2 text-sm" />
          <div className="flex items-center gap-3"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { setNewImage(e.target.files?.[0] || null); if (e.target.files?.[0]) setNewCandidate({ ...newCandidate, imageUrl: '' }); }} className="min-w-0 text-sm" /><span className="text-xs text-gray-500">JPEG/PNG/WebP · 5MB</span></div>
          <button disabled={saving} className="rounded-lg bg-brand-green px-5 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Add candidate'}</button>
        </form>
      </section>

      {candidates.length === 0 ? <div className="rounded-xl border border-dashed p-10 text-center text-gray-500">No candidates configured yet.</div> : (
        <div className="space-y-8">
          {Object.entries(raceGroups).map(([race, groupedCandidates]) => (
            <section key={race}>
              <div className="mb-3 flex items-center gap-3"><h3 className="text-lg font-extrabold text-brand-black">{race}</h3><span className="rounded bg-brand-yellow/15 px-2 py-1 text-xs font-bold text-brand-black">{groupedCandidates.length} candidate{groupedCandidates.length === 1 ? '' : 's'}</span></div>
              <div className="grid gap-4 md:grid-cols-2">
          {groupedCandidates.map(candidate => (
            <article key={candidate.id} className={`rounded-xl border bg-white p-5 shadow-sm ${candidate.archivedAt ? 'opacity-70' : ''}`}>
              <div className="flex items-start gap-4">
                <CandidateAvatar candidate={candidate} size="large" />
                <div className="min-w-0 flex-1">
                  {editingId === candidate.id ? (
                    <div className="space-y-3">
                      <input value={editCandidate.name} onChange={e => setEditCandidate({ ...editCandidate, name: e.target.value })} className="w-full rounded border px-3 py-2 text-sm" />
                      <input value={editCandidate.party} onChange={e => setEditCandidate({ ...editCandidate, party: e.target.value })} placeholder="Party / affiliation" className="w-full rounded border px-3 py-2 text-sm" />
                      <select required value={editCandidate.race} onChange={e => setEditCandidate({ ...editCandidate, race: e.target.value })} className="w-full rounded border px-3 py-2 text-sm"><option value="">Select managed race</option>{races.filter(race => (race.active && !race.archivedAt) || race.name === editCandidate.race).map(race => <option key={race.id} value={race.name}>{race.name}</option>)}</select>
                      <input value={editCandidate.imageUrl} onChange={e => { setEditCandidate({ ...editCandidate, imageUrl: e.target.value }); setEditImage(null); }} placeholder="Image URL" className="w-full rounded border px-3 py-2 text-sm" />
                      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { setEditImage(e.target.files?.[0] || null); if (e.target.files?.[0]) setEditCandidate({ ...editCandidate, imageUrl: '' }); }} className="w-full text-xs" />
                      <div className="flex gap-3"><button disabled={saving} onClick={() => saveEdit(candidate)} className="text-sm font-semibold text-brand-green hover:underline">Save changes</button><button onClick={() => setEditingId(null)} className="text-sm text-gray-500 hover:underline">Cancel</button></div>
                    </div>
                  ) : (
                    <>
                      <p className="font-extrabold text-gray-900">{candidate.name}</p>
                      <p className="mt-1 text-sm text-gray-500">{candidate.party || 'No affiliation entered'}</p>
                      <p className={`mt-1 text-xs font-semibold ${candidate.race === 'Unassigned' ? 'text-amber-700' : 'text-brand-green'}`}>{candidate.race || 'Unassigned'}</p>
                      <span className={`mt-3 inline-block rounded px-2 py-1 text-xs font-semibold ${candidate.archivedAt ? 'bg-gray-200 text-gray-600' : candidate.active ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{candidate.archivedAt ? 'archived' : candidate.active ? 'active' : 'inactive'}</span>
                    </>
                  )}
                </div>
              </div>
              {editingId !== candidate.id && <div className="mt-5 flex flex-wrap gap-3 text-sm">{candidate.archivedAt ? <button onClick={() => restore(candidate)} className="font-semibold text-brand-green hover:underline">Restore</button> : <><button onClick={() => beginEdit(candidate)} className="font-semibold text-blue-700 hover:underline">Edit</button><button onClick={() => setActive(candidate, !candidate.active)} className="font-semibold text-brand-green hover:underline">{candidate.active ? 'Deactivate' : 'Activate'}</button><button onClick={() => archive(candidate)} className="text-gray-600 hover:underline">Archive</button><button onClick={() => remove(candidate)} className="text-red-600 hover:underline">Delete</button></>}</div>}
            </article>
          ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
