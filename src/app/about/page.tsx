import InfoPageShell from '@/components/InfoPageShell'

export default function AboutPage() {
  return (
    <InfoPageShell
      eyebrow="About Uninest"
      title="Housing support built for KU comrades"
      description="Uninest helps students find trusted houses near KU with a cleaner flow for discovery, reviews, and viewing coordination."
      points={[
        'Verified listing badges for safer decisions.',
        'Roommate matching to reduce guesswork.',
        'Area-aware search around the KU belt.',
        'Viewing coordination with transparent expectations.',
      ]}
    />
  )
}
