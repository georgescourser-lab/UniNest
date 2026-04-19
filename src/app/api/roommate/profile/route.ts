import { NextRequest, NextResponse } from 'next/server'
import {
  Area,
  CleanlinessPreference,
  GuestPolicy,
  OccupancyType,
  SleepRoutine,
} from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { SESSION_COOKIE_NAME } from '@/lib/session'

const VALID_AREAS = new Set(Object.values(Area))
const VALID_CAPACITIES = new Set(Object.values(OccupancyType))
const VALID_SLEEP_ROUTINES = new Set(Object.values(SleepRoutine))
const VALID_CLEANLINESS = new Set(Object.values(CleanlinessPreference))
const VALID_GUEST_POLICIES = new Set(Object.values(GuestPolicy))

export async function GET(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { profile: null, code: 'DB_NOT_CONFIGURED', demoMode: true },
        { status: 200 }
      )
    }

    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const profile = await prisma.roommateProfile.findUnique({
      where: { userId: sessionCookie },
    })

    return NextResponse.json({ profile }, { status: 200 })
  } catch (error) {
    console.error('Roommate profile GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch roommate profile' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          profile: {
            ...body,
            budgetMin: Number.isFinite(Number(body.budgetMin)) ? Number(body.budgetMin) : null,
            budgetMax: Number.isFinite(Number(body.budgetMax)) ? Number(body.budgetMax) : null,
          },
          code: 'DB_NOT_CONFIGURED',
          demoMode: true,
        },
        { status: 200 }
      )
    }

    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const preferredArea = body.preferredArea ? String(body.preferredArea) : null
    const capacityPreference = body.capacityPreference
      ? String(body.capacityPreference)
      : null
    const sleepRoutine = String(body.sleepRoutine || 'FLEXIBLE')
    const cleanlinessPreference = String(body.cleanlinessPreference || 'MEDIUM')
    const guestPolicy = String(body.guestPolicy || 'FLEXIBLE')

    if (preferredArea && !VALID_AREAS.has(preferredArea as Area)) {
      return NextResponse.json({ error: 'Invalid preferredArea' }, { status: 400 })
    }

    if (
      capacityPreference &&
      !VALID_CAPACITIES.has(capacityPreference as OccupancyType)
    ) {
      return NextResponse.json({ error: 'Invalid capacityPreference' }, { status: 400 })
    }

    if (!VALID_SLEEP_ROUTINES.has(sleepRoutine as SleepRoutine)) {
      return NextResponse.json({ error: 'Invalid sleepRoutine' }, { status: 400 })
    }

    if (
      !VALID_CLEANLINESS.has(cleanlinessPreference as CleanlinessPreference)
    ) {
      return NextResponse.json({ error: 'Invalid cleanlinessPreference' }, { status: 400 })
    }

    if (!VALID_GUEST_POLICIES.has(guestPolicy as GuestPolicy)) {
      return NextResponse.json({ error: 'Invalid guestPolicy' }, { status: 400 })
    }

    const budgetMin = Number(body.budgetMin)
    const budgetMax = Number(body.budgetMax)

    const profile = await prisma.roommateProfile.upsert({
      where: { userId: sessionCookie },
      create: {
        userId: sessionCookie,
        preferredArea: (preferredArea as Area | null) || null,
        budgetMin: Number.isFinite(budgetMin) ? budgetMin : null,
        budgetMax: Number.isFinite(budgetMax) ? budgetMax : null,
        capacityPreference: (capacityPreference as OccupancyType | null) || null,
        sleepRoutine: sleepRoutine as SleepRoutine,
        cleanlinessPreference:
          cleanlinessPreference as CleanlinessPreference,
        guestPolicy: guestPolicy as GuestPolicy,
        studyRoutine: body.studyRoutine || null,
        smoking:
          typeof body.smoking === 'boolean' ? body.smoking : null,
        drinking:
          typeof body.drinking === 'boolean' ? body.drinking : null,
        genderPreference: body.genderPreference || null,
        lifestyleAnswers: body.lifestyleAnswers || null,
        compatibilityScore:
          Number.isFinite(Number(body.compatibilityScore))
            ? Number(body.compatibilityScore)
            : null,
        compatibilityNotes: body.compatibilityNotes || null,
      },
      update: {
        preferredArea: (preferredArea as Area | null) || null,
        budgetMin: Number.isFinite(budgetMin) ? budgetMin : null,
        budgetMax: Number.isFinite(budgetMax) ? budgetMax : null,
        capacityPreference: (capacityPreference as OccupancyType | null) || null,
        sleepRoutine: sleepRoutine as SleepRoutine,
        cleanlinessPreference:
          cleanlinessPreference as CleanlinessPreference,
        guestPolicy: guestPolicy as GuestPolicy,
        studyRoutine: body.studyRoutine || null,
        smoking:
          typeof body.smoking === 'boolean' ? body.smoking : null,
        drinking:
          typeof body.drinking === 'boolean' ? body.drinking : null,
        genderPreference: body.genderPreference || null,
        lifestyleAnswers: body.lifestyleAnswers || null,
        compatibilityScore:
          Number.isFinite(Number(body.compatibilityScore))
            ? Number(body.compatibilityScore)
            : null,
        compatibilityNotes: body.compatibilityNotes || null,
      },
    })

    return NextResponse.json({ profile }, { status: 200 })
  } catch (error) {
    console.error('Roommate profile POST error:', error)
    return NextResponse.json({ error: 'Failed to save roommate profile' }, { status: 500 })
  }
}
