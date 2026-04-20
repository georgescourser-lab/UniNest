import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/utils/supabase/route'
import { getTransactionById } from '@/utils/supabase/queries'

type StatusParams = {
  params: Promise<{
    checkoutRequestId: string
  }>
}

export async function GET(_request: NextRequest, { params }: StatusParams) {
  try {
    const { checkoutRequestId } = await params

    const { supabase } = createRouteHandlerClient(_request)
    const transaction = await getTransactionById(supabase, checkoutRequestId)

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    return NextResponse.json({ transaction }, { status: 200 })
  } catch (error) {
    console.error('M-Pesa status lookup error:', error)
    return NextResponse.json({ error: 'Failed to fetch transaction status' }, { status: 500 })
  }
}