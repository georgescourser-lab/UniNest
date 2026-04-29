import InfoPageShell from '@/components/InfoPageShell'

export default function ReportIssuePage() {
  return (
    <InfoPageShell
      eyebrow="Report Issue"
      title="Tell us what is broken"
      description="If links, listings, or workflows fail, send details so we can reproduce and fix quickly."
      points={[
        'Include page URL and timestamp.',
        'Share browser/device details when possible.',
        'Attach screenshots of visible errors.',
        'Mention if this blocks searching or payments.',
      ]}
      primaryHref="mailto:support@uninest.app?subject=Uninest%20Issue%20Report"
      primaryLabel="Send report"
      secondaryHref="/help-center"
      secondaryLabel="Back to help center"
    />
  )
}
