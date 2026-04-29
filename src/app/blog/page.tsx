import InfoPageShell from '@/components/InfoPageShell'

export default function BlogPage() {
  return (
    <InfoPageShell
      eyebrow="Blog"
      title="Student housing tips and updates"
      description="We publish practical guidance for first-time renters, move-in planning, and shared-living decisions."
      points={[
        'Budgeting for rent, utilities, and deposits.',
        'How to compare listings quickly and safely.',
        'What to ask during a house viewing.',
        'How to align roommate expectations early.',
      ]}
      primaryHref="/areas"
      primaryLabel="Explore areas"
    />
  )
}
