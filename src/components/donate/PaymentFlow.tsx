'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Script from 'next/script';
import DonationProgress from '@/components/DonationProgress';
import PageHeader from '@/components/PageHeader';

type PaymentMethod = 'mpesa' | 'card';

interface FormErrors {
  amount?: string;
  name?: string;
  email?: string;
  phone?: string;
}

// Flutterwave Inline types
declare global {
  interface Window {
    FlutterwaveCheckout?: (config: FlutterwaveConfig) => void;
  }
}

interface FlutterwaveConfig {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options: string;
  customer: { email: string; phone_number: string; name: string };
  customizations: { title: string; description: string; logo?: string };
  callback: (response: FlutterwaveResponse) => void;
  onclose: () => void;
}

interface FlutterwaveResponse {
  transaction_id: number;
  tx_ref: string;
  status: string;
  flw_ref: string;
}

/**
 * Live payment flow: real M-Pesa STK push and card (Flutterwave Inline).
 * Only rendered when payment mode is "live".
 */
export default function PaymentFlow() {
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [donationComplete, setDonationComplete] = useState(false);
  const [receiptId, setReceiptId] = useState('');
  const [waLink, setWaLink] = useState('#');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [flutterwaveKey, setFlutterwaveKey] = useState('');
  const [cardEnabled, setCardEnabled] = useState(false);

  // Idempotency key to prevent double submissions
  const idempotencyKeyRef = useRef<string>('');

  const presetAmounts = ['500', '1000', '2500', '5000', '10000', '25000'];
  const selectedAmount = customAmount || amount;

  useEffect(() => {
    Promise.all([
      fetch('/api/content/settings').then(r => (r.ok ? r.json() : null)),
      fetch('/api/donations/config').then(r => (r.ok ? r.json() : null)),
    ])
      .then(([settings, donationConfig]) => {
        if (settings?.whatsappLink) setWaLink(settings.whatsappLink);
        if (donationConfig?.flutterwavePublicKey) setFlutterwaveKey(donationConfig.flutterwavePublicKey);
        if (donationConfig?.cardEnabled) setCardEnabled(true);
      })
      .catch(() => {});
  }, []);

  const generateIdempotencyKey = () => {
    idempotencyKeyRef.current = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    return idempotencyKeyRef.current;
  };

  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};

    if (!selectedAmount || parseInt(selectedAmount) < 1) {
      errors.amount = 'Please select or enter a donation amount.';
    }
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
  }, [selectedAmount, name, email, phone]);

  /**
   * Handle card payment via Flutterwave Inline modal.
   */
  const handleCardPayment = useCallback(() => {
    if (!validateForm()) return;
    if (isProcessing) return;

    const donationAmount = parseInt(selectedAmount);

    if (!window.FlutterwaveCheckout) {
      setError('Payment system is loading. Please try again in a moment.');
      return;
    }

    if (!flutterwaveKey) {
      setError('Card payments are not configured. Please use M-Pesa or contact support.');
      return;
    }

    setError('');
    setIsProcessing(true);

    const txRef = `CMP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    window.FlutterwaveCheckout({
      public_key: flutterwaveKey,
      tx_ref: txRef,
      amount: donationAmount,
      currency: 'KES',
      payment_options: 'card',
      customer: {
        email: email.trim().toLowerCase(),
        phone_number: phone.trim(),
        name: name.trim(),
      },
      customizations: {
        title: 'Campaign 2027 Donation',
        description: `KES ${donationAmount.toLocaleString()} donation`,
      },
      callback: (response: FlutterwaveResponse) => {
        if (response.status === 'successful' || response.status === 'completed') {
          completeDonation(String(response.transaction_id), donationAmount);
        } else {
          setIsProcessing(false);
          setError('Payment was not completed. Please try again.');
        }
      },
      onclose: () => {
        if (!donationComplete) {
          setIsProcessing(false);
        }
      },
    });
  }, [validateForm, isProcessing, selectedAmount, flutterwaveKey, email, phone, name, donationComplete]);

  /**
   * After Flutterwave confirms payment, send transactionId to our backend for verification.
   */
  const completeDonation = async (transactionId: string, donationAmount: number) => {
    try {
      const key = generateIdempotencyKey();
      const payload = {
        amount: donationAmount,
        paymentMethod: 'card' as const,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        transactionId,
      };

      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': key,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setReceiptId(data.receiptId || 'RCP-' + Date.now());
        setDonationComplete(true);
      } else {
        setError(data.message || data.error || 'Payment verification failed. Please contact support.');
      }
    } catch {
      setError('Connection error during verification. Your payment may have succeeded — please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle M-Pesa payment (STK push via backend).
   */
  const handleMpesaPayment = async () => {
    if (!validateForm()) return;
    if (isProcessing) return;

    setError('');
    setIsProcessing(true);

    try {
      const key = generateIdempotencyKey();
      const payload = {
        amount: parseInt(selectedAmount),
        paymentMethod: 'mpesa' as const,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
      };

      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': key,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setReceiptId(data.receiptId || 'RCP-' + Date.now());
        setDonationComplete(true);
      } else {
        setError(data.message || data.error || 'Payment failed. Please try again.');
      }
    } catch {
      setError('Connection error. Please check your internet and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'card') {
      handleCardPayment();
    } else {
      handleMpesaPayment();
    }
  };

  // ── Success Screen ──
  if (donationComplete) {
    return (
      <div className="bg-white text-brand-black">
        <PageHeader label="Thank You!" title="Donation Received 🎉" />
        <div className="max-w-lg mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <div className="text-6xl mb-4" aria-hidden="true">🙏</div>
            <h2 className="text-2xl font-extrabold text-brand-black mb-2">
              Thank You for Your Support!
            </h2>
            <p className="text-gray-600 mb-5">
              Your contribution of{' '}
              <strong className="text-brand-green">
                KES {parseInt(selectedAmount).toLocaleString()}
              </strong>{' '}
              has been received.
            </p>

            <div className="bg-brand-yellow/10 border border-brand-yellow rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">
                Receipt Number
              </p>
              <p className="text-lg font-mono font-extrabold text-brand-black">{receiptId}</p>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              A confirmation SMS and WhatsApp message have been sent to{' '}
              <strong>{phone}</strong>.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => window.print()}
                className="bg-brand-black hover:bg-gray-900 text-brand-yellow font-bold py-3 px-6 rounded-lg w-full transition-colors"
                aria-label="Print donation receipt"
              >
                🧾 Print Receipt
              </button>
              <button
                onClick={() =>
                  navigator.share?.({
                    title: 'I just donated to the campaign!',
                    text: `I donated KES ${parseInt(selectedAmount).toLocaleString()} to support the vision. Join me!`,
                    url: window.location.origin + '/donate',
                  })
                }
                className="bg-brand-yellow hover:bg-brand-yellowlt text-brand-black font-bold py-3 px-6 rounded-lg w-full transition-colors"
                aria-label="Share campaign on social media"
              >
                📤 Share Campaign
              </button>
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
                onClick={() => {
                  setDonationComplete(false);
                  setAmount('');
                  setCustomAmount('');
                  setName('');
                  setEmail('');
                  setPhone('');
                  setFieldErrors({});
                }}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors w-full py-2"
              >
                ← Donate Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Donation Form ──
  return (
    <div className="bg-white text-brand-black">
      {/* Load Flutterwave Inline JS (only when card payment is available) */}
      {cardEnabled && (
        <Script src="https://checkout.flutterwave.com/v3.js" strategy="lazyOnload" />
      )}

      <PageHeader
        label="Support the Campaign"
        title="Make a Donation"
        subtitle="Every contribution funds campaign activities, mobilization, and outreach across the constituency."
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Live Progress */}
        <div className="mb-8">
          <DonationProgress />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <form onSubmit={handleDonate} className="space-y-6" noValidate>
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

            {/* Amount */}
            <fieldset>
              <legend className="block text-sm font-extrabold text-brand-black mb-3 uppercase tracking-wide">
                Select Amount (KES)
              </legend>
              <div className="grid grid-cols-3 gap-3 mb-3" role="group" aria-label="Preset donation amounts">
                {presetAmounts.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setAmount(preset);
                      setCustomAmount('');
                      setFieldErrors(prev => ({ ...prev, amount: undefined }));
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
                placeholder="Or enter custom amount"
                value={customAmount}
                onChange={e => {
                  setCustomAmount(e.target.value);
                  setAmount('');
                  setFieldErrors(prev => ({ ...prev, amount: undefined }));
                }}
                aria-label="Custom donation amount in KES"
                aria-invalid={!!fieldErrors.amount}
                aria-describedby={fieldErrors.amount ? 'amount-error' : undefined}
                className="w-full border-2 border-gray-200 focus:border-brand-yellow rounded-lg px-4 py-3 outline-none transition-colors text-brand-black"
              />
              {fieldErrors.amount && (
                <p id="amount-error" className="text-red-600 text-xs mt-1">{fieldErrors.amount}</p>
              )}
            </fieldset>

            {/* Personal Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="donate-name" className="block text-sm font-semibold text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  id="donate-name"
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
                <label htmlFor="donate-email" className="block text-sm font-semibold text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  id="donate-email"
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
              <label htmlFor="donate-phone" className="block text-sm font-semibold text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                id="donate-phone"
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
                {fieldErrors.phone || 'Safaricom number for M-Pesa or confirmation SMS'}
              </p>
            </div>

            {/* Payment Method */}
            <fieldset>
              <legend className="block text-sm font-extrabold text-brand-black mb-3 uppercase tracking-wide">
                Payment Method
              </legend>
              <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Payment method">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mpesa')}
                  role="radio"
                  aria-checked={paymentMethod === 'mpesa'}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    paymentMethod === 'mpesa'
                      ? 'border-brand-green bg-green-50 shadow-md'
                      : 'border-gray-200 hover:border-brand-green bg-white'
                  }`}
                >
                  <div className="text-3xl mb-1" aria-hidden="true">📱</div>
                  <div className="font-extrabold text-brand-black">M-Pesa</div>
                  <div className="text-xs text-gray-500 mt-0.5">STK Push to your phone</div>
                </button>
                {cardEnabled && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    role="radio"
                    aria-checked={paymentMethod === 'card'}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      paymentMethod === 'card'
                        ? 'border-brand-black bg-gray-50 shadow-md'
                        : 'border-gray-200 hover:border-brand-black bg-white'
                    }`}
                  >
                    <div className="text-3xl mb-1" aria-hidden="true">💳</div>
                    <div className="font-extrabold text-brand-black">Card</div>
                    <div className="text-xs text-gray-500 mt-0.5">Visa / Mastercard</div>
                  </button>
                )}
              </div>
            </fieldset>

            {/* M-Pesa info */}
            {paymentMethod === 'mpesa' && (
              <div className="bg-green-50 border-l-4 border-brand-green rounded-lg p-4" role="note">
                <p className="text-sm text-green-800 font-semibold mb-1">How M-Pesa works:</p>
                <p className="text-sm text-green-700">
                  After clicking Donate, an STK push will be sent to your phone number. Enter your
                  M-Pesa PIN to complete the payment.
                </p>
              </div>
            )}

            {/* Card info — no raw card fields! */}
            {paymentMethod === 'card' && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5" role="note">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0" aria-hidden="true">🔒</span>
                  <div>
                    <p className="text-sm text-gray-800 font-semibold mb-1">Secure Card Payment</p>
                    <p className="text-sm text-gray-600">
                      Clicking &quot;Donate&quot; will open a secure Flutterwave payment window where you&apos;ll
                      enter your card details. Your card information never touches our server.
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs bg-white border border-gray-200 rounded px-2 py-1 font-medium">Visa</span>
                      <span className="text-xs bg-white border border-gray-200 rounded px-2 py-1 font-medium">Mastercard</span>
                      <span className="text-xs bg-white border border-gray-200 rounded px-2 py-1 font-medium">Verve</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!selectedAmount || isProcessing}
              aria-busy={isProcessing}
              className={`w-full py-4 rounded-xl font-extrabold text-lg transition-all ${
                !selectedAmount || isProcessing
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-brand-green hover:bg-brand-greenlt text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {isProcessing
                ? '⏳ Processing...'
                : selectedAmount
                  ? `💚 Donate KES ${parseInt(selectedAmount).toLocaleString()}`
                  : 'Select an amount to continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
