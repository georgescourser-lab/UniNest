import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAppUser } from '@/lib/current-user'
import { createRouteHandlerClient } from '@/utils/supabase/route'
import {
  getPropertiesWithFilters,
  createProperty,
} from '@/utils/supabase/queries'

const mockListings = [
  {
    id: '1',
    title: 'Spacious 2BR Bedsitter near Campus',
    description: 'Clean, secure, and close to KU.',
    price: 15000,
    bedrooms: 2,
    bathrooms: 1,
    amenities: ['WiFi', 'Water', 'Security'],
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=400&fit=crop',
    ],
    location: 'Close to Main Gate',
    area: 'KAHAWA',
    latitude: 1.9437,
    longitude: 36.881,
    waterReliability: 8,
    wifiQuality: 7,
    securityScore: 8,
    noiseLevel: 3,
    roommateWanted: true,
    isVerifiedProperty: true,
    owner: {
      id: 'mock-1',
      fullName: 'John Owner',
      email: 'john@example.com',
      phone: null,
      verified: true,
    },
    reviews: [{ rating: 5 }, { rating: 4 }],
    reviewCount: 2,
    averageRating: 4.5,
  },
  {
    id: '2',
    title: 'Budget Friendly Bedsitter',
    description: 'Affordable option in a student-friendly zone.',
    price: 6500,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['Water'],
    images: [
      'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=500&h=400&fit=crop',
    ],
    location: 'Near shopping center',
    area: 'KWARE',
    latitude: 1.942,
    longitude: 36.889,
    waterReliability: 5,
    wifiQuality: 0,
    securityScore: 5,
    noiseLevel: 5,
    roommateWanted: false,
    isVerifiedProperty: false,
    owner: {
      id: 'mock-2',
      fullName: 'Jane Owner',
      email: 'jane@example.com',
      phone: null,
      verified: false,
    },
    reviews: [{ rating: 3 }],
    reviewCount: 1,
    averageRating: 3.0,
  },
]

function getMockResponse() {
  return {
    data: mockListings,
    total: mockListings.length,
    limit: mockListings.length,
    offset: 0,
    hasMore: false,
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const area = searchParams.get('area') || undefined
    const priceMin = searchParams.get('priceMin') ? parseInt(searchParams.get('priceMin')!, 10) : undefined
    const priceMax = searchParams.get('priceMax') ? parseInt(searchParams.get('priceMax')!, 10) : undefined
    const hasWifi = searchParams.get('hasWifi') === 'true'
    const limit = parseInt(searchParams.get('limit') || '12', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const { supabase } = createRouteHandlerClient(request)

    const { properties, total } = await getPropertiesWithFilters(supabase, {
      area,
      priceMin,
      priceMax,
      hasWifi,
      limit,
      offset,
    })

    return NextResponse.json({
      data: properties,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    })
  } catch (error) {
    console.error('Error fetching listings:', error)
    return NextResponse.json(getMockResponse())
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { user, unauthorized } = await getCurrentAppUser(request)
    if (!user || unauthorized) {
      return unauthorized || NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (!body.title || !body.area || !body.location) {
      return NextResponse.json(
        { error: 'title, area, and location are required' },
        { status: 400 }
      )
    }

    const { supabase } = createRouteHandlerClient(request)

    const property = await createProperty(supabase, user.id, {
      title: String(body.title),
      description: String(body.description || ''),
      price: Number(body.price || 0),
      bedrooms: Number(body.bedrooms || 1),
      bathrooms: Number(body.bathrooms || 1),
      amenities: Array.isArray(body.amenities) ? body.amenities : [],
      location: String(body.location),
      area: body.area,
      bookingFee: body.bookingFee ? Number(body.bookingFee) : undefined,
      images: Array.isArray(body.images) ? body.images : [],
    })

    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    console.error('Error creating listing:', error)
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }
}
