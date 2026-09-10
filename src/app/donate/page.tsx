import PageHeader from '@/components/PageHeader';

const ZENLIPA_DONATION_URL = 'https://maiywa.zenlipa.co.ke/c/FPA4Wp';

export const metadata = {
  title: 'Donate | Isaac Maiywa',
  description: 'Support the Isaac Maiywa campaign through the secure Zenlipa donation portal.',
};

export default function DonatePage() {
  return (
    <div className="bg-white text-brand-black">
      <PageHeader
        label="Support the Campaign"
        title="Make a Secure Contribution"
        subtitle="Your support helps build a campaign for accountable representation, development, and opportunity."
      />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-brand-yellow/50 bg-brand-yellow/10 p-5 text-sm text-gray-700">
          <p className="font-extrabold text-brand-black">Secure donation portal</p>
          <p className="mt-1">The contribution form below is provided securely by Zenlipa. Your payment details are entered directly with the payment provider, not stored by this website.</p>
        </section>

        <div className="mt-6 overflow-hidden rounded-2xl border bg-white shadow-sm">
          <iframe
            src={ZENLIPA_DONATION_URL}
            title="Isaac Maiywa campaign donation portal"
            className="h-[780px] w-full border-0"
            loading="eager"
            allow="payment *"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>

        {/* <div className="mt-5 rounded-xl border bg-gray-50 p-5 text-center">
          <p className="text-sm text-gray-600">If the donation form does not load or you prefer to donate in a separate tab, use the secure portal directly.</p>
          <a
            href={ZENLIPA_DONATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex rounded-lg bg-brand-green px-6 py-3 text-sm font-extrabold text-white transition-colors hover:bg-brand-greenlt"
          >
            Open secure donation portal →
          </a>
        </div> */}
      </main>
    </div>
  );
}
