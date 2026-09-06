'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/PageHeader';

const TOKEN_KEY = 'campaign_volunteer_token';

export default function VolunteerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Signed-in volunteers go straight to the dashboard.
  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_KEY);
    if (!saved) {
      setCheckingSession(false);
      return;
    }
    fetch('/api/volunteers/me', { headers: { Authorization: `Bearer ${saved}` } })
      .then(response => {
        if (response.ok) router.replace('/volunteer/dashboard');
        else {
          sessionStorage.removeItem(TOKEN_KEY);
          setCheckingSession(false);
        }
      })
      .catch(() => {
        sessionStorage.removeItem(TOKEN_KEY);
        setCheckingSession(false);
      });
  }, [router]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(''); setBusy(true);
    try {
      const res = await fetch('/api/volunteers/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        sessionStorage.setItem(TOKEN_KEY, data.token);
        router.replace('/volunteer/dashboard');
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="bg-white text-brand-black">
        <PageHeader label="Campaign Team" title="Campaign Team Login" />
        <div className="max-w-md mx-auto px-4 py-16 text-center text-gray-400">Checking your account…</div>
      </div>
    );
  }

  return (
    <div className="bg-white text-brand-black">
      <PageHeader label="Campaign Team" title="Campaign Team Login"
        subtitle="Log in with your email and the password you set from your invite link." />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-6 md:grid-cols-[1fr_0.85fr] md:items-start">
          <section className="relative overflow-hidden rounded-2xl bg-brand-black p-7 text-white">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-yellow/10 blur-2xl" />
            <div className="relative">
              <p className="text-xs font-extrabold uppercase tracking-widest text-brand-yellow">Volunteer workspace</p>
              <h2 className="mt-2 text-3xl font-extrabold leading-tight">Your role. Your resources. Your impact.</h2>
              <p className="mt-4 text-sm leading-relaxed text-gray-300">Access your volunteer status, campaign guidance, team resources, and role-specific activities in one secure place.</p>
              <div className="mt-7 space-y-3">
                {[
                  ['🔐', 'Secure access', 'Your email and password keep your account private.'],
                  ['📋', 'Clear next steps', 'See exactly where you are in the volunteer journey.'],
                  ['📱', 'Social toolkit', 'Approved social volunteers get content and sharing tools.'],
                ].map(([icon, title, text]) => (
                  <div key={title} className="flex items-start gap-3 rounded-xl bg-white/5 p-3">
                    <span className="text-xl">{icon}</span>
                    <div><p className="text-sm font-bold">{title}</p><p className="text-xs text-gray-400">{text}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            <div className="mb-5">
              <p className="section-label mb-1">Secure sign-in</p>
              <h2 className="text-xl font-extrabold">Welcome back</h2>
              <p className="mt-1 text-sm text-gray-500">Use the email and password set from your invitation.</p>
            </div>
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
                {busy ? 'Logging in…' : 'Log In to My Dashboard'}
              </button>
            </form>
            <div className="mt-6 rounded-xl bg-gray-50 p-4 text-xs leading-relaxed text-gray-500">
              <p className="font-bold text-gray-700">Need help?</p>
              <p className="mt-1">Open the invitation email to activate your account. If you forgot your password, ask the campaign team for a new invitation link.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
