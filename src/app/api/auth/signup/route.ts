import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/utils/supabase/route'
import { upsertUser } from '@/utils/supabase/queries'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const { supabase, withAuthCookies } = createRouteHandlerClient(request)

    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          name,
        },
      },
    })

    if (signupError) {
      const status = signupError.message.toLowerCase().includes('already registered') ? 409 : 400
      return withAuthCookies(NextResponse.json({ error: signupError.message }, { status }))
    }

    if (!signupData.user) {
      return withAuthCookies(NextResponse.json({ error: 'Failed to create account' }, { status: 500 }))
    }

    const identities = signupData.user.identities || []
    if (!signupData.session && identities.length === 0) {
      return withAuthCookies(
        NextResponse.json(
          {
            error: 'An account with this email already exists. Please sign in instead.',
            code: 'ACCOUNT_EXISTS',
          },
          { status: 409 }
        )
      )
    }

    let appUser: {
      id: string
      fullName: string
      email: string
      role: 'STUDENT' | 'LANDLORD' | 'ADMIN'
    } = {
      id: signupData.user.id,
      fullName: name,
      email,
      role: 'STUDENT',
    }

    try {
      const dbUser = await upsertUser(supabase, signupData.user.id, email, name, 'STUDENT')
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

    let isAuthenticated = Boolean(signupData.session)
    let requiresEmailVerification = false
    let message: string | undefined

    if (!isAuthenticated) {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      isAuthenticated = Boolean(loginData.session)

      if (!isAuthenticated) {
        requiresEmailVerification =
          Boolean(loginError) && loginError.message.toLowerCase().includes('email not confirmed')
        message = requiresEmailVerification
          ? 'Account created. Please verify your email, then sign in.'
          : 'Account created. Please sign in to continue.'
      }
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
          authenticated: isAuthenticated,
          requiresEmailVerification,
          message,
        },
        { status: 201 }
      )
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Failed to sign up' }, { status: 500 })
  }
}
