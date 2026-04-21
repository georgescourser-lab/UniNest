/**
 * Supabase query utilities - direct database queries replacing Prisma
 * All queries are RLS-protected at the database level
 */

import { SupabaseClient } from '@supabase/supabase-js'

// ============================================================================
// USER QUERIES
// ============================================================================

export async function getUserByEmail(
  supabase: SupabaseClient,
  email: string
): Promise<{
  id: string
  fullName: string
  email: string
  role: 'STUDENT' | 'LANDLORD' | 'ADMIN'
  phone: string | null
} | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id, fullName, email, role, phone')
    .eq('email', email.toLowerCase())
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // No rows returned
    }
    throw error
  }

  return data as {
    id: string
    fullName: string
    email: string
    role: 'STUDENT' | 'LANDLORD' | 'ADMIN'
    phone: string | null
  }
}

export async function upsertUser(
  supabase: SupabaseClient,
  userId: string,
  email: string,
  fullName: string,
  role: 'STUDENT' | 'LANDLORD' | 'ADMIN' = 'STUDENT'
): Promise<{
  id: string
  fullName: string
  email: string
  role: 'STUDENT' | 'LANDLORD' | 'ADMIN'
}> {
  const { data, error } = await supabase
    .from('users')
    .upsert(
      {
        id: userId,
        email: email.toLowerCase(),
        fullName,
        role,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    )
    .select('id, fullName, email, role')
    .single()

  if (error) throw error

  return data as {
    id: string
    fullName: string
    email: string
    role: 'STUDENT' | 'LANDLORD' | 'ADMIN'
  }
}

// ============================================================================
// PROPERTY QUERIES
// ============================================================================

export async function getPropertyById(
  supabase: SupabaseClient,
  propertyId: string
): Promise<{
  id: string
  title: string
  description: string
  location: string
  area: string
  price: number
  bedrooms: number
  bathrooms: number
  bookingFee: number | null
  amenities: string[]
  images: string[]
  latitude: number | null
  longitude: number | null
  waterReliability: number
  wifiQuality: number
  securityScore: number
  noiseLevel: number
  isActive: boolean
  isVerifiedProperty: boolean
  roommateWanted: boolean
  owner: {
    id: string
    fullName: string
    email: string
    phone: string | null
    verified: boolean
  }
  reviews: Array<{ rating: number }>
  reviewCount: number
  averageRating: number
} | null> {
  const { data, error } = await supabase
    .from('properties')
    .select(
      `
        id,
        title,
        description,
        location,
        area,
        price,
        bedrooms,
        bathrooms,
        bookingFee,
        amenities,
        images,
        latitude,
        longitude,
        waterReliability,
        wifiQuality,
        securityScore,
        noiseLevel,
        isActive,
        isVerifiedProperty,
        roommateWanted,
        owner:users(id, fullName, email, phone, verified),
        reviews(rating)
      `
    )
    .eq('id', propertyId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  const reviews = ((data as { reviews?: Array<{ rating: number }> }).reviews || []) as Array<{
    rating: number
  }>
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0

  return {
    ...(data as Record<string, any>),
    reviews,
    reviewCount: reviews.length,
    averageRating: parseFloat(averageRating.toFixed(1)),
  } as any
}

export async function getPropertiesWithFilters(
  supabase: SupabaseClient,
  options: {
    area?: string
    priceMin?: number
    priceMax?: number
    hasWifi?: boolean
    limit?: number
    offset?: number
  }
): Promise<{
  properties: Array<{
    id: string
    title: string
    description: string
    location: string
    area: string
    price: number
    bedrooms: number
    bathrooms: number
    bookingFee: number | null
    amenities: string[]
    images: string[]
    latitude: number | null
    longitude: number | null
    waterReliability: number
    wifiQuality: number
    securityScore: number
    noiseLevel: number
    isVerifiedProperty: boolean
    roommateWanted: boolean
    owner: {
      id: string
      fullName: string
      email: string
      phone: string | null
      verified: boolean
    }
    reviews: Array<{ rating: number }>
    reviewCount: number
    averageRating: number
  }>
  total: number
}> {
  const limit = options.limit || 12
  const offset = options.offset || 0

  let query = supabase
    .from('properties')
    .select(
      `
        id,
        title,
        description,
        location,
        area,
        price,
        bedrooms,
        bathrooms,
        bookingFee,
        amenities,
        images,
        latitude,
        longitude,
        waterReliability,
        wifiQuality,
        securityScore,
        noiseLevel,
        isVerifiedProperty,
        roommateWanted,
        owner:users(id, fullName, email, phone, verified),
        reviews(rating)
      `,
      { count: 'exact' }
    )
    .eq('isActive', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (options.area) {
    query = query.eq('area', options.area)
  }

  if (options.priceMin !== undefined || options.priceMax !== undefined) {
    if (options.priceMin !== undefined) {
      query = query.gte('price', options.priceMin)
    }
    if (options.priceMax !== undefined) {
      query = query.lte('price', options.priceMax)
    }
  }

  if (options.hasWifi) {
    query = query.gt('wifiQuality', 0)
  }

  const { data, error, count } = await query

  if (error) throw error

  const properties = (data || []).map((property: any) => {
    const reviews = property.reviews || []
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
        : 0

    return {
      ...property,
      reviews,
      reviewCount: reviews.length,
      averageRating: parseFloat(avgRating.toFixed(1)),
    }
  })

  return {
    properties,
    total: count || 0,
  }
}

export async function createProperty(
  supabase: SupabaseClient,
  ownerId: string,
  data: {
    title: string
    description: string
    location: string
    area: string
    price: number
    bedrooms: number
    bathrooms: number
    amenities?: string[]
    images?: string[]
    bookingFee?: number
  }
): Promise<{ id: string }> {
  const { data: result, error } = await supabase
    .from('properties')
    .insert({
      ownerId,
      title: data.title,
      description: data.description,
      location: data.location,
      area: data.area,
      price: data.price,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      amenities: data.amenities || [],
      images: data.images || [],
      bookingFee: data.bookingFee || null,
      isActive: true,
      verificationStatus: 'PENDING',
      created_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) throw error
  return result
}

export async function updatePropertyVerification(
  supabase: SupabaseClient,
  propertyId: string,
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'
): Promise<{
  id: string
  title: string
  verificationStatus: string
  isVerifiedProperty: boolean
  verifiedAt: string | null
}> {
  const { data, error } = await supabase
    .from('properties')
    .update({
      verificationStatus,
      isVerifiedProperty: verificationStatus === 'VERIFIED',
      verifiedAt:
        verificationStatus === 'VERIFIED'
          ? new Date().toISOString()
          : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', propertyId)
    .select('id, title, verificationStatus, isVerifiedProperty, verifiedAt')
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// ROOMMATE PROFILE QUERIES
// ============================================================================

export async function getRoommateProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<any> {
  const { data, error } = await supabase
    .from('roommate_profiles')
    .select('*')
    .eq('userId', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data
}

export async function upsertRoommateProfile(
  supabase: SupabaseClient,
  userId: string,
  profileData: Record<string, any>
): Promise<any> {
  const { data, error } = await supabase
    .from('roommate_profiles')
    .upsert(
      {
        userId,
        ...profileData,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'userId' }
    )
    .select('*')
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// TRANSACTION QUERIES
// ============================================================================

export async function getTransactionByCheckoutRequestId(
  supabase: SupabaseClient,
  checkoutRequestId: string
): Promise<{ id: string } | null> {
  const { data, error } = await supabase
    .from('transactions')
    .select('id')
    .eq('checkoutRequestId', checkoutRequestId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data
}

export async function updateTransaction(
  supabase: SupabaseClient,
  transactionId: string,
  updates: Record<string, any>
): Promise<void> {
  const { error } = await supabase
    .from('transactions')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', transactionId)

  if (error) throw error
}

export async function createTransaction(
  supabase: SupabaseClient,
  data: {
    payerId: string
    propertyId: string
    transactionType: string
    amount: number
    phoneNumber: string
    accountReference: string
    status: string
    checkoutRequestId: string
    merchantRequestId?: string
    mpesaCallback?: Record<string, any>
    failedReason?: string
  }
): Promise<{
  id: string
  status: string
  checkoutRequestId: string
  merchantRequestId: string | null
}> {
  const { data: result, error } = await supabase
    .from('transactions')
    .insert({
      payerId: data.payerId,
      propertyId: data.propertyId,
      transactionType: data.transactionType,
      amount: data.amount,
      phoneNumber: data.phoneNumber,
      accountReference: data.accountReference,
      status: data.status,
      checkoutRequestId: data.checkoutRequestId,
      merchantRequestId: data.merchantRequestId || null,
      mpesaCallback: data.mpesaCallback || null,
      failedReason: data.failedReason || null,
      currency: 'KES',
      created_at: new Date().toISOString(),
    })
    .select('id, status, checkoutRequestId, merchantRequestId')
    .single()

  if (error) throw error
  return result
}

export async function getTransactionById(
  supabase: SupabaseClient,
  checkoutRequestId: string
): Promise<any> {
  const { data, error } = await supabase
    .from('transactions')
    .select(
      `
        id,
        status,
        amount,
        currency,
        phoneNumber,
        accountReference,
        checkoutRequestId,
        merchantRequestId,
        receiptNumber,
        failedReason,
        paidAt,
        reconciledAt,
        created_at,
        updated_at,
        property:properties(id, title, area, location)
      `
    )
    .eq('checkoutRequestId', checkoutRequestId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data
}
