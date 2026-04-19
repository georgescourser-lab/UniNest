'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, MapPin, ChevronRight, Zap } from 'lucide-react'
import ListingCard from '@/components/ListingCard'

// Mock data
const mockListings = [
  {
    id: '1',
    title: 'Spacious 2BR Bedsitter near Campus',
    price: 15000,
    area: 'Kahawa Wendani',
    location: 'Close to Main Gate',
    bedrooms: 2,
    bathrooms: 1,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=400&fit=crop',
    latitude: 1.9437,
    longitude: 36.881,
    isVerifiedProperty: true,
    waterReliability: 'RELIABLE' as const,
    hasWifi: true,
    wifiQuality: 4,
    securityScore: 5,
    noiseLevel: 2,
    lookingForRoommate: true,
    reviewCount: 12,
    averageRating: 4.8,
  },
  {
    id: '2',
    title: 'Cozy Single Room with Balcony',
    price: 8500,
    area: 'Githurai 44',
    location: 'Main Road',
    bedrooms: 1,
    bathrooms: 1,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=400&fit=crop',
    latitude: 1.942,
    longitude: 36.889,
    isVerifiedProperty: false,
    waterReliability: 'RATIONED' as const,
    hasWifi: true,
    wifiQuality: 3,
    securityScore: 4,
    noiseLevel: 3,
    lookingForRoommate: false,
    reviewCount: 8,
    averageRating: 4.3,
  },
  {
    id: '3',
    title: '3BR Maisonette - Perfect for Group',
    price: 28000,
    area: 'Kahawa Sukari',
    location: 'Secure Estate',
    bedrooms: 3,
    bathrooms: 2,
    image: 'https://images.unsplash.com/photo-1585399363032-fdbeffb36091?w=500&h=400&fit=crop',
    latitude: 1.95,
    longitude: 36.87,
    isVerifiedProperty: true,
    waterReliability: 'BOREHOLE' as const,
    hasWifi: true,
    wifiQuality: 5,
    securityScore: 5,
    noiseLevel: 1,
    lookingForRoommate: true,
    reviewCount: 24,
    averageRating: 4.9,
  },
  {
    id: '4',
    title: 'Budget Friendly Bedsitter',
    price: 6500,
    area: 'Mwihoko',
    location: 'Walking Distance to Campus',
    bedrooms: 1,
    bathrooms: 1,
    image: 'https://images.unsplash.com/photo-1460932468917-551de54faf60?w=500&h=400&fit=crop',
    latitude: 1.935,
    longitude: 36.892,
    isVerifiedProperty: false,
    waterReliability: 'RATIONED' as const,
    hasWifi: false,
    wifiQuality: 0,
    securityScore: 3,
    noiseLevel: 4,
    lookingForRoommate: false,
    reviewCount: 5,
    averageRating: 3.8,
  },
  {
    id: '5',
    title: 'Luxury 2BR Apartment with Garden',
    price: 22000,
    area: 'Ruiru',
    location: 'Quiet Neighborhood',
    bedrooms: 2,
    bathrooms: 2,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=400&fit=crop',
    latitude: 1.92,
    longitude: 36.87,
    isVerifiedProperty: true,
    waterReliability: 'RELIABLE' as const,
    hasWifi: true,
    wifiQuality: 5,
    securityScore: 5,
    noiseLevel: 1,
    lookingForRoommate: false,
    reviewCount: 18,
    averageRating: 4.7,
  },
  {
    id: '6',
    title: 'Studio Apartment - Short Term Available',
    price: 7000,
    area: 'KM',
    location: 'City Center Adjacent',
    bedrooms: 1,
    bathrooms: 1,
    image: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=500&h=400&fit=crop',
    latitude: 1.938,
    longitude: 36.882,
    isVerifiedProperty: true,
    waterReliability: 'RELIABLE' as const,
    hasWifi: true,
    wifiQuality: 4,
    securityScore: 4,
    noiseLevel: 3,
    lookingForRoommate: false,
    reviewCount: 15,
    averageRating: 4.5,
  },
]

const kuAreas = [
  { name: 'Kahawa Wendani', count: 342 },
  { name: 'Githurai 44', count: 287 },
  { name: 'Kahawa Sukari', count: 215 },
  { name: 'Mwihoko', count: 178 },
  { name: 'Ruiru', count: 156 },
  { name: 'Githurai 45', count: 143 },
  { name: 'KM', count: 112 },
]

export default function Home() {
  const [searchLocation, setSearchLocation] = useState('')
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const query = searchLocation.trim()
    router.push(query ? `/search?query=${encodeURIComponent(query)}` : '/search')
  }

  const filteredListings = selectedArea
    ? mockListings.filter((listing) => listing.area === selectedArea)
    : mockListings

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white py-12 px-4 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 md:mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Perfect Hostel at KU
            </h1>
            <p className="text-emerald-100 text-lg md:text-xl max-w-2xl">
              Discover student-verified accommodations with &quot;Comrade Metrics&quot; - water, WiFi, security,
              and noise ratings from real students.
            </p>
          </div>

          {/* Hero Search Bar */}
          <form onSubmit={handleSearch} className="theme-panel p-4 shadow-lg md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-1 md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Where are you looking?
                </label>
                <div className="relative flex items-center">
                  <MapPin size={20} className="absolute left-3 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search area or specific location..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background py-3 pl-10 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-electric-blue/30"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Property Type</label>
                <select
                  aria-label="Property type"
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-electric-blue/30"
                >
                  <option value="">All Types</option>
                  <option value="bedsitter">Bedsitter</option>
                  <option value="apartment">Apartment</option>
                  <option value="maisonette">Maisonette</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              <Search size={20} />
              Search Listings
            </button>
          </form>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-emerald-400 bg-opacity-30 rounded-lg p-4">
              <p className="text-3xl font-bold">1,200+</p>
              <p className="text-emerald-100 text-sm">Active Listings</p>
            </div>
            <div className="bg-emerald-400 bg-opacity-30 rounded-lg p-4">
              <p className="text-3xl font-bold">5K+</p>
              <p className="text-emerald-100 text-sm">Student Reviews</p>
            </div>
            <div className="bg-emerald-400 bg-opacity-30 rounded-lg p-4">
              <p className="text-3xl font-bold">7 Areas</p>
              <p className="text-emerald-100 text-sm">Near Campus</p>
            </div>
            <div className="bg-emerald-400 bg-opacity-30 rounded-lg p-4">
              <p className="text-3xl font-bold">98%</p>
              <p className="text-emerald-100 text-sm">Verified Landlords</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Areas */}
      <section className="bg-background px-4 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">Popular Areas Near KU</h2>
            <Link href="/areas" className="flex items-center gap-1 font-medium text-electric-blue hover:text-electric-green">
              View All
              <ChevronRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {kuAreas.map((area) => (
              <button
                key={area.name}
                onClick={() => {
                  setSelectedArea(selectedArea === area.name ? null : area.name)
                  router.push(`/search?area=${encodeURIComponent(area.name)}`)
                }}
                className={`p-4 rounded-lg border-2 transition duration-200 text-left group ${
                  selectedArea === area.name
                    ? 'border-electric-blue bg-electric-blue/10'
                    : 'border-border bg-card hover:border-electric-green'
                }`}
              >
                <p className="font-semibold text-foreground group-hover:text-electric-blue">{area.name}</p>
                <p className="text-sm text-muted-foreground">{area.count} listings</p>
              </button>
            ))}
          </div>

          {/* Featured Listings Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">
                {selectedArea ? `Listings in ${selectedArea}` : 'Featured Hostels'}
              </h2>
              {selectedArea && (
                <button
                  onClick={() => {
                    setSelectedArea(null)
                    router.push('/search')
                  }}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Clear Filter
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} {...listing} />
              ))}
            </div>

            {filteredListings.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No listings found in this area.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why ComradeHomes Section */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="mb-12 text-center text-2xl font-bold text-foreground md:text-3xl">
            Why Choose ComradeHomes?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="theme-panel rounded-lg p-6 transition hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-electric-blue/10">
                <Zap size={24} className="text-electric-blue" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Comrade Metrics</h3>
              <p className="text-muted-foreground">
                Real student ratings for water, WiFi, security, and noise levels. Know exactly what you&apos;re
                getting.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="theme-panel rounded-lg p-6 transition hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-electric-green/10">
                <MapPin size={24} className="text-electric-green" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Distance to Campus</h3>
              <p className="text-muted-foreground">
                See walking time to Gates A, B, and C. Find places based on your schedule and commute time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="theme-panel rounded-lg p-6 transition hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-electric-blue/10">
                <Search size={24} className="text-electric-blue" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Verified Landlords</h3>
              <p className="text-muted-foreground">
                Trust verified landlords and read genuine reviews from students who have lived there.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-electric-blue/10 px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Are you a Landlord or Caretaker?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            List your properties on ComradeHomes and reach thousands of KU students searching for accommodation.
          </p>
          <Link
            href="/post-listing"
            className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-8 rounded-lg transition duration-200"
          >
            Post Your Listing Today
          </Link>
        </div>
      </section>
    </div>
  )
}
