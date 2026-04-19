import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SESSION_COOKIE_NAME } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          user: null,
          authenticated: false,
          code: 'DB_NOT_CONFIGURED',
          error: 'Database is not configured',
        },
        { status: 200 }
      )
    }

    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value
    if (!sessionCookie) {
      return NextResponse.json({ user: null, authenticated: false }, { status: 200 })
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionCookie },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    if (!user) {
      return NextResponse.json({ user: null, authenticated: false }, { status: 200 })
    }

    return NextResponse.json({ user, authenticated: true }, { status: 200 })
  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json(
      { user: null, authenticated: false, error: 'Failed to check auth state' },
      { status: 200 }
    )
  }
}
