import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/utils/supabase/route'
import { upsertUser } from '@/utils/supabase/queries'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { supabase, withAuthCookies } = createRouteHandlerClient(request)
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser?.email) {
      return withAuthCookies(NextResponse.json({ user: null, authenticated: false }, { status: 200 }))
    }

    const email = authUser.email.toLowerCase()
    const fullName =
      (authUser.user_metadata?.full_name as string | undefined) ||
      (authUser.user_metadata?.name as string | undefined) ||
      email.split('@')[0]

    let user = null
    try {
      user = await upsertUser(supabase, authUser.id, email, fullName, 'STUDENT')
    } catch (dbError) {
      console.error('Error upserting user profile:', dbError)
      // Return auth user if DB fails
      return withAuthCookies(
        NextResponse.json(
          {
            user: {
              id: authUser.id,
              name: fullName,
              email,
              role: 'STUDENT',
            },
            authenticated: true,
          },
          { status: 200 }
        )
      )
    }

    return withAuthCookies(
      NextResponse.json(
        {
          user: {
            id: user.id,
            name: user.fullName,
            email: user.email,
            role: user.role,
          },
          authenticated: true,
        },
        { status: 200 }
      )
    )
  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json({ error: 'Failed to get user info' }, { status: 500 })
  }
}
