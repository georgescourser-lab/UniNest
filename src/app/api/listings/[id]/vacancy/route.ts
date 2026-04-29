import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAppUser } from '@/lib/current-user'
import { createRouteHandlerClient } from '@/utils/supabase/route'
import { getPropertyOwnerId, updatePropertyVacancyStatus } from '@/utils/supabase/queries'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, unauthorized } = await getCurrentAppUser(request)
    if (!user || unauthorized) {
      return unauthorized || NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await params
    const body = (await request.json()) as { isActive?: boolean }

    if (typeof body.isActive !== 'boolean') {
      return NextResponse.json({ error: 'isActive must be a boolean' }, { status: 400 })
    }

    const { supabase } = createRouteHandlerClient(request)
    const ownerId = await getPropertyOwnerId(supabase, id)

    if (!ownerId) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    if (user.role !== 'ADMIN' && ownerId !== user.id) {
      return NextResponse.json({ error: 'Not allowed to update this property' }, { status: 403 })
    }

    const property = await updatePropertyVacancyStatus(supabase, id, body.isActive)
    return NextResponse.json({ property }, { status: 200 })
  } catch (error) {
    console.error('Vacancy update error:', error)
    return NextResponse.json({ error: 'Failed to update vacancy status' }, { status: 500 })
  }
}
