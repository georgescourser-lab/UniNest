const AUTH_FLAG_KEY = 'comradehomes-authenticated'
const AUTH_NAME_KEY = 'comradehomes-user-name'

export function getAuthState() {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, userName: '' }
  }

  return {
    isAuthenticated: window.localStorage.getItem(AUTH_FLAG_KEY) === 'true',
    userName: window.localStorage.getItem(AUTH_NAME_KEY) || '',
  }
}

export function setAuthState(userName: string) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(AUTH_FLAG_KEY, 'true')
  window.localStorage.setItem(AUTH_NAME_KEY, userName)
}

export function clearAuthState() {
  if (typeof window === 'undefined') return

  window.localStorage.removeItem(AUTH_FLAG_KEY)
  window.localStorage.removeItem(AUTH_NAME_KEY)
}
