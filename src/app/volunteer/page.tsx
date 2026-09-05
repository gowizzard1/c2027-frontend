'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type VolunteerRole = 'polling_agent' | 'mobilizer' | 'social_media';

import PageHeader from '@/components/PageHeader';

export default function VolunteerPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    idNumber: '',
    county: '',
    constituency: '',
    ward: '',
    role: '' as VolunteerRole | '',
    experience: '',
    availability: '',
    pollingStationId: '',
    proposedPollingStationName: '',
    proposedPollingStationWard: '',
  });
  const [proposeStation, setProposeStation] = useState(false);
  const [pollingStations, setPollingStations] = useState<{ id: string; name: string; ward: string }[]>([]);
  const [pollingConfig, setPollingConfig] = useState({ county: 'Uasin Gishu', constituency: 'Turbo', wards: [] as string[] });
  const [stationsLoading, setStationsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roles = [
    {
      id: 'polling_agent' as VolunteerRole,
      title: 'Polling Agent',
      icon: '🗳️',
      description: 'Monitor the voting process at polling stations on election day',
      requirements: ['Must have valid ID', 'Available on election day', 'Training provided'],
    },
    {
      id: 'mobilizer' as VolunteerRole,
      title: 'Mobilizer',
      icon: '📢',
      description: 'Organize community meetings and mobilize supporters in your area',
      requirements: ['Good communication skills', 'Community network', 'Flexible schedule'],
    },
    {
      id: 'social_media' as VolunteerRole,
      title: 'Social Media Volunteer',
      icon: '📱',
      description: 'Help amplify our message on social media platforms',
      requirements: ['Active social media presence', 'Content creation skills', 'Smartphone'],
    },
  ];

  useEffect(() => {
    if (formData.role !== 'polling_agent') return;
    setStationsLoading(true);
    Promise.all([
      fetch('/api/volunteers/polling-stations').then(res => res.ok ? res.json() : []),
      fetch('/api/volunteers/polling-config').then(res => res.ok ? res.json() : null),
    ])
      .then(([stations, config]) => {
        setPollingStations(stations || []);
        if (config) setPollingConfig(config);
      })
      .catch(() => setPollingStations([]))
      .finally(() => setStationsLoading(false));
  }, [formData.role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || 'Registration failed. Please try again.');
      }
    } catch {
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-lg mx-auto px-4">
          <div className="card text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for volunteering as a <strong>{roles.find(r => r.id === formData.role)?.title}</strong>.
              Our team will contact you shortly.
            </p>
            <div className="space-y-3">
              <a
                href="https://chat.whatsapp.com/your-group-link"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold py-3 px-6 rounded-lg w-full inline-block text-center transition-all"
              >
                💬 Join Volunteer WhatsApp Group
              </a>
              <button
                onClick={() => {
                  navigator.share?.({
                    title: 'Join the campaign as a volunteer!',
                    text: 'I just signed up as a campaign volunteer. Join me!',
                    url: window.location.href,
                  });
                }}
                className="btn-primary w-full"
              >
                📤 Invite Friends to Volunteer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-brand-black">
      <PageHeader label="Get Involved" title="Join Our Team" subtitle="Be part of the movement. Choose your role and sign up today.">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-300">Already registered?</span>
          <Link href="/volunteer/login" className="inline-flex items-center gap-2 rounded-lg bg-brand-yellow px-5 py-2.5 text-sm font-extrabold text-brand-black transition-colors hover:bg-brand-yellowlt">
            🔐 Volunteer Login →
          </Link>
        </div>
      </PageHeader>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Role Selection */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => setFormData({
                ...formData,
                role: role.id,
                ...(role.id === 'polling_agent' ? { county: pollingConfig.county, constituency: pollingConfig.constituency, ward: '', pollingStationId: '', proposedPollingStationName: '', proposedPollingStationWard: '' } : { pollingStationId: '', proposedPollingStationName: '', proposedPollingStationWard: '' }),
              })}
          className={`card text-left transition-all hover:shadow-lg cursor-pointer ${
                formData.role === role.id
                  ? 'ring-2 ring-brand-yellow border-brand-yellow'
                  : 'hover:border-brand-yellow/50'
              }`}
            >
              <div className="text-3xl mb-3">{role.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{role.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{role.description}</p>
              <ul className="space-y-1">
                {role.requirements.map((req, i) => (
                  <li key={i} className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="text-brand-green">✓</span> {req}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {/* Registration Form */}
        {formData.role && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Register as {roles.find(r => r.id === formData.role)?.title}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                  <input
                    type="text"
                    required
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
                    placeholder="0712 345 678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
                  <input
                    type="text"
                    required
                    value={formData.county}
                    disabled={formData.role === 'polling_agent'}
                    onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow outline-none disabled:bg-gray-100 disabled:text-gray-500"
                  />
                  {formData.role === 'polling_agent' && <p className="mt-1 text-xs text-gray-400">Polling agents are restricted to Uasin Gishu.</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Constituency</label>
                  <input
                    type="text"
                    required
                    value={formData.constituency}
                    disabled={formData.role === 'polling_agent'}
                    onChange={(e) => setFormData({ ...formData, constituency: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow outline-none disabled:bg-gray-100 disabled:text-gray-500"
                  />
                  {formData.role === 'polling_agent' && <p className="mt-1 text-xs text-gray-400">Polling agents are restricted to Turbo.</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ward</label>
                  <input
                    type="text"
                    required
                    value={formData.ward}
                    disabled={formData.role === 'polling_agent'}
                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow outline-none disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder={formData.role === 'polling_agent' ? 'Selected from station' : ''}
                  />
                </div>
              </div>
              {formData.role === 'polling_agent' && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                  <div className="mb-3 flex items-start gap-3"><span className="text-2xl">🗳️</span><div><h3 className="font-extrabold text-brand-black">Turbo polling-station assignment</h3><p className="mt-1 text-sm text-gray-600">Select an approved official station, or propose a missing station under one of the official Turbo wards. Proposed stations must be approved by admin before they become active.</p></div></div>
                  {!proposeStation ? (
                    <>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Official polling station *</label>
                      <select
                        required={!proposeStation}
                        disabled={stationsLoading || pollingStations.length === 0}
                        value={formData.pollingStationId}
                        onChange={e => {
                          const station = pollingStations.find(item => item.id === e.target.value);
                          setFormData({ ...formData, pollingStationId: e.target.value, ward: station?.ward || '', proposedPollingStationName: '', proposedPollingStationWard: '' });
                        }}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-brand-yellow disabled:bg-gray-100"
                      >
                        <option value="">{stationsLoading ? 'Loading official stations…' : pollingStations.length === 0 ? 'No active stations listed yet' : 'Select polling station'}</option>
                        {pollingStations.map(station => <option key={station.id} value={station.id}>{station.name} — {station.ward} Ward</option>)}
                      </select>
                      <button type="button" onClick={() => { setProposeStation(true); setFormData({ ...formData, pollingStationId: '', ward: '', proposedPollingStationName: '', proposedPollingStationWard: '' }); }} className="mt-3 text-sm font-bold text-brand-green hover:underline">Station not listed? Propose it for admin approval →</button>
                    </>
                  ) : (
                    <div className="space-y-3 rounded-lg border border-brand-yellow bg-white p-4">
                      <div className="flex items-center justify-between gap-3"><p className="font-bold text-sm text-brand-black">Propose missing polling station</p><button type="button" onClick={() => { setProposeStation(false); setFormData({ ...formData, proposedPollingStationName: '', proposedPollingStationWard: '', ward: '' }); }} className="text-xs font-semibold text-gray-500 hover:underline">Use listed station instead</button></div>
                      <input required={proposeStation} value={formData.proposedPollingStationName} onChange={e => setFormData({ ...formData, proposedPollingStationName: e.target.value })} placeholder="Official station name" className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 outline-none focus:border-brand-yellow" />
                      <select required={proposeStation} value={formData.proposedPollingStationWard} onChange={e => setFormData({ ...formData, proposedPollingStationWard: e.target.value, ward: e.target.value })} className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 outline-none focus:border-brand-yellow">
                        <option value="">Select official Turbo ward</option>
                        {pollingConfig.wards.map(item => <option key={item} value={item}>{item}</option>)}
                      </select>
                      <p className="text-xs text-gray-500">Your polling-agent application and proposed station will remain pending until an admin reviews both.</p>
                    </div>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relevant Experience (optional)
                </label>
                <textarea
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
                  rows={3}
                  placeholder="Tell us about any relevant experience..."
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-4 text-lg"
              >
                {isSubmitting ? '⏳ Submitting...' : '✅ Register as Volunteer'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
