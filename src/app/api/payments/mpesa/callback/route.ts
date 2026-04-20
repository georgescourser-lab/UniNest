import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/utils/supabase/route'
import {
  getTransactionByCheckoutRequestId,
  updateTransaction,
} from '@/utils/supabase/queries'
import { parseStkCallbackPayload } from '@/lib/mpesa'

export async function POST(request: NextRequest) {
  try {
    const configuredToken = process.env.MPESA_CALLBACK_TOKEN
    if (configuredToken) {
      const token = request.nextUrl.searchParams.get('token')
      if (token !== configuredToken) {
        return NextResponse.json({ error: 'Unauthorized callback token' }, { status: 401 })
      }
    }

    const payload = (await request.json()) as unknown
    const parsedCallback = parseStkCallbackPayload(payload)

    if (!parsedCallback) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: 'Invalid callback payload' }, { status: 400 })
    }

    const { supabase } = createRouteHandlerClient(request)
    const transaction = await getTransactionByCheckoutRequestId(
      supabase,
      parsedCallback.checkoutRequestId
    )

    if (transaction) {
      if (parsedCallback.resultCode === 0) {
        await updateTransaction(supabase, transaction.id, {
          status: 'COMPLETED',
          receipt_number: parsedCallback.receiptNumber,
          paid_at: new Date().toISOString(),
          failed_reason: null,
          mpesa_callback: payload as object,
        })
      } else {
        await updateTransaction(supabase, transaction.id, {
          status: 'FAILED',
          failed_reason: parsedCallback.resultDesc,
          mpesa_callback: payload as object,
        })
      }
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' }, { status: 200 })
  } catch (error) {
    console.error('M-Pesa callback handling error:', error)
    return NextResponse.json({ ResultCode: 1, ResultDesc: 'Callback handling failed' }, { status: 500 })
  }
}
