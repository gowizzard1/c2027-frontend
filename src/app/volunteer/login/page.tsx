'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';

const TOKEN_KEY = 'campaign_volunteer_token';

interface Me {
  name: string;
  role: string;
  status: string;
  isSocialMedia: boolean;
  isApproved: boolean;
  approvedSocial: boolean;
  social: { groupLink: string; shareMessage: string; shareUrl: string } | null;
}

type Step = 'contact' | 'code' | 'authed';

const roleLabels: Record<string, string> = {
  polling_agent: 'Polling Agent',
  mobilizer: 'Mobilizer',
  social_media: 'Social Media Volunteer',
};

export default function VolunteerLoginPage() {
  const [step, setStep] = useState<Step>('contact');
  const [contact, setContact] = useState('');
  const [code, setCode] = useState('');
  const [token, setToken] = useState('');
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const loadMe = useCallback(async (t: string) => {
    const res = await fetch('/api/volunteers/me', { headers: { Authorization: `Bearer ${t}` } });
    if (res.ok) {
      setMe(await res.json());
      setToken(t);
      setStep('authed');
      return true;
    }
    return false;
  }, []);

  // Restore an existing session on mount.
  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_KEY);
    if (saved) {
      loadMe(saved)
        .then(ok => { if (!ok) sessionStorage.removeItem(TOKEN_KEY); })
        .finally(() => setHydrated(true));
    } else {
      setHydrated(true);
    }
  }, [loadMe]);

  const requestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(''); setInfo(''); setBusy(true);
    try {
      const res = await fetch('/api/volunteers/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: contact.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setInfo(data.message || 'If that contact is registered, a code has been sent.');
        setStep('code');
      } else {
        setError(data.message || 'Could not send code. Please try again.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(''); setBusy(true);
    try {
      const res = await fetch('/api/volunteers/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: contact.trim(), code: code.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        sessionStorage.setItem(TOKEN_KEY, data.token);
        await loadMe(data.token);
      } else {
        setError(data.message || 'Verification failed. Please try again.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(''); setMe(null); setCode(''); setContact('');
    setStep('contact'); setError(''); setInfo('');
  };

  if (!hydrated) {
    return (
      <div className="bg-white text-brand-black">
        <PageHeader label="Volunteers" title="Volunteer Login" />
        <div className="max-w-md mx-auto px-4 py-16 text-center text-gray-400">Loading…</div>
      </div>
    );
  }

  // ── Authenticated toolkit ──
  if (step === 'authed' && me) {
    return (
      <div className="bg-white text-brand-black">
        <PageHeader label="Volunteer Portal" title={`Welcome, ${me.name.split(' ')[0]}!`} />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">

          {/* Status card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-widest text-brand-green mb-1">Your Role</p>
                <p className="font-bold text-lg">{roleLabels[me.role] || me.role}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                me.status === 'approved' ? 'bg-green-100 text-green-700'
                : me.status === 'rejected' ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700'
              }`}>{me.status}</span>
            </div>
          </div>

          {/* Pending / rejected messaging */}
          {!me.isApproved && (
            <div className="bg-brand-yellow/10 border border-brand-yellow rounded-2xl p-6 text-center">
              <div className="text-4xl mb-2">⏳</div>
              <h2 className="font-extrabold text-lg mb-1">
                {me.status === 'rejected' ? 'Application Not Approved' : 'Awaiting Approval'}
              </h2>
              <p className="text-gray-600 text-sm">
                {me.status === 'rejected'
                  ? 'Your volunteer application was not approved. Please contact the campaign team if you believe this is a mistake.'
                  : "Your registration is being reviewed. You'll be notified once approved, and your toolkit will unlock here."}
              </p>
            </div>
          )}

          {/* Approved social-media toolkit */}
          {me.approvedSocial && me.social && (
            <SocialToolkit social={me.social} volunteerName={me.name} />
          )}

          {/* Approved but not social media */}
          {me.isApproved && !me.isSocialMedia && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-2">✅</div>
              <h2 className="font-extrabold text-lg mb-1">You're Approved!</h2>
              <p className="text-gray-600 text-sm">
                Thank you for volunteering as a {roleLabels[me.role] || me.role}. The campaign team
                will reach out with your assignments.
              </p>
            </div>
          )}

          <button onClick={logout}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors w-full py-2">
            Log out
          </button>
        </div>
      </div>
    );
  }

  // ── Login (contact + code) ──
  return (
    <div className="bg-white text-brand-black">
      <PageHeader label="Volunteers" title="Volunteer Login"
        subtitle="Log in with the phone number or email you registered with. We'll send you a verification code." />
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm font-medium mb-4" role="alert">
              ⚠️ {error}
            </div>
          )}
          {info && step === 'code' && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm mb-4" role="status">
              {info}
            </div>
          )}

          {step === 'contact' && (
            <form onSubmit={requestCode} className="space-y-5" noValidate>
              <div>
                <label htmlFor="v-contact" className="block text-sm font-semibold text-gray-700 mb-1">
                  Phone or Email *
                </label>
                <input
                  id="v-contact"
                  type="text"
                  required
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  placeholder="0712 345 678  or  you@example.com"
                  className="w-full border-2 border-gray-200 focus:border-brand-yellow rounded-lg px-4 py-3 outline-none transition-colors"
                />
                <p className="text-gray-400 text-xs mt-1">The code is sent via WhatsApp (and SMS) to your registered number.</p>
              </div>
              <button type="submit" disabled={busy || contact.trim().length < 3}
                className={`w-full py-3.5 rounded-xl font-extrabold text-base transition-all ${
                  busy || contact.trim().length < 3
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-brand-green hover:bg-brand-greenlt text-white shadow-lg'
                }`}>
                {busy ? 'Sending…' : 'Send Verification Code'}
              </button>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={verifyCode} className="space-y-5" noValidate>
              <div>
                <label htmlFor="v-code" className="block text-sm font-semibold text-gray-700 mb-1">
                  6-Digit Code *
                </label>
                <input
                  id="v-code"
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  required
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full border-2 border-gray-200 focus:border-brand-yellow rounded-lg px-4 py-3 outline-none transition-colors tracking-[0.5em] text-center text-lg font-bold"
                />
                <p className="text-gray-400 text-xs mt-1">Sent to your registered number. Expires in 10 minutes.</p>
              </div>
              <button type="submit" disabled={busy || code.length !== 6}
                className={`w-full py-3.5 rounded-xl font-extrabold text-base transition-all ${
                  busy || code.length !== 6
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-brand-green hover:bg-brand-greenlt text-white shadow-lg'
                }`}>
                {busy ? 'Verifying…' : 'Verify & Continue'}
              </button>
              <button type="button" onClick={() => { setStep('contact'); setCode(''); setError(''); }}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors w-full py-1">
                ← Use a different contact
              </button>
            </form>
          )}

          <p className="text-center text-xs text-gray-400 mt-6">
            Not registered yet?{' '}
            <Link href="/volunteer" className="text-brand-green font-semibold hover:underline">Sign up here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Social media volunteer toolkit ──
function SocialToolkit({ social, volunteerName }: {
  social: { groupLink: string; shareMessage: string; shareUrl: string };
  volunteerName: string;
}) {
  const [copied, setCopied] = useState(false);
  const shareUrl = social.shareUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const shareText = social.shareMessage || 'Join me in supporting the campaign! 🇰🇪';
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(shareUrl);

  const shareTargets = [
    { label: 'WhatsApp', emoji: '💬', href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`, cls: 'bg-[#25D366] hover:bg-[#1ebe5d] text-white' },
    { label: 'X (Twitter)', emoji: '𝕏', href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, cls: 'bg-black hover:bg-gray-800 text-white' },
    { label: 'Facebook', emoji: '📘', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`, cls: 'bg-[#1877F2] hover:bg-[#1466d6] text-white' },
    { label: 'Telegram', emoji: '✈️', href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, cls: 'bg-[#26A5E4] hover:bg-[#1e8fca] text-white' },
  ];

  const nativeShare = () => {
    navigator.share?.({ title: 'Campaign 2027', text: shareText, url: shareUrl });
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <>
      {/* Welcome / group invite */}
      <div className="bg-brand-green rounded-2xl p-6 text-center text-white">
        <div className="text-4xl mb-2">🎉</div>
        <h2 className="text-xl font-extrabold mb-1">Welcome to the Social Media Team!</h2>
        <p className="text-green-100 text-sm mb-5">
          You&apos;re approved. Join the dedicated group for daily content, updates, and coordination.
        </p>
        {social.groupLink ? (
          <a href={social.groupLink} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-white text-brand-green font-extrabold py-3 px-7 rounded-lg hover:bg-gray-100 transition-colors">
            💬 Join the Social Media Group
          </a>
        ) : (
          <p className="text-green-100 text-xs italic">The group link will appear here once the team sets it up.</p>
        )}
      </div>

      {/* Share toolkit */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-extrabold text-lg mb-1">Share the Campaign</h3>
        <p className="text-gray-500 text-sm mb-4">Post to your networks with one tap.</p>

        {shareText && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 mb-4">
            {shareText}{shareUrl ? ` ${shareUrl}` : ''}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {shareTargets.map(t => (
            <a key={t.label} href={t.href} target="_blank" rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-lg transition-colors text-sm ${t.cls}`}>
              <span aria-hidden="true">{t.emoji}</span> {t.label}
            </a>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <button onClick={copyMessage}
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-brand-black font-bold py-3 px-4 rounded-lg transition-colors text-sm">
            {copied ? '✓ Copied' : '📋 Copy Message'}
          </button>
          <button onClick={nativeShare}
            className="flex items-center justify-center gap-2 bg-brand-yellow hover:bg-brand-yellowlt text-brand-black font-bold py-3 px-4 rounded-lg transition-colors text-sm">
            📤 More…
          </button>
        </div>
      </div>
    </>
  );
}
