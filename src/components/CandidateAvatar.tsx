'use client';

import { useState } from 'react';

interface Props {
  candidate: { name: string; imageUrl?: string | null };
  size?: 'small' | 'large';
}

/** A public candidate portrait with a neutral avatar fallback for missing/broken images. */
export default function CandidateAvatar({ candidate, size = 'small' }: Props) {
  const [failed, setFailed] = useState(false);
  const dimensions = size === 'large' ? 'h-14 w-14' : 'h-9 w-9';

  if (candidate.imageUrl && !failed) {
    return (
      <img
        src={candidate.imageUrl}
        alt={candidate.name}
        onError={() => setFailed(true)}
        className={`${dimensions} shrink-0 rounded-full border border-gray-200 object-cover`}
      />
    );
  }

  return (
    <span aria-label={`${candidate.name} avatar placeholder`} className={`flex ${dimensions} shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400`}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-2/3 w-2/3" aria-hidden="true">
        <path d="M12 12a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5Zm0 2.25c-4.31 0-7.75 2.1-7.75 4.75 0 .83.67 1.5 1.5 1.5h12.5c.83 0 1.5-.67 1.5-1.5 0-2.65-3.44-4.75-7.75-4.75Z" />
      </svg>
    </span>
  );
}
