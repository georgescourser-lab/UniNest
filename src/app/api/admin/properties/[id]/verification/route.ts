import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SESSION_COOKIE_NAME } from '@/lib/session'

const ALLOWED_STATUSES = new Set(['PENDING', 'VERIFIED', 'REJECTED'])

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
    }

    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: sessionCookie },
      select: { role: true },
    })

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id } = await params
    const body = (await request.json()) as {
      verificationStatus?: string
      isVerified?: boolean
    }

    const verificationStatus = String(body.verificationStatus || '').toUpperCase()
    if (!ALLOWED_STATUSES.has(verificationStatus)) {
      return NextResponse.json(
        { error: 'verificationStatus must be PENDING, VERIFIED, or REJECTED' },
        { status: 400 }
      )
    }

    const property = await prisma.property.update({
      where: { id },
      data: {
        verificationStatus: verificationStatus as 'PENDING' | 'VERIFIED' | 'REJECTED',
        isVerifiedProperty: verificationStatus === 'VERIFIED',
        verifiedAt: verificationStatus === 'VERIFIED' ? new Date() : null,
      },
      select: {
        id: true,
        title: true,
        verificationStatus: true,
        isVerifiedProperty: true,
        verifiedAt: true,
      },
    })

    return NextResponse.json({ property }, { status: 200 })
  } catch (error) {
    console.error('Admin verification update error:', error)
    return NextResponse.json({ error: 'Failed to update verification status' }, { status: 500 })
  }
}
