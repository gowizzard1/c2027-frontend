'use client';

import { useState } from 'react';

export interface ToolkitData {
  name: string;
  email: string;
  county: string;
  constituency: string;
  ward: string;
  pollingStation: { id: string; name: string; ward: string } | null;
  role: string;
  status: string;
  selectedAssignmentId: string;
  assignments: { id: string; role: string; status: string; county: string; constituency: string; ward: string; pollingStation: { id: string; name: string; ward: string } | null }[];
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
  mobilizer: {
    groupLink: string;
    periodStart: string;
    currentReport: MobilizerReport | null;
    recentReports: MobilizerReport[];
  } | null;
}

interface MobilizerReport {
  id: string;
  periodStart: string;
  peopleReached: number;
  meetingsHeld: number;
  newVolunteers: number;
  keyIssues?: string | null;
  notes?: string | null;
  status: string;
  adminNote?: string | null;
  createdAt: string;
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

      {data.assignments.length > 1 && <RoleSwitcher data={data} />}

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

      {data.role === 'mobilizer' && data.isApproved && data.mobilizer && (
        <MobilizerHub assignment={{ county: data.county, constituency: data.constituency, ward: data.ward }} initialData={data.mobilizer} />
      )}

      {data.role === 'polling_agent' && data.isApproved && (
        <PollingAgentHub assignment={{ county: data.county, constituency: data.constituency, ward: data.ward, pollingStation: data.pollingStation }} />
      )}

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

function RoleSwitcher({ data }: { data: ToolkitData }) {
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState('');
  const activeAssignments = data.assignments.filter(assignment => assignment.status !== 'archived');

  const switchRole = async (assignmentId: string) => {
    if (assignmentId === data.selectedAssignmentId || switching) return;
    const token = sessionStorage.getItem('campaign_volunteer_token');
    if (!token) { setError('Your session expired. Please log in again.'); return; }
    setSwitching(true); setError('');
    try {
      const response = await fetch('/api/volunteers/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ assignmentId }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.token) {
        setError(result.message || 'Could not switch roles.');
        return;
      }
      sessionStorage.setItem('campaign_volunteer_token', result.token);
      window.location.reload();
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setSwitching(false);
    }
  };

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="section-label mb-1">Your roles</p><h3 className="text-lg font-extrabold">Switch volunteer workspace</h3></div><span className="text-xs text-gray-400">One account, multiple roles</span></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {activeAssignments.map(assignment => {
          const meta = roleMeta[assignment.role] || { label: assignment.role, icon: '🙋', color: 'bg-gray-100 text-gray-700' };
          const selected = assignment.id === data.selectedAssignmentId;
          return <button key={assignment.id} type="button" disabled={switching || assignment.status === 'suspended'} onClick={() => switchRole(assignment.id)} className={`rounded-xl border p-4 text-left transition-colors ${selected ? 'border-brand-green bg-green-50 ring-1 ring-brand-green' : assignment.status === 'suspended' ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-60' : 'border-gray-200 bg-white hover:border-brand-yellow'}`}><div className="flex items-center justify-between gap-2"><span className="text-xl">{meta.icon}</span>{selected && <span className="text-xs font-bold text-brand-green">Current</span>}</div><p className="mt-2 font-bold text-sm text-brand-black">{meta.label}</p><p className="mt-1 text-xs text-gray-500">{assignment.ward}, {assignment.constituency}</p><p className="mt-2 text-xs font-semibold capitalize text-gray-500">{assignment.status}</p></button>;
        })}
      </div>
      {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
    </section>
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

function PollingAgentHub({ assignment }: { assignment: { county: string; constituency: string; ward: string; pollingStation: { id: string; name: string; ward: string } | null } }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-blue-200 bg-blue-50">
      <div className="bg-blue-700 p-6 text-white">
        <p className="text-xs font-extrabold uppercase tracking-widest text-brand-yellow">Polling agent assignment</p>
        <h3 className="mt-1 text-2xl font-extrabold">Turbo Constituency election team</h3>
        <p className="mt-2 text-sm leading-relaxed text-blue-100">Your assignment is restricted to Uasin Gishu County and an official Turbo polling station. Detailed election-day tools will be enabled closer to polling operations.</p>
      </div>
      <div className="space-y-4 p-6">
        {assignment.pollingStation ? (
          <div className="rounded-xl border border-blue-200 bg-white p-5">
            <p className="text-xs font-extrabold uppercase tracking-widest text-blue-700">Assigned polling station</p>
            <h4 className="mt-1 text-xl font-extrabold text-brand-black">{assignment.pollingStation.name}</h4>
            <p className="mt-1 text-sm text-gray-600">{assignment.pollingStation.ward} Ward · {assignment.constituency} Constituency · {assignment.county} County</p>
          </div>
        ) : (
          <div className="rounded-xl border border-brand-yellow bg-brand-yellow/10 p-5 text-sm text-gray-700">
            <strong>Station assignment pending:</strong> Your polling station has not yet been assigned. The campaign team will update this dashboard after confirming the official Turbo station list.
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-3">
          <PollingStep icon="📚" title="Training" detail="Training schedule and materials will appear here." />
          <PollingStep icon="📍" title="Check-in" detail="Election-day check-in opens closer to polling day." />
          <PollingStep icon="🚨" title="Incident reporting" detail="Secure incident escalation will be enabled for active agents." />
        </div>
        <p className="text-xs leading-relaxed text-gray-500">Do not publish polling-station operations, incident details, voter information, or election-day documents outside official campaign and legal channels.</p>
      </div>
    </section>
  );
}

function PollingStep({ icon, title, detail }: { icon: string; title: string; detail: string }) {
  return <div className="rounded-xl bg-white p-4 shadow-sm"><span className="text-2xl">{icon}</span><p className="mt-2 font-bold text-sm text-brand-black">{title}</p><p className="mt-1 text-xs leading-relaxed text-gray-500">{detail}</p></div>;
}

function MobilizerHub({ assignment, initialData }: {
  assignment: { county: string; constituency: string; ward: string };
  initialData: NonNullable<ToolkitData['mobilizer']>;
}) {
  const [mobilizer, setMobilizer] = useState(initialData);
  const [form, setForm] = useState({ peopleReached: '', meetingsHeld: '', newVolunteers: '', keyIssues: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || mobilizer.currentReport) return;
    const token = sessionStorage.getItem('campaign_volunteer_token');
    if (!token) { setMessage('Your session has expired. Please log in again.'); return; }
    setSubmitting(true); setMessage('');
    try {
      const response = await fetch('/api/volunteers/mobilizer/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          peopleReached: Number(form.peopleReached || 0),
          meetingsHeld: Number(form.meetingsHeld || 0),
          newVolunteers: Number(form.newVolunteers || 0),
          keyIssues: form.keyIssues,
          notes: form.notes,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.mobilizer) {
        setMobilizer(data.mobilizer);
        setMessage('Your weekly field report has been submitted for campaign review.');
      } else {
        setMessage(data.message || 'Could not submit the report. Please try again.');
      }
    } catch {
      setMessage('Connection error. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = (status: string) => status === 'actioned' ? 'bg-green-100 text-green-700' : status === 'reviewed' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700';

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-purple-700 p-6 text-white">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-yellow/15 blur-2xl" />
        <div className="relative">
          <p className="text-xs font-extrabold uppercase tracking-widest text-brand-yellow">Mobilizer operations</p>
          <h3 className="mt-1 text-2xl font-extrabold">Your field area</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <AssignmentCard label="County" value={assignment.county} />
            <AssignmentCard label="Constituency" value={assignment.constituency} />
            <AssignmentCard label="Ward" value={assignment.ward} />
          </div>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-purple-100">Coordinate community activity in your assigned area, submit weekly aggregate reports, and escalate local issues. Do not collect named voter lists or political preference profiles.</p>
          {mobilizer.groupLink ? <a href={mobilizer.groupLink} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-extrabold text-purple-700 transition-colors hover:bg-gray-100">💬 Join Mobilizer Coordination Group</a> : <p className="mt-5 text-sm italic text-purple-100">Your coordinator will add the mobilizer group link here soon.</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="section-label mb-1">Weekly field report</p>
            <h3 className="text-xl font-extrabold">Week of {new Date(mobilizer.periodStart).toLocaleDateString()}</h3>
          </div>
          {mobilizer.currentReport && <span className={`rounded px-3 py-1 text-xs font-bold ${statusColor(mobilizer.currentReport.status)}`}>{mobilizer.currentReport.status}</span>}
        </div>

        {message && <div className="mb-4 rounded-lg border border-brand-yellow bg-brand-yellow/10 px-4 py-3 text-sm font-semibold text-gray-700">{message}</div>}

        {mobilizer.currentReport ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <ReportMetric label="People reached" value={mobilizer.currentReport.peopleReached} />
              <ReportMetric label="Meetings" value={mobilizer.currentReport.meetingsHeld} />
              <ReportMetric label="Volunteer referrals" value={mobilizer.currentReport.newVolunteers} />
            </div>
            {mobilizer.currentReport.keyIssues && <ReportText title="Key local issues" text={mobilizer.currentReport.keyIssues} />}
            {mobilizer.currentReport.notes && <ReportText title="Field notes" text={mobilizer.currentReport.notes} />}
            {mobilizer.currentReport.adminNote && <div className="rounded-xl bg-green-50 p-4 text-sm text-green-900"><strong>Coordinator follow-up:</strong> {mobilizer.currentReport.adminNote}</div>}
            <p className="text-xs text-gray-400">One weekly report is allowed. A new report opens at the start of the next Monday-based reporting week.</p>
          </div>
        ) : (
          <form onSubmit={submitReport} className="space-y-4">
            <p className="text-sm text-gray-600">Report aggregate activity only. Do not include names, phone numbers, or individual political preferences.</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <FieldNumber label="People reached" value={form.peopleReached} onChange={value => setForm({ ...form, peopleReached: value })} />
              <FieldNumber label="Community meetings" value={form.meetingsHeld} onChange={value => setForm({ ...form, meetingsHeld: value })} />
              <FieldNumber label="Volunteer referrals" value={form.newVolunteers} onChange={value => setForm({ ...form, newVolunteers: value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Key local issues (optional)</label>
              <textarea rows={3} maxLength={1000} value={form.keyIssues} onChange={e => setForm({ ...form, keyIssues: e.target.value })} placeholder="Example: water access, road maintenance, youth employment concerns — no names or private details" className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 outline-none focus:border-brand-yellow" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Additional field notes (optional)</label>
              <textarea rows={3} maxLength={2000} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Brief aggregate update for the campaign team" className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 outline-none focus:border-brand-yellow" />
            </div>
            <button type="submit" disabled={submitting} className={`w-full rounded-xl py-3.5 text-sm font-extrabold transition-colors ${submitting ? 'bg-gray-200 text-gray-400' : 'bg-purple-700 text-white hover:bg-purple-800'}`}>{submitting ? 'Submitting…' : 'Submit weekly report'}</button>
          </form>
        )}
      </section>

      {mobilizer.recentReports.length > 0 && (
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-extrabold">Recent field reports</h3>
          <div className="space-y-3">
            {mobilizer.recentReports.map(report => <div key={report.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 p-4"><div><p className="font-semibold">Week of {new Date(report.periodStart).toLocaleDateString()}</p><p className="mt-1 text-xs text-gray-500">{report.peopleReached} reached · {report.meetingsHeld} meetings · {report.newVolunteers} referrals</p></div><span className={`rounded px-2 py-1 text-xs font-semibold ${statusColor(report.status)}`}>{report.status}</span></div>)}
          </div>
        </section>
      )}
    </div>
  );
}

function AssignmentCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-white/10 p-3"><p className="text-xs font-bold uppercase tracking-wide text-purple-100">{label}</p><p className="mt-1 font-extrabold">{value || 'Not assigned'}</p></div>;
}

function ReportMetric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl bg-purple-50 p-3 text-center"><p className="text-2xl font-extrabold text-purple-700">{value}</p><p className="text-[11px] font-semibold leading-tight text-gray-500">{label}</p></div>;
}

function ReportText({ title, text }: { title: string; text: string }) {
  return <div className="rounded-xl bg-gray-50 p-4"><p className="text-xs font-extrabold uppercase tracking-wide text-gray-500">{title}</p><p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-gray-700">{text}</p></div>;
}

function FieldNumber({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div><label className="mb-1 block text-sm font-semibold text-gray-700">{label}</label><input type="number" min="0" max="100000" value={value} onChange={e => onChange(e.target.value)} placeholder="0" className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 outline-none focus:border-brand-yellow" /></div>;
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
