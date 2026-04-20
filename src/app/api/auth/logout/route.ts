import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/utils/supabase/route'

export async function POST(request: NextRequest) {
  const { supabase, withAuthCookies } = createRouteHandlerClient(request)
  await supabase.auth.signOut()

  return withAuthCookies(NextResponse.json({ ok: true }, { status: 200 }))
}
