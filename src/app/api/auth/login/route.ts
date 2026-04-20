import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/utils/supabase/route'
import { upsertUser } from '@/utils/supabase/queries'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const { supabase, withAuthCookies } = createRouteHandlerClient(request)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user) {
      return withAuthCookies(NextResponse.json({ error: 'Invalid credentials' }, { status: 401 }))
    }

    let appUser: {
      id: string
      fullName: string
      email: string
      role: 'STUDENT' | 'LANDLORD' | 'ADMIN'
    } = {
      id: data.user.id,
      fullName:
        (data.user.user_metadata?.full_name as string | undefined) ||
        (data.user.user_metadata?.name as string | undefined) ||
        email.split('@')[0],
      email,
      role: 'STUDENT',
    }

    try {
      const dbUser = await upsertUser(
        supabase,
        data.user.id,
        email,
        (data.user.user_metadata?.full_name as string | undefined) ||
          (data.user.user_metadata?.name as string | undefined) ||
          email.split('@')[0],
        'STUDENT'
      )

      appUser = {
        id: dbUser.id,
        fullName: dbUser.fullName,
        email: dbUser.email,
        role: dbUser.role,
      }
    } catch (dbError) {
      console.error('Error upserting user profile:', dbError)
      // Continue with Supabase auth even if profile creation fails
    }

    return withAuthCookies(
      NextResponse.json(
        {
          user: {
            id: appUser.id,
            name: appUser.fullName,
            email: appUser.email,
            role: appUser.role,
          },
          authenticated: true,
        },
        { status: 200 }
      )
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Failed to sign in' }, { status: 500 })
  }
}
