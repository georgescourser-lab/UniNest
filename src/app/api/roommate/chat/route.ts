import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAppUser } from '@/lib/current-user'
import { createRouteHandlerClient } from '@/utils/supabase/route'
import {
  createRoommateChatMessage,
  getRoommateChatMessages,
} from '@/utils/supabase/queries'

export async function GET(request: NextRequest) {
  try {
    const { user, unauthorized } = await getCurrentAppUser(request)
    if (!user || unauthorized) {
      return unauthorized || NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const area = String(request.nextUrl.searchParams.get('area') || '').trim().toUpperCase()
    if (!area) {
      return NextResponse.json({ error: 'area is required' }, { status: 400 })
    }

    const { supabase } = createRouteHandlerClient(request)
    const messages = await getRoommateChatMessages(supabase, area)

    return NextResponse.json({ data: messages }, { status: 200 })
  } catch (error) {
    console.error('Roommate chat GET error:', error)
    return NextResponse.json({ error: 'Failed to load chat messages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, unauthorized } = await getCurrentAppUser(request)
    if (!user || unauthorized) {
      return unauthorized || NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = (await request.json()) as { area?: string; message?: string }
    const area = String(body.area || '').trim().toUpperCase()
    const message = String(body.message || '').trim()

    if (!area) {
      return NextResponse.json({ error: 'area is required' }, { status: 400 })
    }

    if (!message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 })
    }

    if (message.length > 1000) {
      return NextResponse.json({ error: 'message is too long' }, { status: 400 })
    }

    const { supabase } = createRouteHandlerClient(request)
    const created = await createRoommateChatMessage(supabase, {
      area,
      senderId: user.id,
      senderName: user.fullName || user.email,
      message,
    })

    return NextResponse.json({ data: created }, { status: 201 })
  } catch (error) {
    console.error('Roommate chat POST error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
