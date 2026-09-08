import PollDetailClient from '@/components/polls/PollDetailClient';

export const metadata = {
  title: 'Opinion Poll | Isaac Maiywa',
  description: 'Take part in the current Isaac Maiywa campaign opinion poll.',
};

export default function DefaultPollPage() {
  return <PollDetailClient />;
}
