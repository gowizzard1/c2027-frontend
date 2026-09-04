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
}

const roleLabels: Record<string, string> = {
  polling_agent: 'Polling Agent',
  mobilizer: 'Mobilizer',
  social_media: 'Social Media Volunteer',
};

export default function VolunteerToolkit({ data }: { data: ToolkitData }) {
  return (
    <div className="space-y-6">
      {/* Status */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-brand-green mb-1">Your Role</p>
            <p className="font-bold text-lg">{roleLabels[data.role] || data.role}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
            data.status === 'approved' ? 'bg-green-100 text-green-700'
            : data.status === 'rejected' ? 'bg-red-100 text-red-700'
            : 'bg-yellow-100 text-yellow-700'
          }`}>{data.status}</span>
        </div>
      </div>

      {!data.isApproved && (
        <div className="bg-brand-yellow/10 border border-brand-yellow rounded-2xl p-6 text-center">
          <div className="text-4xl mb-2">⏳</div>
          <h2 className="font-extrabold text-lg mb-1">
            {data.status === 'rejected' ? 'Application Not Approved' : 'Awaiting Approval'}
          </h2>
          <p className="text-gray-600 text-sm">
            {data.status === 'rejected'
              ? 'Your volunteer application was not approved. Please contact the campaign team if you think this is a mistake.'
              : "Your registration is being reviewed. Your toolkit will unlock here once you're approved."}
          </p>
        </div>
      )}

      {data.approvedSocial && data.social && <SocialToolkit social={data.social} />}

      {data.isApproved && !data.isSocialMedia && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-2">✅</div>
          <h2 className="font-extrabold text-lg mb-1">You&apos;re Approved!</h2>
          <p className="text-gray-600 text-sm">
            Thank you for volunteering as a {roleLabels[data.role] || data.role}. The campaign team will
            be in touch with your assignments.
          </p>
        </div>
      )}
    </div>
  );
}

function SocialToolkit({ social }: { social: { groupLink: string; shareMessage: string; shareUrl: string } }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = social.shareUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const shareText = social.shareMessage || 'Join me in supporting the campaign! 🇰🇪';
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(shareUrl);

  const shareTargets = [
    { label: 'WhatsApp', emoji: '💬', href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`, cls: 'bg-[#25D366] hover:bg-[#1ebe5d] text-white' },
    { label: 'X (Twitter)', emoji: '𝕏', href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, cls: 'bg-black hover:bg-gray-800 text-white' },
    { label: 'Facebook', emoji: '📘', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`, cls: 'bg-[#1877F2] hover:bg-[#1466d6] text-white' },
    { label: 'Telegram', emoji: '✈️', href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, cls: 'bg-[#26A5E4] hover:bg-[#1e8fca] text-white' },
  ];

  const nativeShare = () => navigator.share?.({ title: 'Campaign 2027', text: shareText, url: shareUrl });
  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <>
      <div className="bg-brand-green rounded-2xl p-6 text-center text-white">
        <div className="text-4xl mb-2">🎉</div>
        <h2 className="text-xl font-extrabold mb-1">Welcome to the Social Media Team!</h2>
        <p className="text-green-100 text-sm mb-5">
          Join the dedicated group for daily content, updates and coordination.
        </p>
        {social.groupLink ? (
          <a href={social.groupLink} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-white text-brand-green font-extrabold py-3 px-7 rounded-lg hover:bg-gray-100 transition-colors">
            💬 Join the Social Media Group
          </a>
        ) : (
          <p className="text-green-100 text-xs italic">The group link will appear here once the team sets it up.</p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-extrabold text-lg mb-1">Share the Campaign</h3>
        <p className="text-gray-500 text-sm mb-4">Post to your networks with one tap.</p>
        {shareText && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 mb-4">
            {shareText}{shareUrl ? ` ${shareUrl}` : ''}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          {shareTargets.map(t => (
            <a key={t.label} href={t.href} target="_blank" rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-lg transition-colors text-sm ${t.cls}`}>
              <span aria-hidden="true">{t.emoji}</span> {t.label}
            </a>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <button onClick={copyMessage}
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-brand-black font-bold py-3 px-4 rounded-lg transition-colors text-sm">
            {copied ? '✓ Copied' : '📋 Copy Message'}
          </button>
          <button onClick={nativeShare}
            className="flex items-center justify-center gap-2 bg-brand-yellow hover:bg-brand-yellowlt text-brand-black font-bold py-3 px-4 rounded-lg transition-colors text-sm">
            📤 More…
          </button>
        </div>
      </div>
    </>
  );
}
