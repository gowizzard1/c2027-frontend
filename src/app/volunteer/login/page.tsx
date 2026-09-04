'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import VolunteerToolkit, { ToolkitData } from '@/components/volunteer/VolunteerToolkit';

const TOKEN_KEY = 'campaign_volunteer_token';

export default function VolunteerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [data, setData] = useState<ToolkitData | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Restore an existing session.
  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_KEY);
    if (saved) {
      fetch('/api/volunteers/me', { headers: { Authorization: `Bearer ${saved}` } })
        .then(async r => { if (r.ok) setData(await r.json()); else sessionStorage.removeItem(TOKEN_KEY); })
        .catch(() => sessionStorage.removeItem(TOKEN_KEY))
        .finally(() => setHydrated(true));
    } else {
      setHydrated(true);
    }
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(''); setBusy(true);
    try {
      const res = await fetch('/api/volunteers/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const d = await res.json();
      if (res.ok && d.token) {
        sessionStorage.setItem(TOKEN_KEY, d.token);
        setData(d);
      } else {
        setError(d.message || 'Login failed.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setData(null); setEmail(''); setPassword('');
  };

  if (!hydrated) {
    return (
      <div className="bg-white text-brand-black">
        <PageHeader label="Volunteers" title="Volunteer Login" />
        <div className="max-w-md mx-auto px-4 py-16 text-center text-gray-400">Loading…</div>
      </div>
    );
  }

  if (data) {
    return (
      <div className="bg-white text-brand-black">
        <PageHeader label="Volunteer Portal" title={`Welcome, ${data.name.split(' ')[0]}!`} />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <VolunteerToolkit data={data} />
          <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-600 transition-colors w-full py-4">
            Log out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-brand-black">
      <PageHeader label="Volunteers" title="Volunteer Login"
        subtitle="Log in with your email and the password you set from your invite link." />
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">⚠️ {error}</div>}
          <form onSubmit={login} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com"
                className="w-full border-2 border-gray-200 focus:border-brand-yellow rounded-lg px-4 py-3 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password *</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="Your password"
                className="w-full border-2 border-gray-200 focus:border-brand-yellow rounded-lg px-4 py-3 outline-none" />
            </div>
            <button type="submit" disabled={busy}
              className={`w-full py-3.5 rounded-xl font-extrabold text-base transition-all ${busy ? 'bg-gray-200 text-gray-400' : 'bg-brand-green hover:bg-brand-greenlt text-white shadow-lg'}`}>
              {busy ? 'Logging in…' : 'Log In'}
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-6">
            Have an invite link but no password yet? Open the link the campaign sent you.<br />
            Forgot your password? Contact the campaign team to get a new invite link.
          </p>
        </div>
      </div>
    </div>
  );
}
