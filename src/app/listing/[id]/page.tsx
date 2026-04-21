import Image from 'next/image'
import Link from 'next/link'
import { cookies } from 'next/headers'
import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  MapPin,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react'
import ListingCard from '@/components/ListingCard'
import { createClient } from '@/utils/supabase/server'
import { getPropertyById, getPropertiesWithFilters } from '@/utils/supabase/queries'
import { calculateDistanceToKU, formatDistance } from '@/lib/distance-calculator'

type PageProps = {
  params: {
    id: string
  }
}

type FeaturedListing = {
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
  category: 'BEDSITTER' | 'HOSTEL'
  capacity: 'SINGLE' | 'TWO_SHARING'
}

const areaNameMap: Record<string, string> = {
  KAHAWA_WENDANI: 'Kahawa Wendani',
  KAHAWA_SUKARI: 'Kahawa Sukari',
  KM: 'KU KM',
  MWIHOKO: 'Mwihoko',
  GITHURAI_44: 'Githurai 44',
  GITHURAI_45: 'Githurai 45',
  RUIRU: 'Ruiru',
  KAHAWA: 'Kahawa',
  KWARE: 'Kware',
}

async function fetchListings(limit: number): Promise<FeaturedListing[]> {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { properties } = await getPropertiesWithFilters(supabase, { limit })

    return properties.map(normalizeListing)
  } catch {
    return fallbackListings
  }
}

function normalizeListing(listing: {
  id: string
  title: string
  price: number
  bookingFee?: number | null
  bedrooms: number
  bathrooms: number
  area: string
  location: string
  latitude: number | null
  longitude: number | null
  images: string[]
  isVerifiedProperty: boolean
  roommateWanted: boolean
  reviewCount: number
  averageRating: number
}): FeaturedListing {
  return {
    id: listing.id,
    title: listing.title,
    price: Number(listing.bookingFee || listing.price),
    area: areaNameMap[listing.area] || listing.area,
    location: listing.location,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    image:
      listing.images?.[0] ||
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&h=700&fit=crop',
    latitude: listing.latitude ?? 1.944,
    longitude: listing.longitude ?? 36.879,
    isVerifiedProperty: Boolean(listing.isVerifiedProperty),
    reviewCount: listing.reviewCount || 0,
    averageRating: listing.averageRating || 4.5,
    category: listing.roommateWanted ? 'HOSTEL' : 'BEDSITTER',
    capacity: listing.roommateWanted || listing.bedrooms >= 2 ? 'TWO_SHARING' : 'SINGLE',
  }
}

const fallbackListings: FeaturedListing[] = [
  {
    id: 'fallback-1',
    title: 'Sunny Bedsitter Near Main Gate',
    price: 12000,
    area: 'Kahawa Wendani',
    location: 'Close to Main Gate',
    bedrooms: 1,
    bathrooms: 1,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&h=700&fit=crop',
    latitude: 1.944,
    longitude: 36.879,
    isVerifiedProperty: true,
    reviewCount: 12,
    averageRating: 4.8,
    category: 'BEDSITTER',
    capacity: 'SINGLE',
  },
  {
    id: 'fallback-2',
    title: 'Quiet Single Room With WiFi',
    price: 8500,
    area: 'Githurai 44',
    location: 'Near shopping center',
    bedrooms: 1,
    bathrooms: 1,
    image: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=900&h=700&fit=crop',
    latitude: 1.9425,
    longitude: 36.886,
    isVerifiedProperty: false,
    reviewCount: 5,
    averageRating: 4.1,
    category: 'HOSTEL',
    capacity: 'SINGLE',
  },
]

export default async function ListingDetailPage({ params }: PageProps) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const [selectedProperty, allListings] = await Promise.all([
    getPropertyById(supabase, params.id),
    fetchListings(30),
  ])

  const selectedListing = selectedProperty
    ? normalizeListing({
        id: selectedProperty.id,
        title: selectedProperty.title,
        price: selectedProperty.price,
        bookingFee: selectedProperty.bookingFee,
        bedrooms: selectedProperty.bedrooms,
        bathrooms: selectedProperty.bathrooms,
        area: selectedProperty.area,
        location: selectedProperty.location,
        latitude: selectedProperty.latitude,
        longitude: selectedProperty.longitude,
        images: selectedProperty.images,
        isVerifiedProperty: selectedProperty.isVerifiedProperty,
        roommateWanted: selectedProperty.roommateWanted,
        reviewCount: selectedProperty.reviewCount,
        averageRating: selectedProperty.averageRating,
      })
    : allListings.find((listing) => listing.id === params.id) || allListings[0]
  const relatedListings = allListings.filter((listing) => listing.id !== selectedListing?.id).slice(0, 4)

  if (!selectedListing) {
    return (
      <section className="section-wrap py-10">
        <div className="surface-card p-6">
          <h1 className="font-display text-3xl font-bold text-foreground">Listing not found</h1>
          <p className="mt-2 text-muted-foreground">We could not load this property, but you can still browse live listings.</p>
          <div className="mt-4">
            <Link href="/search" className="cta-electric">
              Browse listings
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const distanceKm = calculateDistanceToKU(selectedListing.latitude, selectedListing.longitude).distanceKm

  return (
    <div className="section-wrap py-8 md:py-10">
      <div className="mb-5 flex items-center justify-between gap-3">
        <Link href="/search" className="inline-flex items-center gap-2 text-sm font-medium text-electric-blue">
          <ArrowLeft size={16} />
          Back to search
        </Link>
        <Link href="/dashboard" className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground">
          Dashboard
        </Link>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="surface-card overflow-hidden">
          <div className="relative h-72 w-full md:h-[28rem]">
            <Image
              src={selectedListing.image}
              alt={selectedListing.title}
              fill
              className="object-cover"
              priority
            />
            {selectedListing.isVerifiedProperty && (
              <div className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-electric-blue px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
                <BadgeCheck size={14} />
                Verified listing
              </div>
            )}
            <div className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
              {formatDistance(distanceKm)} to KU
            </div>
          </div>

          <div className="space-y-5 p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{selectedListing.area}</p>
                <h1 className="mt-1 font-display text-3xl font-bold text-foreground md:text-4xl">{selectedListing.title}</h1>
                <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin size={14} />
                  {selectedListing.location}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4 text-right">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Price</p>
                <p className="mt-1 text-2xl font-bold text-electric-green">KES {selectedListing.price.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Booking fee or monthly entry</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <InfoTile label="Bedrooms" value={`${selectedListing.bedrooms}`} />
              <InfoTile label="Bathrooms" value={`${selectedListing.bathrooms}`} />
              <InfoTile label="Reviews" value={`${selectedListing.reviewCount}`} />
            </div>

            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-electric-blue" />
                <p className="text-sm font-semibold text-foreground">Why this listing appears here</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Live data, trusted listing status, and a direct path back into the housing flow. Use the dashboard to request a viewing guide and keep the fee agreement until after the visit.
              </p>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="surface-card p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">At a glance</p>
                <h2 className="mt-1 font-display text-2xl font-bold text-foreground">Quick facts</h2>
              </div>
              <Star size={22} className="fill-yellow-400 text-yellow-400" />
            </div>

            <div className="mt-5 grid gap-3">
              <FactRow label="Distance to KU" value={`${formatDistance(distanceKm)}`} />
              <FactRow label="Verification" value={selectedListing.isVerifiedProperty ? 'Verified' : 'Pending review'} />
              <FactRow label="Category" value={selectedListing.category} />
              <FactRow label="Sharing" value={selectedListing.capacity} />
            </div>

            <div className="mt-5 rounded-2xl border border-electric-blue/20 bg-electric-blue/10 p-4">
              <div className="flex items-center gap-2">
                <CalendarClock size={16} className="text-electric-blue" />
                <p className="text-sm font-semibold text-foreground">Next step</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Open the dashboard to request a viewing, or use search to compare this property with similar units nearby.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/dashboard" className="cta-electric">
                  Request viewing
                </Link>
                <Link href="/search" className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground">
                  Compare more
                </Link>
              </div>
            </div>
          </div>

          <div className="surface-card p-6">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-electric-blue" />
              <p className="text-sm font-semibold text-foreground">Trust signals</p>
            </div>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <p>Verified badges come from the trust and safety workflow.</p>
              <p>Viewing fees are agreed after the visit, not before.</p>
              <p>Roommate-ready listings can be matched through the compatibility quiz.</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-8 surface-card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-electric-blue">More listings</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-foreground">Similar units to keep browsing</h2>
          </div>
          <Link href="/search" className="inline-flex items-center gap-2 text-sm font-medium text-electric-blue">
            View all
            <ArrowLeft size={16} className="rotate-180" />
          </Link>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {(relatedListings.length > 0 ? relatedListings : fallbackListings)
            .slice(0, 4)
            .map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
        </div>
      </section>
    </div>
  )
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  )
}
