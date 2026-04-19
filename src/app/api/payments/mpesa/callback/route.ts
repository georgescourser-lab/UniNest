import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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

    const transaction = await prisma.transaction.findUnique({
      where: { checkoutRequestId: parsedCallback.checkoutRequestId },
      select: { id: true },
    })

    if (transaction) {
      if (parsedCallback.resultCode === 0) {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'COMPLETED',
            receiptNumber: parsedCallback.receiptNumber,
            paidAt: new Date(),
            failedReason: null,
            mpesaCallback: payload as object,
          },
        })
      } else {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'FAILED',
            failedReason: parsedCallback.resultDesc,
            mpesaCallback: payload as object,
          },
        })
      }
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' }, { status: 200 })
  } catch (error) {
    console.error('M-Pesa callback handling error:', error)
    return NextResponse.json({ ResultCode: 1, ResultDesc: 'Callback handling failed' }, { status: 500 })
  }
}
