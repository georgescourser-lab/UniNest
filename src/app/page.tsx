import Link from 'next/link'
import { cookies } from 'next/headers'
import { ArrowRight, BadgeCheck, MapPin, Search, ShieldCheck, Sparkles, Users } from 'lucide-react'
import ListingCard from '@/components/ListingCard'
import { createClient } from '@/utils/supabase/server'
import { getPropertiesWithFilters } from '@/utils/supabase/queries'

type ApiListing = {
  id: string
  title: string
  description?: string
  price: number
  bookingFee?: number | null
  bedrooms: number
  bathrooms: number
  area: string
  location: string
  latitude?: number | null
  longitude?: number | null
  images?: string[]
  isVerifiedProperty?: boolean
  roommateWanted?: boolean
  reviewCount?: number
  averageRating?: number
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

const heroStats = [
  { label: 'Verified listings', value: 'Live feed' },
  { label: 'Viewing fee', value: 'Zero on platform' },
  { label: 'Roommate matching', value: 'Lifestyle aware' },
  { label: 'Locations', value: 'KU belt only' },
]

const pillars = [
  {
    title: 'Search smarter',
    body: 'Filter bedsitters, hostels, and roommate-ready units near KU without noise.',
    icon: Search,
  },
  {
    title: 'Verify before you go',
    body: 'Track trusted listings, landlord docs, and a clean viewing flow before you commit.',
    icon: ShieldCheck,
  },
  {
    title: 'Book a viewing',
    body: 'Let a guide escort you to the vacant house and agree the fee later after the visit.',
    icon: MapPin,
  },
]

const quickLinks = [
  { href: '/search', label: 'Browse listings' },
  { href: '/dashboard', label: 'Open dashboard' },
  { href: '/roommate-match', label: 'Roommate quiz' },
  { href: '/post-listing', label: 'Post property' },
]

async function getFeaturedListings(): Promise<FeaturedListing[]> {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { properties } = await getPropertiesWithFilters(supabase, { limit: 6 })

    const listings = properties.map(normalizeListing)
    return listings.length > 0 ? listings : fallbackListings
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
  {
    id: 'fallback-3',
    title: 'Shared 2BR With Balcony',
    price: 17500,
    area: 'Kahawa Sukari',
    location: 'Secure estate',
    bedrooms: 2,
    bathrooms: 1,
    image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=900&h=700&fit=crop',
    latitude: 1.945,
    longitude: 36.882,
    isVerifiedProperty: true,
    reviewCount: 8,
    averageRating: 4.7,
    category: 'HOSTEL',
    capacity: 'TWO_SHARING',
  },
]

export const metadata = {
  title: 'Uninest | Trusted Student Housing for Comrades',
  description:
    'Find verified bedsitters and hostels around KU with zero viewing fees, safer booking, and roommate matching built for comrades.',
}

export default async function Page() {
  const featuredListings = await getFeaturedListings()

  return (
    <div className="section-wrap py-8 md:py-10">
      <section className="surface-card overflow-hidden p-6 md:p-8 lg:p-10">
        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-electric-blue/30 bg-electric-blue/10 px-3 py-1 text-xs font-semibold text-electric-blue">
              <Sparkles size={14} />
              Live housing for KU comrades
            </div>

            <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              Find a safe place to stay near KU without the ghost-developer drama.
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
              Browse verified bedsitters and hostels, match with compatible roommates, and book viewing help when you need a guide to the vacant house.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/search" className="cta-electric gap-2">
                <Search size={16} />
                Browse listings
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-electric-blue hover:text-electric-blue"
              >
                <Users size={16} />
                Open dashboard
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {heroStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-background p-5 md:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-electric-blue">Quick access</p>
                <h2 className="mt-1 font-display text-2xl font-bold text-foreground">Jump to the main flows</h2>
              </div>
              <BadgeCheck className="text-electric-green" size={22} />
            </div>

            <div className="mt-5 grid gap-3">
              {pillars.map((pillar) => {
                const Icon = pillar.icon
                return (
                  <div key={pillar.title} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-electric-green/15 p-2 text-electric-green">
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{pillar.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{pillar.body}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-electric-blue hover:text-electric-blue"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="surface-card p-6">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-electric-blue">How it works</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-foreground">Built for a cleaner housing flow</h2>

          <div className="mt-6 space-y-4">
            {[
              'Search the live feed and filter by area, budget, and trust level.',
              'Open a listing for details, then compare it against your roomie profile.',
              'Request a viewing guide and agree the fee later after the visit.',
            ].map((step, index) => (
              <div key={step} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-electric-blue/10 text-sm font-bold text-electric-blue">
                  {index + 1}
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-electric-blue/20 bg-electric-blue/10 p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-electric-blue" />
              <p className="text-sm font-semibold text-foreground">Trust & safety first</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Verified badges, landlord checks, and viewing guidance are part of the flow so the platform stays useful, not noisy.
            </p>
          </div>
        </div>

        <div className="surface-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-electric-blue">Featured listings</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-foreground">Live cards from the app</h2>
            </div>
            <Link href="/search" className="inline-flex items-center gap-2 text-sm font-medium text-electric-blue">
              View all
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 surface-card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-electric-blue">Popular areas</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-foreground">Common KU housing belts</h2>
          </div>
          <Link href="/areas" className="inline-flex items-center gap-2 text-sm font-medium text-electric-blue">
            Browse areas
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {['Kahawa Wendani', 'Kahawa Sukari', 'KM', 'Mwihoko', 'Githurai 44', 'Githurai 45', 'Ruiru'].map((area) => (
            <Link
              key={area}
              href={`/search?area=${encodeURIComponent(area)}`}
              className="rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground transition hover:border-electric-blue hover:text-electric-blue"
            >
              {area}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
