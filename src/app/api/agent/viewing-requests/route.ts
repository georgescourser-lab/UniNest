import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAppUser } from '@/lib/current-user'
import { createRouteHandlerClient } from '@/utils/supabase/route'
import {
  createLiveViewingRequest,
  getLiveViewingRequestsForUser,
  getPropertyOwnerId,
  type LiveViewingRequest,
} from '@/utils/supabase/queries'

interface CreateViewingRequestBody {
  tenantName?: string
  tenantPhone?: string
  houseId?: string
  houseTitle?: string
  area?: string
  propertyType?: string
  time?: string
  pickupPoint?: string
}

export async function GET(request: NextRequest) {
  try {
    const { user, unauthorized } = await getCurrentAppUser(request)
    if (!user || unauthorized) {
      return unauthorized || NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { supabase } = createRouteHandlerClient(request)
    const requests = await getLiveViewingRequestsForUser(supabase, user.id)
    return NextResponse.json({ data: requests }, { status: 200 })
  } catch (error) {
    console.error('Agent viewing request GET error:', error)
    return NextResponse.json({ error: 'Failed to load viewing requests' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, unauthorized } = await getCurrentAppUser(request)
    if (!user) return unauthorized

    const body = (await request.json()) as CreateViewingRequestBody

    const requiredFields: Array<keyof CreateViewingRequestBody> = [
      'houseId',
      'houseTitle',
      'area',
      'propertyType',
      'time',
      'pickupPoint',
    ]

    const missing = requiredFields.filter((field) => !String(body[field] || '').trim())
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

    const { supabase } = createRouteHandlerClient(request)
    const ownerUserId = await getPropertyOwnerId(supabase, String(body.houseId || '').trim())

    const payload: Omit<LiveViewingRequest, 'id' | 'createdAt' | 'status' | 'feeStatus'> = {
      tenantName: String(body.tenantName || 'New tenant').trim(),
      tenantPhone: String(body.tenantPhone || '').trim(),
      houseId: String(body.houseId || '').trim(),
      houseTitle: String(body.houseTitle || '').trim(),
      area: String(body.area || '').trim(),
      propertyType: String(body.propertyType || '').trim(),
      time: String(body.time || '').trim(),
      pickupPoint: String(body.pickupPoint || '').trim(),
      requesterUserId: user.id,
      ownerUserId,
    }

    const created = await createLiveViewingRequest(supabase, {
      ...payload,
      ownerUserId,
    })

    return NextResponse.json({ data: created }, { status: 201 })
  } catch (error) {
    console.error('Agent viewing request POST error:', error)
    return NextResponse.json({ error: 'Failed to create viewing request' }, { status: 500 })
  }
}
