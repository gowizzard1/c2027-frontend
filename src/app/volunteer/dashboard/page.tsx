'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import VolunteerToolkit, { ToolkitData } from '@/components/volunteer/VolunteerToolkit';

const TOKEN_KEY = 'campaign_volunteer_token';

export default function VolunteerDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<ToolkitData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) {
      router.replace('/volunteer/login');
      return;
    }

    fetch('/api/volunteers/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(async response => {
        if (!response.ok) {
          sessionStorage.removeItem(TOKEN_KEY);
          router.replace('/volunteer/login');
          return;
        }
        setData(await response.json());
      })
      .catch(() => {
        sessionStorage.removeItem(TOKEN_KEY);
        router.replace('/volunteer/login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    router.replace('/volunteer/login');
  };

  return (
    <div className="bg-white text-brand-black">
      <PageHeader
        label="Campaign Team Portal"
        title={data ? `Welcome back, ${data.name.split(' ')[0]}!` : 'Campaign Team Dashboard'}
        subtitle="Your campaign role, resources, and next steps in one place."
      />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading && <div className="py-16 text-center text-gray-400">Loading your campaign team dashboard…</div>}
        {!loading && data && (
          <>
            <VolunteerToolkit data={data} />
            <Link href="/app" className="mt-4 block w-full rounded-lg bg-brand-green px-4 py-3 text-center text-sm font-extrabold text-white transition-colors hover:bg-brand-greenlt">
              📱 Download Campaign Team App
            </Link>
            <button onClick={logout} className="mt-4 w-full py-3 text-sm text-gray-400 transition-colors hover:text-gray-600">
              Log out
            </button>
          </>
        )}
      </main>
    </div>
  );
}
