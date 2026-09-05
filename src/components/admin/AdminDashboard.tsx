'use client';

import { useEffect, useState } from 'react';

type Tab = 'overview' | 'manifesto' | 'biography' | 'news' | 'donations' | 'pledges' | 'volunteers' | 'orders' | 'products' | 'payments' | 'settings';

interface Props {
  token: string;
  onLogout: () => void;
}

interface Stats {
  donations: { total: number; completed: number; totalAmount: number };
  volunteers: { total: number; pollingAgents: number; mobilizers: number; socialMedia: number };
  orders: { total: number; pending: number; totalRevenue: number };
  campaign: { raised: number; goal: number; donors: number };
}

export default function AdminDashboard({ token, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', { headers });
      if (res.ok) setStats(await res.json());
      else if (res.status === 401) onLogout();
    } catch {}
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview',  label: 'Overview',     icon: '📊' },
    { id: 'manifesto', label: 'Manifesto',    icon: '📋' },
    { id: 'biography', label: 'Biography',    icon: '👤' },
    { id: 'news',      label: 'News & Events',icon: '📰' },
    { id: 'donations', label: 'Donations',    icon: '💰' },
    { id: 'pledges',   label: 'Pledges',      icon: '🙌' },
    { id: 'volunteers',label: 'Volunteers',   icon: '👥' },
    { id: 'orders',    label: 'Orders',       icon: '📦' },
    { id: 'products',  label: 'Products',     icon: '🏪' },
    { id: 'payments',  label: 'Payments',     icon: '⚙️' },
    { id: 'settings',  label: 'Settings',     icon: '🔧' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar */}
      <div className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">🛡️ Campaign Admin</h1>
        <button onClick={onLogout} className="text-sm text-red-600 hover:text-red-700 font-medium">
          Logout
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white min-h-screen border-r hidden md:block">
          <nav className="py-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-6 py-3 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-brand-yellow/10 text-brand-green border-r-2 border-brand-yellow'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile Tabs */}
        <div className="md:hidden w-full overflow-x-auto border-b bg-white">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-xs whitespace-nowrap ${
                  activeTab === tab.id ? 'border-b-2 border-brand-yellow text-brand-green' : 'text-gray-500'
                }`}
              >
                {tab.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'overview' && <OverviewPanel stats={stats} />}
          {activeTab === 'manifesto' && <ManifestoPanel headers={headers} onLogout={onLogout} />}
          {activeTab === 'biography' && <BiographyPanel headers={headers} onLogout={onLogout} />}
          {activeTab === 'donations' && <DonationsPanel headers={headers} onLogout={onLogout} />}
          {activeTab === 'pledges' && <PledgesPanel headers={headers} onLogout={onLogout} />}
          {activeTab === 'volunteers' && <VolunteersPanel headers={headers} onLogout={onLogout} />}
          {activeTab === 'orders' && <OrdersPanel headers={headers} onLogout={onLogout} />}
          {activeTab === 'news' && <NewsPanel headers={headers} onLogout={onLogout} />}
          {activeTab === 'products' && <ProductsPanel headers={headers} onLogout={onLogout} />}
          {activeTab === 'payments' && <PaymentsPanel headers={headers} onLogout={onLogout} />}
          {activeTab === 'settings' && <SettingsPanel headers={headers} onLogout={onLogout} />}
        </main>
      </div>
    </div>
  );
}

// --- Overview Panel ---
function OverviewPanel({ stats }: { stats: Stats | null }) {
  if (!stats) return <div className="text-gray-500">Loading stats...</div>;

  const cards = [
    { label: 'Total Raised', value: `KES ${(stats.campaign.raised / 1000000).toFixed(2)}M`, icon: '💰', color: 'bg-green-50 text-green-800' },
    { label: 'Total Donors', value: stats.campaign.donors, icon: '🙏', color: 'bg-blue-50 text-blue-800' },
    { label: 'Volunteers', value: stats.volunteers.total, icon: '👥', color: 'bg-purple-50 text-purple-800' },
    { label: 'Merch Orders', value: stats.orders.total, icon: '📦', color: 'bg-orange-50 text-orange-800' },
    { label: 'Pending Orders', value: stats.orders.pending, icon: '⏳', color: 'bg-yellow-50 text-yellow-800' },
    { label: 'Merch Revenue', value: `KES ${stats.orders.totalRevenue.toLocaleString()}`, icon: '🏪', color: 'bg-pink-50 text-pink-800' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {cards.map((card, i) => (
          <div key={i} className={`rounded-xl p-5 ${card.color}`}>
            <div className="text-2xl mb-1">{card.icon}</div>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="text-sm opacity-75">{card.label}</div>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border">
          <h4 className="font-semibold text-sm text-gray-600 mb-2">Volunteers Breakdown</h4>
          <p className="text-sm">🗳️ Polling Agents: {stats.volunteers.pollingAgents}</p>
          <p className="text-sm">📢 Mobilizers: {stats.volunteers.mobilizers}</p>
          <p className="text-sm">📱 Social Media: {stats.volunteers.socialMedia}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <h4 className="font-semibold text-sm text-gray-600 mb-2">Campaign Progress</h4>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div className="bg-green-500 h-3 rounded-full" style={{ width: `${Math.min((stats.campaign.raised / stats.campaign.goal) * 100, 100)}%` }} />
          </div>
          <p className="text-xs text-gray-500">{((stats.campaign.raised / stats.campaign.goal) * 100).toFixed(1)}% of goal</p>
        </div>
      </div>
    </div>
  );
}

// --- Donations Panel ---
function DonationsPanel({ headers, onLogout }: { headers: any; onLogout: () => void }) {
  const [donations, setDonations] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/donations', { headers })
      .then(res => { if (res.status === 401) { onLogout(); return []; } return res.json(); })
      .then(data => setDonations(data || []))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Donations ({donations.length})</h2>
      {donations.length === 0 ? (
        <p className="text-gray-500">No donations yet.</p>
      ) : (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Method</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{d.name}</td>
                  <td className="px-4 py-3 font-semibold">KES {d.amount?.toLocaleString()}</td>
                  <td className="px-4 py-3">{d.paymentMethod === 'mpesa' ? '📱 M-Pesa' : '💳 Card'}</td>
                  <td className="px-4 py-3">{d.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      d.status === 'completed' ? 'bg-green-100 text-green-700' :
                      d.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>{d.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(d.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// --- Pledges Panel (donation interest to follow up on) ---
function PledgesPanel({ headers, onLogout }: { headers: any; onLogout: () => void }) {
  const [pledges, setPledges] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/pledges', { headers })
      .then(res => { if (res.status === 401) { onLogout(); return []; } return res.json(); })
      .then(data => setPledges(data || []))
      .catch(() => {});
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/pledges/${id}`, {
      method: 'PATCH', headers, body: JSON.stringify({ status }),
    });
    setPledges(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this pledge? This cannot be undone.')) return;
    await fetch(`/api/admin/pledges/${id}`, { method: 'DELETE', headers });
    setPledges(prev => prev.filter(p => p.id !== id));
  };

  const statusStyle = (s: string) =>
    s === 'converted' ? 'bg-green-100 text-green-700' :
    s === 'contacted' ? 'bg-blue-100 text-blue-700' :
    s === 'archived'  ? 'bg-gray-100 text-gray-500' :
    'bg-yellow-100 text-yellow-700';

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Pledges ({pledges.length})</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          People who registered interest while donations are being set up. Contact them once payments are live.
        </p>
      </div>
      {pledges.length === 0 ? (
        <p className="text-gray-500">No pledges yet.</p>
      ) : (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Contact</th>
                <th className="px-4 py-3 text-left">Intended</th>
                <th className="px-4 py-3 text-left">Message</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pledges.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50 align-top">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-xs">
                    <div><a href={`tel:${p.phone}`} className="text-brand-green hover:underline">{p.phone}</a></div>
                    <div><a href={`mailto:${p.email}`} className="text-gray-500 hover:underline">{p.email}</a></div>
                  </td>
                  <td className="px-4 py-3">{p.amount ? `KES ${Number(p.amount).toLocaleString()}` : '—'}</td>
                  <td className="px-4 py-3 text-xs max-w-[220px] text-gray-600">{p.message || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusStyle(p.status)}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button onClick={() => updateStatus(p.id, 'contacted')} className="text-xs text-blue-600 hover:underline mr-2">Contacted</button>
                    <button onClick={() => updateStatus(p.id, 'converted')} className="text-xs text-green-600 hover:underline mr-2">Converted</button>
                    <button onClick={() => remove(p.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// --- Volunteers Panel ---
function VolunteersPanel({ headers, onLogout }: { headers: any; onLogout: () => void }) {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [view, setView] = useState<'active' | 'archived'>('active');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const query = view === 'archived' ? '?archived=true' : '';
    fetch(`/api/admin/volunteers${query}`, { headers })
      .then(res => { if (res.status === 401) { onLogout(); return []; } return res.json(); })
      .then(data => setVolunteers(data || []))
      .catch(() => setVolunteers([]));
  }, [view]);

  const roleLabels: Record<string, string> = {
    polling_agent: '🗳️ Polling Agent',
    mobilizer: '📢 Mobilizer',
    social_media: '📱 Social Media',
  };

  const formatDate = (value?: string) => value ? new Date(value).toLocaleString() : '—';

  const updateStatus = async (id: string, status: 'approved' | 'rejected' | 'suspended') => {
    const res = await fetch(`/api/admin/volunteers/${id}`, {
      method: 'PATCH', headers, body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.message || 'Could not update volunteer status.');
      return;
    }
    const updated = await res.json();
    setVolunteers(prev => prev.map(v => v.id === id ? { ...v, ...updated } : v));
  };

  const buildInviteMessage = (v: any) => {
    const origin = window.location.origin;
    const activationLink = `${origin}/volunteer/toolkit?key=${v.accessToken}`;
    const loginUrl = `${origin}/volunteer/login`;
    return `Hi ${v.name},

You've been approved as a Maiywa 4 Turbo 2027 volunteer! 🎉

1) Activate your account and set a password here:
${activationLink}

2) After that, log in anytime at:
${loginUrl}
   Email: ${v.email}

See you inside — together we rise! 🇰🇪`;
  };

  const copyInvite = async (v: any) => {
    if (!v.accessToken) { alert('This volunteer has no invite link yet. Use "Reset access" to generate one.'); return; }
    const msg = buildInviteMessage(v);
    try {
      await navigator.clipboard.writeText(msg);
      setCopiedId(v.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      prompt('Copy this invite message and send it to the volunteer:', msg);
    }
  };

  const resetAccess = async (v: any) => {
    if (!confirm(`Reset access for ${v.name}? This creates a new invite link and clears their current password.`)) return;
    const res = await fetch(`/api/admin/volunteers/${v.id}/reset-access`, { method: 'POST', headers });
    if (res.ok) {
      const data = await res.json();
      setVolunteers(prev => prev.map(x => x.id === v.id ? { ...x, accessToken: data.accessToken, activatedAt: null, inviteDeliveryStatus: 'not_sent' } : x));
      alert('New invite link generated and an email has been queued.');
    } else {
      alert('Could not reset access. Please try again.');
    }
  };

  const archiveVolunteer = async (v: any) => {
    if (!confirm(`Archive ${v.name}? They will be removed from the active list and lose portal access. You can restore them later.`)) return;
    const res = await fetch(`/api/admin/volunteers/${v.id}/archive`, { method: 'POST', headers });
    if (res.ok) {
      setVolunteers(prev => prev.filter(item => item.id !== v.id));
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.message || 'Could not archive this volunteer.');
    }
  };

  const restoreVolunteer = async (v: any) => {
    const res = await fetch(`/api/admin/volunteers/${v.id}/restore`, { method: 'POST', headers });
    if (res.ok) {
      setVolunteers(prev => prev.filter(item => item.id !== v.id));
      alert(`${v.name} was restored to ${v.statusBeforeArchive || 'pending'} status.`);
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.message || 'Could not restore this volunteer.');
    }
  };

  const statusStyle = (status: string) =>
    status === 'approved' ? 'bg-green-100 text-green-700' :
    status === 'suspended' ? 'bg-orange-100 text-orange-700' :
    status === 'rejected' ? 'bg-red-100 text-red-700' :
    status === 'archived' ? 'bg-gray-200 text-gray-600' :
    'bg-yellow-100 text-yellow-700';

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Volunteer Management</h2>
          <p className="mt-1 text-sm text-gray-500">
            Approve pending applications, suspend active access when needed, and archive records without deleting history.
          </p>
        </div>
        <div className="flex rounded-lg border bg-white p-1 text-sm font-semibold">
          <button onClick={() => setView('active')} className={`rounded-md px-4 py-2 transition-colors ${view === 'active' ? 'bg-brand-green text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            Active ({view === 'active' ? volunteers.length : ''})
          </button>
          <button onClick={() => setView('archived')} className={`rounded-md px-4 py-2 transition-colors ${view === 'archived' ? 'bg-gray-700 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            Archived ({view === 'archived' ? volunteers.length : ''})
          </button>
        </div>
      </div>

      {view === 'active' && (
        <div className="mb-5 rounded-xl border border-brand-yellow/40 bg-brand-yellow/10 p-4 text-sm text-gray-700">
          <strong>Account lifecycle:</strong> Pending applicants can be approved or rejected. Approved volunteers can be suspended or archived. Suspended volunteers can be unsuspended. Archive is reversible and preserves history.
        </div>
      )}

      {volunteers.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-gray-500">
          {view === 'archived' ? 'No archived volunteers.' : 'No active volunteers found.'}
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Account activity</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map(v => (
                <tr key={v.id} className="border-b align-top hover:bg-gray-50">
                  <td className="px-4 py-3"><p className="font-medium">{v.name}</p><p className="mt-0.5 text-xs text-gray-500">{v.email}</p></td>
                  <td className="px-4 py-3">{roleLabels[v.role] || v.role}</td>
                  <td className="px-4 py-3">{v.phone}</td>
                  <td className="px-4 py-3 text-xs">{v.ward}, {v.constituency}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-medium ${statusStyle(v.status)}`}>{v.status}</span>{v.archivedAt && <p className="mt-1 text-xs text-gray-400">{formatDate(v.archivedAt)}</p>}</td>
                  <td className="min-w-[185px] px-4 py-3 text-xs">
                    {v.activatedAt ? <><p className="font-semibold text-green-700">✓ Account activated</p><p className="mt-1 text-gray-500">Last login: {formatDate(v.lastLoginAt)}</p></>
                    : v.inviteDeliveryStatus === 'failed' ? <><p className="font-semibold text-red-600">⚠ Invite email failed</p><p className="mt-1 text-gray-500">Attempt: {formatDate(v.inviteFailedAt)}</p></>
                    : v.inviteDeliveryStatus === 'sent' ? <><p className="font-semibold text-blue-700">✉ Invite accepted for delivery</p><p className="mt-1 text-gray-500">Sent: {formatDate(v.inviteSentAt)}</p></>
                    : <p className="text-gray-500">No invite sent yet</p>}
                    {v.loginFailureCount > 0 && <p className="mt-1 font-semibold text-amber-700">⚠ {v.loginFailureCount} failed login{v.loginFailureCount === 1 ? '' : 's'} · {formatDate(v.lastLoginFailedAt)}</p>}
                  </td>
                  <td className="min-w-[180px] px-4 py-3">
                    {view === 'archived' ? (
                      <button onClick={() => restoreVolunteer(v)} className="text-xs font-semibold text-brand-green hover:underline">↩ Restore</button>
                    ) : (
                      <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs">
                        {v.status === 'pending' && <><button onClick={() => updateStatus(v.id, 'approved')} className="text-green-600 hover:underline">Approve</button><button onClick={() => updateStatus(v.id, 'rejected')} className="text-red-600 hover:underline">Reject</button></>}
                        {v.status === 'rejected' && <button onClick={() => updateStatus(v.id, 'approved')} className="text-green-600 hover:underline">Approve</button>}
                        {v.status === 'approved' && <><button onClick={() => updateStatus(v.id, 'suspended')} className="text-orange-600 hover:underline">Suspend</button><button onClick={() => copyInvite(v)} className="font-semibold text-brand-green hover:underline">{copiedId === v.id ? '✓ Copied' : '✉️ Copy invite'}</button><button onClick={() => resetAccess(v)} className="text-gray-500 hover:underline">Reset access</button></>}
                        {v.status === 'suspended' && <button onClick={() => updateStatus(v.id, 'approved')} className="text-green-600 hover:underline">Unsuspend</button>}
                        <button onClick={() => archiveVolunteer(v)} className="text-gray-500 hover:text-gray-800 hover:underline">Archive</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// --- Orders Panel ---
function OrdersPanel({ headers, onLogout }: { headers: any; onLogout: () => void }) {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/orders', { headers })
      .then(res => { if (res.status === 401) { onLogout(); return []; } return res.json(); })
      .then(data => setOrders(data || []))
      .catch(() => {});
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH', headers, body: JSON.stringify({ status }),
    });
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Orders ({orders.length})</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg border p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">{order.id}</p>
                  <p className="text-sm text-gray-500">{order.name} • {order.phone}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  order.status === 'completed' ? 'bg-green-100 text-green-700' :
                  order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>{order.status}</span>
              </div>
              <p className="text-sm mb-2">Items: {order.items?.map((i: any) => i.name).join(', ')}</p>
              <div className="flex justify-between items-center">
                <p className="font-bold">KES {order.total?.toLocaleString()}</p>
                <div className="space-x-2">
                  <button onClick={() => updateStatus(order.id, 'shipped')} className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">Ship</button>
                  <button onClick={() => updateStatus(order.id, 'completed')} className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200">Complete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- News Panel ---
function NewsPanel({ headers, onLogout }: { headers: any; onLogout: () => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: '', type: 'statement', emoji: '', time: '', location: '' });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = () => {
    fetch('/api/admin/news', { headers })
      .then(res => { if (res.status === 401) { onLogout(); return []; } return res.json(); })
      .then(data => setItems(data || []))
      .catch(() => {});
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/news', { method: 'POST', headers, body: JSON.stringify(form) });
    setForm({ title: '', content: '', category: '', type: 'statement', emoji: '', time: '', location: '' });
    setShowForm(false);
    fetchNews();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    await fetch(`/api/admin/news/${id}`, { method: 'DELETE', headers });
    fetchNews();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">News & Events ({items.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-brand-yellow hover:bg-brand-yellowlt text-brand-black font-bold rounded-lg text-sm py-2 px-4">
          {showForm ? 'Cancel' : '+ Add New'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-lg border p-6 mb-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="statement">Statement</option>
                <option value="photo">Photo</option>
                <option value="event">Event</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} />
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Emoji (e.g. 📸)" value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Time (events)" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Location (events)" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="bg-brand-green hover:bg-brand-greenlt text-white font-bold rounded-lg text-sm py-2 px-6">Publish</button>
        </form>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-lg border p-4 flex justify-between items-center">
            <div>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded mr-2">{item.type}</span>
              <span className="font-medium">{item.title}</span>
              <span className="text-xs text-gray-400 ml-2">{item.date}</span>
            </div>
            <button onClick={() => handleDelete(item.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Products Panel ---
function ProductsPanel({ headers, onLogout }: { headers: any; onLogout: () => void }) {
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', image: '', category: '', sizes: '' });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = () => {
    fetch('/api/admin/products', { headers })
      .then(res => { if (res.status === 401) { onLogout(); return []; } return res.json(); })
      .then(data => setProducts(data || []))
      .catch(() => {});
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: parseInt(form.price),
      sizes: form.sizes ? form.sizes.split(',').map(s => s.trim()) : undefined,
    };
    await fetch('/api/admin/products', { method: 'POST', headers, body: JSON.stringify(payload) });
    setForm({ name: '', price: '', image: '', category: '', sizes: '' });
    setShowForm(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE', headers });
    fetchProducts();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Products ({products.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-brand-yellow hover:bg-brand-yellowlt text-brand-black font-bold rounded-lg text-sm py-2 px-4">
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-lg border p-6 mb-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input type="text" required placeholder="Product Name" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
            <input type="number" required placeholder="Price (KES)" value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <input placeholder="Emoji/Image (e.g. 👕)" value={form.image}
              onChange={e => setForm({ ...form, image: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Category (e.g. Apparel)" value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Sizes (S,M,L,XL) or leave empty" value={form.sizes}
              onChange={e => setForm({ ...form, sizes: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="bg-brand-green hover:bg-brand-greenlt text-white font-bold rounded-lg text-sm py-2 px-6">Add Product</button>
        </form>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <div key={p.id} className="bg-white rounded-lg border p-4 text-center">
            <div className="text-3xl mb-2">{p.image || '📦'}</div>
            <p className="font-medium text-sm">{p.name}</p>
            <p className="text-brand-green font-bold text-sm">KES {p.price?.toLocaleString()}</p>
            <p className="text-xs text-gray-400">{p.category}</p>
            <button onClick={() => handleDelete(p.id)} className="text-xs text-red-500 mt-2 hover:underline">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Settings Panel ---
function SettingsPanel({ headers, onLogout }: { headers: any; onLogout: () => void }) {
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [visionInput, setVisionInput] = useState({ icon: '', title: '', description: '' });

  useEffect(() => {
    fetch('/api/admin/settings', { headers })
      .then(res => { if (res.status === 401) { onLogout(); return null; } return res.json(); })
      .then(data => { if (data) setSettings(data); })
      .catch(() => {});
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', { method: 'PUT', headers, body: JSON.stringify(settings) });
      if (res.status === 401) { onLogout(); return; }
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        alert('Settings saved!');
      } else {
        const detail = Array.isArray(data.details)
          ? data.details.map((d: any) => `${d.field}: ${d.message}`).join('\n')
          : '';
        alert(`Could not save settings.\n${data.message || data.error || ''}${detail ? '\n' + detail : ''}`);
      }
    } catch {
      alert('Connection error while saving. Is the backend running?');
    } finally {
      setSaving(false);
    }
  };

  const addVisionItem = () => {
    if (!visionInput.title) return;
    setSettings({ ...settings, visionItems: [...(settings.visionItems || []), visionInput] });
    setVisionInput({ icon: '', title: '', description: '' });
  };

  const removeVisionItem = (index: number) => {
    const items = [...settings.visionItems];
    items.splice(index, 1);
    setSettings({ ...settings, visionItems: items });
  };

  if (!settings) return <div className="text-gray-500">Loading settings...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Campaign Settings</h2>
      <div className="bg-white rounded-lg border p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Candidate Photo URL</label>
            <input value={settings.candidatePhoto || ''} onChange={e => setSettings({ ...settings, candidatePhoto: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Or upload below" />
            {settings.candidatePhoto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.candidatePhoto}
                alt="Candidate preview"
                className="mt-2 h-24 w-24 object-cover rounded-lg border"
              />
            )}
          </div>
          <div className="flex items-end">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Photo</label>
              <input type="file" accept="image/jpeg,image/png,image/webp"
                disabled={uploadingPhoto}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const inputEl = e.target;

                  // Client-side guard so the user gets instant feedback.
                  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                    alert('Unsupported file type. Please choose a JPEG, PNG, or WebP image.');
                    inputEl.value = '';
                    return;
                  }
                  if (file.size > 5 * 1024 * 1024) {
                    alert('Image is too large. Maximum size is 5MB.');
                    inputEl.value = '';
                    return;
                  }

                  setUploadingPhoto(true);
                  try {
                    const fd = new FormData();
                    fd.append('photo', file);
                    const res = await fetch('/api/upload/candidate-photo', {
                      method: 'POST',
                      headers: { Authorization: (headers as any).Authorization },
                      body: fd,
                    });

                    if (res.status === 401) { onLogout(); return; }

                    const data = await res.json().catch(() => ({}));
                    if (res.ok && data.url) {
                      const updated = { ...settings, candidatePhoto: data.url };
                      setSettings(updated);
                      // Persist immediately so the new photo actually shows on the site.
                      await fetch('/api/admin/settings', {
                        method: 'PUT', headers, body: JSON.stringify(updated),
                      });
                      alert('Photo uploaded and saved!');
                    } else {
                      alert(data.message || data.error || 'Upload failed. Please try again.');
                    }
                  } catch {
                    alert('Connection error during upload. Is the backend running?');
                  } finally {
                    setUploadingPhoto(false);
                    inputEl.value = ''; // allow re-selecting the same file
                  }
                }}
                className="w-full border rounded-lg px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-brand-yellow file:text-brand-black file:font-bold file:text-xs disabled:opacity-50" />
              <p className="text-xs text-gray-400 mt-1">
                {uploadingPhoto ? '⏳ Uploading…' : 'JPEG, PNG, or WebP • max 5MB'}
              </p>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
            <input value={settings.siteName || ''} onChange={e => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
            <input value={settings.tagline || ''} onChange={e => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
          <input value={settings.heroTitle || ''} onChange={e => setSettings({ ...settings, heroTitle: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
          <textarea value={settings.heroSubtitle || ''} onChange={e => setSettings({ ...settings, heroSubtitle: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Donation Goal (KES)</label>
            <input type="number" value={settings.donationGoal || ''} onChange={e => setSettings({ ...settings, donationGoal: parseInt(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Group Link</label>
            <input value={settings.whatsappLink || ''} onChange={e => setSettings({ ...settings, whatsappLink: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="https://chat.whatsapp.com/..." />
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
            <input value={settings.contactEmail || ''} onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
            <input value={settings.contactPhone || ''} onChange={e => setSettings({ ...settings, contactPhone: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input value={settings.address || ''} onChange={e => setSettings({ ...settings, address: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>

        {/* Social Media Volunteer Team */}
        <div className="border-t pt-6">
          <h3 className="font-bold text-gray-900 mb-1">Social Media Volunteer Team</h3>
          <p className="text-xs text-gray-500 mb-4">
            Shown to approved social-media volunteers after they log in at <code>/volunteer/login</code>.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Social Media Group Link</label>
              <input value={settings.socialGroupLink || ''} onChange={e => setSettings({ ...settings, socialGroupLink: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="https://chat.whatsapp.com/... (dedicated social team group)" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Share Message</label>
                <textarea value={settings.socialShareMessage || ''} onChange={e => setSettings({ ...settings, socialShareMessage: e.target.value })}
                  rows={3} maxLength={500}
                  className="w-full border rounded-lg px-3 py-2 text-sm resize-y" placeholder="Join me in supporting the campaign! 🇰🇪" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Share URL</label>
                <input value={settings.socialShareUrl || ''} onChange={e => setSettings({ ...settings, socialShareUrl: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="https://your-campaign-site.com" />
                <p className="text-xs text-gray-400 mt-1">Link shared alongside the message (defaults to the site homepage).</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vision Items */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Vision Pillars</label>
          <div className="space-y-2 mb-3">
            {(settings.visionItems || []).map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                <span>{item.icon}</span>
                <span className="font-medium text-sm flex-1">{item.title}</span>
                <span className="text-xs text-gray-500 flex-1">{item.description}</span>
                <button onClick={() => removeVisionItem(i)} className="text-xs text-red-500">✕</button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input placeholder="Icon (emoji)" value={visionInput.icon} onChange={e => setVisionInput({ ...visionInput, icon: e.target.value })}
              className="border rounded px-2 py-1 text-sm w-20" />
            <input placeholder="Title" value={visionInput.title} onChange={e => setVisionInput({ ...visionInput, title: e.target.value })}
              className="border rounded px-2 py-1 text-sm flex-1" />
            <input placeholder="Description" value={visionInput.description} onChange={e => setVisionInput({ ...visionInput, description: e.target.value })}
              className="border rounded px-2 py-1 text-sm flex-1" />
            <button type="button" onClick={addVisionItem} className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">Add</button>
          </div>
        </div>

        <button onClick={saveSettings} disabled={saving} className="bg-brand-yellow hover:bg-brand-yellowlt text-brand-black font-bold rounded-lg py-3 px-8">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

// --- Manifesto Panel ---
function ManifestoPanel({ headers, onLogout }: { headers: any; onLogout: () => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ pillar: '', title: '', description: '', details: '', icon: '📌', sortOrder: '0' });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = () => {
    fetch('/api/admin/manifesto', { headers })
      .then(r => { if (r.status === 401) { onLogout(); return []; } return r.json(); })
      .then(d => setItems(d || [])).catch(() => {});
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/manifesto', { method: 'POST', headers, body: JSON.stringify({ ...form, sortOrder: parseInt(form.sortOrder) }) });
    setForm({ pillar: '', title: '', description: '', details: '', icon: '📌', sortOrder: '0' });
    setShowForm(false);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this manifesto item?')) return;
    await fetch(`/api/admin/manifesto/${id}`, { method: 'DELETE', headers });
    fetchItems();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manifesto</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage the campaign development agenda and policy pillars</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-brand-yellow hover:bg-brand-yellowlt text-brand-black font-bold rounded-lg text-sm py-2 px-4">
          {showForm ? 'Cancel' : '+ Add Item'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border p-6 mb-6 space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Pillar</label>
              <input required placeholder="e.g. Education, Health, Infrastructure" value={form.pillar}
                onChange={e => setForm({ ...form, pillar: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Icon (emoji)</label>
              <input placeholder="📌" value={form.icon}
                onChange={e => setForm({ ...form, icon: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Sort Order</label>
              <input type="number" value={form.sortOrder}
                onChange={e => setForm({ ...form, sortOrder: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Title</label>
            <input required placeholder="e.g. Expand Bursary Access for Students" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Short Description</label>
            <textarea required placeholder="One or two sentence summary" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Full Details (optional — shown on expand)</label>
            <textarea placeholder="Detailed policy points, timelines, targets..." value={form.details}
              onChange={e => setForm({ ...form, details: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" rows={4} />
          </div>
          <button type="submit" className="bg-brand-green text-white font-semibold py-2 px-6 rounded-lg text-sm">
            Publish Item
          </button>
        </form>
      )}

      {items.length === 0 && !showForm && (
        <div className="text-center py-12 bg-white rounded-xl border">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-500">No manifesto items yet. Add your first policy point above.</p>
        </div>
      )}

      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-xl border p-4 flex items-center gap-4">
            <span className="text-2xl">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-brand-green uppercase bg-brand-yellow/10 px-2 py-0.5 rounded mr-2">{item.pillar}</span>
              <span className="font-semibold text-gray-900">{item.title}</span>
              <p className="text-xs text-gray-500 mt-1 truncate">{item.description}</p>
            </div>
            <button onClick={() => handleDelete(item.id)} className="text-xs text-red-500 hover:text-red-700 shrink-0">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Biography Panel ---
function BiographyPanel({ headers, onLogout }: { headers: any; onLogout: () => void }) {
  const SECTIONS = [
    { key: 'summary', label: 'Profile Summary', placeholder: 'A short tagline that appears on the About page header...' },
    { key: 'background', label: 'Background & Experience', placeholder: 'Education, career, community work...' },
    { key: 'why', label: 'Why I\'m Running', placeholder: 'The motivation behind the campaign...' },
    { key: 'vision', label: 'My Vision', placeholder: 'Long-term vision for the constituency...' },
  ];
  const [content, setContent] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/biography', { headers })
      .then(r => { if (r.status === 401) { onLogout(); return []; } return r.json(); })
      .then((data: any[]) => {
        const map: Record<string, string> = {};
        (data || []).forEach(b => { map[b.section] = b.content; });
        setContent(map);
      }).catch(() => {});
  }, []);

  const save = async (key: string) => {
    setSaving(key);
    await fetch(`/api/admin/biography/${key}`, {
      method: 'PUT', headers, body: JSON.stringify({ content: content[key] || '' }),
    });
    setSaving(null);
    setSaved(key);
    setTimeout(() => setSaved(null), 2000);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Biography</h2>
        <p className="text-sm text-gray-500 mt-0.5">Edit the candidate's story — shown on the About page</p>
      </div>
      <div className="space-y-6">
        {SECTIONS.map(s => (
          <div key={s.key} className="bg-white rounded-xl border p-6">
            <label className="block font-semibold text-gray-900 mb-3">{s.label}</label>
            <textarea
              value={content[s.key] || ''}
              onChange={e => setContent({ ...content, [s.key]: e.target.value })}
              placeholder={s.placeholder}
              rows={5}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow outline-none resize-y"
            />
            <div className="flex justify-end mt-3">
              <button onClick={() => save(s.key)}
                className={`text-sm font-semibold py-2 px-5 rounded-lg transition-colors ${
                  saved === s.key
                    ? 'bg-green-100 text-green-700'
                    : 'bg-brand-green hover:bg-brand-green text-white'
                }`}>
                {saving === s.key ? 'Saving...' : saved === s.key ? '✓ Saved' : 'Save'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Payments Panel ---
function PaymentsPanel({ headers, onLogout }: { headers: any; onLogout: () => void }) {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchMode(); }, []);

  const fetchMode = () => {
    fetch('/api/admin/payment-mode', { headers })
      .then(r => { if (r.status === 401) { onLogout(); return null; } return r.json(); })
      .then(d => { if (d) setData(d); }).catch(() => {});
  };

  const toggle = async (mode: 'live' | 'mock') => {
    setSaving(true); setMsg('');
    const res = await fetch('/api/admin/payment-mode', {
      method: 'PUT', headers, body: JSON.stringify({ mode }),
    });
    const result = await res.json();
    setSaving(false);
    if (res.ok) { setMsg(`✓ Switched to ${mode} mode`); fetchMode(); }
    else { setMsg(`✗ ${result.error}`); }
  };

  if (!data) return <div className="text-gray-400 text-sm">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Payment Configuration</h2>
      <p className="text-sm text-gray-500 mb-8">Configure payment integrations and toggle between live and mock (test) mode.</p>

      {/* Mode Toggle */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h3 className="font-bold text-gray-900 mb-1">Payment Mode</h3>
        <p className="text-sm text-gray-500 mb-4">
          In <strong>Mock</strong> mode all payments are simulated — no real money moves. Use for testing.<br />
          In <strong>Live</strong> mode real credentials are used and real money is processed.
        </p>
        <div className="grid grid-cols-2 gap-4 max-w-sm">
          <button onClick={() => toggle('mock')}
            disabled={saving}
            className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${
              data.mode === 'mock'
                ? 'border-brand-yellow bg-brand-yellow text-brand-black shadow'
                : 'border-gray-200 hover:border-brand-yellow text-gray-600'
            }`}>
            🧪 Mock (Test)
            {data.mode === 'mock' && <div className="text-xs font-normal mt-0.5">● Active</div>}
          </button>
          <button onClick={() => toggle('live')}
            disabled={saving || (!data.mpesaConfigured && !data.cardConfigured)}
            className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${
              data.mode === 'live'
                ? 'border-brand-green bg-brand-green text-white shadow'
                : (!data.mpesaConfigured && !data.cardConfigured)
                  ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                  : 'border-gray-200 hover:border-brand-green text-gray-600'
            }`}>
            🚀 Live
            {data.mode === 'live' && <div className="text-xs font-normal mt-0.5">● Active</div>}
          </button>
        </div>
        {msg && (
          <p className={`mt-3 text-sm font-medium ${msg.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>{msg}</p>
        )}
      </div>

      {/* M-Pesa Status */}
      <div className="bg-white rounded-xl border p-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📱</span>
            <div>
              <h3 className="font-bold text-gray-900">M-Pesa (Daraja API)</h3>
              <p className="text-xs text-gray-500">Safaricom STK Push payments</p>
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${data.mpesaConfigured ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {data.mpesaConfigured ? '✓ Configured' : '⚠ Not configured'}
          </span>
        </div>
        {!data.mpesaConfigured && (
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 space-y-1">
            <p className="font-semibold text-gray-700 mb-2">Add these to your <code className="bg-gray-200 px-1 rounded">.env</code> file:</p>
            <code className="block text-xs bg-gray-100 rounded p-2 font-mono leading-relaxed">
              MPESA_CONSUMER_KEY=your_key<br />
              MPESA_CONSUMER_SECRET=your_secret<br />
              MPESA_PASSKEY=your_passkey<br />
              MPESA_SHORTCODE=your_shortcode<br />
              MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback<br />
              MPESA_ENV=sandbox
            </code>
            <p className="text-xs text-gray-400 pt-1">Get credentials at <strong>developer.safaricom.co.ke</strong></p>
          </div>
        )}
      </div>

      {/* Card Status */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💳</span>
            <div>
              <h3 className="font-bold text-gray-900">Card Payments (Flutterwave)</h3>
              <p className="text-xs text-gray-500">Visa / Mastercard via Flutterwave</p>
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${data.cardConfigured ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {data.cardConfigured ? '✓ Configured' : '⚠ Not configured'}
          </span>
        </div>
        {!data.cardConfigured && (
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 space-y-1">
            <p className="font-semibold text-gray-700 mb-2">Add these to your <code className="bg-gray-200 px-1 rounded">.env</code> file:</p>
            <code className="block text-xs bg-gray-100 rounded p-2 font-mono leading-relaxed">
              FLW_SECRET_KEY=FLWSECK_TEST_xxxx  (or FLWSECK_LIVE_xxxx for production)
            </code>
            <p className="text-xs text-gray-400 pt-1">Get credentials at <strong>developer.flutterwave.com</strong></p>
          </div>
        )}
      </div>
    </div>
  );
}
