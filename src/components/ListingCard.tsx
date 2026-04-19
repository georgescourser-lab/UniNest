'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BadgeCheck, BedSingle, Home, MapPin, Star, Users } from 'lucide-react'
import { calculateDistanceToKU, formatDistance } from '@/lib/distance-calculator'
import type { ListingCapacity, ListingCategory } from '@/components/FilterPanel'

interface ListingCardProps {
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
  reviewCount?: number
  averageRating?: number
  category?: ListingCategory
  capacity?: ListingCapacity
}

const capacityLabel: Record<ListingCapacity, string> = {
  SINGLE: 'Single',
  TWO_SHARING: '2-sharing',
}

const categoryLabel: Record<ListingCategory, string> = {
  BEDSITTER: 'Bedsitter',
  HOSTEL: 'Hostel',
}

export const ListingCard: React.FC<ListingCardProps> = ({
  id,
  title,
  price,
  area,
  location,
  bedrooms,
  bathrooms,
  image,
  latitude,
  longitude,
  isVerifiedProperty,
  reviewCount = 0,
  averageRating = 4.4,
  category = 'BEDSITTER',
  capacity = 'SINGLE',
}) => {
  const distanceInfo = calculateDistanceToKU(latitude, longitude)

  return (
    <Link href={`/listing/${id}`}>
      <article className="surface-card group h-full overflow-hidden transition-transform duration-300 hover:-translate-y-0.5">
        <div className="relative h-52 overflow-hidden bg-muted">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
          />

          {isVerifiedProperty && (
            <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-electric-blue px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg">
              <BadgeCheck size={14} />
              Verified
            </div>
          )}

          <div className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
            {formatDistance(distanceInfo.distanceKm)} to KU
          </div>
        </div>

        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 text-base font-semibold text-foreground">{title}</h3>
            <p className="whitespace-nowrap text-sm font-bold text-electric-green">
              KES {price.toLocaleString()}
            </p>
          </div>

          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin size={14} />
            {location}, {area}
          </p>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs text-foreground">
              <Home size={13} />
              {categoryLabel[category]}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs text-foreground">
              <Users size={13} />
              {capacityLabel[capacity]}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs text-foreground">
              <BedSingle size={13} />
              {bedrooms} bed / {bathrooms} bath
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              {averageRating.toFixed(1)} ({reviewCount})
            </span>
            <span className="font-medium text-electric-blue">Zero viewing fee</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

export default ListingCard
