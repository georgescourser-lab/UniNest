import { NextRequest, NextResponse } from 'next/server'
import {
  createAgentViewingRequest,
  getAgentViewingRequests,
  type AgentViewingRequest,
} from '@/lib/agent-viewing-store'

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

export async function GET() {
  try {
    const requests = await getAgentViewingRequests()
    return NextResponse.json({ data: requests }, { status: 200 })
  } catch (error) {
    console.error('Agent viewing request GET error:', error)
    return NextResponse.json({ error: 'Failed to load viewing requests' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const payload: Omit<AgentViewingRequest, 'id' | 'createdAt'> = {
      tenantName: String(body.tenantName || 'New tenant').trim(),
      tenantPhone: String(body.tenantPhone || '').trim(),
      houseId: String(body.houseId || '').trim(),
      houseTitle: String(body.houseTitle || '').trim(),
      area: String(body.area || '').trim(),
      propertyType: String(body.propertyType || '').trim(),
      time: String(body.time || '').trim(),
      pickupPoint: String(body.pickupPoint || '').trim(),
      status: 'Pending',
      feeStatus: 'To be decided later',
    }

    const created = await createAgentViewingRequest(payload)
    return NextResponse.json({ data: created }, { status: 201 })
  } catch (error) {
    console.error('Agent viewing request POST error:', error)
    return NextResponse.json({ error: 'Failed to create viewing request' }, { status: 500 })
  }
}
