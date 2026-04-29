import InfoPageShell from '@/components/InfoPageShell'

export default function ReviewsPage() {
  return (
    <InfoPageShell
      eyebrow="Community Reviews"
      title="Feedback that helps better housing decisions"
      description="Review signals are used to highlight consistent quality and improve trust across listings."
      points={[
        'Star ratings summarize student experiences.',
        'Verified data helps reduce listing uncertainty.',
        'Recent feedback highlights current conditions.',
        'Use reviews together with location and price filters.',
      ]}
      primaryHref="/search"
      primaryLabel="View rated listings"
    />
  )
}
