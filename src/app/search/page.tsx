import { Suspense } from 'react'
import SearchPageClient from '@/components/SearchPageClient'

function SearchPageFallback() {
  return (
    <div className="section-wrap py-8 md:py-10">
      <div className="surface-card p-6 text-sm text-muted-foreground">
        Loading search experience...
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchPageClient />
    </Suspense>
  )
}
