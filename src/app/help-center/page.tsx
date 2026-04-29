import InfoPageShell from '@/components/InfoPageShell'

export default function HelpCenterPage() {
  return (
    <InfoPageShell
      eyebrow="Help Center"
      title="Get support for common tasks"
      description="Use this page as a quick guide for common account, search, and listing issues."
      points={[
        'Log in or sign up from the top navigation.',
        'Use Search and Areas to find nearby options.',
        'Open Dashboard for profile and action history.',
        'Submit issue reports when something breaks.',
      ]}
      primaryHref="/faq"
      primaryLabel="Read FAQ"
      secondaryHref="/contact"
      secondaryLabel="Contact support"
    />
  )
}
