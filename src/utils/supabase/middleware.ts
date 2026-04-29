import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

type CookieToSet = {
  name: string
  value: string
  options?: CookieOptions
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const PROTECTED_ROUTE_PREFIXES = ['/profile', '/post-listing', '/dashboard', '/agent', '/admin']
const GUEST_ONLY_ROUTES = ['/login', '/signup']

const isProtectedRoute = (pathname: string) => {
  return PROTECTED_ROUTE_PREFIXES.some((routePrefix) =>
    pathname === routePrefix || pathname.startsWith(`${routePrefix}/`)
  )
}

const isGuestOnlyRoute = (pathname: string) => {
  return GUEST_ONLY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

export const updateSession = async (request: NextRequest) => {
  const pendingCookies: CookieToSet[] = []

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(nextCookies: CookieToSet[]) {
        nextCookies.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          pendingCookies.push({ name, value, options })
        })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthenticated = Boolean(user)
  const pathname = request.nextUrl.pathname

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  if (!isAuthenticated && isProtectedRoute(pathname)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`)
    response = NextResponse.redirect(loginUrl)
  } else if (isAuthenticated && isGuestOnlyRoute(pathname)) {
    const profileUrl = request.nextUrl.clone()
    profileUrl.pathname = '/profile'
    profileUrl.search = ''
    response = NextResponse.redirect(profileUrl)
  }

  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options)
  })

  return response
}
