'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  BadgeCheck,
  Bell,
  CheckCircle2,
  CreditCard,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  Target,
  Users,
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface DashboardListing {
  id: string
  title: string
  price: number
  bookingFee?: number | null
  area: string
  zone?: string
  location: string
  images: string[]
  isVerifiedProperty?: boolean
  lookingForRoommate?: boolean
  reviewCount?: number
  averageRating?: number
  owner?: {
    id: string
  }
}

interface DashboardUser {
  id: string
  name: string | null
  email: string
  role: string
}

interface RoommateProfile {
  preferredArea?: string | null
  budgetMin?: number | null
  budgetMax?: number | null
  capacityPreference?: 'SINGLE' | 'TWO_SHARING' | null
  sleepRoutine?: string | null
  cleanlinessPreference?: string | null
  guestPolicy?: string | null
  compatibilityScore?: number | null
}

interface MpesaTransactionSummary {
  id: string
  status: string
  checkoutRequestId?: string | null
  merchantRequestId?: string | null
  amount?: number | string | null
  currency?: string | null
  failedReason?: string | null
  receiptNumber?: string | null
  paidAt?: string | null
  reconciledAt?: string | null
}

interface StkPushResponse {
  message?: string
  error?: string
  transaction?: MpesaTransactionSummary
}

interface LandlordNotification {
  id: string
  title: string
  detail: string
  createdAt: string
}

const quickActions = [
  {
    title: 'Browse Verified Listings',
    description: 'Search bedsitters and hostels around Wendani, Sukari, KM, Mwihoko, Githurai, and Ruiru.',
    href: '/search',
    icon: Search,
  },
  {
    title: 'Roommate Compatibility',
    description: 'Take the quick lifestyle quiz and get matched with comrades who fit your routine.',
    href: '/roommate-match',
    icon: Users,
  },
  {
    title: 'Secure Booking Checkout',
    description: 'Trigger an M-Pesa STK Push for booking fees or deposits without leaving the platform.',
    href: '#checkout',
    icon: CreditCard,
  },
]

const areaPills = ['Kahawa Wendani', 'Kahawa Sukari', 'KM', 'Mwihoko', 'Githurai 44', 'Githurai 45', 'Ruiru']

function getPulseWidthClass(value: number) {
  if (value >= 100) return 'w-full'
  if (value >= 90) return 'w-11/12'
  if (value >= 80) return 'w-10/12'
  if (value >= 70) return 'w-9/12'
  if (value >= 60) return 'w-8/12'
  if (value >= 50) return 'w-7/12'
  if (value >= 40) return 'w-6/12'
  if (value >= 30) return 'w-5/12'
  if (value >= 20) return 'w-4/12'
  return 'w-1/6'
}

export default function DashboardPage() {
  const [listings, setListings] = useState<DashboardListing[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<DashboardUser | null>(null)
  const [roommateProfile, setRoommateProfile] = useState<RoommateProfile | null>(null)
  const [checkoutListingId, setCheckoutListingId] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [amount, setAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [latestCheckoutRequestId, setLatestCheckoutRequestId] = useState('')
  const [latestPaymentStatus, setLatestPaymentStatus] = useState<MpesaTransactionSummary | null>(null)
  const [checkingPaymentStatus, setCheckingPaymentStatus] = useState(false)
  const [landlordNotifications, setLandlordNotifications] = useState<LandlordNotification[]>([])
  const [vacancyUpdatingId, setVacancyUpdatingId] = useState('')

  useEffect(() => {
    const loadListings = async () => {
      try {
        const [listingsResponse, meResponse, roommateResponse] = await Promise.all([
          fetch('/api/listings?limit=8', { cache: 'no-store' }),
          fetch('/api/auth/me', { cache: 'no-store' }),
          fetch('/api/roommate/profile', { cache: 'no-store' }),
        ])

        if (meResponse.ok) {
          const mePayload = (await meResponse.json()) as { user?: DashboardUser }
          setUser(mePayload.user || null)
        }

        if (roommateResponse.ok) {
          const roommatePayload = (await roommateResponse.json()) as {
            profile?: RoommateProfile | null
          }
          setRoommateProfile(roommatePayload.profile || null)
        }

        if (!listingsResponse.ok) {
          return
        }

        const payload = (await listingsResponse.json()) as { data?: DashboardListing[] }

        const normalized = (payload.data || []).map((listing) => ({
          id: listing.id,
          title: listing.title,
          price: Number(listing.price),
          bookingFee: listing.bookingFee ? Number(listing.bookingFee) : null,
          area: listing.area,
          zone: listing.zone,
          location: listing.location,
          images: listing.images || [],
          isVerifiedProperty: listing.isVerifiedProperty,
          lookingForRoommate: listing.lookingForRoommate,
          reviewCount: listing.reviewCount,
          averageRating: listing.averageRating,
          owner: listing.owner,
        }))

        setListings(normalized)
        setCheckoutListingId((current) => current || normalized[0]?.id || '')
      } finally {
        setLoading(false)
      }
    }

    loadListings()
  }, [])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('dashboard-live-vacancy')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'properties' },
        async () => {
          try {
            const response = await fetch('/api/listings?limit=8', { cache: 'no-store' })
            if (!response.ok) {
              return
            }

            const payload = (await response.json()) as { data?: DashboardListing[] }
            const normalized = (payload.data || []).map((listing) => ({
              id: listing.id,
              title: listing.title,
              price: Number(listing.price),
              bookingFee: listing.bookingFee ? Number(listing.bookingFee) : null,
              area: listing.area,
              zone: listing.zone,
              location: listing.location,
              images: listing.images || [],
              isVerifiedProperty: listing.isVerifiedProperty,
              lookingForRoommate: listing.lookingForRoommate,
              reviewCount: listing.reviewCount,
              averageRating: listing.averageRating,
              owner: listing.owner,
            }))

            setListings(normalized)
          } catch {
            // Ignore transient realtime refetch errors.
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (!user || user.role !== 'LANDLORD') {
      setLandlordNotifications([])
      return
    }

    const mapRequestToNotification = (request: {
      id: string
      houseTitle: string
      tenantName: string
      time: string
      createdAt?: string
    }): LandlordNotification => ({
      id: request.id,
      title: `New viewing request for ${request.houseTitle}`,
      detail: `${request.tenantName} · ${request.time}`,
      createdAt: request.createdAt || new Date().toISOString(),
    })

    const loadLandlordNotifications = async () => {
      try {
        const response = await fetch('/api/agent/viewing-requests', { cache: 'no-store' })
        if (!response.ok) {
          return
        }

        const payload = (await response.json()) as {
          data?: Array<{
            id: string
            houseTitle: string
            tenantName: string
            time: string
            ownerUserId?: string | null
            createdAt?: string
          }>
        }

        const notifications = (payload.data || [])
          .filter((item) => item.ownerUserId === user.id)
          .map(mapRequestToNotification)
          .slice(0, 6)

        setLandlordNotifications(notifications)
      } catch {
        setLandlordNotifications([])
      }
    }

    loadLandlordNotifications()

    const supabase = createClient()
    const channel = supabase
      .channel(`landlord-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_viewing_requests',
          filter: `owner_user_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string
            house_title: string
            tenant_name: string
            time_label: string
            created_at: string
          }

          setLandlordNotifications((current) => [
            {
              id: row.id,
              title: `New viewing request for ${row.house_title}`,
              detail: `${row.tenant_name} · ${row.time_label}`,
              createdAt: row.created_at,
            },
            ...current,
          ].slice(0, 6))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, user?.role])

  const selectedListing = useMemo(
    () => listings.find((item) => item.id === checkoutListingId) || listings[0],
    [checkoutListingId, listings]
  )

  const dashboardStats = useMemo(() => {
    const verifiedListings = listings.filter((listing) => listing.isVerifiedProperty).length
    const roommateReady = listings.filter((listing) => listing.lookingForRoommate).length
    const averagePrice = listings.length
      ? Math.round(listings.reduce((sum, listing) => sum + listing.price, 0) / listings.length)
      : 0
    const compatibility = roommateProfile?.compatibilityScore || 0

    return [
      { label: 'Verified listings', value: verifiedListings || listings.length, detail: 'trusted units live' },
      { label: 'Average price', value: `KES ${averagePrice.toLocaleString()}`, detail: 'current market pulse' },
      { label: 'Roommate-ready', value: roommateReady, detail: 'open sharing units' },
      { label: 'Your match score', value: compatibility ? `${compatibility}/100` : 'Set up quiz', detail: 'lifestyle fit' },
    ]
  }, [listings, roommateProfile?.compatibilityScore])

  const areaBreakdown = useMemo(() => {
    const counts = listings.reduce<Record<string, number>>((accumulator, listing) => {
      accumulator[listing.area] = (accumulator[listing.area] || 0) + 1
      return accumulator
    }, {})

    return Object.entries(counts)
      .map(([area, count]) => ({ area, count }))
      .sort((left, right) => right.count - left.count)
  }, [listings])

  const recommendedListings = useMemo(() => {
    const profileMin = roommateProfile?.budgetMin ?? 0
    const profileMax = roommateProfile?.budgetMax ?? Number.MAX_SAFE_INTEGER
    const preferredArea = roommateProfile?.preferredArea

    return listings
      .filter((listing) => listing.price >= profileMin && listing.price <= profileMax)
      .sort((left, right) => {
        const leftScore = (left.isVerifiedProperty ? 20 : 0) + (left.lookingForRoommate ? 8 : 0)
        const rightScore = (right.isVerifiedProperty ? 20 : 0) + (right.lookingForRoommate ? 8 : 0)

        if (preferredArea) {
          if (left.area === preferredArea) {
            return -1
          }

          if (right.area === preferredArea) {
            return 1
          }
        }

        return rightScore - leftScore
      })
      .slice(0, 3)
  }, [listings, roommateProfile?.budgetMax, roommateProfile?.budgetMin, roommateProfile?.preferredArea])

  useEffect(() => {
    if (selectedListing && !amount) {
      setAmount(String(selectedListing.bookingFee || selectedListing.price))
    }
  }, [selectedListing, amount])

  const handleCheckout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/payments/mpesa/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: checkoutListingId,
          phoneNumber,
          amount: Number(amount),
          transactionType: 'BOOKING_FEE',
        }),
      })

      const payload = (await response.json().catch(() => null)) as StkPushResponse | null

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to initiate payment')
      }

      if (payload?.transaction?.checkoutRequestId) {
        setLatestCheckoutRequestId(payload.transaction.checkoutRequestId)
        setLatestPaymentStatus({
          id: payload.transaction.id,
          status: payload.transaction.status,
          checkoutRequestId: payload.transaction.checkoutRequestId,
          merchantRequestId: payload.transaction.merchantRequestId,
        })
      }

      setSuccessMessage(
        payload?.message || 'STK Push sent. Check your phone and complete the booking securely.'
      )
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Could not initiate checkout right now.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const checkPaymentStatus = async () => {
    if (!latestCheckoutRequestId) {
      return
    }

    setCheckingPaymentStatus(true)

    try {
      const response = await fetch(`/api/payments/mpesa/status/${latestCheckoutRequestId}`, {
        cache: 'no-store',
      })

      const payload = (await response.json().catch(() => null)) as
        | { transaction?: MpesaTransactionSummary; error?: string }
        | null

      if (!response.ok) {
        throw new Error(payload?.error || 'Could not fetch payment status')
      }

      if (payload?.transaction) {
        setLatestPaymentStatus(payload.transaction)
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Could not fetch payment status right now.'
      )
    } finally {
      setCheckingPaymentStatus(false)
    }
  }

  const handleMarkOccupied = async (listingId: string) => {
    setVacancyUpdatingId(listingId)
    try {
      const response = await fetch(`/api/listings/${listingId}/vacancy`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false }),
      })

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to update vacancy status')
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update vacancy status')
    } finally {
      setVacancyUpdatingId('')
    }
  }

  return (
    <section className="section-wrap py-8 md:py-10">
      <div className="surface-card overflow-hidden p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-electric-blue">
              Student Dashboard
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-foreground md:text-5xl">
              Browse, match, then pay without leaving the flow.
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-muted-foreground md:text-base">
              {user ? `Welcome back, ${user.name || user.email}.` : 'Uninest keeps the student journey in one place.'}
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-xs md:text-sm">
              {areaPills.map((pill) => (
                <span key={pill} className="rounded-full border border-border bg-background px-3 py-1 text-muted-foreground">
                  {pill}
                </span>
              ))}
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {dashboardStats.slice(0, 3).map((item) => (
                <div key={item.label} className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p>
                  <p className="mt-2 font-display text-2xl font-bold text-foreground">{item.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
                </div>
              ))}
            </div>

            {user?.role === 'LANDLORD' && (
              <div className="mt-6 rounded-3xl border border-border bg-card p-5">
                <div className="flex items-center gap-2">
                  <Bell size={18} className="text-electric-blue" />
                  <p className="text-sm font-semibold text-foreground">Instant landlord notifications</p>
                </div>
                <div className="mt-3 space-y-2">
                  {landlordNotifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No new viewing requests yet.</p>
                  ) : (
                    landlordNotifications.map((notification) => (
                      <div key={notification.id} className="rounded-xl border border-border bg-background px-3 py-2">
                        <p className="text-sm font-medium text-foreground">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.detail}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-electric-blue/20 bg-electric-blue/10 p-5 md:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-electric-blue">Quick Flow</p>
            <div className="mt-4 space-y-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="block rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-electric-blue"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-electric-green/15 p-2 text-electric-green">
                        <Icon size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">
                          {index + 1}. {action.title}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
                      </div>
                      <ArrowRight size={16} className="mt-1 text-muted-foreground" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="surface-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-electric-blue">
                Live Signals
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-foreground">
                Real backend data powering your dashboard
              </h2>
            </div>
            <BadgeCheck className="text-electric-green" size={22} />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardStats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p>
                <p className="mt-2 font-display text-2xl font-bold text-foreground">{item.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-border bg-background p-5">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-electric-blue" />
              <p className="text-sm font-semibold text-foreground">Market pulse by area</p>
            </div>

            <div className="mt-4 space-y-3">
              {areaBreakdown.slice(0, 5).map((entry) => {
                const maxCount = areaBreakdown[0]?.count || 1
                const width = Math.max(12, Math.round((entry.count / maxCount) * 100))
                const widthClass = getPulseWidthClass(width)

                return (
                  <div key={entry.area}>
                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{entry.area}</span>
                      <span>{entry.count} listings</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r from-electric-green to-electric-blue ${widthClass}`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="surface-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-electric-blue">
                Your Roommate Profile
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-foreground">Compatibility snapshot</h2>
            </div>
            <Target size={22} className="text-electric-green" />
          </div>

          {roommateProfile ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <InfoTile label="Preferred area" value={String(roommateProfile.preferredArea || 'Not set')} />
              <InfoTile
                label="Budget range"
                value={
                  roommateProfile.budgetMin || roommateProfile.budgetMax
                    ? `KES ${Number(roommateProfile.budgetMin || 0).toLocaleString()} - ${Number(
                        roommateProfile.budgetMax || 0
                      ).toLocaleString()}`
                    : 'Not set'
                }
              />
              <InfoTile
                label="Sleep routine"
                value={String(roommateProfile.sleepRoutine || 'Flexible')}
              />
              <InfoTile
                label="Guest policy"
                value={String(roommateProfile.guestPolicy || 'Flexible')}
              />
              <div className="sm:col-span-2 rounded-2xl border border-electric-blue/20 bg-electric-blue/10 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-electric-blue">Match score</p>
                <p className="mt-2 font-display text-4xl font-bold text-foreground">
                  {roommateProfile.compatibilityScore ?? 0}/100
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Use the roommate quiz to refine your roomie fit.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href="/roommate-match" className="cta-electric">
                    Update quiz
                  </Link>
                  <Link href="/search" className="rounded-xl border border-border px-4 py-2 text-sm">
                    Back to search
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-border bg-background p-5 text-sm text-muted-foreground">
              No roommate profile yet. Take the quiz to get a real compatibility score and matching hints.
              <div className="mt-4">
                <Link href="/roommate-match" className="cta-electric">
                  Start quiz
                </Link>
              </div>
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-border bg-background p-5">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-electric-blue" />
              <p className="text-sm font-semibold text-foreground">Recommended for you</p>
            </div>

            <div className="mt-4 space-y-3">
              {recommendedListings.length > 0 ? (
                recommendedListings.map((listing) => (
                  <div key={listing.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{listing.title}</p>
                      <p className="text-xs text-muted-foreground">{listing.area} · {listing.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-electric-green">KES {listing.price.toLocaleString()}</p>
                      <Link href={`/listing/${listing.id}`} className="text-xs text-electric-blue">
                        View
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">We could not match listings yet. Open search to browse the live feed.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="surface-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-electric-blue">
                Featured Feed
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-foreground">Recently verified listings</h2>
            </div>
            <Link href="/search" className="inline-flex items-center gap-2 text-sm font-medium text-electric-blue">
              Open search
              <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <p className="mt-6 text-sm text-muted-foreground">Loading listings...</p>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {listings.map((listing) => (
                <article key={listing.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        {listing.area}
                      </p>
                      <h3 className="mt-1 font-semibold text-foreground">{listing.title}</h3>
                    </div>
                    {listing.isVerifiedProperty && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-electric-blue px-2 py-1 text-[11px] font-semibold text-white">
                        <ShieldCheck size={12} />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{listing.location}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">KES {listing.price.toLocaleString()}</span>
                    <div className="flex items-center gap-3">
                      <Link href={`/listing/${listing.id}`} className="text-sm font-medium text-electric-blue">
                        View listing
                      </Link>
                      {(user?.role === 'ADMIN' || listing.owner?.id === user?.id) && (
                        <button
                          type="button"
                          onClick={() => handleMarkOccupied(listing.id)}
                          disabled={vacancyUpdatingId === listing.id}
                          className="text-xs font-semibold text-amber-400 disabled:opacity-60"
                        >
                          {vacancyUpdatingId === listing.id ? 'Updating...' : 'Mark occupied'}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div id="checkout" className="surface-card p-6">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-electric-blue">
            Secure Checkout
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold text-foreground">Start an M-Pesa STK Push</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Use this form to pay booking fees or rent directly to escrow after selecting a listing.
          </p>

          <form onSubmit={handleCheckout} className="mt-6 space-y-4">
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Listing
              </span>
              <select
                value={checkoutListingId}
                onChange={(event) => {
                  setCheckoutListingId(event.target.value)
                  const nextListing = listings.find((item) => item.id === event.target.value)
                  if (nextListing) {
                    setAmount(String(nextListing.bookingFee || nextListing.price))
                  }
                }}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
                title="Dashboard listing select"
              >
                {listings.map((listing) => (
                  <option key={listing.id} value={listing.id}>
                    {listing.title} - KES {listing.bookingFee || listing.price}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Phone Number
              </span>
              <input
                title="Dashboard phone number"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                placeholder="07XXXXXXXX or 2547XXXXXXXX"
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Amount (KES)
              </span>
              <input
                title="Dashboard payment amount"
                type="number"
                min="1"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
              />
            </label>

            {errorMessage && (
              <p className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {errorMessage}
              </p>
            )}

            {successMessage && (
              <p className="rounded-xl border border-electric-green/40 bg-electric-green/10 px-4 py-3 text-sm text-foreground">
                {successMessage}
              </p>
            )}

            {latestPaymentStatus && (
              <div className="rounded-2xl border border-border bg-card p-4 text-sm text-foreground">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Payment status</p>
                <p className="mt-2 font-semibold">{latestPaymentStatus.status}</p>
                <p className="mt-1 text-muted-foreground">
                  Checkout ID: {latestPaymentStatus.checkoutRequestId || 'N/A'}
                </p>
                {latestPaymentStatus.receiptNumber && (
                  <p className="mt-1 text-muted-foreground">Receipt: {latestPaymentStatus.receiptNumber}</p>
                )}
                {latestPaymentStatus.failedReason && (
                  <p className="mt-1 text-red-200">{latestPaymentStatus.failedReason}</p>
                )}
              </div>
            )}

            <button disabled={isSubmitting} className="cta-electric w-full disabled:opacity-60">
              {isSubmitting ? 'Sending STK Push...' : 'Pay with M-Pesa'}
            </button>

            {latestCheckoutRequestId && (
              <button
                type="button"
                onClick={checkPaymentStatus}
                disabled={checkingPaymentStatus}
                className="w-full rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground disabled:opacity-60"
              >
                {checkingPaymentStatus ? 'Checking status...' : 'Refresh payment status'}
              </button>
            )}
          </form>

          <div className="mt-6 rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={16} className="mt-0.5 text-electric-green" />
              <p>
                After checkout, the transaction is tracked in escrow and reconciled from the M-Pesa callback.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
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
