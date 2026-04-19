import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type StatusParams = {
  params: Promise<{
    checkoutRequestId: string
  }>
}

export async function GET(_request: NextRequest, { params }: StatusParams) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          error: 'Database is not configured',
          code: 'DB_NOT_CONFIGURED',
        },
        { status: 503 }
      )
    }

    const { checkoutRequestId } = await params
    const transaction = await prisma.transaction.findUnique({
      where: { checkoutRequestId },
      select: {
        id: true,
        status: true,
        amount: true,
        currency: true,
        phoneNumber: true,
        accountReference: true,
        checkoutRequestId: true,
        merchantRequestId: true,
        receiptNumber: true,
        failedReason: true,
        paidAt: true,
        reconciledAt: true,
        createdAt: true,
        updatedAt: true,
        property: {
          select: {
            id: true,
            title: true,
            area: true,
            location: true,
          },
        },
      },
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    return NextResponse.json({ transaction }, { status: 200 })
  } catch (error) {
    console.error('M-Pesa status lookup error:', error)
    return NextResponse.json({ error: 'Failed to fetch transaction status' }, { status: 500 })
  }
}