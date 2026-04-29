import InfoPageShell from '@/components/InfoPageShell'

export default function FaqPage() {
  return (
    <InfoPageShell
      eyebrow="FAQ"
      title="Frequently asked housing questions"
      description="Quick answers about listings, viewing, roommate matching, and account flows on Uninest."
      points={[
        'Use Search to filter by area, price, and trust signals.',
        'Open any listing card for details and related options.',
        'Use Roommate Match to improve compatibility outcomes.',
        'Use your dashboard for saved actions and requests.',
      ]}
      primaryHref="/search"
      primaryLabel="Open search"
    />
  )
}
