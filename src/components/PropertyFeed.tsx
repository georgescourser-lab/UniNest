import React from 'react'
import ListingCard from '@/components/ListingCard'
import type { ListingCapacity, ListingCategory } from '@/components/FilterPanel'

export interface PropertyFeedItem {
  id: string
  title: string
  price: number
  area: string
  location: string
  bedrooms: number
  bathrooms: number
  image: string
  latitude: number
  longitude: number
  isVerifiedProperty: boolean
  reviewCount: number
  averageRating: number
  category: ListingCategory
  capacity: ListingCapacity
}

interface PropertyFeedProps {
  listings: PropertyFeedItem[]
  onReset: () => void
}

export default function PropertyFeed({ listings, onReset }: PropertyFeedProps) {
  if (listings.length === 0) {
    return (
      <div className="surface-card p-10 text-center">
        <h3 className="font-display text-2xl font-bold text-foreground">No matches yet</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Try widening your price range or switching between bedsitters and hostels.
        </p>
        <button type="button" onClick={onReset} className="cta-electric mt-6">
          Clear filters
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          id={listing.id}
          title={listing.title}
          price={listing.price}
          area={listing.area}
          location={listing.location}
          bedrooms={listing.bedrooms}
          bathrooms={listing.bathrooms}
          image={listing.image}
          latitude={listing.latitude}
          longitude={listing.longitude}
          isVerifiedProperty={listing.isVerifiedProperty}
          reviewCount={listing.reviewCount}
          averageRating={listing.averageRating}
          category={listing.category}
          capacity={listing.capacity}
        />
      ))}
    </div>
  )
}
