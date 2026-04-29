import InfoPageShell from '@/components/InfoPageShell'

export default function PrivacyPolicyPage() {
  return (
    <InfoPageShell
      eyebrow="Legal"
      title="Privacy policy summary"
      description="We only collect and process data needed to provide listings, accounts, trust features, and support flows."
      points={[
        'Account details are used for authentication and profile features.',
        'Listing interactions support search and recommendations.',
        'Issue reports are retained for safety and bug resolution.',
        'Support requests may include contact and diagnostic metadata.',
      ]}
      primaryHref="/terms-of-service"
      primaryLabel="Read terms"
    />
  )
}
