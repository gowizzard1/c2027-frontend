'use client';

import { useState } from 'react';

export interface ToolkitData {
  name: string;
  email: string;
  role: string;
  status: string;
  isSocialMedia: boolean;
  isApproved: boolean;
  approvedSocial: boolean;
  social: { groupLink: string; shareMessage: string; shareUrl: string } | null;
  stipend: {
    canRequest: boolean;
    reason: string | null;
    nextEligibleAt: string | null;
    activationDelayDays: number;
    repeatCooldownDays: number;
    latestRequest: { id: string; status: string; requestedAt: string; approvedAt?: string | null; paidAt?: string | null } | null;
  };
}

const roleMeta: Record<string, { label: string; icon: string; color: string; nextStep: string; guide: string[] }> = {
  polling_agent: {
    label: 'Polling Agent', icon: '🗳️', color: 'bg-blue-100 text-blue-700',
    nextStep: 'Watch for your polling-station assignment and training schedule.',
    guide: ['Keep your ID and contact details current.', 'Attend polling-agent training when invited.', 'Follow official procedures and report issues promptly.'],
  },
  mobilizer: {
    label: 'Mobilizer', icon: '📣', color: 'bg-purple-100 text-purple-700',
    nextStep: 'Connect with your local coordinator for ward-level activities.',
    guide: ['Invite neighbours to community meetings.', 'Share verified campaign information only.', 'Keep notes on local issues and feedback.'],
  },
  social_media: {
    label: 'Social Media Volunteer', icon: '📱', color: 'bg-green-100 text-green-700',
    nextStep: 'Join the social-media team group and begin amplifying campaign content.',
    guide: ['Use the approved campaign message below.', 'Be respectful and never spread unverified claims.', 'Share consistently across your active platforms.'],
  },
};

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'V';
}

export default function VolunteerToolkit({ data }: { data: ToolkitData }) {
  const role = roleMeta[data.role] || {
    label: data.role, icon: '🙋', color: 'bg-gray-100 text-gray-700',
    nextStep: 'The campaign team will contact you with next steps.', guide: [],
  };

  const progressStep = data.status === 'approved' ? 3 : data.status === 'rejected' ? 1 : 2;

  return (
    <div className="space-y-6">
      {/* Member profile + status */}
      <section className="relative overflow-hidden rounded-2xl bg-brand-black p-6 sm:p-7 text-white">
        <div className="absolute top-0 right-0 h-36 w-36 rounded-full bg-brand-yellow/10 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-brand-yellow bg-white/10 text-xl font-extrabold text-brand-yellow shadow-lg">
            {initials(data.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold uppercase tracking-widest text-brand-yellow">Volunteer account</p>
            <h2 className="mt-1 truncate text-2xl font-extrabold">{data.name}</h2>
            <p className="mt-1 truncate text-sm text-gray-300">{data.email}</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${role.color}`}>{role.icon} {role.label}</span>
            <StatusBadge status={data.status} />
          </div>
        </div>
      </section>

      {/* Account journey */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="section-label mb-1">Your journey</p>
            <h3 className="text-lg font-extrabold">Volunteer onboarding</h3>
          </div>
          <span className="text-xs font-semibold text-gray-400">Step {progressStep} of 3</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <JourneyStep number="1" title="Registered" description="Your details are on file." active />
          <JourneyStep number="2" title="Under review" description="The campaign team checks your application." active={progressStep >= 2} />
          <JourneyStep number="3" title="Active volunteer" description="Your role resources and team access unlock." active={progressStep >= 3} />
        </div>
      </section>

      {!data.isApproved && <AwaitingApproval status={data.status} role={role} />}

      {data.isApproved && <StipendPanel initialStipend={data.stipend} />}

      {data.approvedSocial && data.social && <SocialMediaHub social={data.social} />}

      {data.isApproved && !data.isSocialMedia && <RoleGuide role={role} />}

      {/* Shared volunteer standards */}
      {data.isApproved && (
        <section className="rounded-2xl border border-gray-100 bg-gray-50 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-yellow text-lg">🤝</span>
            <div>
              <h3 className="font-extrabold text-brand-black">Volunteer standards</h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                Represent the campaign with respect. Share verified information, protect people&apos;s privacy,
                and direct questions or incidents to your campaign coordinator.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = status === 'approved'
    ? 'bg-green-500 text-white'
    : status === 'rejected'
      ? 'bg-red-500 text-white'
      : 'bg-brand-yellow text-brand-black';
  const label = status === 'approved' ? '✓ Approved' : status === 'rejected' ? 'Not approved' : '⏳ Pending';
  return <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${styles}`}>{label}</span>;
}

function JourneyStep({ number, title, description, active }: { number: string; title: string; description: string; active?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${active ? 'border-brand-green/30 bg-green-50' : 'border-gray-200 bg-white opacity-60'}`}>
      <div className={`mb-2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold ${active ? 'bg-brand-green text-white' : 'bg-gray-200 text-gray-500'}`}>{active ? '✓' : number}</div>
      <p className="font-bold text-sm text-brand-black">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-gray-500">{description}</p>
    </div>
  );
}

function AwaitingApproval({ status, role }: { status: string; role: { icon: string; label: string; nextStep: string } }) {
  const rejected = status === 'rejected';
  const suspended = status === 'suspended';
  const archived = status === 'archived';
  const icon = rejected ? '📩' : suspended ? '⏸️' : archived ? '🔒' : '⏳';
  const title = rejected ? 'Application not approved' : suspended ? 'Volunteer access suspended' : archived ? 'Account archived' : 'Your application is under review';
  const message = rejected
    ? 'Please contact the campaign team if you believe this decision needs review.'
    : suspended
      ? 'Your access has been paused by the campaign team. Please contact your coordinator for next steps.'
      : archived
        ? 'This volunteer account is archived. Please contact the campaign team if you need it restored.'
        : `Thanks for applying as a ${role.label}. ${role.nextStep}`;
  return (
    <section className={`rounded-2xl border p-6 text-center ${rejected ? 'border-red-200 bg-red-50' : suspended || archived ? 'border-gray-300 bg-gray-50' : 'border-brand-yellow bg-brand-yellow/10'}`}>
      <div className="mb-3 text-4xl">{icon}</div>
      <h3 className="text-xl font-extrabold">{title}</h3>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-gray-600">{message}</p>
    </section>
  );
}

function RoleGuide({ role }: { role: { icon: string; label: string; nextStep: string; guide: string[] } }) {
  return (
    <section className="rounded-2xl border border-green-200 bg-green-50 p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-green text-xl">{role.icon}</span>
        <div className="min-w-0">
          <p className="section-label mb-1">Active volunteer</p>
          <h3 className="text-xl font-extrabold">Your {role.label} guide</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">{role.nextStep}</p>
          <ul className="mt-4 space-y-2">
            {role.guide.map(item => (
              <li key={item} className="flex gap-2 text-sm text-gray-700"><span className="font-bold text-brand-green">✓</span>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function StipendPanel({ initialStipend }: { initialStipend: ToolkitData['stipend'] }) {
  const [stipend, setStipend] = useState(initialStipend);
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage] = useState('');
  const activationDelayDays = stipend.activationDelayDays ?? 7;
  const repeatCooldownDays = stipend.repeatCooldownDays ?? 7;

  const requestStipend = async () => {
    if (requesting || !stipend.canRequest) return;
    const token = sessionStorage.getItem('campaign_volunteer_token');
    if (!token) {
      setMessage('Your session has expired. Please log in again.');
      return;
    }
    setRequesting(true); setMessage('');
    try {
      const response = await fetch('/api/volunteers/stipend/request', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.stipend) {
        setStipend(data.stipend);
        setMessage('Your request has been sent to the campaign team for review.');
      } else {
        setMessage(data.message || 'Your request could not be submitted. Please try again later.');
      }
    } catch {
      setMessage('Connection error. Please try again later.');
    } finally {
      setRequesting(false);
    }
  };

  const statusLabel = stipend.latestRequest?.status === 'paid' ? 'Paid' :
    stipend.latestRequest?.status === 'approved' ? 'Approved — manual payment pending' :
    stipend.latestRequest?.status === 'pending' ? 'Awaiting admin review' :
    stipend.latestRequest?.status === 'rejected' ? 'Not approved' : null;

  return (
    <section className="overflow-hidden rounded-2xl border border-blue-200 bg-blue-50">
      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl text-white">📶</span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-blue-700">Volunteer support</p>
            <h3 className="mt-1 text-xl font-extrabold text-brand-black">Weekly mobile-data stipend</h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-700">
              After you have been an approved active volunteer for {activationDelayDays} day{activationDelayDays === 1 ? '' : 's'}, you can request mobile-data support. After a stipend is approved or paid, requests remain limited to once every {repeatCooldownDays} days.
            </p>
          </div>
        </div>
        {stipend.canRequest && (
          <button onClick={requestStipend} disabled={requesting} className={`shrink-0 rounded-lg px-5 py-3 text-sm font-extrabold transition-colors ${requesting ? 'bg-blue-200 text-blue-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
            {requesting ? 'Submitting…' : 'Request data stipend'}
          </button>
        )}
      </div>
      <div className="border-t border-blue-200 bg-white/70 px-6 py-4 text-sm">
        {message ? <p className="font-semibold text-blue-800">{message}</p> : stipend.canRequest ? <p className="text-gray-600">You are eligible to request this week&apos;s stipend.</p> : (
          <div>
            {statusLabel && <p className="font-semibold text-gray-800">Status: {statusLabel}</p>}
            <p className="mt-1 text-gray-600">{stipend.reason || 'Please check back later.'}</p>
            {stipend.nextEligibleAt && <p className="mt-1 text-xs text-gray-500">Next request available: {new Date(stipend.nextEligibleAt).toLocaleString()}</p>}
          </div>
        )}
      </div>
    </section>
  );
}

function SocialMediaHub({ social }: { social: { groupLink: string; shareMessage: string; shareUrl: string } }) {
  const [copied, setCopied] = useState(false);
  const [checklist, setChecklist] = useState([false, false, false]);
  const shareUrl = social.shareUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const shareText = social.shareMessage || 'Join me in supporting the campaign! 🇰🇪';
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(shareUrl);

  const shareTargets = [
    { label: 'WhatsApp', emoji: '💬', href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`, cls: 'bg-[#25D366] hover:bg-[#1ebe5d] text-white' },
    { label: 'X', emoji: '𝕏', href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, cls: 'bg-black hover:bg-gray-800 text-white' },
    { label: 'Facebook', emoji: '📘', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`, cls: 'bg-[#1877F2] hover:bg-[#1466d6] text-white' },
    { label: 'Telegram', emoji: '✈️', href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, cls: 'bg-[#26A5E4] hover:bg-[#1e8fca] text-white' },
  ];

  const toggleChecklist = (index: number) => setChecklist(current => current.map((item, i) => i === index ? !item : item));
  const nativeShare = () => navigator.share?.({ title: 'Maiywa 4 Turbo 2027', text: shareText, url: shareUrl });
  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* Browser clipboard is unavailable. */ }
  };

  return (
    <div className="space-y-6">
      {/* Social mission */}
      <section className="relative overflow-hidden rounded-2xl bg-brand-green p-6 sm:p-7 text-white">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-yellow/10 blur-2xl" />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-brand-yellow">Social media mission</p>
              <h3 className="mt-1 text-2xl font-extrabold">Amplify the campaign, responsibly.</h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-green-100">Use the approved message, share with your real network, and coordinate with the team for daily content.</p>
            </div>
            <span className="rounded-xl bg-white/10 px-3 py-2 text-2xl">📱</span>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <MissionCard icon="💬" title="Coordinate" detail="Get approved content" />
            <MissionCard icon="📤" title="Amplify" detail="Share across channels" />
            <MissionCard icon="📈" title="Engage" detail="Respond respectfully" />
          </div>
          {social.groupLink ? (
            <a href={social.groupLink} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 font-extrabold text-brand-green transition-colors hover:bg-gray-100">
              💬 Join the Social Media Group
            </a>
          ) : (
            <p className="mt-6 text-sm italic text-green-100">Your coordinator will add the team group link here soon.</p>
          )}
        </div>
      </section>

      {/* Action checklist */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="section-label mb-1">Today&apos;s workflow</p>
            <h3 className="text-xl font-extrabold">Three simple actions</h3>
          </div>
          <span className="text-sm font-bold text-brand-green">{checklist.filter(Boolean).length}/3 complete</span>
        </div>
        <div className="space-y-3">
          {[
            'Read the latest content and guidance in the team group.',
            'Share the approved campaign message to one or more platforms.',
            'Engage respectfully with genuine questions from your network.',
          ].map((item, index) => (
            <button key={item} type="button" onClick={() => toggleChecklist(index)} className="flex w-full items-center gap-3 rounded-xl border border-gray-100 p-4 text-left transition-colors hover:bg-gray-50">
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${checklist[index] ? 'border-brand-green bg-brand-green text-white' : 'border-gray-300 text-transparent'}`}>✓</span>
              <span className={`text-sm ${checklist[index] ? 'text-gray-400 line-through' : 'font-medium text-gray-700'}`}>{item}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Content pack */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="section-label mb-1">Approved content pack</p>
            <h3 className="text-xl font-extrabold">Ready-to-share campaign message</h3>
          </div>
          <button onClick={copyMessage} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-bold text-brand-black transition-colors hover:bg-gray-200">
            {copied ? '✓ Copied' : '📋 Copy message'}
          </button>
        </div>
        <blockquote className="rounded-xl border-l-4 border-brand-yellow bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
          {shareText}{shareUrl ? ` ${shareUrl}` : ''}
        </blockquote>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {shareTargets.map(target => (
            <a key={target.label} href={target.href} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-bold transition-colors ${target.cls}`}>
              <span aria-hidden="true">{target.emoji}</span> {target.label}
            </a>
          ))}
        </div>
        <button onClick={nativeShare} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-yellow px-4 py-3 text-sm font-extrabold text-brand-black transition-colors hover:bg-brand-yellowlt">
          📤 Share using another app
        </button>
      </section>

      {/* Safety guidance */}
      <section className="rounded-2xl border border-brand-yellow/40 bg-brand-yellow/10 p-5">
        <div className="flex gap-3">
          <span className="text-2xl">⚖️</span>
          <div>
            <h3 className="font-extrabold text-brand-black">Share responsibly</h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-700">Use only approved information. Do not harass, impersonate, share private data, or amplify claims you cannot verify. Escalate difficult conversations to the campaign team.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function MissionCard({ icon, title, detail }: { icon: string; title: string; detail: string }) {
  return <div className="rounded-xl bg-white/10 p-3"><span className="text-xl">{icon}</span><p className="mt-1 font-bold text-sm">{title}</p><p className="text-xs text-green-100">{detail}</p></div>;
}
