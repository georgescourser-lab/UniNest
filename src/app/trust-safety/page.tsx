import InfoPageShell from '@/components/InfoPageShell'

export default function TrustSafetyPage() {
  return (
    <InfoPageShell
      eyebrow="Trust & Safety"
      title="Safer housing interactions on Uninest"
      description="Our trust and safety flow aims to keep listing quality high and housing journeys predictable."
      points={[
        'Verification workflow for listings and owners.',
        'Moderation support for suspicious activity reports.',
        'Clear route for issue escalation and follow-up.',
        'Community-first standards for respectful use.',
      ]}
      primaryHref="/admin/trust-safety"
      primaryLabel="Open trust dashboard"
    />
  )
}
