'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const VISITOR_KEY = 'maiywa_analytics_visitor';
const PRIVATE_PATHS = ['/portal-mc2027', '/admin', '/volunteer/dashboard', '/volunteer/login', '/volunteer/toolkit'];

function visitorId() {
  const existing = localStorage.getItem(VISITOR_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 20)}`;
  localStorage.setItem(VISITOR_KEY, id);
  return id;
}

function deviceType() {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

function referrerDomain() {
  if (!document.referrer) return '';
  try {
    const domain = new URL(document.referrer).hostname;
    return domain === window.location.hostname ? '' : domain;
  } catch {
    return '';
  }
}

/**
 * Records anonymous public page views on route changes.
 * It never sends user IDs, form fields, IP addresses, query parameters, or raw user agents.
 */
export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || PRIVATE_PATHS.some(path => pathname.startsWith(path))) return;

    fetch('/api/analytics/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        visitorId: visitorId(),
        path: pathname,
        referrerDomain: referrerDomain(),
        deviceType: deviceType(),
      }),
    }).catch(() => {
      // Analytics is non-critical and must never affect page use.
    });
  }, [pathname]);

  return null;
}
