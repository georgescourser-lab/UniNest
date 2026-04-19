// Utility functions for the application

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(price)
}

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export const truncateText = (text: string, length: number = 100): string => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

export const getRatingColor = (rating: number): string => {
  if (rating >= 4.5) return 'text-green-600'
  if (rating >= 3.5) return 'text-yellow-600'
  if (rating >= 2.5) return 'text-orange-600'
  return 'text-red-600'
}

export const getSecurityColor = (score: number): string => {
  if (score >= 4) return 'bg-green-100 text-green-800'
  if (score >= 3) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

export const getWaterReliabilityLabel = (type: string): string => {
  switch (type) {
    case 'BOREHOLE':
      return 'Borehole Water'
    case 'RATIONED':
      return 'Rationed Supply'
    case 'RELIABLE':
      return '24/7 Water'
    default:
      return 'Unknown'
  }
}

export const getAreaCoordinates = (
  area: string
): { lat: number; lng: number } | null => {
  const coordinates: Record<string, { lat: number; lng: number }> = {
    KAHAWA_WENDANI: { lat: 1.945, lng: 36.881 },
    KM: { lat: 1.938, lng: 36.882 },
    KAHAWA_SUKARI: { lat: 1.95, lng: 36.87 },
    MWIHOKO: { lat: 1.935, lng: 36.892 },
    GITHURAI_44: { lat: 1.942, lng: 36.889 },
    GITHURAI_45: { lat: 1.943, lng: 36.89 },
    RUIRU: { lat: 1.92, lng: 36.87 },
  }

  return coordinates[area] || null
}

// Debounce function for search inputs
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
) => {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: unknown[]) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}
