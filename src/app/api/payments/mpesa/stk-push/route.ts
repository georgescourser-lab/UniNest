import { NextRequest, NextResponse } from 'next/server'
import { Prisma, TransactionType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { SESSION_COOKIE_NAME } from '@/lib/session'
import {
  assertMpesaConfig,
  getMpesaConfig,
  initiateStkPush,
  normalizeKenyanPhoneNumber,
} from '@/lib/mpesa'

interface StkPushRequestBody {
  propertyId?: string
  phoneNumber?: string
  amount?: number
  transactionType?: TransactionType
  accountReference?: string
}

const ALLOWED_TRANSACTION_TYPES: TransactionType[] = [
  TransactionType.BOOKING_FEE,
  TransactionType.RENT_PAYMENT,
  TransactionType.SECURITY_DEPOSIT,
]

export async function POST(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database is not configured', code: 'DB_NOT_CONFIGURED' },
        { status: 503 }
      )
    }

    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = (await request.json()) as StkPushRequestBody

    const propertyId = String(body.propertyId || '').trim()
    const rawPhoneNumber = String(body.phoneNumber || '').trim()
    const phoneNumber = normalizeKenyanPhoneNumber(rawPhoneNumber)

    if (!propertyId) {
      return NextResponse.json({ error: 'propertyId is required' }, { status: 400 })
    }

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Provide a valid Kenyan phone number (e.g. 07XXXXXXXX or 2547XXXXXXXX)' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionCookie },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        title: true,
        price: true,
        bookingFee: true,
        isActive: true,
      },
    })

    if (!property || !property.isActive) {
      return NextResponse.json({ error: 'Property not found or inactive' }, { status: 404 })
    }

    const requestedAmount = Number(body.amount)
    const fallbackAmount = Number(property.bookingFee || property.price)
    const amount = Number.isFinite(requestedAmount) && requestedAmount > 0 ? requestedAmount : fallbackAmount

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const transactionType = body.transactionType || TransactionType.BOOKING_FEE

    if (!ALLOWED_TRANSACTION_TYPES.includes(transactionType)) {
      return NextResponse.json({ error: 'Invalid transactionType' }, { status: 400 })
    }

    const accountReference =
      String(body.accountReference || '').trim() || `UNN-${property.id.slice(0, 8).toUpperCase()}`

    const mpesaConfig = getMpesaConfig()
    const missingConfig = assertMpesaConfig(mpesaConfig)

    if (missingConfig.length > 0) {
      return NextResponse.json(
        {
          error: 'M-Pesa is not configured',
          missing: missingConfig,
        },
        { status: 503 }
      )
    }

    const stkResponse = await initiateStkPush(mpesaConfig, {
      amount,
      phoneNumber,
      accountReference,
      transactionDescription: `${transactionType} for ${property.title}`,
    })

    const isAccepted = stkResponse.ResponseCode === '0'
    const checkoutRequestId = stkResponse.CheckoutRequestID

    if (!checkoutRequestId) {
      return NextResponse.json(
        {
          error: 'M-Pesa response did not include CheckoutRequestID',
          response: stkResponse,
        },
        { status: 502 }
      )
    }

    const transaction = await prisma.transaction.create({
      data: {
        payerId: user.id,
        propertyId: property.id,
        transactionType,
        amount,
        phoneNumber,
        accountReference,
        status: isAccepted ? 'PROCESSING' : 'FAILED',
        checkoutRequestId,
        merchantRequestId: stkResponse.MerchantRequestID,
        mpesaCallback: stkResponse as unknown as Prisma.InputJsonValue,
        failedReason: isAccepted
          ? null
          : stkResponse.errorMessage || stkResponse.ResponseDescription || 'STK initiation failed',
      },
      select: {
        id: true,
        status: true,
        checkoutRequestId: true,
        merchantRequestId: true,
      },
    })

    return NextResponse.json(
      {
        message: stkResponse.CustomerMessage || 'STK push initiated',
        transaction,
      },
      { status: isAccepted ? 200 : 502 }
    )
  } catch (error) {
    console.error('STK push initiation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to initiate M-Pesa payment',
      },
      { status: 500 }
    )
  }
}
