import Link from 'next/link'

type ListingDetailPageProps = {
  params: {
    id: string
  }
}

export default function ListingDetailPage({ params }: ListingDetailPageProps) {
  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold text-foreground">Listing Details</h1>
      <p className="mt-2 text-muted-foreground">Viewing listing ID: {params.id}</p>

      <div className="theme-panel mt-6 p-6">
        <p className="text-sm text-foreground">
          This is a placeholder detail page so property cards no longer open a 404 route.
        </p>
        <div className="mt-4">
          <Link href="/" className="cta-electric">
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  )
}
