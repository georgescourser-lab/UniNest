'use client'

import type { FormEvent, ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Search,
} from 'lucide-react'

type PostedHouse = {
  id: string
  title: string
  area: string
  zone?: string | null
  location: string
  price: number
  bookingFee?: number | null
  images?: string[]
  isVerifiedProperty?: boolean
  lookingForRoommate?: boolean
}

type ViewingRequest = {
  id: string
  tenantName: string
  houseTitle: string
  area: string
  propertyType: string
  time: string
  pickupPoint: string
  status: 'Matched' | 'Pending' | 'On the way'
  feeStatus: 'To be decided later'
  tenantPhone?: string
  createdAt?: string
}

const featuredAgents = [
  {
    name: 'Faith Njeri',
    rating: 4.9,
    specialty: 'Kahawa Wendani, Sukari, KM',
    response: '< 10 mins',
    price: 'KES 300/viewing',
    badge: 'Top Rated',
  },
  {
    name: 'Brian Otieno',
    rating: 4.8,
    specialty: 'Githurai 44, 45, Mwihoko',
    response: '< 15 mins',
    price: 'KES 250/viewing',
    badge: 'Fast Response',
  },
  {
    name: 'Amina Hassan',
    rating: 5.0,
    specialty: 'Ruiru, Zimmerman, Roysambu',
    response: '< 12 mins',
    price: 'KES 350/viewing',
    badge: 'Verified Guide',
  },
]

const initialRequests: ViewingRequest[] = [
  {
    id: 'VR-101',
    tenantName: 'Mercy Wanjiku',
    houseTitle: 'Sunny Bedsitter Near Main Gate',
    area: 'Kahawa Wendani',
    propertyType: 'Bedsitter',
    time: 'Today, 4:30 PM',
    pickupPoint: 'KU Main Gate',
    status: 'Matched',
    feeStatus: 'To be decided later',
  },
  {
    id: 'VR-102',
    tenantName: 'Kevin Auma',
    houseTitle: 'Quiet Single Room With WiFi',
    area: 'Githurai 44',
    propertyType: 'Single room',
    time: 'Today, 6:00 PM',
    pickupPoint: 'KU Gate A',
    status: 'On the way',
    feeStatus: 'To be decided later',
  },
  {
    id: 'VR-103',
    tenantName: 'Lydia Wairimu',
    houseTitle: 'Shared 2BR With Balcony',
    area: 'Ruiru',
    propertyType: '2BR shared',
    time: 'Tomorrow, 11:00 AM',
    pickupPoint: 'Town stage',
    status: 'Pending',
    feeStatus: 'To be decided later',
  },
]

const fallbackPostedHouses: PostedHouse[] = [
  {
    id: 'fallback-1',
    title: 'Sunny Bedsitter Near Main Gate',
    area: 'Kahawa Wendani',
    zone: 'Kahawa Wendani',
    location: 'Close to Main Gate',
    price: 12000,
    bookingFee: null,
    images: [],
    isVerifiedProperty: true,
    lookingForRoommate: false,
  },
  {
    id: 'fallback-2',
    title: 'Quiet Single Room With WiFi',
    area: 'GITHURAI_44',
    zone: 'Githurai 44',
    location: 'Near shopping center',
    price: 8500,
    bookingFee: null,
    images: [],
    isVerifiedProperty: false,
    lookingForRoommate: false,
  },
  {
    id: 'fallback-3',
    title: 'Shared 2BR With Balcony',
    area: 'KAHAWA_SUKARI',
    zone: 'Kahawa Sukari',
    location: 'Secure estate',
    price: 17500,
    bookingFee: null,
    images: [],
    isVerifiedProperty: true,
    lookingForRoommate: true,
  },
]

export default function AgentDashboardPage() {
  const [requests, setRequests] = useState<ViewingRequest[]>(initialRequests)
  const [postedHouses, setPostedHouses] = useState<PostedHouse[]>(fallbackPostedHouses)
  const [loadingHouses, setLoadingHouses] = useState(false)
  const [loadingRequests, setLoadingRequests] = useState(true)
  const [submittingRequest, setSubmittingRequest] = useState(false)
  const [selectedHouseId, setSelectedHouseId] = useState(fallbackPostedHouses[0]?.id || '')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [area, setArea] = useState('Kahawa Wendani')
  const [propertyType, setPropertyType] = useState('Bedsitter')
  const [pickupPoint, setPickupPoint] = useState('KU Main Gate')
  const [preferredTime, setPreferredTime] = useState('Today, 3:00 PM')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const response = await fetch('/api/agent/viewing-requests', { cache: 'no-store' })
        if (!response.ok) {
          return
        }

        const payload = (await response.json()) as { data?: ViewingRequest[] }
        if (payload.data && payload.data.length > 0) {
          setRequests(payload.data)
        }
      } finally {
        setLoadingRequests(false)
      }
    }

    loadRequests()
  }, [])

  useEffect(() => {
    const loadHouses = async () => {
      try {
        const response = await fetch('/api/listings?limit=6', { cache: 'no-store' })
        if (!response.ok) {
          return
        }

        const payload = (await response.json()) as { data?: PostedHouse[] }
        const normalized = (payload.data || []).map((house) => ({
          id: house.id,
          title: house.title,
          area: house.area,
          zone: house.zone,
          location: house.location,
          price: Number(house.price),
          bookingFee: house.bookingFee ? Number(house.bookingFee) : null,
          images: house.images || [],
          isVerifiedProperty: house.isVerifiedProperty,
          lookingForRoommate: house.lookingForRoommate,
        }))

        if (normalized.length > 0) {
          setPostedHouses(normalized)
          setSelectedHouseId((current) => current || normalized[0]?.id || '')
        }

        const firstHouse = normalized[0] || fallbackPostedHouses[0]
        if (firstHouse) {
          setArea(firstHouse.area)
          setPropertyType(firstHouse.lookingForRoommate ? '2BR shared' : 'Bedsitter')
          setPickupPoint(`Meet at ${firstHouse.zone || firstHouse.area}`)
        }
      } finally {
        setLoadingHouses(false)
      }
    }

    loadHouses()
  }, [])

  const stats = useMemo(() => {
    const matched = requests.filter((request) => request.status === 'Matched').length
    const moving = requests.filter((request) => request.status === 'On the way').length
    const feePending = requests.filter((request) => request.feeStatus === 'To be decided later').length
    return [
      { label: 'Active requests', value: requests.length, detail: 'viewing bookings waiting' },
      { label: 'Matched guides', value: matched, detail: 'tenant-agent pairings' },
      { label: 'On the way', value: moving, detail: 'already dispatched' },
      { label: 'Fee pending', value: feePending, detail: 'agreed after the viewing' },
    ]
  }, [requests])

  const selectedHouse = postedHouses.find((house) => house.id === selectedHouseId) || postedHouses[0]

  const createRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedHouse) {
      setMessage('Pick a posted house first.')
      return
    }

    setSubmittingRequest(true)

    try {
      const response = await fetch('/api/agent/viewing-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantName: name || 'New tenant',
          tenantPhone: phone,
          houseId: selectedHouse.id,
          houseTitle: selectedHouse.title,
          area: selectedHouse.area,
          propertyType: propertyType || 'Bedsitter',
          time: preferredTime,
          pickupPoint,
        }),
      })

      const payload = (await response.json().catch(() => null)) as
        | { data?: ViewingRequest; error?: string }
        | null

      if (!response.ok || !payload?.data) {
        throw new Error(payload?.error || 'Could not create viewing request')
      }

      setRequests((current) => [payload.data as ViewingRequest, ...current])
      setMessage(
        `Request created for ${name || 'your'} viewing of ${selectedHouse.title}. The agent fee will be agreed later.`
      )
      setName('')
      setPhone('')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not create request right now.')
    } finally {
      setSubmittingRequest(false)
    }
  }

  return (
    <section className="section-wrap py-8 md:py-10">
      <div className="surface-card overflow-hidden p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-electric-blue">
              Agent Dashboard
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-foreground md:text-5xl">
              Book a guide to take you to the vacant house.
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-muted-foreground md:text-base">
              Request a trusted viewing agent to escort you, show you the vacant house, and help you compare the unit before you commit.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p>
                  <p className="mt-2 font-display text-2xl font-bold text-foreground">{item.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-electric-blue/20 bg-electric-blue/10 p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-electric-blue" />
                <p className="text-sm font-semibold text-foreground">Safe viewing process</p>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                <p>1. Pick a vacant house and preferred area.</p>
                <p>2. Match with a nearby verified agent.</p>
                <p>3. Meet at the pickup point and tour the unit.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-background p-5 md:p-6">
            <div className="flex items-center gap-2">
              <Search size={18} className="text-electric-blue" />
              <p className="text-sm font-semibold text-foreground">Request a viewing</p>
            </div>

            <form onSubmit={createRequest} className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Posted house" className="sm:col-span-2">
                <select
                  title="Posted house"
                  value={selectedHouseId}
                  onChange={(event) => {
                    setSelectedHouseId(event.target.value)
                    const nextHouse = postedHouses.find((house) => house.id === event.target.value)
                    if (nextHouse) {
                      setArea(nextHouse.area)
                      setPropertyType(nextHouse.lookingForRoommate ? '2BR shared' : 'Bedsitter')
                      setPickupPoint(`Meet at ${nextHouse.zone || nextHouse.area}`)
                    }
                  }}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground"
                >
                  {postedHouses.map((house) => (
                    <option key={house.id} value={house.id}>
                      {house.title} · KES {Number(house.price).toLocaleString()}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Tenant name">
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground"
                  placeholder="Your name"
                />
              </Field>

              <Field label="Phone number">
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground"
                  placeholder="07XXXXXXXX"
                />
              </Field>

              <Field label="Area">
                <select
                  title="Area"
                  value={area}
                  onChange={(event) => setArea(event.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground"
                >
                  <option>Kahawa Wendani</option>
                  <option>Kahawa Sukari</option>
                  <option>KM</option>
                  <option>Mwihoko</option>
                  <option>Githurai 44</option>
                  <option>Githurai 45</option>
                  <option>Ruiru</option>
                </select>
              </Field>

              <Field label="Property type">
                <select
                  title="Property type"
                  value={propertyType}
                  onChange={(event) => setPropertyType(event.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground"
                >
                  <option>Bedsitter</option>
                  <option>Single room</option>
                  <option>2BR shared</option>
                  <option>Apartment</option>
                </select>
              </Field>

              <Field label="Pickup point" className="sm:col-span-2">
                <input
                  value={pickupPoint}
                  onChange={(event) => setPickupPoint(event.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground"
                  placeholder="KU Main Gate, Gate A, town stage..."
                />
              </Field>

              <Field label="Preferred time" className="sm:col-span-2">
                <input
                  value={preferredTime}
                  onChange={(event) => setPreferredTime(event.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground"
                  placeholder="Today, 4:00 PM"
                />
              </Field>

              <button type="submit" disabled={submittingRequest} className="cta-electric sm:col-span-2 gap-2 disabled:opacity-60">
                {submittingRequest ? 'Saving request...' : 'Request agent'}
                <ArrowRight size={16} />
              </button>
            </form>

            {message && (
              <div className="mt-4 rounded-2xl border border-electric-blue/30 bg-electric-blue/10 p-4 text-sm text-foreground">
                {message}
              </div>
            )}

            {selectedHouse && (
              <div className="mt-4 rounded-2xl border border-border bg-card p-4 text-sm text-foreground">
                <p className="font-semibold">Selected house</p>
                <p className="mt-1 text-muted-foreground">{selectedHouse.title}</p>
                <p className="mt-1 text-muted-foreground">{selectedHouse.area} · {selectedHouse.location}</p>
                <p className="mt-1 text-electric-green">Agent fee: to be agreed later after the viewing</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="surface-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-electric-blue">
                Trusted Agents
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-foreground">
                People who can escort you to the vacant house
              </h2>
            </div>
            <Sparkles className="text-electric-green" size={22} />
          </div>

          <div className="mt-6 space-y-4">
            {featuredAgents.map((agent) => (
              <article key={agent.name} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{agent.name}</p>
                      <span className="rounded-full border border-electric-blue/30 bg-electric-blue/10 px-2 py-0.5 text-[11px] font-semibold text-electric-blue">
                        {agent.badge}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{agent.specialty}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p className="flex items-center justify-end gap-1 text-electric-green">
                      <Star size={14} />
                      {agent.rating}
                    </p>
                    <p>{agent.response}</p>
                    <p>{agent.price}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="surface-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-electric-blue">
                Live Viewing Queue
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-foreground">
                Current requests from tenants
              </h2>
            </div>
            <CalendarClock size={22} className="text-electric-green" />
          </div>

          <div className="mt-6 space-y-4">
            {loadingRequests && (
              <p className="text-sm text-muted-foreground">Loading viewing requests...</p>
            )}
            {requests.map((request) => (
              <div key={request.id} className="rounded-2xl border border-border bg-background p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{request.tenantName}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.houseTitle} · {request.area} · {request.propertyType}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground">
                    {request.status === 'On the way' ? <Clock3 size={14} /> : <CheckCircle2 size={14} />}
                    {request.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin size={14} />
                  Pickup: {request.pickupPoint}
                </div>
                <p className="mt-2 text-sm text-electric-green">Fee: {request.feeStatus}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <MessageCircle size={16} className="text-electric-blue" />
              <p className="text-sm font-semibold text-foreground">How this helps tenants</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              The agent meets the tenant, walks them to the vacant house, and helps them verify the room before payment or commitment.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 surface-card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-electric-blue">
              Suggested Vacant Houses
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold text-foreground">
              Popular places tenants are asking to view
            </h2>
          </div>
          <Link href="/search" className="inline-flex items-center gap-2 text-sm font-medium text-electric-blue">
            Browse listings
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {(postedHouses.length > 0
            ? postedHouses
            : [
                {
                  id: 'fallback-1',
                  title: 'Browse the live listings page to pick a house',
                  area: 'Open search',
                  location: 'No posted houses loaded yet',
                  price: 0,
                  bookingFee: null,
                  isVerifiedProperty: false,
                },
              ]
          ).map((house) => (
            <article key={house.id} className="rounded-2xl border border-border bg-card p-4">
              <p className="font-semibold text-foreground">{house.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{house.area}</p>
              <p className="mt-1 text-sm text-muted-foreground">{house.location}</p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-electric-green">KES {Number(house.price || 0).toLocaleString()}</span>
                <button
                  type="button"
                  onClick={() => setSelectedHouseId(house.id)}
                  className="text-muted-foreground hover:text-electric-blue"
                >
                  Choose house
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Field({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: ReactNode
}) {
  return (
    <label className={`block space-y-2 ${className || ''}`}>
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}