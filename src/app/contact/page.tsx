import InfoPageShell from '@/components/InfoPageShell'

export default function ContactPage() {
  return (
    <InfoPageShell
      eyebrow="Contact"
      title="Reach the Uninest support team"
      description="Need help with account access, listing issues, or viewing support? Reach us through our support channels."
      points={[
        'Email support: support@uninest.app',
        'General inquiries: hello@uninest.app',
        'Priority reports: safety@uninest.app',
        'Include listing ID and screenshots when possible.',
      ]}
      primaryHref="mailto:support@uninest.app"
      primaryLabel="Email support"
      secondaryHref="/help-center"
      secondaryLabel="Open help center"
    />
  )
}
