import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/utils/supabase/route'
import { getUserByEmail } from '@/utils/supabase/queries'

export type AppUser = {
  id: string
  fullName: string
  email: string
  role: 'STUDENT' | 'LANDLORD' | 'ADMIN'
  phone?: string | null
}

export async function getCurrentAppUser(request: NextRequest) {
  const { supabase, withAuthCookies } = createRouteHandlerClient(request)
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser?.email) {
    return {
      user: null,
      withAuthCookies,
      unauthorized: withAuthCookies(
        NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
      ),
    }
  }

  const email = authUser.email.toLowerCase()

  try {
    const dbUser = await getUserByEmail(supabase, email)

    if (!dbUser) {
      return {
        user: null,
        withAuthCookies,
        unauthorized: withAuthCookies(
          NextResponse.json({ error: 'User profile not found' }, { status: 403 })
        ),
      }
    }

    return {
      user: {
        id: dbUser.id,
        fullName: dbUser.fullName,
        email: dbUser.email,
        role: dbUser.role,
        phone: dbUser.phone,
      },
      withAuthCookies,
      unauthorized: null,
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return {
      user: null,
      withAuthCookies,
      unauthorized: withAuthCookies(
        NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 })
      ),
    }
  }
}
