import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAppUser } from '@/lib/current-user'
import { createRouteHandlerClient } from '@/utils/supabase/route'
import { updatePropertyVerification } from '@/utils/supabase/queries'

const ALLOWED_STATUSES = new Set(['PENDING', 'VERIFIED', 'REJECTED'])

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, unauthorized } = await getCurrentAppUser(request)
    if (!user || unauthorized) {
      return unauthorized || NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id } = await params
    const body = (await request.json()) as {
      verificationStatus?: string
      isVerified?: boolean
    }

    const verificationStatus = String(body.verificationStatus || '').toUpperCase()
    if (!ALLOWED_STATUSES.has(verificationStatus)) {
      return NextResponse.json(
        { error: 'verificationStatus must be PENDING, VERIFIED, or REJECTED' },
        { status: 400 }
      )
    }

    const { supabase } = createRouteHandlerClient(request)
    const property = await updatePropertyVerification(
      supabase,
      id,
      verificationStatus as 'PENDING' | 'VERIFIED' | 'REJECTED'
    )

    return NextResponse.json({ property }, { status: 200 })
  } catch (error) {
    console.error('Admin verification update error:', error)
    return NextResponse.json({ error: 'Failed to update verification status' }, { status: 500 })
  }
}
