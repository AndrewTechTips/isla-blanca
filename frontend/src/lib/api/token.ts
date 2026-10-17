/**
 * The signed-in user's JWT, kept in localStorage so a refresh keeps the session.
 * Components subscribe to changes (sign in, sign out, expired token).
 */
const KEY = 'isla-blanca.token'

type Listener = (token: string | null) => void
const listeners = new Set<Listener>()

function read(): string | null {
  try {
    return window.localStorage.getItem(KEY)
  } catch {
    return null
  }
}

let current = read()

export const tokenStore = {
  get: () => current,
  set(token: string | null) {
    current = token
    try {
      if (token) window.localStorage.setItem(KEY, token)
      else window.localStorage.removeItem(KEY)
    } catch {
      // Private mode or blocked storage: the session simply won't survive a refresh.
    }
    listeners.forEach((listener) => listener(token))
  },
  subscribe(listener: Listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}
