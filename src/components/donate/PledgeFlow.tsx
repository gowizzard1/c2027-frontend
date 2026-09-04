'use client';

import { useState, useCallback, useEffect } from 'react';
import DonationProgress from '@/components/DonationProgress';
import PageHeader from '@/components/PageHeader';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
}

/**
 * Shown when payments are in "mock" mode (still being integrated).
 * Captures a donor's interest instead of taking a payment.
 */
export default function PledgeFlow() {
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pledgeComplete, setPledgeComplete] = useState(false);
  const [pledgeId, setPledgeId] = useState('');
  const [waLink, setWaLink] = useState('#');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

  const presetAmounts = ['500', '1000', '2500', '5000', '10000', '25000'];
  const selectedAmount = customAmount || amount;

  useEffect(() => {
    fetch('/api/content/settings')
      .then(r => (r.ok ? r.json() : null))
      .then(settings => {
        if (settings?.whatsappLink) setWaLink(settings.whatsappLink);
      })
      .catch(() => {});
  }, []);

  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};
    if (!name || name.trim().length < 2) {
      errors.name = 'Full name is required.';
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Valid email address is required.';
    }
    if (!phone || phone.replace(/\D/g, '').length < 9) {
      errors.phone = 'Valid phone number is required.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [name, email, phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (isProcessing) return;

    setError('');
    setIsProcessing(true);

    try {
      const payload: Record<string, unknown> = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
      };
      if (selectedAmount) payload.amount = parseInt(selectedAmount);
      if (message.trim()) payload.message = message.trim();

      const res = await fetch('/api/donations/pledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPledgeId(data.pledgeId || '');
        setPledgeComplete(true);
      } else {
        setError(data.message || data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Connection error. Please check your internet and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Thank-You Screen ──
  if (pledgeComplete) {
    return (
      <div className="bg-white text-brand-black">
        <PageHeader label="Thank You!" title="We Appreciate You 🙏" />
        <div className="max-w-lg mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <div className="text-6xl mb-4" aria-hidden="true">💛</div>
            <h2 className="text-2xl font-extrabold text-brand-black mb-3">
              Thank You for Your Willingness to Donate!
            </h2>
            <p className="text-gray-600 mb-5">
              We are currently setting things up and will let you know as soon as we are ready to
              receive contributions. We&apos;ve saved your details and will reach out to{' '}
              <strong>{phone}</strong>.
            </p>

            {pledgeId && (
              <div className="bg-brand-yellow/10 border border-brand-yellow rounded-xl p-4 mb-6">
                <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">
                  Your Reference
                </p>
                <p className="text-lg font-mono font-extrabold text-brand-black">{pledgeId}</p>
              </div>
            )}

            <div className="space-y-3">
              {waLink !== '#' && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold py-3 px-6 rounded-lg w-full transition-colors"
                  aria-label="Join WhatsApp group"
                >
                  💬 Join WhatsApp Group
                </a>
              )}
              <button
                onClick={() =>
                  navigator.share?.({
                    title: 'Support the campaign',
                    text: 'I just pledged to support the campaign. Join me!',
                    url: window.location.origin + '/donate',
                  })
                }
                className="bg-brand-yellow hover:bg-brand-yellowlt text-brand-black font-bold py-3 px-6 rounded-lg w-full transition-colors"
                aria-label="Share campaign"
              >
                📤 Share Campaign
              </button>
              <button
                onClick={() => {
                  setPledgeComplete(false);
                  setAmount('');
                  setCustomAmount('');
                  setName('');
                  setEmail('');
                  setPhone('');
                  setMessage('');
                  setFieldErrors({});
                }}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors w-full py-2"
              >
                ← Register Another Pledge
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Pledge Form ──
  return (
    <div className="bg-white text-brand-black">
      <PageHeader
        label="Support the Campaign"
        title="Register Your Support"
        subtitle="Online donations are being set up. Leave your details and we'll notify you the moment we're ready to receive your contribution."
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Under-integration banner */}
        <div
          className="bg-yellow-50 border-2 border-brand-yellow rounded-xl px-5 py-4 mb-6 flex items-start gap-3"
          role="alert"
        >
          <span className="text-2xl shrink-0" aria-hidden="true">🚧</span>
          <div>
            <p className="font-extrabold text-brand-black text-sm">Donations Under Integration</p>
            <p className="text-gray-600 text-xs mt-0.5">
              We&apos;re currently setting up secure payments (M-Pesa and card). You can&apos;t be
              charged yet. Register your interest below and we&apos;ll contact you as soon as
              donations go live.
            </p>
          </div>
        </div>

        {/* Live Progress */}
        <div className="mb-8">
          <DonationProgress />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Error */}
            {error && (
              <div
                className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm font-medium"
                role="alert"
                aria-live="polite"
              >
                ⚠️ {error}
              </div>
            )}

            {/* Intended Amount (optional) */}
            <fieldset>
              <legend className="block text-sm font-extrabold text-brand-black mb-3 uppercase tracking-wide">
                Intended Amount (KES) — Optional
              </legend>
              <div className="grid grid-cols-3 gap-3 mb-3" role="group" aria-label="Preset pledge amounts">
                {presetAmounts.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setAmount(preset);
                      setCustomAmount('');
                    }}
                    aria-pressed={amount === preset && !customAmount}
                    className={`py-3 px-4 rounded-lg font-bold border-2 transition-all text-sm ${
                      amount === preset && !customAmount
                        ? 'border-brand-yellow bg-brand-yellow text-brand-black shadow-md'
                        : 'border-gray-200 hover:border-brand-yellow text-gray-700 bg-white'
                    }`}
                  >
                    {parseInt(preset).toLocaleString()}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                max="500000"
                placeholder="Or enter a custom amount"
                value={customAmount}
                onChange={e => {
                  setCustomAmount(e.target.value);
                  setAmount('');
                }}
                aria-label="Custom pledge amount in KES"
                className="w-full border-2 border-gray-200 focus:border-brand-yellow rounded-lg px-4 py-3 outline-none transition-colors text-brand-black"
              />
              <p className="text-gray-400 text-xs mt-1">
                Let us know how much you&apos;re thinking of contributing (you won&apos;t be charged now).
              </p>
            </fieldset>

            {/* Personal Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pledge-name" className="block text-sm font-semibold text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  id="pledge-name"
                  type="text"
                  required
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    setFieldErrors(prev => ({ ...prev, name: undefined }));
                  }}
                  placeholder="John Doe"
                  aria-invalid={!!fieldErrors.name}
                  aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                  className="w-full border-2 border-gray-200 focus:border-brand-yellow rounded-lg px-4 py-3 outline-none transition-colors"
                />
                {fieldErrors.name && (
                  <p id="name-error" className="text-red-600 text-xs mt-1">{fieldErrors.name}</p>
                )}
              </div>
              <div>
                <label htmlFor="pledge-email" className="block text-sm font-semibold text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  id="pledge-email"
                  type="email"
                  required
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    setFieldErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  placeholder="john@example.com"
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  className="w-full border-2 border-gray-200 focus:border-brand-yellow rounded-lg px-4 py-3 outline-none transition-colors"
                />
                {fieldErrors.email && (
                  <p id="email-error" className="text-red-600 text-xs mt-1">{fieldErrors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="pledge-phone" className="block text-sm font-semibold text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                id="pledge-phone"
                type="tel"
                required
                value={phone}
                onChange={e => {
                  setPhone(e.target.value);
                  setFieldErrors(prev => ({ ...prev, phone: undefined }));
                }}
                placeholder="0712 345 678"
                aria-invalid={!!fieldErrors.phone}
                aria-describedby="phone-help"
                className="w-full border-2 border-gray-200 focus:border-brand-yellow rounded-lg px-4 py-3 outline-none transition-colors"
              />
              <p id="phone-help" className="text-gray-400 text-xs mt-1">
                {fieldErrors.phone || "We'll reach you here once donations are ready"}
              </p>
            </div>

            {/* Optional message */}
            <div>
              <label htmlFor="pledge-message" className="block text-sm font-semibold text-gray-700 mb-1">
                Message (Optional)
              </label>
              <textarea
                id="pledge-message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Anything you'd like us to know…"
                className="w-full border-2 border-gray-200 focus:border-brand-yellow rounded-lg px-4 py-3 outline-none transition-colors resize-y"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isProcessing}
              aria-busy={isProcessing}
              className={`w-full py-4 rounded-xl font-extrabold text-lg transition-all ${
                isProcessing
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-brand-green hover:bg-brand-greenlt text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {isProcessing ? '⏳ Submitting...' : '💛 Notify Me When Donations Open'}
            </button>

            <p className="text-center text-xs text-gray-400">
              No payment is taken now. We&apos;ll only use your details to let you know when
              donations are ready.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
