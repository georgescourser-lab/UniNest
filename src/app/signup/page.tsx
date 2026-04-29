'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [nextPath, setNextPath] = useState('/profile')

  type SignupResponse = {
    authenticated?: boolean
    requiresEmailVerification?: boolean
    message?: string
    error?: string
  }

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
    setInfo('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const payload = (await response.json().catch(() => ({}))) as SignupResponse

      if (response.ok) {
        if (payload.authenticated) {
          router.push(nextPath)
          router.refresh()
          return
        }

        setInfo(payload.message || 'Account created. Please sign in to continue.')
        return
      }

      setError(payload.error || 'Sign up failed')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="theme-panel w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Join ComradeHomes to find or post housing.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20"
              placeholder="Your name"
            />
          </div>
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
              placeholder="Create password"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white hover:bg-emerald-700"
          >
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
          </button>
          {info && <p className="text-sm text-emerald-600">{info}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </form>

        <p className="mt-4 text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href={nextPath !== '/profile' ? `/login?next=${encodeURIComponent(nextPath)}` : '/login'}
            className="font-medium text-electric-blue hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </section>
  )
}
