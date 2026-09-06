'use client';

import { useEffect, useState } from 'react';

interface Props {
  headers: Record<string, string>;
  onLogout: () => void;
}

export default function MobileAppReleasesPanel({ headers, onLogout }: Props) {
  const [releases, setReleases] = useState<any[]>([]);
  const [platform, setPlatform] = useState<'android' | 'ios'>('android');
  const [version, setVersion] = useState('');
  const [buildNumber, setBuildNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [apk, setApk] = useState<File | null>(null);
  const [iosUrl, setIosUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = () => fetch('/api/admin/mobile-app-releases', { headers })
    .then(res => { if (res.status === 401) { onLogout(); return []; } return res.json(); })
    .then(data => setReleases(data || []))
    .catch(() => setReleases([]));

  useEffect(() => { load(); }, []);

  const uploadApk = async () => {
    if (!apk) throw new Error('Choose the compiled Android APK file first.');
    setUploading(true);
    try {
      const form = new FormData();
      form.append('apk', apk);
      const res = await fetch('/api/upload/mobile-apk', { method: 'POST', headers: { Authorization: headers.Authorization }, body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.objectKey) throw new Error(data.message || 'Could not upload APK.');
      return data.objectKey as string;
    } finally { setUploading(false); }
  };

  const publish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!version.trim() || saving) return;
    setSaving(true);
    try {
      const artifactKey = platform === 'android' ? await uploadApk() : '';
      const res = await fetch('/api/admin/mobile-app-releases', {
        method: 'POST', headers,
        body: JSON.stringify({ platform, version: version.trim(), buildNumber: buildNumber.trim(), artifactKey, externalUrl: platform === 'ios' ? iosUrl.trim() : '', releaseNotes: notes.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { alert(data.message || 'Could not publish app release.'); return; }
      setReleases(prev => [data, ...prev]);
      setVersion(''); setBuildNumber(''); setNotes(''); setApk(null); setIosUrl('');
      alert('Release uploaded. Mark it active when you are ready for authenticated Campaign Team downloads.');
    } catch (err: any) { alert(err?.message || 'Could not upload app build.'); }
    finally { setSaving(false); }
  };

  const action = async (release: any, actionName: 'activate' | 'archive') => {
    if (actionName === 'archive' && !confirm(`Archive version ${release.version}? It will no longer be available for download.`)) return;
    const res = await fetch(`/api/admin/mobile-app-releases/${release.id}`, { method: 'PATCH', headers, body: JSON.stringify({ action: actionName }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { alert(data.message || 'Could not update release.'); return; }
    setReleases(prev => prev.map(item => item.id === release.id ? data : actionName === 'activate' && item.platform === release.platform ? { ...item, active: false } : item));
  };

  const remove = async (release: any) => {
    if (!confirm(`Delete version ${release.version}? This removes the release record, but not necessarily its media file.`)) return;
    const res = await fetch(`/api/admin/mobile-app-releases/${release.id}`, { method: 'DELETE', headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { alert(data.message || 'Could not delete release.'); return; }
    setReleases(prev => prev.filter(item => item.id !== release.id));
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-gray-900">Campaign Team Mobile App</h2><p className="mt-1 text-sm text-gray-500">Upload a compiled Android APK, publish it as the active download, and manage TestFlight/App Store links for iOS.</p></div>
      <section className="rounded-xl border border-blue-200 bg-blue-50 p-5"><h3 className="font-extrabold text-brand-black">Publish app release</h3><p className="mt-1 text-xs text-gray-600">Build the app using Expo EAS or CI first. This page publishes the finished artifact; it does not compile the app.</p><form onSubmit={publish} className="mt-4 grid gap-3 sm:grid-cols-2"><select value={platform} onChange={e => setPlatform(e.target.value as 'android' | 'ios')} className="rounded-lg border px-3 py-2 text-sm"><option value="android">Android APK download</option><option value="ios">iOS TestFlight / App Store link</option></select><input value={version} onChange={e => setVersion(e.target.value)} placeholder="Version, e.g. 1.0.0" className="rounded-lg border px-3 py-2 text-sm" /><input value={buildNumber} onChange={e => setBuildNumber(e.target.value)} placeholder="Build number (optional)" className="rounded-lg border px-3 py-2 text-sm" />{platform === 'android' ? <div className="flex items-center gap-2"><input type="file" accept=".apk,application/vnd.android.package-archive" onChange={e => setApk(e.target.files?.[0] || null)} className="min-w-0 text-sm" /><span className="text-xs text-gray-500">APK · max 120MB</span></div> : <input value={iosUrl} onChange={e => setIosUrl(e.target.value)} placeholder="TestFlight or App Store URL" className="rounded-lg border px-3 py-2 text-sm" />}<textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Release notes (optional)" className="min-h-20 rounded-lg border px-3 py-2 text-sm sm:col-span-2" /><button disabled={saving || uploading} className="rounded-lg bg-brand-green px-5 py-2 text-sm font-bold text-white disabled:opacity-50 sm:col-span-2">{uploading ? 'Uploading APK…' : saving ? 'Publishing…' : 'Publish release'}</button></form></section>
      {releases.length === 0 ? <div className="rounded-xl border border-dashed p-10 text-center text-gray-500">No mobile app releases published yet.</div> : <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-sm"><thead className="border-b bg-gray-50"><tr><th className="px-4 py-3 text-left">Platform</th><th className="px-4 py-3 text-left">Version</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Published</th><th className="px-4 py-3 text-left">Actions</th></tr></thead><tbody>{releases.map(release => <tr key={release.id} className="border-b"><td className="px-4 py-3 capitalize">{release.platform}</td><td className="px-4 py-3 font-semibold">{release.version}{release.buildNumber ? ` (${release.buildNumber})` : ''}<p className="mt-1 max-w-xs text-xs font-normal text-gray-500">{release.releaseNotes || 'No release notes'}</p></td><td className="px-4 py-3"><span className={`rounded px-2 py-1 text-xs font-semibold ${release.archivedAt ? 'bg-gray-200 text-gray-600' : release.active ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{release.archivedAt ? 'archived' : release.active ? 'active' : 'draft'}</span></td><td className="px-4 py-3 text-xs text-gray-500">{new Date(release.createdAt).toLocaleString()}</td><td className="px-4 py-3"><div className="flex flex-wrap gap-3 text-xs">{!release.archivedAt && <button onClick={() => action(release, 'activate')} className="font-semibold text-brand-green hover:underline">Activate</button>}{!release.archivedAt && <button onClick={() => action(release, 'archive')} className="text-gray-600 hover:underline">Archive</button>}<button onClick={() => remove(release)} className="text-red-600 hover:underline">Delete</button></div></td></tr>)}</tbody></table></div>}
    </div>
  );
}
