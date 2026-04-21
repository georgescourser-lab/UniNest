import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAppUser } from '@/lib/current-user'
import { createRouteHandlerClient } from '@/utils/supabase/route'
import { getRoommateProfile, upsertRoommateProfile } from '@/utils/supabase/queries'

// Define enums locally instead of importing from Prisma
enum Area {
  KAHAWA_WENDANI = 'KAHAWA_WENDANI',
  GITHURAI_44 = 'GITHURAI_44',
  KU_GATE_A = 'KU_GATE_A',
  KU_GATE_B = 'KU_GATE_B',
  KU_GATE_C = 'KU_GATE_C',
  ROYSAMBU = 'ROYSAMBU',
  KAHAWA_SUKARI = 'KAHAWA_SUKARI',
}

enum OccupancyType {
  SINGLE = 'SINGLE',
  SHARED = 'SHARED',
  EITHER = 'EITHER',
}

enum SleepRoutine {
  EARLY_BIRD = 'EARLY_BIRD',
  NIGHT_OWL = 'NIGHT_OWL',
  FLEXIBLE = 'FLEXIBLE',
}

enum CleanlinessPreference {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

enum GuestPolicy {
  NO_GUESTS = 'NO_GUESTS',
  OCCASIONAL = 'OCCASIONAL',
  FLEXIBLE = 'FLEXIBLE',
}

const VALID_AREAS = new Set(Object.values(Area))
const VALID_CAPACITIES = new Set(Object.values(OccupancyType))
const VALID_SLEEP_ROUTINES = new Set(Object.values(SleepRoutine))
const VALID_CLEANLINESS = new Set(Object.values(CleanlinessPreference))
const VALID_GUEST_POLICIES = new Set(Object.values(GuestPolicy))

export async function GET(request: NextRequest) {
  try {
    const { user, unauthorized } = await getCurrentAppUser(request)
    if (!user || unauthorized) {
      return unauthorized || NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { supabase } = createRouteHandlerClient(request)
    const profile = await getRoommateProfile(supabase, user.id)

    return NextResponse.json({ profile }, { status: 200 })
  } catch (error) {
    console.error('Roommate profile GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch roommate profile' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { user, unauthorized } = await getCurrentAppUser(request)
    if (!user || unauthorized) {
      return unauthorized || NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
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

    const { supabase } = createRouteHandlerClient(request)

    const profile = await upsertRoommateProfile(supabase, user.id, {
      preferred_area: (preferredArea as Area | null) || null,
      budget_min: Number.isFinite(budgetMin) ? budgetMin : null,
      budget_max: Number.isFinite(budgetMax) ? budgetMax : null,
      capacity_preference: (capacityPreference as OccupancyType | null) || null,
      sleep_routine: sleepRoutine as SleepRoutine,
      cleanliness_preference:
        cleanlinessPreference as CleanlinessPreference,
      guest_policy: guestPolicy as GuestPolicy,
      study_routine: body.studyRoutine || null,
      smoking:
        typeof body.smoking === 'boolean' ? body.smoking : null,
      drinking:
        typeof body.drinking === 'boolean' ? body.drinking : null,
      gender_preference: body.genderPreference || null,
      lifestyle_answers: body.lifestyleAnswers || null,
      compatibility_score:
        Number.isFinite(Number(body.compatibilityScore))
          ? Number(body.compatibilityScore)
          : null,
      compatibility_notes: body.compatibilityNotes || null,
    })

    return NextResponse.json({ profile }, { status: 200 })
  } catch (error) {
    console.error('Roommate profile POST error:', error)
    return NextResponse.json({ error: 'Failed to update roommate profile' }, { status: 500 })
  }
}
