import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

const envSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const envSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

type CookieToSet = {
  name: string
  value: string
  options?: CookieOptions
}

export function createRouteHandlerClient(request: NextRequest) {
  const cookiesToSet: CookieToSet[] = []

  if (!envSupabaseUrl || !envSupabaseKey) {
    throw new Error('Supabase environment variables are not configured')
  }

  const supabase = createServerClient(envSupabaseUrl, envSupabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(nextCookies: CookieToSet[]) {
        nextCookies.forEach((cookie: CookieToSet) => {
          request.cookies.set(cookie.name, cookie.value)
          cookiesToSet.push(cookie)
        })
      },
    },
  })

  const withAuthCookies = <T extends NextResponse>(response: T) => {
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })

    return response
  }

  return { supabase, withAuthCookies }
}
