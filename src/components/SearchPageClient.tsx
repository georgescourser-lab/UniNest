'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import FilterPanel, {
  type FilterOptions,
  type ListingCapacity,
  type ListingCategory,
} from '@/components/FilterPanel'
import PropertyFeed, { type PropertyFeedItem } from '@/components/PropertyFeed'

interface ApiProperty {
  id: string
  title: string
  price: number | string
  area: string
  zone?: string
  location: string
  bedrooms: number
  bathrooms: number
  images?: string[]
  latitude: number | string
  longitude: number | string
  isVerifiedProperty?: boolean
  verificationStatus?: string
  reviewCount?: number
  averageRating?: number
  propertyType?: string
  capacity?: string
}

interface ApiResponse {
  data: ApiProperty[]
}

const areaNameMap: Record<string, string> = {
  KAHAWA_WENDANI: 'Kahawa Wendani',
  KAHAWA_SUKARI: 'Kahawa Sukari',
  KM: 'KM',
  MWIHOKO: 'Mwihoko',
  GITHURAI_44: 'Githurai',
  GITHURAI_45: 'Githurai',
  RUIRU: 'Ruiru',
}

const categoryFromType = (type?: string): ListingCategory => {
  if (type === 'HOSTEL') {
    return 'HOSTEL'
  }

  return 'BEDSITTER'
}

const capacityFromListing = (input: ApiProperty): ListingCapacity => {
  if (input.capacity === 'TWO_SHARING') {
    return 'TWO_SHARING'
  }

  if (input.bedrooms >= 2) {
    return 'TWO_SHARING'
  }

  return 'SINGLE'
}

const initialFilters: FilterOptions = {
  areas: [],
  categories: [],
  capacities: [],
  priceMin: 3000,
  priceMax: 35000,
  onlyVerified: false,
}

export default function SearchPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [allListings, setAllListings] = useState<PropertyFeedItem[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('query') || '')
  const [filters, setFilters] = useState<FilterOptions>(initialFilters)

  useEffect(() => {
    const loadListings = async () => {
      try {
        const response = await fetch('/api/listings', { cache: 'no-store' })
        if (!response.ok) {
          return
        }

        const payload = (await response.json()) as ApiResponse
        const normalized = payload.data.map<PropertyFeedItem>((item) => {
          const areaCode = String(item.area || '')
          return {
            id: item.id,
            title: item.title,
            price: Number(item.price),
            area: areaNameMap[areaCode] || item.zone || item.area,
            location: item.location,
            bedrooms: item.bedrooms,
            bathrooms: item.bathrooms,
            image:
              item.images?.[0] ||
              'https://images.unsplash.com/photo-1493666438817-866a91353ca9?w=800&h=600&fit=crop',
            latitude: Number(item.latitude),
            longitude: Number(item.longitude),
            isVerifiedProperty:
              Boolean(item.isVerifiedProperty) || item.verificationStatus === 'VERIFIED',
            reviewCount: item.reviewCount || 0,
            averageRating: item.averageRating || 4.2,
            category: categoryFromType(item.propertyType),
            capacity: capacityFromListing(item),
          }
        })

        setAllListings(normalized)
      } catch {
        setAllListings([])
      }
    }

    loadListings()
  }, [])

  useEffect(() => {
    const query = searchParams?.get('query') || ''
    const area = searchParams?.get('area') || ''

    setSearchQuery(query)
    setFilters((current) => ({
      ...current,
      areas: area ? [area] : current.areas,
    }))
  }, [searchParams])

  const filteredListings = useMemo(() => {
    return allListings.filter((listing) => {
      if (filters.areas.length > 0 && !filters.areas.includes(listing.area)) {
        return false
      }

      if (filters.categories.length > 0 && !filters.categories.includes(listing.category)) {
        return false
      }

      if (filters.capacities.length > 0 && !filters.capacities.includes(listing.capacity)) {
        return false
      }

      if (listing.price < filters.priceMin || listing.price > filters.priceMax) {
        return false
      }

      if (filters.onlyVerified && !listing.isVerifiedProperty) {
        return false
      }

      if (searchQuery.trim().length > 0) {
        const haystack = `${listing.title} ${listing.location} ${listing.area}`.toLowerCase()
        if (!haystack.includes(searchQuery.trim().toLowerCase())) {
          return false
        }
      }

      return true
    })
  }, [allListings, filters, searchQuery])

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
  }

  const handleReset = () => {
    setSearchQuery('')
    setFilters(initialFilters)
    router.push('/search')
  }

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next = searchQuery.trim()
    router.push(next ? `/search?query=${encodeURIComponent(next)}` : '/search')
  }

  return (
    <div className="section-wrap py-8 md:py-10">
      <div className="mb-6 surface-card p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-electric-blue">
              Student Dashboard
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">
              Property Feed
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Find trusted bedsitters and hostels around KU with zero viewing fees.
            </p>
          </div>

          <div className="rounded-xl border border-electric-blue/40 bg-electric-blue/10 px-3 py-2 text-sm text-foreground">
            <span className="font-semibold text-electric-blue">{filteredListings.length}</span> listings match
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="mt-5">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by area, title, or landmark"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-xl border border-border bg-card px-10 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button type="submit" className="cta-electric">
              Search
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground"
          >
            <SlidersHorizontal size={18} />
            {isFilterOpen ? 'Hide filters' : 'Show filters'}
          </button>

          {isFilterOpen && (
            <div className="mt-4">
              <FilterPanel onFilterChange={handleFilterChange} initialFilters={filters} />
            </div>
          )}
        </div>

        <div className="hidden lg:block">
          <FilterPanel onFilterChange={handleFilterChange} initialFilters={filters} />
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {filters.areas.map((area) => (
              <span key={area} className="rounded-full border border-border bg-background px-3 py-1 text-muted-foreground">
                {area}
              </span>
            ))}
            {filters.categories.map((category) => (
              <span key={category} className="rounded-full border border-border bg-background px-3 py-1 text-muted-foreground">
                {category === 'BEDSITTER' ? 'Bedsitter' : 'Hostel'}
              </span>
            ))}
            {filters.capacities.map((capacity) => (
              <span key={capacity} className="rounded-full border border-border bg-background px-3 py-1 text-muted-foreground">
                {capacity === 'SINGLE' ? 'Single' : '2-sharing'}
              </span>
            ))}
            {(filters.areas.length > 0 ||
              filters.categories.length > 0 ||
              filters.capacities.length > 0 ||
              filters.onlyVerified ||
              searchQuery.trim().length > 0 ||
              filters.priceMin !== initialFilters.priceMin ||
              filters.priceMax !== initialFilters.priceMax) && (
              <button
                type="button"
                onClick={handleReset}
                className="rounded-full border border-electric-blue/50 px-3 py-1 font-semibold text-electric-blue"
              >
                Clear all
              </button>
            )}
          </div>

          <PropertyFeed listings={filteredListings} onReset={handleReset} />
        </div>
      </div>
    </div>
  )
}
