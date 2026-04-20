// Common types for the application

export interface PropertyMetrics {
  waterReliability: 'BOREHOLE' | 'RATIONED' | 'RELIABLE'
  hasWifi: boolean
  wifiQuality: number // 1-5
  securityScore: number // 1-5
  noiseLevel: number // 1-5
}

export interface DistanceInfo {
  nearestGate: string
  distanceKm: number
  walkingTimeMinutes: number
  allGates: Array<{ name: string; distanceKm: number }>
}

export interface Property {
  id: string
  title: string
  description?: string
  price: number
  bedrooms: number
  bathrooms: number
  area: KUArea
  location: string
  latitude: number
  longitude: number
  images: string[]
  metrics: PropertyMetrics
  lookingForRoommate: boolean
  isVerifiedProperty: boolean
  landlordId: string
  landlordName: string
  caretakerName?: string
  phoneNumber: string
  createdAt: Date
  updatedAt: Date
}

export interface Review {
  id: string
  rating: number // 1-5
  comment: string
  authorName: string
  authorImage?: string
  createdAt: Date
}

export interface User {
  id: string
  email: string
  name?: string
  phone?: string
  role: 'STUDENT' | 'LANDLORD' | 'CARETAKER'
  profileImage?: string
  bio?: string
  isVerified: boolean
}

export type KUArea =
  | 'KAHAWA_WENDANI'
  | 'KM'
  | 'KAHAWA_SUKARI'
  | 'MWIHOKO'
  | 'GITHURAI_44'
  | 'GITHURAI_45'
  | 'RUIRU'

export const KU_AREA_NAMES: Record<KUArea, string> = {
  KAHAWA_WENDANI: 'Kahawa Wendani',
  KM: 'KM',
  KAHAWA_SUKARI: 'Kahawa Sukari',
  MWIHOKO: 'Mwihoko',
  GITHURAI_44: 'Githurai 44',
  GITHURAI_45: 'Githurai 45',
  RUIRU: 'Ruiru',
}
