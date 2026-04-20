'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { BadgeCheck, CheckCircle2, FileText, ShieldAlert, ShieldCheck, XCircle } from 'lucide-react'

interface AdminLandlord {
  id: string
  name: string | null
  email: string
  phone: string | null
  idDocumentUrl: string | null
  kraPinUrl: string | null
  verificationStatus: string
  isVerified: boolean
}

interface AdminProperty {
  id: string
  title: string
  price: number
  area: string
  zone?: string
  location: string
  isVerifiedProperty?: boolean
  verificationStatus?: string
  landlord?: AdminLandlord
}

export default function TrustSafetyPage() {
  const [properties, setProperties] = useState<AdminProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [authMessage, setAuthMessage] = useState('')
  const [busyPropertyId, setBusyPropertyId] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [meResponse, listingsResponse] = await Promise.all([
          fetch('/api/auth/me', { cache: 'no-store' }),
          fetch('/api/listings?limit=20', { cache: 'no-store' }),
        ])

        if (!meResponse.ok) {
          setAuthMessage('Sign in as an admin to review trust and safety records.')
        } else {
          const mePayload = (await meResponse.json()) as {
            user?: { role?: string } | null
            authenticated?: boolean
          }
          if (!mePayload.authenticated) {
            setAuthMessage('Sign in as an admin to review trust and safety records.')
          } else if (mePayload.user?.role !== 'ADMIN') {
            setAuthMessage('Admin access required to manage listing verification.')
          }
        }

        if (listingsResponse.ok) {
          const payload = (await listingsResponse.json()) as { data?: AdminProperty[] }
          setProperties(payload.data || [])
        }
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const metrics = useMemo(() => {
    const total = properties.length
    const verified = properties.filter((property) => property.isVerifiedProperty).length
    const pending = properties.filter((property) => property.verificationStatus === 'PENDING').length
    const missingDocs = properties.filter(
      (property) => !property.landlord?.idDocumentUrl || !property.landlord?.kraPinUrl
    ).length

    return [
      { label: 'Total listings', value: total },
      { label: 'Verified', value: verified },
      { label: 'Pending review', value: pending },
      { label: 'Missing docs', value: missingDocs },
    ]
  }, [properties])

  const updateVerification = async (propertyId: string, status: 'VERIFIED' | 'REJECTED' | 'PENDING') => {
    setBusyPropertyId(propertyId)

    try {
      const response = await fetch(`/api/admin/properties/${propertyId}/verification`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationStatus: status }),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error || 'Failed to update verification')
      }

      setProperties((current) =>
        current.map((property) =>
          property.id === propertyId
            ? {
                ...property,
                verificationStatus: status,
                isVerifiedProperty: status === 'VERIFIED',
              }
            : property
        )
      )
    } finally {
      setBusyPropertyId('')
    }
  }

  return (
    <section className="section-wrap py-8 md:py-10">
      <div className="surface-card p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-electric-blue">
              Trust & Safety
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-foreground md:text-5xl">
              Review landlord documents and verify properties.
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-muted-foreground md:text-base">
              Keep the platform safe by checking ID, KRA PIN, and property legitimacy before toggling verified status.
            </p>
          </div>
          <Link href="/dashboard" className="cta-electric">
            Back to dashboard
          </Link>
        </div>

        {authMessage && (
          <div className="mt-6 rounded-2xl border border-electric-blue/30 bg-electric-blue/10 p-4 text-sm text-foreground">
            {authMessage}
          </div>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{metric.label}</p>
              <p className="mt-2 font-display text-3xl font-bold text-foreground">{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading trust and safety queue...</p>
          ) : (
            properties.map((property) => {
              const landlord = property.landlord
              const docsReady = Boolean(landlord?.idDocumentUrl && landlord?.kraPinUrl)

              return (
                <article key={property.id} className="rounded-3xl border border-border bg-background p-5 md:p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {property.isVerifiedProperty ? (
                          <ShieldCheck size={18} className="text-electric-green" />
                        ) : (
                          <ShieldAlert size={18} className="text-electric-blue" />
                        )}
                        <p className="text-sm font-semibold text-foreground">{property.title}</p>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {property.area} · {property.location}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        KES {Number(property.price).toLocaleString()} · {property.verificationStatus || 'PENDING'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => updateVerification(property.id, 'VERIFIED')}
                        disabled={busyPropertyId === property.id}
                        className="inline-flex items-center gap-2 rounded-xl bg-electric-green px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
                      >
                        <CheckCircle2 size={16} />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => updateVerification(property.id, 'REJECTED')}
                        disabled={busyPropertyId === property.id}
                        className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-60"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="rounded-2xl border border-border bg-card p-4">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-electric-blue" />
                        <p className="text-sm font-semibold text-foreground">Landlord documents</p>
                      </div>
                      <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                        <p>Name: {landlord?.name || 'Unknown landlord'}</p>
                        <p>Email: {landlord?.email || 'Not provided'}</p>
                        <p>Phone: {landlord?.phone || 'Not provided'}</p>
                        <p>ID document: {landlord?.idDocumentUrl ? 'Uploaded' : 'Missing'}</p>
                        <p>KRA PIN: {landlord?.kraPinUrl ? 'Uploaded' : 'Missing'}</p>
                        {docsReady ? (
                          <div className="flex items-center gap-2 text-electric-green">
                            <BadgeCheck size={16} />
                            Docs ready for review
                          </div>
                        ) : (
                          <p className="text-electric-blue">Request the landlord to upload missing documents.</p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-electric-blue" />
                        <p className="text-sm font-semibold text-foreground">Verification notes</p>
                      </div>
                      <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                        <p>
                          Property status: <span className="font-semibold text-foreground">{property.verificationStatus || 'PENDING'}</span>
                        </p>
                        <p>
                          Public badge: <span className="font-semibold text-foreground">{property.isVerifiedProperty ? 'Visible' : 'Hidden'}</span>
                        </p>
                        <p>
                          Safety check: confirm the listing is real, the photos match, and no hidden broker fee is being charged.
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}
