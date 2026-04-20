import Link from 'next/link'

const areas = [
  'Kahawa Wendani',
  'KM',
  'Kahawa Sukari',
  'Mwihoko',
  'Githurai 44',
  'Githurai 45',
  'Ruiru',
]

export default function AreasPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold text-foreground">KU Housing Areas</h1>
      <p className="mt-2 text-muted-foreground">Browse all neighborhoods commonly used by KU comrades.</p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {areas.map((area) => (
          <div key={area} className="theme-panel p-4 text-foreground">
            {area}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Link href="/search" className="cta-electric">
          Explore Listings
        </Link>
      </div>
    </section>
  )
}
