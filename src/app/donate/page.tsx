'use client';

import { useState, useEffect } from 'react';
import PledgeFlow from '@/components/donate/PledgeFlow';
import PaymentFlow from '@/components/donate/PaymentFlow';
import PageHeader from '@/components/PageHeader';

export default function DonatePage() {
  // null = still loading, then 'mock' | 'live'
  const [mode, setMode] = useState<'mock' | 'live' | null>(null);

  useEffect(() => {
    fetch('/api/content/payment-mode')
      .then(r => (r.ok ? r.json() : null))
      .then(data => setMode(data?.mode === 'live' ? 'live' : 'mock'))
      // If we can't determine the mode, fail safe to the pledge flow (no charges).
      .catch(() => setMode('mock'));
  }, []);

  if (mode === null) {
    return (
      <div className="bg-white text-brand-black">
        <PageHeader label="Support the Campaign" title="Loading…" />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-400">
          Loading donation options…
        </div>
      </div>
    );
  }

  // Live mode → real payment flow. Mock mode → "under integration" pledge capture.
  return mode === 'live' ? <PaymentFlow /> : <PledgeFlow />;
}
