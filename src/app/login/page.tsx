'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [nextPath, setNextPath] = useState('/profile')

  useEffect(() => {
    const requestedNext = new URLSearchParams(window.location.search).get('next')
    const safeNextPath =
      requestedNext && requestedNext.startsWith('/') && !requestedNext.startsWith('//')
        ? requestedNext
        : '/profile'
    setNextPath(safeNextPath)
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        router.push(nextPath)
        router.refresh()
        return
      }

      const payload = await response.json().catch(() => ({ error: 'Sign in failed' }))
      setError(payload.error || 'Sign in failed')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="theme-panel w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-foreground">Sign In</h1>
        <p className="mt-1 text-sm text-muted-foreground">Access your ComradeHomes account.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20"
              placeholder="Enter password"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white hover:bg-emerald-700"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </form>

        <p className="mt-4 text-sm text-muted-foreground">
          New here?{' '}
          <Link
            href={nextPath !== '/profile' ? `/signup?next=${encodeURIComponent(nextPath)}` : '/signup'}
            className="font-medium text-electric-blue hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </section>
  )
}
