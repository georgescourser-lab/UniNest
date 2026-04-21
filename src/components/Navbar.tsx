'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, Search, Plus, User, LogOut, Home, ShieldCheck, Users, MapPin } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')
  const router = useRouter()

  useEffect(() => {
    const hydrateAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' })
        if (response.ok) {
          const payload = (await response.json()) as {
            user?: { name?: string | null; email?: string; role?: string } | null
            authenticated?: boolean
          }

          if (payload.authenticated && payload.user) {
            setIsAuthenticated(true)
            setUserName(payload.user.name || payload.user.email || 'User')
            setUserRole(payload.user.role || '')
            return
          }
        }
      } catch {
        setIsAuthenticated(false)
        setUserName('')
        setUserRole('')
      }
    }

    hydrateAuth()
  }, [])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const query = searchQuery.trim()
    router.push(query ? `/search?query=${encodeURIComponent(query)}` : '/search')
    setIsMenuOpen(false)
  }

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignore logout API failures and clear client fallback session below.
    }

    setIsAuthenticated(false)
    setUserName('')
    setIsMenuOpen(false)
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-xl">
      <div className="section-wrap">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-electric-green to-electric-blue flex items-center justify-center text-black font-black text-xs tracking-wide">
                UNI
              </div>
              <span className="hidden font-display text-lg font-bold text-foreground sm:inline">
                Uninest
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground transition hover:border-electric-blue hover:text-foreground"
              >
                <Users size={16} />
                Dashboard
              </Link>
              <Link
                href="/agent/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground transition hover:border-electric-blue hover:text-foreground"
              >
                <MapPin size={16} />
                Viewings
              </Link>
              {isAuthenticated && userRole === 'ADMIN' && (
                <Link
                  href="/admin/trust-safety"
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground transition hover:border-electric-blue hover:text-foreground"
                >
                  <ShieldCheck size={16} />
                  Trust & Safety
                </Link>
              )}
            </div>
          </div>

          <div className="hidden md:flex flex-1 mx-8">
            <form onSubmit={handleSearch} className="w-full relative">
              <div className="relative flex items-center gap-2">
                <Search size={18} className="absolute left-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search Wendani, Sukari, Ruiru..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-10 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="submit"
                  className="cta-electric"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <Link
                  href="/post-listing"
                  className="cta-electric gap-2"
                >
                  <Plus size={18} />
                  List Property
                </Link>
                <Link href="/profile" className="p-2 hover:bg-muted rounded-lg transition" title={userName || 'Profile'}>
                  <User size={20} className="text-foreground" />
                </Link>
                <button onClick={handleSignOut} className="p-2 hover:bg-muted rounded-lg transition" title="Sign out">
                  <LogOut size={20} className="text-foreground" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-foreground hover:text-electric-blue font-medium text-sm"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="cta-electric"
                >
                  Join Uninest
                </Link>
              </>
            )}
          </div>

          <button
            onClick={toggleMenu}
            className="md:hidden p-2 hover:bg-muted rounded-lg transition"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-3">
            <form onSubmit={handleSearch} className="px-0">
              <div className="relative flex items-center gap-2">
                <Search size={18} className="absolute left-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search hostels and bedsitters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border bg-card rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="submit"
                  className="cta-electric"
                >
                  Go
                </button>
              </div>
            </form>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-3 py-2 text-foreground hover:bg-muted rounded-lg transition"
                onClick={() => setIsMenuOpen(false)}
              >
                <Users size={18} />
                Dashboard
              </Link>
              <Link
                href="/agent/dashboard"
                className="inline-flex items-center gap-2 px-3 py-2 text-foreground hover:bg-muted rounded-lg transition"
                onClick={() => setIsMenuOpen(false)}
              >
                <MapPin size={18} />
                Viewings
              </Link>
              {isAuthenticated && userRole === 'ADMIN' && (
                <Link
                  href="/admin/trust-safety"
                  className="inline-flex items-center gap-2 px-3 py-2 text-foreground hover:bg-muted rounded-lg transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShieldCheck size={18} />
                  Trust & Safety
                </Link>
              )}
            </div>

            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 text-foreground hover:bg-muted rounded-lg transition"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home size={18} />
              Home
            </Link>

            <Link
              href="/search"
              className="flex items-center gap-2 px-4 py-2 text-foreground hover:bg-muted rounded-lg transition"
              onClick={() => setIsMenuOpen(false)}
            >
              <ShieldCheck size={18} />
              Verified Listings
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/post-listing"
                  className="cta-electric gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Plus size={18} />
                  List Property
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-foreground hover:bg-muted rounded-lg transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={18} />
                  Profile
                </Link>
                <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-4 py-2 text-foreground hover:bg-muted rounded-lg transition text-left">
                  <LogOut size={18} />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 text-foreground hover:bg-muted rounded-lg transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={18} />
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="cta-electric gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
