'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'

type SleepRoutine = 'EARLY_BIRD' | 'BALANCED' | 'NIGHT_OWL' | 'FLEXIBLE'
type CleanlinessPreference = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH'
type GuestPolicy = 'STRICT' | 'LIMITED' | 'FLEXIBLE'
type Capacity = 'SINGLE' | 'TWO_SHARING'
type Area =
  | 'KAHAWA_WENDANI'
  | 'KAHAWA_SUKARI'
  | 'KM'
  | 'MWIHOKO'
  | 'GITHURAI_44'
  | 'GITHURAI_45'
  | 'RUIRU'

interface QuizState {
  preferredArea: Area
  budgetMin: string
  budgetMax: string
  capacityPreference: Capacity
  sleepRoutine: SleepRoutine
  cleanlinessPreference: CleanlinessPreference
  guestPolicy: GuestPolicy
  studyRoutine: string
  smoking: boolean
  drinking: boolean
  genderPreference: string
}

const initialState: QuizState = {
  preferredArea: 'KAHAWA_WENDANI',
  budgetMin: '6000',
  budgetMax: '15000',
  capacityPreference: 'SINGLE',
  sleepRoutine: 'BALANCED',
  cleanlinessPreference: 'HIGH',
  guestPolicy: 'LIMITED',
  studyRoutine: 'Evenings and weekends',
  smoking: false,
  drinking: false,
  genderPreference: 'No preference',
}

const compatibilityRules = {
  EARLY_BIRD: 30,
  BALANCED: 24,
  NIGHT_OWL: 22,
  FLEXIBLE: 26,
  LOW: 15,
  MEDIUM: 22,
  HIGH: 28,
  VERY_HIGH: 32,
  STRICT: 30,
  LIMITED: 25,
  FLEXIBLE_GUEST: 20,
}

function areaLabel(area: Area) {
  switch (area) {
    case 'KAHAWA_WENDANI':
      return 'Kahawa Wendani'
    case 'KAHAWA_SUKARI':
      return 'Kahawa Sukari'
    case 'KM':
      return 'KU KM'
    case 'MWIHOKO':
      return 'Mwihoko'
    case 'GITHURAI_44':
      return 'Githurai 44'
    case 'GITHURAI_45':
      return 'Githurai 45'
    case 'RUIRU':
      return 'Ruiru'
    default:
      return area
  }
}

export default function RoommateMatchPage() {
  const [state, setState] = useState<QuizState>(initialState)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/roommate/profile', { cache: 'no-store' })
        if (!response.ok) {
          setLoading(false)
          return
        }

        const payload = (await response.json()) as {
          profile?: {
            preferredArea?: Area
            budgetMin?: number
            budgetMax?: number
            capacityPreference?: Capacity
            sleepRoutine?: SleepRoutine
            cleanlinessPreference?: CleanlinessPreference
            guestPolicy?: GuestPolicy
            studyRoutine?: string
            smoking?: boolean
            drinking?: boolean
            genderPreference?: string
          } | null
        }

        const profile = payload.profile
        if (profile) {
          setState((prev) => ({
            ...prev,
            preferredArea: profile.preferredArea || prev.preferredArea,
            budgetMin: profile.budgetMin ? String(profile.budgetMin) : prev.budgetMin,
            budgetMax: profile.budgetMax ? String(profile.budgetMax) : prev.budgetMax,
            capacityPreference: profile.capacityPreference || prev.capacityPreference,
            sleepRoutine: profile.sleepRoutine || prev.sleepRoutine,
            cleanlinessPreference:
              profile.cleanlinessPreference || prev.cleanlinessPreference,
            guestPolicy: profile.guestPolicy || prev.guestPolicy,
            studyRoutine: profile.studyRoutine || prev.studyRoutine,
            smoking: typeof profile.smoking === 'boolean' ? profile.smoking : prev.smoking,
            drinking: typeof profile.drinking === 'boolean' ? profile.drinking : prev.drinking,
            genderPreference: profile.genderPreference || prev.genderPreference,
          }))
        }
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const compatibilityScore = useMemo(() => {
    const base =
      compatibilityRules[state.sleepRoutine] +
      compatibilityRules[state.cleanlinessPreference] +
      (state.guestPolicy === 'FLEXIBLE'
        ? compatibilityRules.FLEXIBLE_GUEST
        : compatibilityRules[state.guestPolicy])

    const habitBonus = (state.smoking ? -6 : 4) + (state.drinking ? -4 : 4)
    return Math.max(0, Math.min(100, base + habitBonus))
  }, [state])

  const compatibilityBand =
    compatibilityScore >= 80
      ? 'High compatibility profile'
      : compatibilityScore >= 60
      ? 'Good compatibility profile'
      : 'Needs clearer roommate expectations'

  const submitQuiz = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setSaving(true)

    try {
      const response = await fetch('/api/roommate/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...state,
          budgetMin: Number(state.budgetMin),
          budgetMax: Number(state.budgetMax),
          compatibilityScore,
          compatibilityNotes: {
            band: compatibilityBand,
            safety: 'Prefer verified listings and direct landlord onboarding only.',
          },
          lifestyleAnswers: {
            sleepRoutine: state.sleepRoutine,
            cleanlinessPreference: state.cleanlinessPreference,
            guestPolicy: state.guestPolicy,
            studyRoutine: state.studyRoutine,
            smoking: state.smoking,
            drinking: state.drinking,
          },
        }),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null
        throw new Error(payload?.error || 'Failed to save roommate preferences')
      }

      setSuccessMessage('Roommate profile saved. We will match you with compatible comrades.')
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Could not save your roommate preferences.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="section-wrap py-10">
      <div className="surface-card p-6 md:p-8">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-electric-blue">
          Student Dashboard
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">
          Roommate Compatibility Quiz
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Tell us your lifestyle and we will match you with comrades who align with your routine, safety preferences, and budget.
        </p>

        {loading ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading your preferences...</p>
        ) : (
          <form onSubmit={submitQuiz} className="mt-8 grid gap-4 md:grid-cols-2">
            <Field label="Preferred Area">
              <select title="Roommate field" 
                value={state.preferredArea}
                onChange={(event) =>
                  setState((prev) => ({
                    ...prev,
                    preferredArea: event.target.value as Area,
                  }))
                }
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
              >
                {(
                  [
                    'KAHAWA_WENDANI',
                    'KAHAWA_SUKARI',
                    'KM',
                    'MWIHOKO',
                    'GITHURAI_44',
                    'GITHURAI_45',
                    'RUIRU',
                  ] as Area[]
                ).map((area) => (
                  <option key={area} value={area}>
                    {areaLabel(area)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Capacity Preference">
              <select title="Roommate field" 
                value={state.capacityPreference}
                onChange={(event) =>
                  setState((prev) => ({
                    ...prev,
                    capacityPreference: event.target.value as Capacity,
                  }))
                }
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
              >
                <option value="SINGLE">Single</option>
                <option value="TWO_SHARING">2-sharing</option>
              </select>
            </Field>

            <Field label="Budget Min (KES)">
              <input title="Roommate field" 
                type="number"
                value={state.budgetMin}
                onChange={(event) =>
                  setState((prev) => ({ ...prev, budgetMin: event.target.value }))
                }
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
              />
            </Field>

            <Field label="Budget Max (KES)">
              <input title="Roommate field" 
                type="number"
                value={state.budgetMax}
                onChange={(event) =>
                  setState((prev) => ({ ...prev, budgetMax: event.target.value }))
                }
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
              />
            </Field>

            <Field label="Sleep Routine">
              <select title="Roommate field" 
                value={state.sleepRoutine}
                onChange={(event) =>
                  setState((prev) => ({
                    ...prev,
                    sleepRoutine: event.target.value as SleepRoutine,
                  }))
                }
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
              >
                <option value="EARLY_BIRD">Early bird</option>
                <option value="BALANCED">Balanced</option>
                <option value="NIGHT_OWL">Night owl</option>
                <option value="FLEXIBLE">Flexible</option>
              </select>
            </Field>

            <Field label="Cleanliness Preference">
              <select title="Roommate field" 
                value={state.cleanlinessPreference}
                onChange={(event) =>
                  setState((prev) => ({
                    ...prev,
                    cleanlinessPreference:
                      event.target.value as CleanlinessPreference,
                  }))
                }
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="VERY_HIGH">Very high</option>
              </select>
            </Field>

            <Field label="Guest Policy">
              <select title="Roommate field" 
                value={state.guestPolicy}
                onChange={(event) =>
                  setState((prev) => ({
                    ...prev,
                    guestPolicy: event.target.value as GuestPolicy,
                  }))
                }
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
              >
                <option value="STRICT">Strict</option>
                <option value="LIMITED">Limited</option>
                <option value="FLEXIBLE">Flexible</option>
              </select>
            </Field>

            <Field label="Study Routine">
              <input title="Roommate field" 
                value={state.studyRoutine}
                onChange={(event) =>
                  setState((prev) => ({ ...prev, studyRoutine: event.target.value }))
                }
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
              />
            </Field>

            <Field label="Gender Preference">
              <input title="Roommate field" 
                value={state.genderPreference}
                onChange={(event) =>
                  setState((prev) => ({ ...prev, genderPreference: event.target.value }))
                }
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
              />
            </Field>

            <label className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm">
              <input title="Roommate field" 
                type="checkbox"
                checked={state.smoking}
                onChange={(event) =>
                  setState((prev) => ({ ...prev, smoking: event.target.checked }))
                }
              />
              Smoking-friendly house
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm">
              <input title="Roommate field" 
                type="checkbox"
                checked={state.drinking}
                onChange={(event) =>
                  setState((prev) => ({ ...prev, drinking: event.target.checked }))
                }
              />
              Drinking-friendly house
            </label>

            <div className="md:col-span-2 rounded-xl border border-electric-blue/40 bg-electric-blue/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-electric-blue">
                Compatibility Score
              </p>
              <p className="mt-2 text-3xl font-bold text-foreground">{compatibilityScore}/100</p>
              <p className="mt-1 text-sm text-muted-foreground">{compatibilityBand}</p>
            </div>

            {errorMessage && (
              <p className="md:col-span-2 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {errorMessage}
              </p>
            )}

            {successMessage && (
              <p className="md:col-span-2 rounded-xl border border-electric-green/40 bg-electric-green/10 px-4 py-3 text-sm text-foreground">
                {successMessage}
              </p>
            )}

            <div className="md:col-span-2">
              <button disabled={saving} className="cta-electric disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Roommate Profile'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2">
      <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}

