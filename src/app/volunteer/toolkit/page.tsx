'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';

const TOKEN_KEY = 'campaign_volunteer_token';

function ActivateInner() {
  const params = useSearchParams();
  const router = useRouter();
  const key = params.get('key') || '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!key) {
      setError('This page requires a personal invite link. Please use the link sent to you by the campaign team.');
      setLoading(false);
      return;
    }
    fetch(`/api/volunteers/activation?key=${encodeURIComponent(key)}`)
      .then(async r => {
        const d = await r.json().catch(() => ({}));
        if (r.ok && d.valid) {
          setName(d.name); setEmail(d.email); setNeedsPassword(d.needsPassword);
        } else {
          setError(d.message || 'This link is not valid.');
        }
      })
      .catch(() => setError('Connection error. Please try again.'))
      .finally(() => setLoading(false));
  }, [key]);

  const activate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/volunteers/activate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, password }),
      });
      const d = await res.json();
      if (res.ok && d.token) {
        sessionStorage.setItem(TOKEN_KEY, d.token);
        router.replace('/volunteer/dashboard');
      } else {
        setError(d.message || 'Could not set your password. Please try again.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="max-w-md mx-auto px-4 py-16 text-center text-gray-400">Loading…</div>;

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-2">🔒</div>
          <h2 className="font-extrabold text-lg mb-1 text-brand-black">Invite Link Required</h2>
          <p className="text-gray-600 text-sm">{error}</p>
          <Link href="/volunteer/login" className="inline-block mt-5 text-brand-green font-semibold hover:underline text-sm">
            Already set a password? Log in →
          </Link>
        </div>
      </div>
    );
  }

  // Already activated (has password) → send to login.
  if (!needsPassword) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-8 text-center">
          <div className="text-4xl mb-2">👋</div>
          <h2 className="font-extrabold text-lg mb-1">Welcome back, {name.split(' ')[0]}</h2>
          <p className="text-gray-600 text-sm mb-5">You&apos;ve already set a password. Please log in with your email.</p>
          <Link href="/volunteer/login" className="inline-block bg-brand-green hover:bg-brand-greenlt text-white font-bold py-2.5 px-6 rounded-lg text-sm">
            Go to Login →
          </Link>
        </div>
      </div>
    );
  }

  // Set-password form
  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
        <h2 className="text-xl font-extrabold mb-1">Set Your Password</h2>
        <p className="text-gray-500 text-sm mb-5">
          Welcome, {name.split(' ')[0]}! Create a password for <strong>{email}</strong> to access your volunteer toolkit.
        </p>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">⚠️ {error}</div>}
        <form onSubmit={activate} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password *</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters" minLength={8} required
              className="w-full border-2 border-gray-200 focus:border-brand-yellow rounded-lg px-4 py-3 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password *</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Re-enter password" required
              className="w-full border-2 border-gray-200 focus:border-brand-yellow rounded-lg px-4 py-3 outline-none" />
          </div>
          <button type="submit" disabled={busy}
            className={`w-full py-3.5 rounded-xl font-extrabold text-base transition-all ${busy ? 'bg-gray-200 text-gray-400' : 'bg-brand-green hover:bg-brand-greenlt text-white shadow-lg'}`}>
            {busy ? 'Setting up…' : 'Set Password & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function VolunteerToolkitPage() {
  return (
    <div className="bg-white text-brand-black">
      <PageHeader label="Campaign Team Portal" title="Activate Your Account" />
      <Suspense fallback={<div className="max-w-md mx-auto px-4 py-16 text-center text-gray-400">Loading…</div>}>
        <ActivateInner />
      </Suspense>
    </div>
  );
}
