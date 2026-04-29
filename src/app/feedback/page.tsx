import InfoPageShell from '@/components/InfoPageShell'

export default function FeedbackPage() {
  return (
    <InfoPageShell
      eyebrow="Feedback"
      title="Help improve the platform"
      description="Your comments on search quality, listing clarity, and dashboard flows help us improve the product quickly."
      points={[
        'Share what is confusing or slow.',
        'Recommend improvements to filtering and cards.',
        'Report areas that need clearer details.',
        'Tell us which workflows save you time.',
      ]}
      primaryHref="/report-issue"
      primaryLabel="Report an issue"
      secondaryHref="/contact"
      secondaryLabel="Contact support"
    />
  )
}
