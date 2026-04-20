'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type MeResponse = {
  user?: {
    id: string
    name: string | null
    email: string
    role: string
  }
}

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState('Comrade')
  const [email, setEmail] = useState('')

  useEffect(() => {
    const hydrate = async () => {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' })
        if (response.ok) {
          const payload = (await response.json()) as MeResponse & { authenticated?: boolean }
          if (payload.authenticated && payload.user) {
            setDisplayName(payload.user.name || payload.user.email || 'Comrade')
            setEmail(payload.user.email || '')
            return
          }
        }
      } catch {
        // Keep defaults when profile cannot be loaded.
      }
    }

    hydrate()
  }, [])

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
      <p className="mt-2 text-muted-foreground">Manage your account details, listings, and reviews.</p>

      <div className="theme-panel mt-6 p-6">
        <p className="text-sm text-foreground">Welcome, {displayName}.</p>
        {email && <p className="mt-1 text-sm text-muted-foreground">{email}</p>}
        <div className="mt-4 flex gap-3">
          <Link href="/post-listing" className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
            Post Listing
          </Link>
          <Link href="/" className="rounded-lg border border-border px-4 py-2 text-foreground hover:bg-muted">
            Home
          </Link>
        </div>
      </div>
    </section>
  )
}
