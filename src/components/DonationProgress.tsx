'use client';

import { useEffect, useState } from 'react';

interface ProgressData {
  raised: number;
  goal: number;
  donors: number;
}

export default function DonationProgress() {
  const [progress, setProgress] = useState<ProgressData | null>(null);

  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/donations/progress');
      if (res.ok) {
        const data = await res.json();
        setProgress(data);
      }
    } catch {
      // Silently fail
    }
  };

  useEffect(() => {
    fetchProgress();
    const interval = setInterval(fetchProgress, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!progress) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-full mb-3" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    );
  }

  const percentage = progress.goal > 0 ? Math.min((progress.raised / progress.goal) * 100, 100) : 0;

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
    return amount.toLocaleString();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-base font-extrabold text-brand-black">Campaign Fund Progress</h3>
        <span className="text-sm font-extrabold text-brand-green">{percentage.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 mb-3 overflow-hidden">
        <div
          className="bg-brand-green h-4 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-sm text-gray-600">
        <span>
          <strong className="text-brand-black">KES {formatAmount(progress.raised)}</strong> raised
        </span>
        <span>Goal: <strong>KES {formatAmount(progress.goal)}</strong></span>
      </div>
      <p className="text-sm text-gray-500 mt-2">
        🙏 <strong className="text-brand-black">{progress.donors.toLocaleString()}</strong> supporters have donated
      </p>
    </div>
  );
}
