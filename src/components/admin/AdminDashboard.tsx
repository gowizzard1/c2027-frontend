'use client';

import { useEffect, useState } from 'react';

type Tab = 'overview' | 'analytics' | 'manifesto' | 'biography' | 'news' | 'donations' | 'pledges' | 'stipends' | 'mobilizerReports' | 'pollingStations' | 'electionResults' | 'volunteers' | 'orders' | 'products' | 'payments' | 'settings';

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
    { id: 'analytics', label: 'Site Analytics',icon: '📈' },
    { id: 'manifesto', label: 'Manifesto',    icon: '📋' },
    { id: 'biography', label: 'Biography',    icon: '👤' },
    { id: 'news',      label: 'News & Events',icon: '📰' },
    { id: 'donations', label: 'Donations',    icon: '💰' },
    { id: 'pledges',   label: 'Pledges',      icon: '🙌' },
    { id: 'stipends',  label: 'Stipends',     icon: '📶' },
    { id: 'mobilizerReports', label: 'Mobilizer Reports', icon: '📣' },
    { id: 'pollingStations', label: 'Polling Stations', icon: '🗳️' },
    { id: 'electionResults', label: 'Result Review', icon: '📑' },
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
          {activeTab === 'analytics' && <AnalyticsPanel headers={headers} onLogout={onLogout} />}
          {activeTab === 'manifesto' && <ManifestoPanel headers={headers} onLogout={onLogout} />}
          {activeTab === 'biography' && <BiographyPanel headers={headers} onLogout={onLogout} />}
          {activeTab === 'donations' && <DonationsPanel headers={headers} onLogout={onLogout} />}
          {activeTab === 'pledges' && <PledgesPanel headers={headers} onLogout={onLogout} />}
          {activeTab === 'stipends' && <StipendsPanel headers={headers} onLogout={onLogout} />}
          {activeTab === 'mobilizerReports' && <MobilizerReportsPanel headers={headers} onLogout={onLogout} />}
          {activeTab === 'pollingStations' && <PollingStationsPanel headers={headers} onLogout={onLogout} />}
          {activeTab === 'electionResults' && <ElectionResultsPanel headers={headers} onLogout={onLogout} />}
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

// --- First-party Site Analytics Panel ---
function AnalyticsPanel({ headers, onLogout }: { headers: any; onLogout: () => void }) {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?days=${days}`, { headers })
      .then(async response => {
        if (response.status === 401) { onLogout(); return null; }
        return response.ok ? response.json() : null;
      })
      .then(result => { if (result) setData(result); })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [days]);

  if (loading) return <div className="text-gray-500">Loading analytics…</div>;
  if (!data) return <div className="text-gray-500">Analytics could not be loaded.</div>;

  const maxDaily = Math.max(1, ...data.daily.map((day: any) => day.pageviews));
  const cards = [
    { label: 'Page views', value: data.totalPageviews, icon: '👁️', color: 'bg-blue-50 text-blue-800' },
    { label: 'Unique visitors', value: data.uniqueVisitors, icon: '👥', color: 'bg-green-50 text-green-800' },
    { label: 'Views today', value: data.todayPageviews, icon: '📄', color: 'bg-yellow-50 text-yellow-800' },
    { label: 'Visitors today', value: data.todayVisitors, icon: '✨', color: 'bg-purple-50 text-purple-800' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Site Analytics</h2>
          <p className="mt-1 text-sm text-gray-500">Anonymous first-party traffic data for the public campaign site. No IP addresses are stored.</p>
        </div>
        <div className="flex rounded-lg border bg-white p-1 text-sm font-semibold">
          {[7, 30, 90].map(value => (
            <button key={value} onClick={() => setDays(value)} className={`rounded-md px-3 py-2 transition-colors ${days === value ? 'bg-brand-green text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              {value} days
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => (
          <div key={card.label} className={`rounded-xl p-5 ${card.color}`}>
            <div className="text-2xl">{card.icon}</div>
            <p className="mt-2 text-2xl font-extrabold">{card.value.toLocaleString()}</p>
            <p className="text-sm font-semibold opacity-75">{card.label}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-baseline justify-between"><h3 className="font-bold text-gray-900">Daily page views</h3><span className="text-xs text-gray-400">Last {data.days} days</span></div>
        <div className="flex h-44 items-end gap-1 sm:gap-2" aria-label="Daily page view chart">
          {data.daily.map((day: any) => {
            const height = Math.max(day.pageviews ? 6 : 2, Math.round((day.pageviews / maxDaily) * 100));
            return (
              <div key={day.date} className="group relative flex min-w-0 flex-1 flex-col justify-end" title={`${day.date}: ${day.pageviews} views, ${day.visitors} visitors`}>
                <div className="rounded-t bg-brand-green transition-colors group-hover:bg-brand-yellow" style={{ height: `${height}%` }} />
                {data.days <= 30 && <span className="mt-2 hidden text-center text-[9px] text-gray-400 sm:block">{day.date.slice(8)}</span>}
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <MetricList title="Top pages" icon="📄" empty="No page views recorded yet." items={data.topPages.map((item: any) => ({ label: item.path, value: `${item.pageviews} views · ${item.visitors} visitors` }))} />
        <MetricList title="Traffic sources" icon="🔗" empty="No referrer data recorded yet." items={data.referrers.map((item: any) => ({ label: item.label, value: `${item.count} visits` }))} />
        <MetricList title="Devices" icon="📱" empty="No device data recorded yet." items={data.devices.map((item: any) => ({ label: item.label, value: `${item.count} visits` }))} />
      </div>
    </div>
  );
}

function MetricList({ title, icon, empty, items }: { title: string; icon: string; empty: string; items: { label: string; value: string }[] }) {
  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-bold text-gray-900">{icon} {title}</h3>
      {items.length === 0 ? <p className="text-sm text-gray-400">{empty}</p> : (
        <ul className="space-y-3">
          {items.map(item => <li key={item.label} className="flex items-center justify-between gap-3 text-sm"><span className="truncate font-medium text-gray-700">{item.label}</span><span className="shrink-0 text-xs text-gray-500">{item.value}</span></li>)}
        </ul>
      )}
    </section>
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

// --- Mobile-data stipend requests ---
function StipendsPanel({ headers, onLogout }: { headers: any; onLogout: () => void }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/stipend-requests', { headers })
      .then(res => { if (res.status === 401) { onLogout(); return []; } return res.json(); })
      .then(data => setRequests(data || []))
      .catch(() => setRequests([]));
  }, []);

  const updateRequest = async (request: any, action: 'approve' | 'reject' | 'mark_paid') => {
    let paymentRef = '';
    if (action === 'mark_paid') {
      paymentRef = prompt('Optional: enter the manual M-Pesa/payment reference:', '') || '';
    }
    if (action === 'reject' && !confirm(`Reject this stipend request from ${request.account?.name || 'this volunteer'}?`)) return;
    setUpdatingId(request.id);
    try {
      const res = await fetch(`/api/admin/stipend-requests/${request.id}`, {
        method: 'PATCH', headers, body: JSON.stringify({ action, paymentRef }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.message || 'Could not update stipend request.');
        return;
      }
      setRequests(prev => prev.map(item => item.id === request.id ? { ...item, ...data } : item));
      if (action === 'approve') alert('Request approved. Send the mobile-data stipend manually, then mark it paid.');
    } finally {
      setUpdatingId(null);
    }
  };

  const statusStyle = (status: string) =>
    status === 'paid' ? 'bg-green-100 text-green-700' :
    status === 'approved' ? 'bg-blue-100 text-blue-700' :
    status === 'rejected' ? 'bg-red-100 text-red-700' :
    'bg-yellow-100 text-yellow-700';

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Mobile-data stipend requests</h2>
        <p className="mt-1 text-sm text-gray-500">Volunteers become eligible only after the active-service delay configured in Settings. After approval/paid status, repeat requests are limited to once every 7 days. Approve requests here, send payment manually for now, then mark it paid. M-Pesa automation can replace this final manual step later.</p>
      </div>
      {requests.length === 0 ? <div className="rounded-xl border border-dashed p-10 text-center text-gray-500">No stipend requests yet.</div> : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Volunteer</th>
                <th className="px-4 py-3 text-left">Contact</th>
                <th className="px-4 py-3 text-left">Requested</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(request => {
                const account = request.account;
                const busy = updatingId === request.id;
                return (
                  <tr key={request.id} className="border-b align-top hover:bg-gray-50">
                    <td className="px-4 py-3"><p className="font-medium">{account?.name || 'Unmapped legacy account'}</p><p className="text-xs text-gray-500">Person-level stipend</p></td>
                    <td className="px-4 py-3 text-xs"><p>{account?.phone || '—'}</p><p className="mt-1 text-gray-500">{account?.email || '—'}</p></td>
                    <td className="px-4 py-3 text-xs text-gray-600">{new Date(request.requestedAt).toLocaleString()}</td>
                    <td className="px-4 py-3"><span className={`rounded px-2 py-1 text-xs font-semibold ${statusStyle(request.status)}`}>{request.status}</span></td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {request.paidAt ? <><p>Paid: {new Date(request.paidAt).toLocaleString()}</p>{request.paymentRef && <p className="mt-1">Ref: {request.paymentRef}</p>}</>
                        : request.approvedAt ? <p>Approved: {new Date(request.approvedAt).toLocaleString()}</p> : '—'}
                    </td>
                    <td className="min-w-[170px] px-4 py-3">
                      {request.status === 'pending' && <div className="flex flex-wrap gap-2"><button disabled={busy} onClick={() => updateRequest(request, 'approve')} className="text-xs font-semibold text-green-600 hover:underline disabled:opacity-50">Approve</button><button disabled={busy} onClick={() => updateRequest(request, 'reject')} className="text-xs text-red-600 hover:underline disabled:opacity-50">Reject</button></div>}
                      {request.status === 'approved' && <button disabled={busy} onClick={() => updateRequest(request, 'mark_paid')} className="text-xs font-semibold text-blue-700 hover:underline disabled:opacity-50">✓ Mark paid</button>}
                      {request.status === 'paid' && <span className="text-xs text-gray-400">Completed</span>}
                      {request.status === 'rejected' && <span className="text-xs text-gray-400">Closed</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// --- Mobilizer weekly reports ---
function MobilizerReportsPanel({ headers, onLogout }: { headers: any; onLogout: () => void }) {
  const [reports, setReports] = useState<any[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/mobilizer-reports', { headers })
      .then(res => { if (res.status === 401) { onLogout(); return []; } return res.json(); })
      .then(data => setReports(data || []))
      .catch(() => setReports([]));
  }, []);

  const updateReport = async (report: any, action: 'review' | 'action') => {
    const adminNote = prompt(action === 'action' ? 'Optional: add follow-up/action note:' : 'Optional: add review note:', report.adminNote || '') || '';
    setUpdatingId(report.id);
    try {
      const res = await fetch(`/api/admin/mobilizer-reports/${report.id}`, {
        method: 'PATCH', headers, body: JSON.stringify({ action, adminNote }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { alert(data.message || 'Could not update report.'); return; }
      setReports(prev => prev.map(item => item.id === report.id ? { ...item, ...data } : item));
    } finally {
      setUpdatingId(null);
    }
  };

  const statusStyle = (status: string) => status === 'actioned' ? 'bg-green-100 text-green-700' : status === 'reviewed' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700';

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Mobilizer field reports</h2>
        <p className="mt-1 text-sm text-gray-500">Aggregate weekly activity only. Reports intentionally exclude named voter lists, contact details, and individual political preference data.</p>
      </div>
      {reports.length === 0 ? <div className="rounded-xl border border-dashed p-10 text-center text-gray-500">No mobilizer reports submitted yet.</div> : (
        <div className="space-y-4">
          {reports.map(report => {
            const assignment = report.assignment;
            const account = assignment?.account;
            const busy = updatingId === report.id;
            return (
              <article key={report.id} className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-gray-900">{account?.name || 'Unmapped legacy account'}</p>
                    <p className="mt-1 text-xs text-gray-500">{assignment ? `${assignment.ward}, ${assignment.constituency} · ${account?.phone || '—'}` : 'Mobilizer assignment unavailable'}</p>
                  </div>
                  <div className="flex items-center gap-3"><span className={`rounded px-2 py-1 text-xs font-semibold ${statusStyle(report.status)}`}>{report.status}</span><span className="text-xs text-gray-400">Week of {new Date(report.periodStart).toLocaleDateString()}</span></div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-purple-50 p-3 text-center"><p className="text-xl font-extrabold text-purple-700">{report.peopleReached}</p><p className="text-[11px] font-semibold text-gray-500">People reached</p></div>
                  <div className="rounded-lg bg-purple-50 p-3 text-center"><p className="text-xl font-extrabold text-purple-700">{report.meetingsHeld}</p><p className="text-[11px] font-semibold text-gray-500">Meetings held</p></div>
                  <div className="rounded-lg bg-purple-50 p-3 text-center"><p className="text-xl font-extrabold text-purple-700">{report.newVolunteers}</p><p className="text-[11px] font-semibold text-gray-500">Referrals</p></div>
                </div>
                {report.keyIssues && <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm"><strong>Key local issues:</strong> {report.keyIssues}</div>}
                {report.notes && <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm"><strong>Field notes:</strong> {report.notes}</div>}
                {report.adminNote && <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-900"><strong>Admin follow-up:</strong> {report.adminNote}</div>}
                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  {report.status === 'submitted' && <button disabled={busy} onClick={() => updateReport(report, 'review')} className="font-semibold text-blue-700 hover:underline disabled:opacity-50">Mark reviewed</button>}
                  {report.status !== 'actioned' && <button disabled={busy} onClick={() => updateReport(report, 'action')} className="font-semibold text-green-700 hover:underline disabled:opacity-50">Mark actioned</button>}
                  {report.status === 'actioned' && <span className="text-gray-400">Follow-up completed</span>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- Turbo polling station registry ---
function PollingStationsPanel({ headers, onLogout }: { headers: any; onLogout: () => void }) {
  const [stations, setStations] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [ward, setWard] = useState('');
  const [config, setConfig] = useState({ county: 'Uasin Gishu', constituency: 'Turbo', wards: [] as string[] });
  const [saving, setSaving] = useState(false);

  const loadStations = () => {
    fetch('/api/admin/polling-stations?includeInactive=true', { headers })
      .then(res => { if (res.status === 401) { onLogout(); return []; } return res.json(); })
      .then(data => setStations(data || []))
      .catch(() => setStations([]));
  };

  useEffect(() => {
    loadStations();
    fetch('/api/admin/polling-station-config', { headers })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setConfig(data); })
      .catch(() => {});
  }, []);

  const addStation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ward.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/polling-stations', { method: 'POST', headers, body: JSON.stringify({ name: name.trim(), ward: ward.trim() }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { alert(data.message || 'Could not add polling station.'); return; }
      setStations(prev => [...prev, data].sort((a, b) => a.ward.localeCompare(b.ward) || a.name.localeCompare(b.name)));
      setName(''); setWard('');
    } finally {
      setSaving(false);
    }
  };

  const setActive = async (station: any, active: boolean) => {
    const label = active ? 'activate' : 'deactivate';
    if (!confirm(`${label[0].toUpperCase() + label.slice(1)} ${station.name}?`)) return;
    const res = await fetch(`/api/admin/polling-stations/${station.id}`, { method: 'PATCH', headers, body: JSON.stringify({ active }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { alert(data.message || 'Could not update polling station.'); return; }
    setStations(prev => prev.map(item => item.id === station.id ? data : item));
  };

  const reviewProposal = async (station: any, action: 'approve' | 'reject') => {
    if (!confirm(`${action === 'approve' ? 'Approve' : 'Reject'} proposed station ${station.name}?`)) return;
    const res = await fetch(`/api/admin/polling-stations/${station.id}/review`, { method: 'POST', headers, body: JSON.stringify({ action }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { alert(data.message || 'Could not review station proposal.'); return; }
    setStations(prev => prev.map(item => item.id === station.id ? data : item));
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Turbo polling stations</h2>
        <p className="mt-1 text-sm text-gray-500">Only active stations in this registry can be selected by Polling Agent applicants. County and constituency are fixed to {config.county} / {config.constituency}. Approved wards: {config.wards.join(', ')}.</p>
      </div>
      <section className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
        <h3 className="font-extrabold text-brand-black">Add official polling station</h3>
        <p className="mt-1 text-xs text-gray-600">Use the verified official station name and ward. Do not add unverified or temporary stations.</p>
        <form onSubmit={addStation} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Official station name" className="rounded-lg border px-3 py-2 text-sm" />
          <select value={ward} onChange={e => setWard(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
            <option value="">Select official ward</option>
            {config.wards.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
          <button disabled={saving} className="rounded-lg bg-brand-green px-5 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Adding…' : 'Add station'}</button>
        </form>
      </section>
      {stations.length === 0 ? <div className="rounded-xl border border-dashed p-10 text-center text-gray-500">No polling stations are configured yet. Polling Agent registration will remain unavailable until you add the official Turbo station list.</div> : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50"><tr><th className="px-4 py-3 text-left">Station</th><th className="px-4 py-3 text-left">Ward</th><th className="px-4 py-3 text-left">County / Constituency</th><th className="px-4 py-3 text-left">Registry status</th><th className="px-4 py-3 text-left">Action</th></tr></thead>
            <tbody>{stations.map(station => <tr key={station.id} className={`border-b ${station.validWard === false ? 'bg-red-50' : station.approvalStatus === 'pending' ? 'bg-yellow-50' : ''}`}><td className="px-4 py-3 font-medium">{station.name}{station.validWard === false && <p className="mt-1 text-xs font-semibold text-red-600">Invalid ward: not selectable by applicants</p>}{station.approvalStatus === 'pending' && <p className="mt-1 text-xs text-yellow-700">Proposed by: {station.proposedByEmail || 'applicant'}</p>}</td><td className="px-4 py-3">{station.ward}</td><td className="px-4 py-3 text-xs">{station.county} / {station.constituency}</td><td className="px-4 py-3"><span className={`rounded px-2 py-1 text-xs font-semibold ${station.approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' : station.approvalStatus === 'rejected' ? 'bg-red-100 text-red-700' : station.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{station.approvalStatus === 'pending' ? 'pending approval' : station.approvalStatus === 'rejected' ? 'rejected' : station.active ? 'active' : 'inactive'}</span></td><td className="px-4 py-3">{station.approvalStatus === 'pending' ? <div className="flex gap-2"><button onClick={() => reviewProposal(station, 'approve')} className="text-xs font-semibold text-green-700 hover:underline">Approve</button><button onClick={() => reviewProposal(station, 'reject')} className="text-xs text-red-600 hover:underline">Reject</button></div> : station.approvalStatus === 'rejected' ? <button onClick={() => reviewProposal(station, 'approve')} className="text-xs font-semibold text-brand-green hover:underline">Approve</button> : <button onClick={() => setActive(station, !station.active)} className="text-xs font-semibold text-brand-green hover:underline">{station.active ? 'Deactivate' : 'Activate'}</button>}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// --- Private election result review ---
function ElectionResultsPanel({ headers, onLogout }: { headers: any; onLogout: () => void }) {
  const [view, setView] = useState<'candidates' | 'reports'>('candidates');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [candidateName, setCandidateName] = useState('');
  const [candidateParty, setCandidateParty] = useState('');
  const [saving, setSaving] = useState(false);

  const loadCandidates = () => fetch('/api/admin/election-candidates?includeInactive=true', { headers })
    .then(res => { if (res.status === 401) { onLogout(); return []; } return res.json(); })
    .then(data => setCandidates(data || []));
  const loadReports = () => fetch('/api/admin/polling-results', { headers })
    .then(res => { if (res.status === 401) { onLogout(); return []; } return res.json(); })
    .then(data => setReports(data || []));

  useEffect(() => { loadCandidates(); loadReports(); }, []);

  const addCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/election-candidates', { method: 'POST', headers, body: JSON.stringify({ name: candidateName.trim(), party: candidateParty.trim() }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { alert(data.message || 'Could not add candidate.'); return; }
      setCandidates(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setCandidateName(''); setCandidateParty('');
    } finally { setSaving(false); }
  };

  const toggleCandidate = async (candidate: any) => {
    const res = await fetch(`/api/admin/election-candidates/${candidate.id}`, { method: 'PATCH', headers, body: JSON.stringify({ active: !candidate.active }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { alert(data.message || 'Could not update candidate.'); return; }
    setCandidates(prev => prev.map(item => item.id === candidate.id ? data : item));
  };

  const reviewResult = async (report: any, action: 'review' | 'verify' | 'dispute' | 'archive') => {
    if (action === 'archive' && !confirm(`Archive this result for ${report.pollingStation?.name || 'this station'}? It will be removed from public totals and allows a replacement submission.`)) return;
    const note = prompt(action === 'archive' ? 'Reason for archiving (recommended):' : `Optional review note for ${action}:`, report.reviewNote || '') || '';
    const res = await fetch(`/api/admin/polling-results/${report.id}`, { method: 'PATCH', headers, body: JSON.stringify({ action, reviewNote: note }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { alert(data.message || 'Could not update report.'); return; }
    setReports(prev => prev.map(item => item.id === report.id ? { ...item, ...data } : item));
  };

  const viewEvidence = async (report: any, attachment: any) => {
    const res = await fetch(`/api/admin/polling-results/${report.id}/attachments/${attachment.id}`, { headers });
    if (!res.ok) { alert('Could not load private result form.'); return; }
    const url = URL.createObjectURL(await res.blob());
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const resultStyle = (status: string) => status === 'verified' ? 'bg-green-100 text-green-700' : status === 'disputed' ? 'bg-red-100 text-red-700' : status === 'archived' ? 'bg-gray-200 text-gray-600' : status === 'under_review' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700';

  return (
    <div>
      <div className="mb-6"><h2 className="text-2xl font-bold text-gray-900">Private election result operations</h2><p className="mt-1 text-sm text-gray-500">Agent-reported station results and result-form photos are private evidence. They are not official public declarations and must be verified before operational use.</p></div>
      <div className="mb-5 flex rounded-lg border bg-white p-1 text-sm font-semibold"><button onClick={() => setView('candidates')} className={`rounded-md px-4 py-2 ${view === 'candidates' ? 'bg-brand-green text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Candidate registry</button><button onClick={() => setView('reports')} className={`rounded-md px-4 py-2 ${view === 'reports' ? 'bg-blue-700 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Submitted results ({reports.length})</button></div>
      {view === 'candidates' ? (
        <div className="space-y-6">
          <section className="rounded-xl border border-blue-200 bg-blue-50 p-5"><h3 className="font-extrabold text-brand-black">Add candidate to reporting form</h3><p className="mt-1 text-xs text-gray-600">Add every candidate exactly as they should appear on the official counted-results form before allowing agents to submit results.</p><form onSubmit={addCandidate} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"><input value={candidateName} onChange={e => setCandidateName(e.target.value)} placeholder="Candidate name" className="rounded-lg border px-3 py-2 text-sm" /><input value={candidateParty} onChange={e => setCandidateParty(e.target.value)} placeholder="Party / affiliation (optional)" className="rounded-lg border px-3 py-2 text-sm" /><button disabled={saving} className="rounded-lg bg-brand-green px-5 py-2 text-sm font-bold text-white">{saving ? 'Adding…' : 'Add candidate'}</button></form></section>
          {candidates.length === 0 ? <div className="rounded-xl border border-dashed p-10 text-center text-gray-500">No candidates configured. Polling agents cannot submit results until the complete candidate list is entered.</div> : <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-sm"><thead className="border-b bg-gray-50"><tr><th className="px-4 py-3 text-left">Candidate</th><th className="px-4 py-3 text-left">Party</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Action</th></tr></thead><tbody>{candidates.map(candidate => <tr key={candidate.id} className="border-b"><td className="px-4 py-3 font-medium">{candidate.name}</td><td className="px-4 py-3">{candidate.party || '—'}</td><td className="px-4 py-3"><span className={`rounded px-2 py-1 text-xs font-semibold ${candidate.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{candidate.active ? 'active' : 'inactive'}</span></td><td className="px-4 py-3"><button onClick={() => toggleCandidate(candidate)} className="text-xs font-semibold text-brand-green hover:underline">{candidate.active ? 'Deactivate' : 'Activate'}</button></td></tr>)}</tbody></table></div>}
        </div>
      ) : (
        reports.length === 0 ? <div className="rounded-xl border border-dashed p-10 text-center text-gray-500">No polling result reports submitted yet.</div> : <div className="space-y-5">{reports.map(report => { const votes = (() => { try { return JSON.parse(report.candidateVotesJson); } catch { return []; } })(); return <article key={report.id} className="rounded-xl border bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-bold text-gray-900">{report.pollingStation?.name || 'Unknown station'}</p><p className="mt-1 text-xs text-gray-500">{report.pollingStation?.ward} Ward · Agent: {report.assignment?.account?.name || 'Unknown'} · Submitted {new Date(report.submittedAt).toLocaleString()}</p></div><span className={`rounded px-3 py-1 text-xs font-bold ${resultStyle(report.status)}`}>{report.status.replace('_', ' ')}</span></div><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3"><div className="rounded-lg bg-blue-50 p-3 text-center"><p className="text-xl font-extrabold text-blue-700">{report.validVotes}</p><p className="text-[11px] font-semibold text-gray-500">Valid votes</p></div><div className="rounded-lg bg-blue-50 p-3 text-center"><p className="text-xl font-extrabold text-blue-700">{report.rejectedVotes}</p><p className="text-[11px] font-semibold text-gray-500">Rejected votes</p></div><div className="rounded-lg bg-blue-50 p-3 text-center"><p className="text-xl font-extrabold text-blue-700">{report.attachments.length}</p><p className="text-[11px] font-semibold text-gray-500">Private forms</p></div></div><div className="mt-4 overflow-x-auto rounded-lg border"><table className="w-full text-xs"><thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left">Candidate</th><th className="px-3 py-2 text-left">Party</th><th className="px-3 py-2 text-right">Reported votes</th></tr></thead><tbody>{votes.map((vote: any) => <tr key={vote.candidateId} className="border-t"><td className="px-3 py-2">{vote.candidateName}</td><td className="px-3 py-2">{vote.party || '—'}</td><td className="px-3 py-2 text-right font-semibold">{vote.votes}</td></tr>)}</tbody></table></div>{report.notes && <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm"><strong>Agent observations:</strong> {report.notes}</div>}{report.reviewNote && <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-900"><strong>Admin review note:</strong> {report.reviewNote}</div>}{report.archiveNote && <div className="mt-3 rounded-lg bg-gray-100 p-3 text-sm text-gray-700"><strong>Archive reason:</strong> {report.archiveNote}</div>}<div className="mt-4 flex flex-wrap gap-3 text-sm">{report.attachments.map((attachment: any) => <button key={attachment.id} onClick={() => viewEvidence(report, attachment)} className="font-semibold text-blue-700 hover:underline">🖼️ View private form</button>)}<button onClick={() => reviewResult(report, 'review')} className="font-semibold text-blue-700 hover:underline">Mark under review</button><button onClick={() => reviewResult(report, 'verify')} className="font-semibold text-green-700 hover:underline">Verify</button><button onClick={() => reviewResult(report, 'dispute')} className="font-semibold text-red-600 hover:underline">Dispute</button>{report.status !== 'archived' && <button onClick={() => reviewResult(report, 'archive')} className="font-semibold text-gray-600 hover:underline">Archive result</button>}</div></article>; })}</div>
      )}
    </div>
  );
}

// --- Volunteers Panel ---
function VolunteersPanel({ headers, onLogout }: { headers: any; onLogout: () => void }) {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [view, setView] = useState<'active' | 'archived'>('active');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [wardFilter, setWardFilter] = useState('all');

  useEffect(() => {
    const query = view === 'archived' ? '?archived=true' : '';
    fetch(`/api/admin/volunteer-accounts${query}`, { headers })
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

  const updateStatus = async (account: any, assignment: any, status: 'approved' | 'rejected' | 'suspended') => {
    const res = await fetch(`/api/admin/volunteer-assignments/${assignment.id}`, {
      method: 'PATCH', headers, body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.message || 'Could not update role status.');
      return;
    }
    const updated = await res.json();
    setVolunteers(prev => prev.map(item => item.id === account.id ? { ...item, assignments: item.assignments.map((role: any) => role.id === assignment.id ? { ...role, ...updated } : role) } : item));
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
    const res = await fetch(`/api/admin/volunteer-accounts/${v.id}/reset-access`, { method: 'POST', headers });
    if (res.ok) {
      const data = await res.json();
      setVolunteers(prev => prev.map(x => x.id === v.id ? { ...x, accessToken: data.accessToken, activatedAt: null, inviteDeliveryStatus: 'not_sent' } : x));
      alert('New invite link generated and an email has been queued.');
    } else {
      alert('Could not reset access. Please try again.');
    }
  };

  const archiveAssignment = async (account: any, assignment: any) => {
    if (!confirm(`Archive ${roleLabels[assignment.role] || assignment.role} for ${account.name}? That role will lose portal access. You can restore it later.`)) return;
    const res = await fetch(`/api/admin/volunteer-assignments/${assignment.id}/archive`, { method: 'POST', headers });
    if (res.ok) {
      setVolunteers(prev => prev.map(item => item.id === account.id ? { ...item, assignments: item.assignments.filter((role: any) => role.id !== assignment.id) } : item).filter(item => item.assignments.length > 0));
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.message || 'Could not archive this role.');
    }
  };

  const restoreAssignment = async (account: any, assignment: any) => {
    const res = await fetch(`/api/admin/volunteer-assignments/${assignment.id}/restore`, { method: 'POST', headers });
    if (res.ok) {
      setVolunteers(prev => prev.map(item => item.id === account.id ? { ...item, assignments: item.assignments.filter((role: any) => role.id !== assignment.id) } : item).filter(item => item.assignments.length > 0));
      alert(`${roleLabels[assignment.role] || assignment.role} was restored to ${assignment.statusBeforeArchive || 'pending'} status.`);
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.message || 'Could not restore this role.');
    }
  };

  const statusStyle = (status: string) =>
    status === 'approved' ? 'bg-green-100 text-green-700' :
    status === 'suspended' ? 'bg-orange-100 text-orange-700' :
    status === 'rejected' ? 'bg-red-100 text-red-700' :
    status === 'archived' ? 'bg-gray-200 text-gray-600' :
    'bg-yellow-100 text-yellow-700';

  const wards = Array.from(new Set(volunteers.flatMap(account => account.assignments.map((assignment: any) => assignment.ward).filter(Boolean)))).sort();
  const searchText = search.trim().toLowerCase();
  const filteredVolunteers = volunteers
    .map(account => ({
      ...account,
      assignments: account.assignments.filter((assignment: any) => {
        const searchable = [account.name, account.email, account.phone, assignment.role, assignment.ward, assignment.constituency, assignment.pollingStation?.name]
          .filter(Boolean).join(' ').toLowerCase();
        return (!searchText || searchable.includes(searchText))
          && (roleFilter === 'all' || assignment.role === roleFilter)
          && (statusFilter === 'all' || assignment.status === statusFilter)
          && (wardFilter === 'all' || assignment.ward === wardFilter);
      }),
    }))
    .filter(account => account.assignments.length > 0);

  const clearFilters = () => { setSearch(''); setRoleFilter('all'); setStatusFilter('all'); setWardFilter('all'); };

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

      <section className="mb-5 rounded-xl border bg-white p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_repeat(3,minmax(0,180px))_auto]">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, phone, station, ward…" className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-brand-yellow" />
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="rounded-lg border px-3 py-2 text-sm"><option value="all">All roles</option><option value="social_media">Social Media</option><option value="mobilizer">Mobilizer</option><option value="polling_agent">Polling Agent</option></select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-lg border px-3 py-2 text-sm"><option value="all">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="suspended">Suspended</option><option value="rejected">Rejected</option><option value="archived">Archived</option></select>
          <select value={wardFilter} onChange={e => setWardFilter(e.target.value)} className="rounded-lg border px-3 py-2 text-sm"><option value="all">All wards</option>{wards.map(ward => <option key={ward} value={ward}>{ward}</option>)}</select>
          <button onClick={clearFilters} className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Clear</button>
        </div>
        <p className="mt-3 text-xs text-gray-500">Showing {filteredVolunteers.reduce((sum, account) => sum + account.assignments.length, 0)} matching role assignment{filteredVolunteers.reduce((sum, account) => sum + account.assignments.length, 0) === 1 ? '' : 's'} across {filteredVolunteers.length} account{filteredVolunteers.length === 1 ? '' : 's'}.</p>
      </section>

      {view === 'active' && (
        <div className="mb-5 rounded-xl border border-brand-yellow/40 bg-brand-yellow/10 p-4 text-sm text-gray-700">
          <strong>Account lifecycle:</strong> Pending applicants can be approved or rejected. Approved volunteers can be suspended or archived. Suspended volunteers can be unsuspended. Archive is reversible and preserves history.
        </div>
      )}

      {filteredVolunteers.length === 0 ? (
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
              {filteredVolunteers.flatMap(account => account.assignments.map((assignment: any, index: number) => (
                <tr key={assignment.id} className="border-b align-top hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {index === 0 ? <><p className="font-medium">{account.name}</p><p className="mt-0.5 text-xs text-gray-500">{account.email}</p></> : <p className="text-xs text-gray-400">Same account ↑</p>}
                  </td>
                  <td className="px-4 py-3">{roleLabels[assignment.role] || assignment.role}</td>
                  <td className="px-4 py-3">{index === 0 ? account.phone : '—'}</td>
                  <td className="px-4 py-3 text-xs">{assignment.ward}, {assignment.constituency}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-medium ${statusStyle(assignment.status)}`}>{assignment.status}</span>{assignment.archivedAt && <p className="mt-1 text-xs text-gray-400">{formatDate(assignment.archivedAt)}</p>}</td>
                  <td className="min-w-[185px] px-4 py-3 text-xs">
                    {index === 0 && (account.activatedAt ? <><p className="font-semibold text-green-700">✓ Account activated</p><p className="mt-1 text-gray-500">Last login: {formatDate(account.lastLoginAt)}</p></>
                    : account.inviteDeliveryStatus === 'failed' ? <><p className="font-semibold text-red-600">⚠ Invite email failed</p><p className="mt-1 text-gray-500">Attempt: {formatDate(account.inviteFailedAt)}</p></>
                    : account.inviteDeliveryStatus === 'sent' ? <><p className="font-semibold text-blue-700">✉ Invite accepted for delivery</p><p className="mt-1 text-gray-500">Sent: {formatDate(account.inviteSentAt)}</p></>
                    : <p className="text-gray-500">No invite sent yet</p>)}
                    {index === 0 && account.loginFailureCount > 0 && <p className="mt-1 font-semibold text-amber-700">⚠ {account.loginFailureCount} failed login{account.loginFailureCount === 1 ? '' : 's'} · {formatDate(account.lastLoginFailedAt)}</p>}
                  </td>
                  <td className="min-w-[180px] px-4 py-3">
                    {view === 'archived' ? (
                      <button onClick={() => restoreAssignment(account, assignment)} className="text-xs font-semibold text-brand-green hover:underline">↩ Restore role</button>
                    ) : (
                      <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs">
                        {assignment.status === 'pending' && <><button onClick={() => updateStatus(account, assignment, 'approved')} className="text-green-600 hover:underline">Approve</button><button onClick={() => updateStatus(account, assignment, 'rejected')} className="text-red-600 hover:underline">Reject</button></>}
                        {assignment.status === 'rejected' && <button onClick={() => updateStatus(account, assignment, 'approved')} className="text-green-600 hover:underline">Approve</button>}
                        {assignment.status === 'approved' && <button onClick={() => updateStatus(account, assignment, 'suspended')} className="text-orange-600 hover:underline">Suspend</button>}
                        {assignment.status === 'suspended' && <button onClick={() => updateStatus(account, assignment, 'approved')} className="text-green-600 hover:underline">Unsuspend</button>}
                        {index === 0 && assignment.status === 'approved' && <><button onClick={() => copyInvite(account)} className="font-semibold text-brand-green hover:underline">{copiedId === account.id ? '✓ Copied' : '✉️ Copy invite'}</button><button onClick={() => resetAccess(account)} className="text-gray-500 hover:underline">Reset account</button></>}
                        <button onClick={() => archiveAssignment(account, assignment)} className="text-gray-500 hover:text-gray-800 hover:underline">Archive role</button>
                      </div>
                    )}
                  </td>
                </tr>
              )))}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobilizer Coordination Group Link</label>
              <input value={settings.mobilizerGroupLink || ''} onChange={e => setSettings({ ...settings, mobilizerGroupLink: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="https://chat.whatsapp.com/... (mobilizer coordination group)" />
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

        {/* Volunteer Stipend Rules */}
        <div className="border-t pt-6">
          <h3 className="font-bold text-gray-900 mb-1">Volunteer Mobile-data Stipend</h3>
          <p className="text-xs text-gray-500 mb-4">
            Controls when a newly approved volunteer becomes eligible to make their first stipend request. The weekly repeat limit remains enforced separately.
          </p>
          <div className="max-w-sm">
            <label className="block text-sm font-medium text-gray-700 mb-1">Active-service delay before first request (days)</label>
            <input type="number" min="0" max="90" step="1" value={settings.stipendActivationDelayDays ?? 7}
              onChange={e => setSettings({ ...settings, stipendActivationDelayDays: e.target.value === '' ? 0 : parseInt(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2 text-sm" />
            <p className="mt-1 text-xs text-gray-400">Set to 0 to allow an approved volunteer to request immediately. Maximum: 90 days.</p>
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
