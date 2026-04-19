'use client'

import React, { FormEvent, useState } from 'react'
import Link from 'next/link'

type ListingFormState = {
  title: string
  description: string
  propertyType: 'BEDSITTER' | 'HOSTEL' | 'APARTMENT' | 'STUDIO' | 'SHARED_ROOM'
  area:
    | 'KAHAWA_WENDANI'
    | 'KAHAWA_SUKARI'
    | 'KM'
    | 'MWIHOKO'
    | 'GITHURAI_44'
    | 'GITHURAI_45'
    | 'RUIRU'
  zone: string
  location: string
  latitude: string
  longitude: string
  price: string
  bookingFee: string
  capacity: 'SINGLE' | 'TWO_SHARING'
  bedrooms: string
  bathrooms: string
  amenities: string
  images: string
  waterReliability: 'RELIABLE' | 'RATIONED' | 'BOREHOLE'
  hasWifi: boolean
  wifiQuality: string
  securityScore: string
  noiseLevel: string
  lookingForRoommate: boolean
  landlordName: string
  phoneNumber: string
  caretakerName: string
}

const initialForm: ListingFormState = {
  title: '',
  description: '',
  propertyType: 'BEDSITTER',
  area: 'KAHAWA_WENDANI',
  zone: '',
  location: '',
  latitude: '',
  longitude: '',
  price: '',
  bookingFee: '',
  capacity: 'SINGLE',
  bedrooms: '1',
  bathrooms: '1',
  amenities: 'WiFi, Water, Security',
  images: '',
  waterReliability: 'RELIABLE',
  hasWifi: true,
  wifiQuality: '4',
  securityScore: '4',
  noiseLevel: '3',
  lookingForRoommate: false,
  landlordName: '',
  phoneNumber: '',
  caretakerName: '',
}

const areaLabels: Record<ListingFormState['area'], string> = {
  KAHAWA_WENDANI: 'Kahawa Wendani',
  KAHAWA_SUKARI: 'Kahawa Sukari',
  KM: 'KU KM',
  MWIHOKO: 'Mwihoko',
  GITHURAI_44: 'Githurai 44',
  GITHURAI_45: 'Githurai 45',
  RUIRU: 'Ruiru',
}

export default function PostListingPage() {
  const [form, setForm] = useState<ListingFormState>(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const updateField = <K extends keyof ListingFormState>(
    key: K,
    value: ListingFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      const imageList = form.images
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean)

      const amenities = form.amenities
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)

      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          propertyType: form.propertyType,
          area: form.area,
          zone: form.zone,
          location: form.location,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          price: Number(form.price),
          bookingFee: form.bookingFee ? Number(form.bookingFee) : null,
          capacity: form.capacity,
          bedrooms: Number(form.bedrooms),
          bathrooms: Number(form.bathrooms),
          amenities,
          images: imageList,
          waterReliability: form.waterReliability,
          hasWifi: form.hasWifi,
          wifiQuality: form.hasWifi ? Number(form.wifiQuality) : null,
          securityScore: Number(form.securityScore),
          noiseLevel: Number(form.noiseLevel),
          lookingForRoommate: form.lookingForRoommate,
          landlordName: form.landlordName,
          phoneNumber: form.phoneNumber,
          caretakerName: form.caretakerName || null,
        }),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null
        throw new Error(payload?.error || 'Failed to submit listing')
      }

      setSuccessMessage('Listing submitted successfully. Your property is now in the feed.')
      setForm(initialForm)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong while saving your listing.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="section-wrap py-10">
      <div className="surface-card p-6 md:p-8">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-electric-blue">
          Landlord Dashboard
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">
          Upload Property Listing
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Reach KU comrades directly, avoid broker confusion, and publish transparent, zero-viewing-fee listings.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Property Title" required>
              <input title="Listing field" 
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                required
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
                placeholder="Example: Modern bedsitter near KU Gate B"
              />
            </FormField>

            <FormField label="Property Type" required>
              <select title="Listing field" 
                value={form.propertyType}
                onChange={(event) =>
                  updateField('propertyType', event.target.value as ListingFormState['propertyType'])
                }
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
              >
                <option value="BEDSITTER">Bedsitter</option>
                <option value="HOSTEL">Hostel</option>
                <option value="APARTMENT">Apartment</option>
                <option value="STUDIO">Studio</option>
                <option value="SHARED_ROOM">Shared Room</option>
              </select>
            </FormField>

            <FormField label="Area" required>
              <select title="Listing field" 
                value={form.area}
                onChange={(event) =>
                  updateField('area', event.target.value as ListingFormState['area'])
                }
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
              >
                {Object.entries(areaLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Zone" required>
              <input title="Listing field" 
                value={form.zone}
                onChange={(event) => updateField('zone', event.target.value)}
                required
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
                placeholder="Example: Bypass Stage"
              />
            </FormField>

            <div className="md:col-span-2">
              <FormField label="Location Description" required>
                <input title="Listing field" 
                  value={form.location}
                  onChange={(event) => updateField('location', event.target.value)}
                  required
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
                  placeholder="Landmark and walking distance from KU"
                />
              </FormField>
            </div>

            <FormField label="Latitude" required>
              <input title="Listing field" 
                type="number"
                step="0.0000001"
                value={form.latitude}
                onChange={(event) => updateField('latitude', event.target.value)}
                required
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
              />
            </FormField>

            <FormField label="Longitude" required>
              <input title="Listing field" 
                type="number"
                step="0.0000001"
                value={form.longitude}
                onChange={(event) => updateField('longitude', event.target.value)}
                required
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
              />
            </FormField>

            <FormField label="Monthly Price (KES)" required>
              <input title="Listing field" 
                type="number"
                min="0"
                value={form.price}
                onChange={(event) => updateField('price', event.target.value)}
                required
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
              />
            </FormField>

            <FormField label="Booking Fee (KES)">
              <input title="Listing field" 
                type="number"
                min="0"
                value={form.bookingFee}
                onChange={(event) => updateField('bookingFee', event.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
              />
            </FormField>

            <FormField label="Capacity" required>
              <select title="Listing field" 
                value={form.capacity}
                onChange={(event) =>
                  updateField('capacity', event.target.value as ListingFormState['capacity'])
                }
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
              >
                <option value="SINGLE">Single</option>
                <option value="TWO_SHARING">2-sharing</option>
              </select>
            </FormField>

            <FormField label="Bedrooms" required>
              <input title="Listing field" 
                type="number"
                min="0"
                value={form.bedrooms}
                onChange={(event) => updateField('bedrooms', event.target.value)}
                required
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
              />
            </FormField>

            <FormField label="Bathrooms" required>
              <input title="Listing field" 
                type="number"
                min="0"
                value={form.bathrooms}
                onChange={(event) => updateField('bathrooms', event.target.value)}
                required
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
              />
            </FormField>

            <FormField label="Water Reliability" required>
              <select title="Listing field" 
                value={form.waterReliability}
                onChange={(event) =>
                  updateField(
                    'waterReliability',
                    event.target.value as ListingFormState['waterReliability']
                  )
                }
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
              >
                <option value="RELIABLE">Reliable</option>
                <option value="RATIONED">Rationed</option>
                <option value="BOREHOLE">Borehole</option>
              </select>
            </FormField>

            <FormField label="WiFi Quality (1-5)">
              <input title="Listing field" 
                type="number"
                min="1"
                max="5"
                value={form.wifiQuality}
                disabled={!form.hasWifi}
                onChange={(event) => updateField('wifiQuality', event.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm disabled:opacity-40"
              />
            </FormField>

            <FormField label="Security Score (1-5)" required>
              <input title="Listing field" 
                type="number"
                min="1"
                max="5"
                value={form.securityScore}
                onChange={(event) => updateField('securityScore', event.target.value)}
                required
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
              />
            </FormField>

            <FormField label="Noise Level (1-5)" required>
              <input title="Listing field" 
                type="number"
                min="1"
                max="5"
                value={form.noiseLevel}
                onChange={(event) => updateField('noiseLevel', event.target.value)}
                required
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
              />
            </FormField>

            <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
              <label className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm">
                <input title="Listing field" 
                  type="checkbox"
                  checked={form.hasWifi}
                  onChange={(event) => updateField('hasWifi', event.target.checked)}
                />
                Property has WiFi
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm">
                <input title="Listing field" 
                  type="checkbox"
                  checked={form.lookingForRoommate}
                  onChange={(event) =>
                    updateField('lookingForRoommate', event.target.checked)
                  }
                />
                Open to roommate matching
              </label>
            </div>

            <div className="md:col-span-2">
              <FormField label="Amenities (comma separated)">
                <input title="Listing field" 
                  value={form.amenities}
                  onChange={(event) => updateField('amenities', event.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
                />
              </FormField>
            </div>

            <div className="md:col-span-2">
              <FormField label="Image URLs (comma or new line separated)">
                <textarea title="Listing field" 
                  rows={4}
                  value={form.images}
                  onChange={(event) => updateField('images', event.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
                  placeholder="https://..."
                />
              </FormField>
            </div>

            <div className="md:col-span-2">
              <FormField label="Description">
                <textarea title="Listing field" 
                  rows={4}
                  value={form.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
                />
              </FormField>
            </div>

            <FormField label="Landlord Display Name">
              <input title="Listing field" 
                value={form.landlordName}
                onChange={(event) => updateField('landlordName', event.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
              />
            </FormField>

            <FormField label="Phone Number">
              <input title="Listing field" 
                value={form.phoneNumber}
                onChange={(event) => updateField('phoneNumber', event.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
                placeholder="+2547..."
              />
            </FormField>

            <FormField label="Caretaker Name">
              <input title="Listing field" 
                value={form.caretakerName}
                onChange={(event) => updateField('caretakerName', event.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
              />
            </FormField>
          </div>

          {errorMessage && (
            <p className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p className="rounded-xl border border-electric-green/40 bg-electric-green/10 px-4 py-3 text-sm text-foreground">
              {successMessage}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button disabled={isSubmitting} className="cta-electric disabled:opacity-60">
              {isSubmitting ? 'Submitting...' : 'Publish Listing'}
            </button>
            <Link href="/" className="rounded-xl border border-border px-4 py-2 text-sm">
              Back to Home
            </Link>
          </div>
        </form>
      </div>
    </section>
  )
}

function FormField({
  label,
  children,
  required = false,
}: {
  label: string
  children: React.ReactNode
  required?: boolean
}) {
  const control = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<any>, {
        title: label,
        'aria-label': label,
      })
    : children

  return (
    <div className="space-y-2">
      <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label} {required ? '*' : ''}
      </span>
      {control}
    </div>
  )
}

