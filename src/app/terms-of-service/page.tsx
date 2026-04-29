import InfoPageShell from '@/components/InfoPageShell'

export default function TermsOfServicePage() {
  return (
    <InfoPageShell
      eyebrow="Legal"
      title="Terms of service summary"
      description="Using Uninest means following listing integrity, respectful communication, and lawful platform usage standards."
      points={[
        'Users must provide accurate account and listing data.',
        'Fraudulent or abusive behavior is not permitted.',
        'Trust and safety rules apply to all interactions.',
        'Critical violations may result in restricted access.',
      ]}
      primaryHref="/privacy-policy"
      primaryLabel="Read privacy policy"
    />
  )
}
