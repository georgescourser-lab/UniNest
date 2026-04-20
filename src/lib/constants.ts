// Application constants

export const APP_NAME = 'ComradeHomes'
export const APP_DESCRIPTION = 'House Hunting Platform for KU Students'

// KU Gate information
export const KU_GATES_INFO = [
  {
    id: 'gate_a',
    name: 'Gate A (Main Entrance)',
    coordinates: { lat: 1.9437, lng: 36.881 },
    description: 'Main entrance to Kenyatta University Main Campus',
  },
  {
    id: 'gate_b',
    name: 'Gate B',
    coordinates: { lat: 1.9467, lng: 36.885 },
    description: 'Eastern entrance to campus',
  },
  {
    id: 'gate_c',
    name: 'Gate C',
    coordinates: { lat: 1.941, lng: 36.888 },
    description: 'Northern entrance to campus',
  },
]

// KU Areas
export const KU_AREAS = [
  { id: 'kahawa_wendani', label: 'Kahawa Wendani', value: 'KAHAWA_WENDANI' },
  { id: 'km', label: 'KM', value: 'KM' },
  { id: 'kahawa_sukari', label: 'Kahawa Sukari', value: 'KAHAWA_SUKARI' },
  { id: 'mwihoko', label: 'Mwihoko', value: 'MWIHOKO' },
  { id: 'githurai_44', label: 'Githurai 44', value: 'GITHURAI_44' },
  { id: 'githurai_45', label: 'Githurai 45', value: 'GITHURAI_45' },
  { id: 'ruiru', label: 'Ruiru', value: 'RUIRU' },
]

// Price ranges (in KES)
export const PRICE_RANGES = [
  { label: 'Under 5,000', min: 0, max: 5000 },
  { label: '5,000 - 10,000', min: 5000, max: 10000 },
  { label: '10,000 - 15,000', min: 10000, max: 15000 },
  { label: '15,000 - 20,000', min: 15000, max: 20000 },
  { label: '20,000+', min: 20000, max: Infinity },
]

// Review ratings
export const RATINGS = [1, 2, 3, 4, 5]

// Water types
export const WATER_TYPES = [
  { label: '24/7 Reliable', value: 'RELIABLE' },
  { label: 'Rationed Supply', value: 'RATIONED' },
  { label: 'Borehole', value: 'BOREHOLE' },
]

// Environment variables
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

// Pagination
export const ITEMS_PER_PAGE = 12
export const SEARCH_DEBOUNCE_DELAY = 500

// Cache durations (in milliseconds)
export const CACHE_DURATIONS = {
  LISTINGS: 5 * 60 * 1000, // 5 minutes
  REVIEWS: 10 * 60 * 1000, // 10 minutes
  USER_PROFILE: 30 * 60 * 1000, // 30 minutes
}
