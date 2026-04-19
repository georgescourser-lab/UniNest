import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SESSION_COOKIE_NAME } from '@/lib/session'

type PropertyWithReviews = {
  reviews: Array<{ rating: number }>
  landlord?: {
    id: string
    name: string | null
    email: string
    phone: string | null
    idDocumentUrl: string | null
    kraPinUrl: string | null
    verificationStatus: string
    isVerified: boolean
  }
  [key: string]: unknown
}

const mockListings = [
  {
    id: '1',
    title: 'Spacious 2BR Bedsitter near Campus',
    description: 'Clean, secure, and close to KU.',
    price: 15000,
    bedrooms: 2,
    bathrooms: 1,
    amenities: ['WiFi', 'Water', 'Security'],
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=400&fit=crop'],
    location: 'Close to Main Gate',
    area: 'KAHAWA_WENDANI',
    zone: 'Kahawa Wendani',
    latitude: 1.9437,
    longitude: 36.881,
    waterReliability: 'RELIABLE',
    hasWifi: true,
    wifiQuality: 4,
    securityScore: 5,
    noiseLevel: 2,
    lookingForRoommate: true,
    landlordId: 'demo-landlord',
    landlordName: 'Demo Landlord',
    caretakerName: 'Caretaker John',
    phoneNumber: '+254700000001',
    isVerifiedProperty: true,
    reviews: [{ rating: 5 }, { rating: 4 }],
  },
  {
    id: '2',
    title: 'Budget Friendly Bedsitter',
    description: 'Affordable option in a student-friendly zone.',
    price: 6500,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['Water'],
    images: ['https://images.unsplash.com/photo-1460317442991-0ec209397118?w=500&h=400&fit=crop'],
    location: 'Near shopping center',
    area: 'GITHURAI_44',
    zone: 'Githurai 44',
    latitude: 1.942,
    longitude: 36.889,
    waterReliability: 'RATIONED',
    hasWifi: false,
    wifiQuality: 0,
    securityScore: 3,
    noiseLevel: 4,
    lookingForRoommate: false,
    landlordId: 'demo-landlord-2',
    landlordName: 'Demo Landlord 2',
    caretakerName: 'Caretaker Mary',
    phoneNumber: '+254700000002',
    isVerifiedProperty: false,
    reviews: [{ rating: 3 }],
  },
]

function getMockResponse() {
  const data = mockListings.map((property) => {
    const avgRating = property.reviews.length
      ? property.reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) /
        property.reviews.length
      : 0

    return {
      ...property,
      reviewCount: property.reviews.length,
      averageRating: parseFloat(avgRating.toFixed(1)),
    }
  })

  return {
    data,
    total: data.length,
    limit: data.length,
    offset: 0,
    hasMore: false,
  }
}

/**
 * GET /api/listings
 * Get all properties with optional filtering
 * Query params:
 * - area: Filter by area (KAHAWA_WENDANI, etc.)
 * - priceMin: Minimum price
 * - priceMax: Maximum price
 * - hasWifi: Filter by WiFi availability
 * - limit: Number of results (default: 12)
 * - offset: Pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(getMockResponse())
    }

    const searchParams = request.nextUrl.searchParams

    const area = searchParams.get('area')
    const priceMin = searchParams.get('priceMin')
    const priceMax = searchParams.get('priceMax')
    const hasWifi = searchParams.get('hasWifi')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: any = {}

    if (area) {
      where.area = area
    }

    if (priceMin || priceMax) {
      where.price = {}
      if (priceMin) {
        where.price.gte = parseInt(priceMin)
      }
      if (priceMax) {
        where.price.lte = parseInt(priceMax)
      }
    }

    if (hasWifi === 'true') {
      where.hasWifi = true
    }

    // Fetch properties
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          landlord: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              idDocumentUrl: true,
              kraPinUrl: true,
              verificationStatus: true,
              isVerified: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.property.count({ where }),
    ])

    // Calculate average ratings
    const formattedProperties = (properties as PropertyWithReviews[]).map((property) => {
      const avgRating =
        property.reviews.length > 0
          ? property.reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) / property.reviews.length
          : 0

      return {
        ...property,
        reviewCount: property.reviews.length,
        averageRating: parseFloat(avgRating.toFixed(1)),
      }
    })

    return NextResponse.json({
      data: formattedProperties,
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

/**
 * POST /api/listings
 * Create a new property (requires authentication)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          id: `mock-${Date.now()}`,
          ...body,
        },
        { status: 201 }
      )
    }

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionCookie },
      select: {
        id: true,
        name: true,
        phone: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (!body.title || !body.area || !body.zone || !body.location) {
      return NextResponse.json(
        { error: 'title, area, zone, and location are required' },
        { status: 400 }
      )
    }

    const property = await prisma.property.create({
      data: {
        title: body.title,
        description: body.description,
        propertyType: body.propertyType || 'BEDSITTER',
        price: body.price,
        bookingFee: body.bookingFee,
        capacity: body.capacity || 'SINGLE',
        bedrooms: body.bedrooms,
        bathrooms: body.bathrooms,
        amenities: body.amenities || [],
        location: body.location,
        area: body.area,
        zone: body.zone,
        latitude: body.latitude,
        longitude: body.longitude,
        waterReliability: body.waterReliability,
        hasWifi: body.hasWifi,
        wifiQuality: body.wifiQuality,
        securityScore: body.securityScore,
        noiseLevel: body.noiseLevel,
        lookingForRoommate: body.lookingForRoommate,
        landlordId: user.id,
        landlordName: body.landlordName || user.name || 'Landlord',
        phoneNumber: body.phoneNumber || user.phone || '+254700000000',
        caretakerName: body.caretakerName || null,
        images: body.images || [],
      },
    })

    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    console.error('Error creating listing:', error)
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    )
  }
}
