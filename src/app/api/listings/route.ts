import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SESSION_COOKIE_NAME } from '@/lib/session'

type PropertyWithReviewsAndOwner = {
  reviews: Array<{ rating: number }>
  owner: {
    id: string
    fullName: string
    email: string
    phone: string | null
    verified: boolean
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
    reviews: [{ rating: 3 }],
  },
]

function getMockResponse() {
  const data = mockListings.map((property) => {
    const avgRating = property.reviews.length
      ? property.reviews.reduce((sum, review) => sum + review.rating, 0) / property.reviews.length
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
    const limit = parseInt(searchParams.get('limit') || '12', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const where: Record<string, unknown> = {}

    if (area) {
      where.area = area
    }

    if (priceMin || priceMax) {
      const priceFilter: { gte?: number; lte?: number } = {}
      if (priceMin) priceFilter.gte = parseInt(priceMin, 10)
      if (priceMax) priceFilter.lte = parseInt(priceMax, 10)
      where.price = priceFilter
    }

    if (hasWifi === 'true') {
      // wifiQuality > 0 indicates internet is available.
      where.wifiQuality = { gt: 0 }
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              verified: true,
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

    const formattedProperties = (properties as PropertyWithReviewsAndOwner[]).map((property) => {
      const avgRating =
        property.reviews.length > 0
          ? property.reviews.reduce((sum, review) => sum + review.rating, 0) / property.reviews.length
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
        fullName: true,
        phone: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (!body.title || !body.area || !body.location) {
      return NextResponse.json(
        { error: 'title, area, and location are required' },
        { status: 400 }
      )
    }

    const property = await prisma.property.create({
      data: {
        title: String(body.title),
        description: String(body.description || ''),
        price: Number(body.price || 0),
        bedrooms: Number(body.bedrooms || 1),
        bathrooms: Number(body.bathrooms || 1),
        amenities: Array.isArray(body.amenities) ? body.amenities : [],
        location: String(body.location),
        area: body.area,
        latitude: body.latitude != null ? Number(body.latitude) : null,
        longitude: body.longitude != null ? Number(body.longitude) : null,
        waterReliability: Number(body.waterReliability || 5),
        wifiQuality: Number(body.wifiQuality || 0),
        securityScore: Number(body.securityScore || 5),
        noiseLevel: Number(body.noiseLevel || 5),
        roommateWanted: Boolean(body.roommateWanted ?? body.lookingForRoommate),
        verifiedLandlord: false,
        images: Array.isArray(body.images) ? body.images : [],
        ownerId: user.id,
      },
    })

    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    console.error('Error creating listing:', error)
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }
}
