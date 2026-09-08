import PollDetailClient from '@/components/polls/PollDetailClient';

export default function PollPage({ params }: { params: { slug: string } }) {
  return <PollDetailClient slug={params.slug} />;
}
